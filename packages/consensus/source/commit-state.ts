import { inject, injectable } from "@mainsail/container";
import { Contracts, Identifiers } from "@mainsail/contracts";

@injectable()
export class CommitState implements Contracts.Processor.ProcessableUnit {
	@inject(Identifiers.ValidatorSet.Service)
	private readonly validatorSet!: Contracts.ValidatorSet.Service;

	#commit!: Contracts.Crypto.Commit;
	#processorResult?: Contracts.Processor.BlockProcessorResult;
	#validators = new Map<string, Contracts.State.ValidatorWallet>();
	#accountUpdates: Array<Contracts.Evm.AccountUpdate> = [];

	public get blockNumber(): number {
		return this.#commit.block.data.number;
	}

	public get round(): number {
		return this.#commit.proof.round;
	}

	public get validators(): string[] {
		return [...this.#validators.keys()];
	}

	public configure(commit: Contracts.Crypto.Commit): CommitState {
		this.#commit = commit;

		const validators = this.validatorSet.getRoundValidators();
		for (const validator of validators) {
			const consensusPublicKey = validator.blsPublicKey;
			this.#validators.set(consensusPublicKey, validator);
		}

		return this;
	}

	public getBlock(): Contracts.Crypto.Block {
		return this.#commit.block;
	}

	public setProcessorResult(processorResult: Contracts.Processor.BlockProcessorResult): void {
		this.#processorResult = processorResult;
	}

	public hasProcessorResult(): boolean {
		return this.#processorResult !== undefined;
	}

	public getProcessorResult(): Contracts.Processor.BlockProcessorResult {
		if (this.#processorResult == undefined) {
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

	public async getCommit(): Promise<Contracts.Crypto.Commit> {
		return this.#commit;
	}
}
