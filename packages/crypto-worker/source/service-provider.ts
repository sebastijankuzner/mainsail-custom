import { injectable } from "@mainsail/container";
import { Contracts, Identifiers } from "@mainsail/contracts";
import { Ipc, Providers } from "@mainsail/kernel";
import Joi from "joi";
import { cpus } from "os";
import { URL } from "url";
import { Worker } from "worker_threads";

import { Worker as WorkerInstance } from "./worker.js";
import { WorkerPool } from "./worker-pool.js";

@injectable()
export class ServiceProvider extends Providers.ServiceProvider {
	public async register(): Promise<void> {
		this.app.bind(Identifiers.CryptoWorker.Worker.Instance).to(WorkerInstance);
		this.app
			.bind<() => WorkerInstance>(Identifiers.CryptoWorker.Worker.Factory)
			.toFactory(
				(context: Contracts.Kernel.Container.ResolutionContext) => () =>
					context.get<WorkerInstance>(Identifiers.CryptoWorker.Worker.Instance),
			);

		this.app.bind(Identifiers.CryptoWorker.WorkerPool).to(WorkerPool).inSingletonScope();

		this.app
			.bind<() => Ipc.Subprocess<any>>(Identifiers.CryptoWorker.WorkerSubprocess.Factory)
			.toFactory(() => () => {
				const subprocess = new Worker(`${new URL(".", import.meta.url).pathname}/worker-script.js`, {
					stderr: true,
					stdout: true,
				});
				return new Ipc.Subprocess(this.app, subprocess);
			});
	}

	public async boot(): Promise<void> {
		await this.app.get<Contracts.Crypto.WorkerPool>(Identifiers.CryptoWorker.WorkerPool).boot();
	}

	public async dispose(): Promise<void> {
		await this.app.get<Contracts.Crypto.WorkerPool>(Identifiers.CryptoWorker.WorkerPool).shutdown();
	}

	public async required(): Promise<boolean> {
		return true;
	}

	public configSchema(): Joi.AnySchema {
		return Joi.object({
			workerCount: Joi.number().integer().min(1).max(cpus().length).required(),
			workerLoggingEnabled: Joi.bool().required(),
		}).unknown(true);
	}
}
