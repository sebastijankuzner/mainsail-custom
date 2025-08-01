import { isMajority, isMinority } from "@mainsail/blockchain-utils";
import { inject, injectable } from "@mainsail/container";
import { Contracts, Identifiers } from "@mainsail/contracts";
import { assert } from "@mainsail/utils";

@injectable()
export class RoundState implements Contracts.Consensus.RoundState {
	@inject(Identifiers.Consensus.Aggregator)
	private readonly aggregator!: Contracts.Consensus.Aggregator;

	@inject(Identifiers.Cryptography.Configuration)
	private readonly configuration!: Contracts.Crypto.Configuration;

	@inject(Identifiers.ValidatorSet.Service)
	private readonly validatorSet!: Contracts.ValidatorSet.Service;

	@inject(Identifiers.BlockchainUtils.ProposerCalculator)
	private readonly proposerCalculator!: Contracts.BlockchainUtils.ProposerCalculator;

	@inject(Identifiers.Cryptography.Commit.Serializer)
	private readonly commitSerializer!: Contracts.Crypto.CommitSerializer;

	@inject(Identifiers.Services.Log.Service)
	private readonly logger!: Contracts.Kernel.Logger;

	#blockNumber = 0;
	#round = 0;
	#proposal?: Contracts.Crypto.Proposal;
	#processorResult?: Contracts.Processor.BlockProcessorResult;
	#accountUpdates: Array<Contracts.Evm.AccountUpdate> = [];
	#prevotes = new Map<number, Contracts.Crypto.Prevote>();
	#prevotesCount = new Map<string | undefined, number>();
	#precommits = new Map<number, Contracts.Crypto.Precommit>();
	#precommitsCount = new Map<string | undefined, number>();
	#validators = new Map<string, Contracts.State.ValidatorWallet>();
	#validatorsSignedPrevote: boolean[] = [];
	#validatorsSignedPrecommit: boolean[] = [];
	#proposer!: Contracts.State.ValidatorWallet;

	#commit: Contracts.Crypto.Commit | undefined;

	public get blockNumber(): number {
		return this.#blockNumber;
	}

	public get round(): number {
		return this.#round;
	}

	public get persist(): boolean {
		return true; // Store block in database every time
	}

	public get validators(): string[] {
		return [...this.#validators.keys()];
	}

	public get proposer(): Contracts.State.ValidatorWallet {
		return this.#proposer;
	}

	public configure(blockNumber: number, round: number): RoundState {
		this.#blockNumber = blockNumber;
		this.#round = round;

		const validators = this.validatorSet.getRoundValidators();
		for (const validator of validators) {
			const consensusPublicKey = validator.blsPublicKey;
			this.#validators.set(consensusPublicKey, validator);
			this.#validatorsSignedPrecommit.push(false);
			this.#validatorsSignedPrevote.push(false);
		}

		const validatorIndex = this.proposerCalculator.getValidatorIndex(round);

		this.#proposer = validators[validatorIndex];

		return this;
	}

	public getValidator(consensusPublicKey: string): Contracts.State.ValidatorWallet {
		const validator = this.#validators.get(consensusPublicKey);
		assert.defined(validator);
		return validator;
	}

	public hasProposal(): boolean {
		return !!this.#proposal;
	}

	public addProposal(proposal: Contracts.Crypto.Proposal): void {
		if (this.#proposal) {
			throw new Error("Proposal already exists.");
		}

		this.#proposal = proposal;
	}

	public getProposal(): Contracts.Crypto.Proposal | undefined {
		return this.#proposal;
	}

	public getBlock(): Contracts.Crypto.Block {
		if (this.#proposal && this.#proposal.isDataDeserialized) {
			return this.#proposal.getData().block;
		}

		throw new Error("Block is not available, because proposal is not set or deserialized");
	}

	public async getCommit(): Promise<Contracts.Crypto.Commit> {
		if (!this.#commit) {
			const majority = await this.aggregatePrecommits();

			const proposal = this.getProposal();
			assert.defined(proposal);

			const round = proposal.round;
			const block = proposal.getData().block;

			const commit: Contracts.Crypto.CommitSerializable = {
				block,
				proof: {
					round,
					...majority,
				},
			};

			const serialized = await this.commitSerializer.serializeCommit(commit);

			this.#commit = {
				...commit,
				serialized: serialized.toString("hex"),
			};
		}

		return this.#commit;
	}

	public setProcessorResult(processorResult: Contracts.Processor.BlockProcessorResult): void {
		this.#processorResult = processorResult;
	}

	public hasProcessorResult(): boolean {
		return this.#processorResult !== undefined;
	}

	public getProcessorResult(): Contracts.Processor.BlockProcessorResult {
		if (this.#processorResult === undefined) {
			throw new Error("Processor result is undefined.");
		}

		return this.#processorResult;
	}

	public getAccountUpdates(): Array<Contracts.Evm.AccountUpdate> {
		return this.#accountUpdates;
	}

	public setAccountUpdates(accounts: Array<Contracts.Evm.AccountUpdate>): void {
		this.#accountUpdates = accounts;
	}

	public hasPrevote(validatorIndex: number): boolean {
		return this.#prevotes.has(validatorIndex);
	}

	public addPrevote(prevote: Contracts.Crypto.Prevote): void {
		if (this.#prevotes.has(prevote.validatorIndex)) {
			throw new Error("Prevote already exists.");
		}

		this.#prevotes.set(prevote.validatorIndex, prevote);
		this.#validatorsSignedPrevote[prevote.validatorIndex] = true;
		this.#increasePrevoteCount(prevote.blockHash);
	}

	public hasPrecommit(validatorIndex: number): boolean {
		return this.#precommits.has(validatorIndex);
	}

	public addPrecommit(precommit: Contracts.Crypto.Precommit): void {
		if (this.#precommits.has(precommit.validatorIndex)) {
			throw new Error("Precommit already exists.");
		}

		this.#precommits.set(precommit.validatorIndex, precommit);
		this.#validatorsSignedPrecommit[precommit.validatorIndex] = true;
		this.#increasePrecommitCount(precommit.blockHash);
	}

	public hasMajorityPrevotes(): boolean {
		if (!this.#proposal || !this.#proposal.isDataDeserialized) {
			return false;
		}

		return this.#isMajority(this.#getPrevoteCount(this.#proposal.getData().block.data.hash));
	}

	public hasMajorityPrevotesAny(): boolean {
		return this.#isMajority(this.#prevotes.size);
	}

	public hasMajorityPrevotesNull(): boolean {
		return this.#isMajority(this.#getPrevoteCount());
	}

	public hasMajorityPrecommits(): boolean {
		if (!this.#proposal || !this.#proposal.isDataDeserialized) {
			return false;
		}

		return this.#isMajority(this.#getPrecommitCount(this.#proposal.getData().block.data.hash));
	}

	public hasMajorityPrecommitsAny(): boolean {
		return this.#isMajority(this.#precommits.size);
	}

	public hasMinorityPrevotesOrPrecommits(): boolean {
		return this.#hasMinorityPrevotes() || this.#hasMinorityPrecommits();
	}

	public getPrevote(validatorIndex: number): Contracts.Crypto.Prevote | undefined {
		return this.#prevotes.get(validatorIndex);
	}

	public getPrevotes(): Contracts.Crypto.Prevote[] {
		return [...this.#prevotes.values()];
	}

	public getPrecommit(validatorIndex: number): Contracts.Crypto.Precommit | undefined {
		return this.#precommits.get(validatorIndex);
	}

	public getPrecommits(): Contracts.Crypto.Precommit[] {
		return [...this.#precommits.values()];
	}

	public getValidatorsSignedPrevote(): readonly boolean[] {
		return this.#validatorsSignedPrevote;
	}

	public getValidatorsSignedPrecommit(): readonly boolean[] {
		return this.#validatorsSignedPrecommit;
	}

	public async aggregatePrevotes(): Promise<Contracts.Crypto.AggregatedSignature> {
		const { roundValidators } = this.configuration.getMilestone(this.#blockNumber);
		return this.aggregator.aggregate(this.#getSignatures(this.#prevotes), roundValidators);
	}

	public async aggregatePrecommits(): Promise<Contracts.Crypto.AggregatedSignature> {
		const { roundValidators } = this.configuration.getMilestone(this.#blockNumber);
		return this.aggregator.aggregate(this.#getSignatures(this.#precommits), roundValidators);
	}

	public logPrevotes(): void {
		for (const key of this.#prevotesCount.keys()) {
			const voters = [...this.#prevotes.values()]
				.filter((prevote) => prevote.blockHash === key)
				.map((prevote) => this.validatorSet.getValidator(prevote.validatorIndex).address);

			this.logger.debug(`Block ${key ?? "null"} prevoted by: ${voters.join(", ")}`);
		}
	}

	public logPrecommits(): void {
		for (const key of this.#precommitsCount.keys()) {
			const voters = [...this.#precommits.values()]
				.filter((precommit) => precommit.blockHash === key)
				.map((precommit) => this.validatorSet.getValidator(precommit.validatorIndex).address);

			this.logger.debug(`Block ${key ?? "null"} precommitted by: ${voters.join(", ")}`);
		}
	}

	#hasMinorityPrevotes(): boolean {
		return this.#isMinority(this.#prevotes.size);
	}

	#hasMinorityPrecommits(): boolean {
		return this.#isMinority(this.#precommits.size);
	}

	#isMajority(size: number): boolean {
		const { roundValidators } = this.configuration.getMilestone(this.#blockNumber);
		return isMajority(size, roundValidators);
	}

	#isMinority(size: number): boolean {
		const { roundValidators } = this.configuration.getMilestone(this.#blockNumber);
		return isMinority(size, roundValidators);
	}

	#increasePrevoteCount(blockHash?: string): void {
		this.#prevotesCount.set(blockHash, this.#getPrevoteCount(blockHash) + 1);
	}

	#getPrevoteCount(blockHash?: string): number {
		return this.#prevotesCount.get(blockHash) ?? 0;
	}

	#increasePrecommitCount(blockHash?: string): void {
		this.#precommitsCount.set(blockHash, this.#getPrecommitCount(blockHash) + 1);
	}

	#getPrecommitCount(blockHash?: string): number {
		return this.#precommitsCount.get(blockHash) ?? 0;
	}

	#getSignatures(s: Map<number, { signature: string; blockHash?: string }>): Map<number, { signature: string }> {
		assert.defined(this.#proposal);
		const filtered: Map<number, { signature: string }> = new Map();

		const block = this.#proposal.getData().block;

		for (const [key, value] of s) {
			if (value.blockHash === block.header.hash) {
				filtered.set(key, value);
			}
		}

		return filtered;
	}
}
