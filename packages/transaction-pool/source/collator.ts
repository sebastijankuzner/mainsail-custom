import { inject, injectable } from "@mainsail/container";
import { Contracts, Exceptions, Identifiers } from "@mainsail/contracts";
import { performance } from "perf_hooks";

@injectable()
export class Collator implements Contracts.TransactionPool.Collator {
	@inject(Identifiers.TransactionPool.TransactionValidator.Factory)
	private readonly createTransactionValidator!: Contracts.State.TransactionValidatorFactory;

	@inject(Identifiers.TransactionPool.Service)
	private readonly pool!: Contracts.TransactionPool.Service;

	@inject(Identifiers.TransactionPool.ExpirationService)
	private readonly expirationService!: Contracts.TransactionPool.ExpirationService;

	@inject(Identifiers.TransactionPool.Query)
	private readonly poolQuery!: Contracts.TransactionPool.Query;

	@inject(Identifiers.Services.Log.Service)
	private readonly logger!: Contracts.Kernel.Logger;

	@inject(Identifiers.Cryptography.Configuration)
	private readonly configuration!: Contracts.Crypto.Configuration;

	@inject(Identifiers.Cryptography.Block.Serializer)
	private readonly blockSerializer!: Contracts.Crypto.BlockSerializer;

	initialize(): void {}

	public async getBlockCandidateTransactions(): Promise<Contracts.Crypto.Transaction[]> {
		const milestone = this.configuration.getMilestone();

		let bytesLeft: number = milestone.block.maxPayload - this.blockSerializer.headerSize();

		const candidateTransactions: Contracts.Crypto.Transaction[] = [];
		const validator: Contracts.State.TransactionValidator = this.createTransactionValidator();
		const failedTransactions: Contracts.Crypto.Transaction[] = [];

		let count = 0;

		const t1 = performance.now();

		for (const transaction of await this.poolQuery.getFromHighestPriority().all()) {
			if (count++ % 30 === 0) {
				await new Promise((resolve) => setTimeout(resolve, 0));
			}

			if (performance.now() - t1 > 3000) {
				break;
			}

			// if (candidateTransactions.length === milestone.block.maxTransactions) {
			// 	break;
			// }

			if (candidateTransactions.length === 15_000) {
				break;
			}

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
