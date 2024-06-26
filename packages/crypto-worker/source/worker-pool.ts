import { inject, injectable, tagged } from "@mainsail/container";
import { Contracts, Identifiers } from "@mainsail/contracts";
import { Providers, Types } from "@mainsail/kernel";

@injectable()
export class WorkerPool implements Contracts.Crypto.WorkerPool {
	@inject(Identifiers.ServiceProvider.Configuration)
	@tagged("plugin", "crypto-worker")
	private readonly configuration!: Providers.PluginConfiguration;

	@inject(Identifiers.Services.Log.Service)
	private readonly logger!: Contracts.Kernel.Logger;

	@inject(Identifiers.CryptoWorker.Worker.Factory)
	private readonly createWorker!: Contracts.Crypto.WorkerFactory;

	private workers: Contracts.Crypto.Worker[] = [];

	@inject(Identifiers.Config.Flags)
	private readonly flags!: Types.KeyValuePair;

	#currentWorkerIndex = 0;

	public async boot(): Promise<void> {
		const workerCount = this.configuration.getRequired<number>("workerCount");

		for (let index = 0; index < workerCount; index++) {
			const worker = this.createWorker();
			this.workers.push(worker);
		}

		this.logger.info(`Booting up ${this.workers.length} crypto workers`);

		await Promise.all(
			this.workers.map((worker) =>
				worker.boot({
					...this.flags,
					thread: "crypto-worker",
					workerLoggingEnabled: this.configuration.getRequired("workerLoggingEnabled"),
				}),
			),
		);
	}

	public async shutdown(): Promise<void> {
		await Promise.all(this.workers.map(async (worker) => await worker.kill()));
	}

	public async getWorker(): Promise<Contracts.Crypto.Worker> {
		const worker = this.workers[this.#currentWorkerIndex];
		this.#currentWorkerIndex = (this.#currentWorkerIndex + 1) % this.workers.length;

		return worker;
	}
}
