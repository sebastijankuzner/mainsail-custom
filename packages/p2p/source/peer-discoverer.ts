import { inject, injectable } from "@mainsail/container";
import { Contracts, Identifiers } from "@mainsail/contracts";
import { Services } from "@mainsail/kernel";
import { http } from "@mainsail/utils";
import { readJSONSync } from "fs-extra/esm";

@injectable()
export class PeerDiscoverer implements Contracts.P2P.PeerDiscoverer {
	@inject(Identifiers.Application.Instance)
	private readonly app!: Contracts.Kernel.Application;

	@inject(Identifiers.P2P.Peer.Factory)
	private readonly peerFactory!: Contracts.P2P.PeerFactory;

	@inject(Identifiers.P2P.Peer.Communicator)
	private readonly communicator!: Contracts.P2P.PeerCommunicator;

	@inject(Identifiers.P2P.Peer.Disposer)
	private readonly peerDisposer!: Contracts.P2P.PeerDisposer;

	@inject(Identifiers.Services.Log.Service)
	private readonly logger!: Contracts.Kernel.Logger;

	async discoverPeers(peer: Contracts.P2P.Peer): Promise<void> {
		try {
			const { peers } = await this.communicator.getPeers(peer);

			for (const peer of peers) {
				await this.app.get<Services.Triggers.Triggers>(Identifiers.Services.Trigger.Service).call<{
					ip: string;
					options: Contracts.P2P.AcceptNewPeerOptions;
				}>("validateAndAcceptPeer", { ip: peer.ip, options: {} });
			}
		} catch (error) {
			this.logger.debug(`Failed to get peers from ${peer.ip}: ${error.message}`);
			this.peerDisposer.banPeer(peer.ip, error);
		}
	}

	async populateSeedPeers(): Promise<any> {
		const peerList: Contracts.P2P.PeerData[] = this.app.config("peers").list;

		try {
			const peersFromUrl = await this.#loadPeersFromUrlList();
			for (const peer of peersFromUrl) {
				if (!peerList.find((p) => p.ip === peer.ip)) {
					peerList.push({
						ip: peer.ip,
						port: peer.port,
					});
				}
			}
		} catch {}

		if (!peerList || peerList.length === 0) {
			await this.app.terminate("No seed peers defined in peers.json");
		}

		const peers: Contracts.P2P.Peer[] = peerList.map((peer) => {
			const peerInstance = this.peerFactory(peer.ip);
			peerInstance.version = this.app.version();
			return peerInstance;
		});

		return Promise.all(
			Object.values(peers).map((peer: Contracts.P2P.Peer) =>
				this.app.get<Services.Triggers.Triggers>(Identifiers.Services.Trigger.Service).call<{
					ip: string;
					options: Contracts.P2P.AcceptNewPeerOptions;
				}>("validateAndAcceptPeer", { ip: peer.ip, options: { seed: true } }),
			),
		);
	}

	// TODO: Get from all sources
	async #loadPeersFromUrlList(): Promise<Array<{ ip: string; port: number }>> {
		const urls: string[] = this.app.config("peers").sources || [];

		for (const url of urls) {
			// Local File...
			if (url.startsWith("/")) {
				return readJSONSync(url);
			}

			// URL...
			this.logger.debug(`GET ${url}`);
			const { data } = await http.get(url);
			return typeof data === "object" ? data : JSON.parse(data);
		}

		return [];
	}
}
