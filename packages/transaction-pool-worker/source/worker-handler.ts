import { Container } from "@mainsail/container";
import { Contracts } from "@mainsail/contracts";
import { Application } from "@mainsail/kernel";

import {
	CommitHandler,
	ForgetPeerHandler,
	GetTransactionsHandler,
	ReloadWebhooksHandler,
	RemoveTransactionHandler,
	SetPeerHandler,
	StartHandler,
} from "./handlers/index.js";

export class WorkerScriptHandler implements Contracts.TransactionPool.WorkerScriptHandler {
	// @ts-ignore
	#app: Contracts.Kernel.Application;

	public async boot(flags: Contracts.Crypto.WorkerFlags): Promise<void> {
		const app: Contracts.Kernel.Application = new Application(new Container());

		await app.bootstrap({
			flags,
		});

		await app.boot();
		this.#app = app;
	}

	public async start(height: number): Promise<void> {
		await this.#app.resolve(StartHandler).handle(height);
	}

	public async commit(height: number, sendersAddresses: string[], consumedGas: number): Promise<void> {
		await this.#app.resolve(CommitHandler).handle(height, sendersAddresses, consumedGas);
	}

	public async getTransactions(): Promise<string[]> {
		return await this.#app.resolve(GetTransactionsHandler).handle();
	}

	public async removeTransaction(address: string, id: string): Promise<void> {
		await this.#app.resolve(RemoveTransactionHandler).handle(address, id);
	}

	public async setPeer(ip: string): Promise<void> {
		return await this.#app.resolve(SetPeerHandler).handle(ip);
	}

	public async forgetPeer(ip: string): Promise<void> {
		return await this.#app.resolve(ForgetPeerHandler).handle(ip);
	}

	public async reloadWebhooks(): Promise<void> {
		await this.#app.resolve(ReloadWebhooksHandler).handle();
	}
}
