import { inject, injectable, multiInject, optional } from "@mainsail/container";
import { Contracts, Exceptions, Identifiers } from "@mainsail/contracts";

@injectable()
export class Processor implements Contracts.TransactionPool.Processor {
	@multiInject(Identifiers.TransactionPool.ProcessorExtension)
	@optional()
	private readonly extensions: Contracts.TransactionPool.ProcessorExtension[] = [];

	@inject(Identifiers.TransactionPool.Service)
	private readonly pool!: Contracts.TransactionPool.Service;

	@inject(Identifiers.TransactionPool.Broadcaster)
	private readonly broadcaster!: Contracts.TransactionPool.Broadcaster;

	@inject(Identifiers.Cryptography.Transaction.Factory)
	private readonly transactionFactory!: Contracts.Crypto.TransactionFactory;

	@inject(Identifiers.Services.Log.Service)
	private readonly logger!: Contracts.Kernel.Logger;

	public async process(data: Buffer[]): Promise<Contracts.TransactionPool.ProcessorResult> {
		const accept: number[] = [];
		const broadcast: number[] = [];
		const invalid: number[] = [];
		const excess: number[] = [];
		let errors: { [index: string]: Contracts.TransactionPool.ProcessorError } | undefined;

		const broadcastTransactions: Contracts.Crypto.Transaction[] = [];

		try {
			for (const [index, transactionData] of data.entries()) {
				try {
					const transaction = await this.#getTransactionFromBuffer(transactionData);

					await this.pool.addTransaction(transaction);
					accept.push(index);

					try {
						await Promise.all(this.extensions.map((e) => e.throwIfCannotBroadcast(transaction)));
						broadcastTransactions.push(transaction);
						broadcast.push(index);
					} catch {}
				} catch (error) {
					invalid.push(index);

					if (error instanceof Exceptions.PoolError) {
						if (error.type === "ERR_EXCEEDS_MAX_COUNT") {
							excess.push(index);
						}

						if (!errors) {
							errors = {};
						}
						errors[index] = {
							message: error.message,
							type: error.type,
						};
					} else {
						throw error;
					}
				}
			}
		} finally {
			if (this.broadcaster && broadcastTransactions.length > 0) {
				this.broadcaster
					.broadcastTransactions(broadcastTransactions)
					.catch((error) => this.logger.error(error.stack));
			}
		}

		return {
			accept,
			broadcast,
			errors,
			excess,
			invalid,
		};
	}

	async #getTransactionFromBuffer(transactionData: Buffer): Promise<Contracts.Crypto.Transaction> {
		try {
			return await this.transactionFactory.fromBytes(transactionData);
		} catch (error) {
			throw new Exceptions.InvalidTransactionDataError(error.message);
		}
	}
}
