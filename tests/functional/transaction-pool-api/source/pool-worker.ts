import { inject, injectable } from "@mainsail/container";
import { Contracts, Identifiers } from "@mainsail/contracts";
import { GetTransactionsHandler } from "@mainsail/transaction-pool-worker/distribution/handlers/index.js";

@injectable()
export class PoolWorker implements Contracts.TransactionPool.Worker {
	@inject(Identifiers.Application.Instance)
	private readonly app!: Contracts.Kernel.Application;

	@inject(Identifiers.TransactionPool.Mempool)
	private readonly transactionPoolMempool!: Contracts.TransactionPool.Mempool;

	public async boot(flags: Contracts.TransactionPool.WorkerFlags): Promise<void> {}

	public handle(): void {}

	public async start(): Promise<void> {}

	public async kill(): Promise<number> {
		return 0;
	}
	public getQueueSize(): number {
		return 0;
	}
	async onCommit(unit: Contracts.Processor.ProcessableUnit): Promise<void> {
		const sendersAddresses: Set<string> = new Set();

		for (const transaction of unit.getBlock().transactions) {
			sendersAddresses.add(transaction.data.from);
		}

		await this.transactionPoolMempool.reAddTransactions([...sendersAddresses.keys()]);
	}

	public async getTransactionBytes(): Promise<Buffer[]> {
		const response: string[] = await this.app.resolve(GetTransactionsHandler).handle();
		return response.map((transaction: string) => Buffer.from(transaction, "hex"));
	}

	public async removeTransaction(address: string, hash: string): Promise<void> {
		await this.transactionPoolMempool.removeTransaction(address, hash);
	}

	registerEventHandler(event: string, callback: Contracts.Kernel.IPC.EventCallback<any>): void {}

	async setPeer(ip: string): Promise<void> {}
	async forgetPeer(ip: string): Promise<void> {}
	async reloadWebhooks(): Promise<void> {}
}
