import { inject, injectable } from "@mainsail/container";
import { Contracts, Events, Identifiers } from "@mainsail/contracts";
import { assert } from "@mainsail/utils";

@injectable()
export class Store implements Contracts.State.Store {
	@inject(Identifiers.Cryptography.Configuration)
	private readonly configuration!: Contracts.Crypto.Configuration;

	@inject(Identifiers.Services.EventDispatcher.Service)
	private readonly events!: Contracts.Kernel.EventDispatcher;

	@inject(Identifiers.Services.Log.Service)
	private readonly logger!: Contracts.Kernel.Logger;

	#genesisCommit?: Contracts.Crypto.Commit;
	#lastBlock?: Contracts.Crypto.Block;
	#blockNumber = 0;
	#totalRound = 0;

	public setGenesisCommit(block: Contracts.Crypto.Commit): void {
		this.#genesisCommit = block;
	}

	public getGenesisCommit(): Contracts.Crypto.Commit {
		assert.defined(this.#genesisCommit);

		return this.#genesisCommit;
	}

	public setLastBlock(block: Contracts.Crypto.Block): void {
		this.#lastBlock = block;
		this.setBlockNumber(block.data.number);
	}

	public getLastBlock(): Contracts.Crypto.Block {
		assert.defined(this.#lastBlock);
		return this.#lastBlock;
	}

	// Set blockNumber is used on workers, because last block is not transferred
	public setBlockNumber(blockNumber: number): void {
		this.#blockNumber = blockNumber;
		this.configuration.setHeight(blockNumber + 1);

		if (this.configuration.isNewMilestone()) {
			this.logger.notice(`Milestone change: ${JSON.stringify(this.configuration.getMilestoneDiff())}`);
			void this.events.dispatch(Events.CryptoEvent.MilestoneChanged);
		}
	}

	public getBlockNumber(): number {
		return this.#blockNumber;
	}

	public setTotalRound(totalRound: number): void {
		this.#totalRound = totalRound;
	}

	public getTotalRound(): number {
		return this.#totalRound;
	}

	public async onCommit(unit: Contracts.Processor.ProcessableUnit): Promise<void> {
		this.setLastBlock(unit.getBlock());
		this.#totalRound += unit.round + 1;
	}
}
