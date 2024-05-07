import { inject, injectable } from "@mainsail/container";
import { Contracts, Exceptions, Identifiers } from "@mainsail/contracts";
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

	public async getBlockCandidateTransactions(): Promise<Contracts.Crypto.Transaction[]> {
		const milestone = this.configuration.getMilestone();

		let bytesLeft: number = milestone.block.maxPayload - this.blockSerializer.headerSize();

		const candidateTransactions: Contracts.Crypto.Transaction[] = [];
		const validator: Contracts.State.TransactionValidator = this.createTransactionValidator();
		const failedTransactions: Contracts.Crypto.Transaction[] = [];
		const startTime = performance.now();

		const store = this.stateService.getStore();

		const secrets = this.app.config("validators.secrets");
		const secret = secrets[0];

		const address = await this.addressFactory.fromMnemonic(secret);

		let walletNonce = store.walletRepository.findByAddress(address).getNonce();

		while (true) {
			// if (candidateTransactions.length === milestone.block.maxTransactions) {
			// 	break;
			// }

			// if (candidateTransactions.length === 5000) {
			// 	break;
			// }

			if (store.getLastHeight() < 3) {
				break;
			}

			if (performance.now() - startTime > 3000) {
				break;
			}

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
				if (await this.expirationService.isExpired(transaction)) {
					const expirationHeight: number = await this.expirationService.getExpirationHeight(transaction);
					throw new Exceptions.TransactionHasExpiredError(transaction, expirationHeight);
				}

				if (bytesLeft - 4 - transaction.serialized.length < 0) {
					break;
				}

				await validator.validate(transaction);
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

		return candidateTransactions;
	}
}
