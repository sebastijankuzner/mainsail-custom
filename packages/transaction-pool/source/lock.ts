import { Contracts } from "@mainsail/contracts";

class Job {
	private resolve = () => {};
	private reject = (reason?: any) => {};

	constructor(private callback: () => Promise<any>) {}

	public async createPromise(): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			this.resolve = resolve;
			this.reject = reject;
		});
	}

	public async run() {
		try {
			await this.callback();
			this.resolve();
		} catch (error) {
			this.reject(error);
		}
	}
}

export class Lock implements Contracts.TransactionPool.Lock {
	private locks = 0;
	private jobs: Job[] = [];
	private isRunning = false;

	public lock() {
		this.locks++;
	}

	public unlock() {
		this.locks--;

		void this.#executeNextPromise();
	}

	public async run<T>(callback: () => Promise<void>): Promise<void> {
		const job = new Job(callback);
		this.jobs.push(job);

		const promise = job.createPromise();

		void this.#executeNextPromise();

		return promise;
	}

	async #executeNextPromise(): Promise<void> {
		await new Promise((resolve) => setTimeout(resolve, 20));

		if (this.locks > 0 || this.jobs.length === 0 || this.isRunning) {
			return;
		}

		const job = this.jobs.shift();
		if (job) {
			this.isRunning = true;

			try {
				await job.run();
			} catch {}

			this.isRunning = false;
		}

		await this.#executeNextPromise();
	}
}
