import { injectable } from "@mainsail/container";
import { Contracts, Identifiers } from "@mainsail/contracts";
import { Providers, Services } from "@mainsail/kernel";
import Joi from "joi";

import { ThrowIfCannotBeAppliedAction, VerifyTransactionAction } from "./actions/index.js";
import { Mempool } from "./mempool.js";
import { Processor } from "./processor.js";
import { Query } from "./query.js";
import { SenderMempool } from "./sender-mempool.js";
import { SenderState } from "./sender-state.js";
import { Service } from "./service.js";
import { Storage } from "./storage.js";

@injectable()
export class ServiceProvider extends Providers.ServiceProvider {
	public async register(): Promise<void> {
		this.#registerServices();
		this.#registerActions();
	}

	public async boot(): Promise<void> {
		this.app.get<Storage>(Identifiers.TransactionPool.Storage).boot();
		await this.app.get<Service>(Identifiers.TransactionPool.Service).boot();
	}

	public async dispose(): Promise<void> {
		this.app.get<Service>(Identifiers.TransactionPool.Service).dispose();
		this.app.get<Storage>(Identifiers.TransactionPool.Storage).dispose();
	}

	public async required(): Promise<boolean> {
		return true;
	}

	public configSchema(): object {
		return Joi.object({
			allowedSenders: Joi.array().items(Joi.string()).required(),
			enabled: Joi.bool().required(),
			maxTransactionAge: Joi.number().integer().min(1).required(),
			maxTransactionBytes: Joi.number().integer().min(1).required(),
			maxTransactionsInPool: Joi.number().integer().min(1).required(),
			maxTransactionsPerRequest: Joi.number().integer().min(1).required(),
			maxTransactionsPerSender: Joi.number().integer().min(1).required(),
			storage: Joi.string().required(),
		}).unknown(true);
	}

	#registerServices(): void {
		this.app.bind(Identifiers.TransactionPool.Mempool).to(Mempool).inSingletonScope();
		this.app.bind(Identifiers.TransactionPool.Processor).to(Processor);
		this.app.bind(Identifiers.TransactionPool.Query).to(Query);
		this.app
			.bind<
				(address: string, legacyAddress?: string) => Promise<SenderMempool>
			>(Identifiers.TransactionPool.SenderMempool.Factory)
			.toFactory(
				(context: Contracts.Kernel.Container.ResolutionContext) =>
					async (address: string, legacyAddress?: string) =>
						await context.get(SenderMempool, { autobind: true }).configure(address, legacyAddress),
			);
		this.app.bind(Identifiers.TransactionPool.SenderState).to(SenderState);
		this.app.bind(Identifiers.TransactionPool.Service).to(Service).inSingletonScope();
		this.app.bind(Identifiers.TransactionPool.Storage).to(Storage).inSingletonScope();
	}

	#registerActions(): void {
		this.app
			.get<Services.Triggers.Triggers>(Identifiers.Services.Trigger.Service)
			.bind("verifyTransaction", this.app.resolve(VerifyTransactionAction));

		this.app
			.get<Services.Triggers.Triggers>(Identifiers.Services.Trigger.Service)
			.bind("throwIfCannotBeApplied", this.app.resolve(ThrowIfCannotBeAppliedAction));
	}
}
