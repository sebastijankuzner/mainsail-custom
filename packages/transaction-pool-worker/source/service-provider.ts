import { inject, injectable } from "@mainsail/container";
import { Contracts, Identifiers } from "@mainsail/contracts";
import { Ipc, Providers } from "@mainsail/kernel";
import Joi from "joi";
import { Worker } from "worker_threads";

import { Worker as WorkerInstance } from "./worker.js";

@injectable()
export class ServiceProvider extends Providers.ServiceProvider {
	@inject(Identifiers.Config.Flags)
	private readonly flags!: Contracts.Types.KeyValuePair;

	public async register(): Promise<void> {
		this.app
			.bind<() => Ipc.Subprocess<any>>(Identifiers.TransactionPool.WorkerSubprocess.Factory)
			.toFactory(() => () => {
				const subprocess = new Worker(`${new URL(".", import.meta.url).pathname}/worker-script.js`, {
					stderr: true,
					stdout: true,
				});
				return new Ipc.Subprocess(this.app, subprocess);
			});

		this.app.bind(Identifiers.TransactionPool.Worker).toConstantValue(this.app.resolve(WorkerInstance));
	}

	public async boot(): Promise<void> {
		await this.app.get<Contracts.TransactionPool.Worker>(Identifiers.TransactionPool.Worker).boot({
			...this.flags,
			thread: "transaction-pool",
		});
	}

	public async dispose(): Promise<void> {
		await this.app.get<Contracts.TransactionPool.Worker>(Identifiers.TransactionPool.Worker).kill();
	}

	public async required(): Promise<boolean> {
		return true;
	}

	public configSchema(): Joi.AnySchema {
		return Joi.object({}).required().unknown(true);
	}
}
