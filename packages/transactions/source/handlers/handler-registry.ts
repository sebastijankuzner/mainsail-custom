import { injectable, multiInject } from "@mainsail/container";
import { Contracts, Exceptions, Identifiers } from "@mainsail/contracts";
import { assert } from "@mainsail/utils";

import { TransactionHandler } from "./transaction.js";

@injectable()
export class TransactionHandlerRegistry implements Contracts.Transactions.TransactionHandlerRegistry {
	@multiInject(Identifiers.Transaction.Handler.Instances)
	private readonly handlers!: TransactionHandler[];

	public getRegisteredHandlers(): TransactionHandler[] {
		return this.handlers;
	}

	public getRegisteredHandlerByType(internalType: number, version = 0): TransactionHandler {
		const [handler] = this.handlers;
		assert.defined(handler);
		return handler;
	}

	public async getActivatedHandlers(): Promise<TransactionHandler[]> {
		const promises = this.handlers.map(
			async (handler): Promise<[TransactionHandler, boolean]> => [handler, await handler.isActivated()],
		);
		const results = await Promise.all(promises);
		const activated = results.filter(([_, activated]) => activated);
		return activated.map(([handler, _]) => handler);
	}

	public async getActivatedHandlerByType(internalType: number, version = 0): Promise<TransactionHandler> {
		const handler = this.getRegisteredHandlerByType(internalType, version);
		if (await handler.isActivated()) {
			return handler;
		}
		throw new Exceptions.DeactivatedTransactionHandlerError(internalType);
	}

	public async getActivatedHandlerForData(
		transactionData: Contracts.Crypto.TransactionData,
	): Promise<TransactionHandler> {
		return this.getActivatedHandlerByType(0, 0);
	}
}
