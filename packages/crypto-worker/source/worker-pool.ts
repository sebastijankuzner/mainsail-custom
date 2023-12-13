import { inject, injectable, tagged } from "@mainsail/container";
import { Contracts, Identifiers } from "@mainsail/contracts";
import { IpcWorker, Providers, Types } from "@mainsail/kernel";

@injectable()
export class WorkerPool implements IpcWorker.WorkerPool {
	@inject(Identifiers.PluginConfiguration)
	@tagged("plugin", "crypto-worker")
	private readonly configuration!: Providers.PluginConfiguration;

	@inject(Identifiers.LogService)
	private readonly logger!: Contracts.Kernel.Logger;

	@inject(Identifiers.Ipc.WorkerFactory)
	private readonly createWorker!: IpcWorker.WorkerFactory;

	private workers: IpcWorker.Worker[] = [];

	@inject(Identifiers.ConfigFlags)
	private readonly flags!: Types.KeyValuePair;

	public async boot(): Promise<void> {
		const workerCount = this.configuration.getRequired<number>("workerCount");

		for (let index = 0; index < workerCount; index++) {
			const worker = this.createWorker();
			this.workers.push(worker);
		}

		this.logger.info(`Booting up ${this.workers.length} workers`);

		await Promise.all(
			this.workers.map((worker) =>
				worker.boot({
					...this.flags,
					workerLoggingEnabled: this.configuration.getOptional<boolean>("workerLoggingEnabled", false),
				}),
			),
		);
	}

	public async shutdown(signal?: number | NodeJS.Signals): Promise<void> {
		await Promise.all(this.workers.map((worker) => worker.kill(signal)));
	}

	public async getWorker(): Promise<IpcWorker.Worker> {
		return this.workers.reduce((previous, next) => {
			if (previous.getQueueSize() < next.getQueueSize()) {
				return previous;
			} else {
				return next;
			}
		});
	}
}
