import { inject, injectable, tagged } from "@mainsail/container";
import { Contracts, Identifiers } from "@mainsail/contracts";
import { Providers, Services } from "@mainsail/kernel";
import { shuffle } from "@mainsail/utils";
import dayjs from "dayjs";

import { normalizeUrl } from "./utils/index.js";

@injectable()
export class ApiNodeDiscoverer implements Contracts.P2P.ApiNodeDiscoverer {
	@inject(Identifiers.Application.Instance)
	private readonly app!: Contracts.Kernel.Application;

	@inject(Identifiers.ServiceProvider.Configuration)
	@tagged("plugin", "p2p")
	private readonly configuration!: Providers.PluginConfiguration;

	@inject(Identifiers.P2P.ApiNode.Factory)
	private readonly ApiNodeFactory!: Contracts.P2P.ApiNodeFactory;

	@inject(Identifiers.P2P.Peer.Communicator)
	private readonly communicator!: Contracts.P2P.PeerCommunicator;

	@inject(Identifiers.P2P.ApiNode.Repository)
	private readonly apiNodeRepository!: Contracts.P2P.ApiNodeRepository;

	@inject(Identifiers.P2P.Peer.Repository)
	private readonly peerRepository!: Contracts.P2P.PeerRepository;

	@inject(Identifiers.Services.Log.Service)
	private readonly logger!: Contracts.Kernel.Logger;

	async discoverApiNodes(peer: Contracts.P2P.Peer): Promise<void> {
		try {
			const { apiNodes } = await this.communicator.getApiNodes(peer);

			for (const apiNode of apiNodes) {
				await this.app.get<Services.Triggers.Triggers>(Identifiers.Services.Trigger.Service).call<{
					apiNode: Contracts.P2P.ApiNode;
					options: Contracts.P2P.AcceptNewPeerOptions;
				}>("validateAndAcceptApiNode", { apiNode, options: {} });
			}
		} catch (error) {
			this.logger.debug(`Failed to get api nodes from ${peer.ip}: ${error.message}`);
		}
	}

	async populateApiNodesFromConfiguration(): Promise<any> {
		const apiNodes = this.configuration.getOptional<string[]>("apiNodes", []).map((url) => {
			const normalizedUrl = normalizeUrl(url);
			return this.ApiNodeFactory(normalizedUrl);
		});

		return Promise.all(
			Object.values(apiNodes).map((apiNode: Contracts.P2P.ApiNode) =>
				this.app.get<Services.Triggers.Triggers>(Identifiers.Services.Trigger.Service).call<{
					apiNode: Contracts.P2P.ApiNode;
					options: Contracts.P2P.AcceptNewPeerOptions;
				}>("validateAndAcceptApiNode", { apiNode, options: { seed: true } }),
			),
		);
	}

	async discoverNewApiNodes(): Promise<any> {
		const peers = shuffle(this.peerRepository.getPeers()).slice(0, 5);
		return Promise.all(peers.map((peer) => this.discoverApiNodes(peer)));
	}

	async refreshApiNodes(): Promise<any> {
		return Promise.all(
			this.apiNodeRepository
				.getApiNodes()
				.filter((apiNode) =>
					// ignore nodes that were pinged recently
					(apiNode.lastPinged ?? dayjs()).isAfter(dayjs().add(10, "minutes")),
				)
				.map((apiNode) =>
					this.app.get<Services.Triggers.Triggers>(Identifiers.Services.Trigger.Service).call<{
						apiNode: Contracts.P2P.ApiNode;
					}>("revalidateApiNode", { apiNode }),
				),
		);
	}
}
