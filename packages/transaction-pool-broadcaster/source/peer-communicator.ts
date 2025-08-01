import { inject, injectable, tagged } from "@mainsail/container";
import { Contracts, Identifiers } from "@mainsail/contracts";
import { Ipc, Providers } from "@mainsail/kernel";
import { http } from "@mainsail/utils";
import dayjs from "dayjs";

@injectable()
export class PeerCommunicator implements Contracts.TransactionPool.PeerCommunicator {
	@inject(Identifiers.TransactionPool.Peer.Repository)
	private readonly repository!: Contracts.TransactionPool.PeerRepository;

	@inject(Identifiers.ServiceProvider.Configuration)
	@tagged("plugin", "transaction-pool-broadcaster")
	protected readonly configuration!: Providers.PluginConfiguration;

	@inject(Identifiers.Services.Log.Service)
	private readonly logger!: Contracts.Kernel.Logger;

	public async postTransactions(
		peer: Contracts.TransactionPool.Peer,
		transactions: Contracts.Crypto.Transaction[],
	): Promise<void> {
		try {
			await http.post(`${peer.url}/api/transactions`, {
				body: { transactions: transactions.map((transaction) => transaction.serialized.toString("hex")) },
			});
		} catch (error) {
			this.handleSocketError(peer, error);
		}

		peer.errorCount = 0;
		peer.lastPinged = dayjs();
	}

	private handleSocketError(peer: Contracts.TransactionPool.Peer, error: Error): void {
		this.logger.debug(`socket error ${peer.ip}: ${error.message}`);

		if (peer.errorCount++ > this.configuration.getRequired<number>("maxSequentialErrors")) {
			this.repository.forgetPeer(peer.ip);
			Ipc.emit("peer.removed", peer.ip);
		}
	}
}
