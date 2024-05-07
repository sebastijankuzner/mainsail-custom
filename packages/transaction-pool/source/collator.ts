import { inject, injectable } from "@mainsail/container";
// @ts-ignore
import { Contracts, Identifiers } from "@mainsail/contracts";
import { TransferBuilder } from "@mainsail/crypto-transaction-transfer";
import { performance } from "perf_hooks";

@injectable()
export class Collator implements Contracts.TransactionPool.Collator {
	@inject(Identifiers.Application.Instance)
	private readonly app!: Contracts.Kernel.Application;

	@inject(Identifiers.Cryptography.Identity.Address.Factory)
	private readonly addressFactory!: Contracts.Crypto.AddressFactory;

	@inject(Identifiers.TransactionPool.TransactionValidator.Factory)
	private readonly createTransactionValidator!: Contracts.State.TransactionValidatorFactory;

	@inject(Identifiers.TransactionPool.Service)
	// @ts-ignore
	private readonly pool!: Contracts.TransactionPool.Service;

	@inject(Identifiers.TransactionPool.ExpirationService)
	// @ts-ignore
	private readonly expirationService!: Contracts.TransactionPool.ExpirationService;

	@inject(Identifiers.TransactionPool.Query)
	// @ts-ignore
	private readonly poolQuery!: Contracts.TransactionPool.Query;

	@inject(Identifiers.State.Service)
	protected readonly stateService!: Contracts.State.Service;

	@inject(Identifiers.Services.Log.Service)
	private readonly logger!: Contracts.Kernel.Logger;

	@inject(Identifiers.Cryptography.Configuration)
	private readonly configuration!: Contracts.Crypto.Configuration;

	@inject(Identifiers.Cryptography.Block.Serializer)
	private readonly blockSerializer!: Contracts.Crypto.BlockSerializer;

	private cache: Contracts.Crypto.Transaction[] = [];
	private secretId = 0;
	private continue = true;

	public initialize(): void {
		console.log("Collator initialized");

		void this.#build();
	}

	public async getBlockCandidateTransactions(): Promise<Contracts.Crypto.Transaction[]> {
		await new Promise((resolve) => setTimeout(resolve, 2500));

		this.continue = false;

		await new Promise((resolve) => setTimeout(resolve, 200));

		const result = this.cache;
		this.cache = [];

		void this.#build();

		return result;
	}

	async #build(): Promise<void> {
		this.continue = true;
		this.cache = await this.#getBlockCandidateTransactions();
	}

	async #getBlockCandidateTransactions(): Promise<Contracts.Crypto.Transaction[]> {
		const milestone = this.configuration.getMilestone();

		let bytesLeft: number = milestone.block.maxPayload - this.blockSerializer.headerSize();

		const candidateTransactions: Contracts.Crypto.Transaction[] = [];
		// @ts-ignore
		const validator: Contracts.State.TransactionValidator = this.createTransactionValidator();
		const failedTransactions: Contracts.Crypto.Transaction[] = [];
		// @ts-ignore
		const startTime = performance.now();

		const store = this.stateService.getStore();

		const secrets = this.app.config("validators.secrets");
		const secret = secrets[this.secretId++ % secrets.length];

		const address = await this.addressFactory.fromMnemonic(secret);

		let walletNonce = store.walletRepository.findByAddress(address).getNonce();

		const count = 0;

		while (this.continue) {
			if (count % 300 === 0) {
				await new Promise((resolve) => setTimeout(resolve, 0));
			}

			if (candidateTransactions.length === milestone.block.maxTransactions) {
				break;
			}

			// if (candidateTransactions.length === 15_000) {
			// 	break;
			// }

			// if (store.getLastHeight() < 3) {
			// 	break;
			// }

			// if (performance.now() - startTime > 3000) {
			// 	break;
			// }

			walletNonce = walletNonce.plus(1);

			const builder = await this.app
				.resolve(TransferBuilder)
				.nonce(walletNonce.toString())
				.recipientId(address)
				.amount("100")
				.sign(secret);

			const transaction = await builder.build();

			if (failedTransactions.some((t) => t.data.senderPublicKey === transaction.data.senderPublicKey)) {
				continue;
			}

			try {
				// if (await this.expirationService.isExpired(transaction)) {
				// 	const expirationHeight: number = await this.expirationService.getExpirationHeight(transaction);
				// 	throw new Exceptions.TransactionHasExpiredError(transaction, expirationHeight);
				// }

				if (bytesLeft - 4 - transaction.serialized.length < 0) {
					break;
				}

				// await validator.validate(transaction);
				candidateTransactions.push(transaction);

				bytesLeft -= 4;
				bytesLeft -= transaction.serialized.length;
			} catch (error) {
				this.logger.warning(`${transaction.id} failed to collate: ${error.message}`);
				failedTransactions.push(transaction);
			}
		}

		// eslint-disable-next-line @typescript-eslint/no-floating-promises
		(async () => {
			for (const failedTransaction of failedTransactions) {
				await this.pool.removeTransaction(failedTransaction);
			}
		})();

		this.logger.info(
			`!!!Collated ${candidateTransactions.length} transactions in ${performance.now() - startTime}ms`,
		);

		return candidateTransactions;
	}
}
