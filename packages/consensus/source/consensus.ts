import { inject, injectable } from "@mainsail/container";
import { Contracts, Identifiers } from "@mainsail/contracts";
import delay from "delay";

import { Step } from "./enums";

@injectable()
export class Consensus implements Contracts.Consensus.IConsensusService {
	@inject(Identifiers.BlockProcessor)
	private readonly processor!: Contracts.BlockProcessor.Processor;

	@inject(Identifiers.StateStore)
	private readonly state!: Contracts.State.StateStore;

	@inject(Identifiers.Consensus.Handler)
	private readonly handler!: Contracts.Consensus.IHandler;

	@inject(Identifiers.Consensus.Broadcaster)
	private readonly broadcaster!: Contracts.Consensus.IBroadcaster;

	@inject(Identifiers.Consensus.Scheduler)
	private readonly scheduler!: Contracts.Consensus.IScheduler;

	// TODO: Rename identifier
	@inject(Identifiers.Consensus.ValidatorRepository)
	private readonly validatorsRepository!: Contracts.Consensus.IValidatorRepository;

	@inject(Identifiers.ValidatorSet)
	private readonly validatorSet!: Contracts.ValidatorSet.IValidatorSet;

	@inject(Identifiers.LogService)
	private readonly logger!: Contracts.Kernel.Logger;

	#height = 2;
	#round = 0;
	#step: Step = Step.propose;
	#lockedValue?: Contracts.Consensus.IRoundState;
	#lockedRound?: number = undefined;
	#validValue?: Contracts.Consensus.IRoundState;
	#validRound?: number = undefined;

	#didMajorityPrevote = false;
	#didMajorityPrecommit = false;

	public getHeight(): number {
		return this.#height;
	}

	public getRound(): number {
		return this.#round;
	}

	// TODO: Only for testing
	public setRound(round: number): void {
		this.#round = round;
	}

	public getStep(): Step {
		return this.#step;
	}

	// TODO: Only for testing
	public setStep(step: Step): void {
		this.#step = step;
	}

	public getLockedValue(): unknown {
		return this.#lockedValue;
	}

	public getLockedRound(): number | undefined {
		return this.#lockedRound;
	}

	public getValidValue(): unknown {
		return this.#validValue;
	}

	public getValidRound(): number | undefined {
		return this.#validRound;
	}

	public getState(): Record<string, unknown> {
		return {
			height: this.#height,
			lockedRound: this.#lockedRound,
			lockedValue: this.#lockedValue,
			round: this.#round,
			step: this.#step,
			validRound: this.#validRound,
			validValue: this.#validValue,
		};
	}

	public async run(): Promise<void> {
		const lastBlock = this.state.getLastBlock();
		this.#height = lastBlock.data.height + 1;

		void this.startRound(this.#round);
	}

	public async startRound(round: number): Promise<void> {
		this.#round = round;
		this.#step = Step.propose;
		this.#didMajorityPrevote = false;
		this.#didMajorityPrecommit = false;

		this.scheduler.clear();

		const proposerPublicKey = await this.#getProposerPublicKey(this.#height, round);
		const proposer = this.validatorsRepository.getValidator(proposerPublicKey);

		this.logger.info(`>> Starting new round: ${this.#height}/${this.#round} with proposer ${proposerPublicKey}`);

		if (proposer) {
			// TODO: Error handling
			await this.#propose(proposer);
		} else {
			this.logger.info(`No registered proposer for ${proposerPublicKey}`);

			// TODO: Can we call this even even proposer is known?
			await this.scheduler.scheduleTimeoutPropose(this.#height, this.#round);
		}
	}

	// TODO: Implement proposal for validRound >= 0.
	public async onProposal(roundState: Contracts.Consensus.IRoundState): Promise<void> {
		const proposal = roundState.getProposal();

		if (this.#step !== Step.propose || this.#isInvalidRoundState(roundState) || !proposal || proposal.validRound) {
			return;
		}

		// TODO: Check proposer
		this.logger.info(`Received proposal ${this.#height}/${this.#round} blockId: ${proposal.block.data.id}`);

		const result = await this.processor.process(roundState);
		roundState.setProcessorResult(result);

		this.#step = Step.prevote;

		await this.#prevote(result ? proposal.block.data.id : undefined);
	}

	// TODO: Proposal should include +2/3 prevotes
	public async onProposalLocked(roundState: Contracts.Consensus.IRoundState): Promise<void> {
		const proposal = roundState.getProposal();
		if (
			this.#step !== Step.propose ||
			this.#isInvalidRoundState(roundState) ||
			!proposal ||
			proposal.validRound === undefined ||
			proposal.validRound >= this.#round
		) {
			return;
		}

		this.logger.info(
			`Received proposal ${this.#height}/${this.#round} with locked blockId: ${proposal.block.data.id}`,
		);

		this.#step = Step.prevote;
		if (!this.#lockedRound || this.#lockedRound <= proposal.validRound) {
			const result = await this.processor.process(roundState);
			roundState.setProcessorResult(result);

			if (result) {
				await this.#prevote(proposal.block.data.id);
				return;
			}
		}

		await this.#prevote();
	}

	public async onMajorityPrevote(roundState: Contracts.Consensus.IRoundState): Promise<void> {
		const proposal = roundState.getProposal();

		if (
			this.#didMajorityPrevote ||
			this.#step === Step.propose ||
			this.#isInvalidRoundState(roundState) ||
			!proposal ||
			!roundState.getProcessorResult()
		) {
			return;
		}

		this.logger.info(
			`Received +2/3 prevotes for ${this.#height}/${this.#round} proposer: ${
				proposal.validatorPublicKey
			} blockId: ${proposal.block.data.id}`,
		);

		this.#didMajorityPrevote = true;

		if (this.#step === Step.prevote) {
			this.#lockedValue = roundState;
			this.#lockedRound = this.#round;
			this.#validValue = roundState;
			this.#validRound = this.#round;
			this.#step = Step.precommit;

			await this.#precommit(proposal.block.data.id);
		} else {
			this.#validValue = roundState;
			this.#validRound = this.#round;
		}
	}

	public async onMajorityPrevoteAny(roundState: Contracts.Consensus.IRoundState): Promise<void> {
		if (this.#step !== Step.prevote || this.#isInvalidRoundState(roundState)) {
			return;
		}

		void this.scheduler.scheduleTimeoutPrevote(this.#height, this.#round);
	}

	public async onMajorityPrevoteNull(roundState: Contracts.Consensus.IRoundState): Promise<void> {
		if (this.#step !== Step.prevote || this.#isInvalidRoundState(roundState)) {
			return;
		}

		// ADD: Log info

		this.#step = Step.precommit;

		await this.#precommit();
	}

	public async onMajorityPrecommitAny(roundState: Contracts.Consensus.IRoundState): Promise<void> {
		void this.scheduler.scheduleTimeoutPrecommit(this.#height, this.#round);
	}

	public async onMajorityPrecommit(roundState: Contracts.Consensus.IRoundState): Promise<void> {
		const proposal = roundState.getProposal();
		if (this.#didMajorityPrecommit || this.#isInvalidRoundState(roundState) || !proposal) {
			return;
		}

		this.#didMajorityPrecommit = true;

		if (!roundState.getProcessorResult()) {
			this.logger.info(
				`Block ${proposal.block.data.id} on height ${this.#height} received +2/3 precommti but is invalid`,
			);
			return;
		}
		this.logger.info(
			`Received +2/3 precommits for ${this.#height}/${this.#round} proposer: ${
				proposal.validatorPublicKey
			} blockId: ${proposal.block.data.id}`,
		);

		await this.processor.commit(roundState);

		// TODO: Caclulate timeout
		// TODO: Wait for other approvals if needed
		await delay(80);

		this.#height++;
		this.#lockedRound = undefined;
		this.#lockedValue = undefined;
		this.#validRound = undefined;
		this.#validValue = undefined;

		setImmediate(() => this.startRound(0));
	}

	async onMinorityWithHigherRound(roundState: Contracts.Consensus.IRoundState): Promise<void> {
		if (roundState.height !== this.#height || roundState.round <= this.#round) {
			return;
		}

		setImmediate(() => this.startRound(roundState.round));
	}

	public async onTimeoutPropose(height: number, round: number): Promise<void> {
		if (this.#step !== Step.propose || this.#height !== height || this.#round !== round) {
			return;
		}

		this.#step = Step.prevote;
		await this.#prevote();
	}

	public async onTimeoutPrevote(height: number, round: number): Promise<void> {
		if (this.#step !== Step.prevote || this.#height !== height || this.#round !== round) {
			return;
		}

		this.#step = Step.precommit;
		await this.#precommit();
	}

	public async onTimeoutPrecommit(height: number, round: number): Promise<void> {
		if (this.#height !== height || this.#round !== round) {
			return;
		}

		setImmediate(() => this.startRound(this.#round + 1));
	}

	#isInvalidRoundState(roundState: Contracts.Consensus.IRoundState): boolean {
		if (roundState.height !== this.#height) {
			return true;
		}

		if (roundState.round !== this.#round) {
			return true;
		}

		return false;
	}

	async #propose(proposer: Contracts.Consensus.IValidator): Promise<void> {
		let block: Contracts.Crypto.IBlock;
		const existingProposal = this.#validValue?.getProposal();
		if (this.#validValue && existingProposal) {
			block = existingProposal.block;
		} else {
			block = await proposer.prepareBlock(this.#height, this.#round);
		}

		const proposal = await proposer.propose(this.#height, this.#round, block, this.#validRound);

		await this.broadcaster.broadcastProposal(proposal);
		await this.handler.onProposal(proposal);
	}

	async #prevote(value?: string): Promise<void> {
		for (const validator of this.validatorsRepository.getValidators(await this.#getActiveValidators())) {
			const precommit = await validator.prevote(this.#height, this.#round, value);

			await this.broadcaster.broadcastPrevote(precommit);
			await this.handler.onPrevote(precommit);
		}
	}

	async #precommit(value?: string): Promise<void> {
		for (const validator of this.validatorsRepository.getValidators(await this.#getActiveValidators())) {
			const precommit = await validator.precommit(this.#height, this.#round, value);

			await this.broadcaster.broadcastPrecommit(precommit);
			await this.handler.onPrecommit(precommit);
		}
	}

	async #getProposerPublicKey(height: number, round: number): Promise<string> {
		const activeValidators = await this.validatorSet.getActiveValidators();
		return activeValidators[0].getAttribute("consensus.publicKey");
	}

	async #getActiveValidators(): Promise<string[]> {
		const activeValidators = await this.validatorSet.getActiveValidators();

		return activeValidators.map((wallet) => wallet.getAttribute("consensus.publicKey"));
	}
}