import { inject, injectable, tagged } from "@mainsail/container";
import { Contracts, Identifiers } from "@mainsail/contracts";
import { Application, Enums, IpcWorker } from "@mainsail/kernel";
import { BigNumber } from "@mainsail/utils";
import lmdb from "lmdb";

// @TODO review the implementation
@injectable()
export class StateBuilder {
	@inject(Identifiers.Application)
	private readonly app!: Application;

	@inject(Identifiers.WalletRepository)
	@tagged("state", "blockchain")
	private walletRepository!: Contracts.State.WalletRepository;

	@inject(Identifiers.DposState)
	@tagged("state", "blockchain")
	private dposState!: Contracts.State.DposState;

	@inject(Identifiers.EventDispatcherService)
	private events!: Contracts.Kernel.EventDispatcher;

	@inject(Identifiers.LogService)
	private logger!: Contracts.Kernel.Logger;

	@inject(Identifiers.Cryptography.Block.Factory)
	private readonly blockFactory!: Contracts.Crypto.IBlockFactory;

	@inject(Identifiers.Database.BlockStorage)
	private readonly blockStorage!: lmdb.Database;

	@inject(Identifiers.Cryptography.Configuration)
	private readonly configuration!: Contracts.Crypto.IConfiguration;

	@inject(Identifiers.Ipc.WorkerPool)
	private readonly workerPool!: IpcWorker.WorkerPool;

	public async run(): Promise<void> {
		this.events = this.app.get<Contracts.Kernel.EventDispatcher>(Identifiers.EventDispatcherService);

		const registeredHandlers = this.app
			.getTagged<Contracts.Transactions.ITransactionHandlerRegistry>(
				Identifiers.TransactionHandlerRegistry,
				"state",
				"blockchain",
			)
			.getRegisteredHandlers();


		// TODO: remove
		const worker = await this.workerPool.getWorker();
		const x = await worker.transactionFactory("fromHex", "ff011e0100000000000000000000000000287bfebba4c7881a0509717e71b34b63f31e40021c321f89ae04f84be6d6ac3780969800000000000d5472616e73616374696f6e203700c2eb0b000000000000000005011d1f1d0e1d04181e0401140108090e051f07030c1a0b0c0f19111c100002031019011f020d0e00131c041719161615101b103045022100bac5b7699748a891b39ff5439e16ea1a694e93954b248be6b8082da01e5386310220129eb06a58b9f80d36ea3cdc903e6cc0240bbe1d371339ffe1");
		console.log(x.data.id);

		try {
			this.logger.info(`State Generation - Bootstrap - Blocks: ${this.blockStorage.getCount({})}`);

			for (const { value } of this.blockStorage.getRange({})) {
				const { data, transactions } = await this.blockFactory.fromBytes(value);

				await this.#buildBlockRewards(data);
				await this.#buildSentTransactions(transactions);

				for (const handler of registeredHandlers.values()) {
					await handler.bootstrap(this.walletRepository, transactions);
				}
			}

			this.logger.info(`State Generation - Vote Balances & Validator Ranking`);
			this.dposState.buildVoteBalances();
			this.dposState.buildValidatorRanking();

			this.logger.info(
				`Number of registered validators: ${Object.keys(
					this.walletRepository.allByUsername(),
				).length.toLocaleString()}`,
			);

			this.#verifyWalletsConsistency();

			await this.events.dispatch(Enums.StateEvent.BuilderFinished);
		} catch (error) {
			this.logger.error(error.stack);
		}
	}

	async #buildBlockRewards(block: Contracts.Crypto.IBlockData): Promise<void> {
		const wallet = await this.walletRepository.findByPublicKey(block.generatorPublicKey);
		wallet.increaseBalance(BigNumber.make(block.reward));
	}

	async #buildSentTransactions(transactions: Contracts.Crypto.ITransaction[]): Promise<void> {
		for (const { data: transaction } of transactions) {
			const wallet = await this.walletRepository.findByPublicKey(transaction.senderPublicKey);
			wallet.setNonce(BigNumber.make(transaction.nonce));
			wallet.decreaseBalance(BigNumber.make(transaction.amount).plus(transaction.fee));
		}
	}

	#verifyWalletsConsistency(): void {
		const logNegativeBalance = (wallet, type, balance) =>
			this.logger.warning(`Wallet ${wallet.address} has a negative ${type} of '${balance}'`);

		const genesisPublicKeys: Record<string, true> = Object.fromEntries(
			this.configuration.get("genesisBlock.transactions").map((current) => [current.senderPublicKey, true]),
		);

		for (const wallet of this.walletRepository.allByAddress()) {
			if (wallet.getBalance().isLessThan(0) && !genesisPublicKeys[wallet.getPublicKey()!]) {
				logNegativeBalance(wallet, "balance", wallet.getBalance());

				throw new Error("Non-genesis wallet with negative balance.");
			}

			if (wallet.hasAttribute("validator.voteBalance")) {
				const voteBalance: BigNumber = wallet.getAttribute("validator.voteBalance");

				if (voteBalance.isLessThan(0)) {
					logNegativeBalance(wallet, "vote balance", voteBalance);
					throw new Error("Wallet with negative vote balance.");
				}
			}
		}
	}
}
