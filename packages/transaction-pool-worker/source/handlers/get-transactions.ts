import { inject, injectable } from "@mainsail/container";
import { Contracts, Identifiers } from "@mainsail/contracts";

@injectable()
export class GetTransactionsHandler {
	@inject(Identifiers.TransactionPool.Query)
	private readonly poolQuery!: Contracts.TransactionPool.Query;

	@inject(Identifiers.Cryptography.Configuration)
	private readonly configuration!: Contracts.Crypto.Configuration;

	@inject(Identifiers.Cryptography.Block.HeaderSize)
	private readonly headerSize!: () => number;

	public async handle(): Promise<string[]> {
		const milestone = this.configuration.getMilestone();
		let bytesLeft: number = milestone.block.maxPayload - this.headerSize();

		const candidateTransactions: Contracts.Crypto.Transaction[] = [];
		for (const transaction of await this.poolQuery.getFromHighestPriority().all()) {
			if (bytesLeft - 4 - transaction.serialized.length < 0) {
				break;
			}

			candidateTransactions.push(transaction);

			bytesLeft -= 4;
			bytesLeft -= transaction.serialized.length;
		}

		return candidateTransactions.map((transaction) => transaction.serialized.toString("hex"));
	}
}
