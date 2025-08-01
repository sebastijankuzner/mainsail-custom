import { inject, injectable, postConstruct, tagged } from "@mainsail/container";
import { Contracts, Events, Identifiers } from "@mainsail/contracts";
import { Providers } from "@mainsail/kernel";
import { isBlacklisted, isWhitelisted } from "@mainsail/utils";

import { isValidVersion } from "./utils/index.js";
import { isValidPeerIp } from "./validation/index.js";

@injectable()
export class PeerProcessor implements Contracts.P2P.PeerProcessor {
	@inject(Identifiers.Application.Instance)
	private readonly app!: Contracts.Kernel.Application;

	@inject(Identifiers.ServiceProvider.Configuration)
	@tagged("plugin", "p2p")
	private readonly configuration!: Providers.PluginConfiguration;

	@inject(Identifiers.P2P.Peer.Repository)
	private readonly repository!: Contracts.P2P.PeerRepository;

	@inject(Identifiers.P2P.Peer.Verifier)
	private readonly peerVerifier!: Contracts.P2P.PeerVerifier;

	@inject(Identifiers.P2P.Peer.Disposer)
	private readonly peerDisposer!: Contracts.P2P.PeerDisposer;

	@inject(Identifiers.P2P.Peer.Communicator)
	private readonly peerCommunicator!: Contracts.P2P.PeerCommunicator;

	@inject(Identifiers.P2P.Peer.Discoverer)
	private readonly peerDiscoverer!: Contracts.P2P.PeerDiscoverer;

	@inject(Identifiers.P2P.ApiNode.Discoverer)
	private readonly ApiNodeDiscoverer!: Contracts.P2P.ApiNodeDiscoverer;

	@inject(Identifiers.P2P.TxPoolNode.Factory)
	private readonly txPoolNodeFactory!: Contracts.P2P.TxPoolNodeFactory;

	@inject(Identifiers.P2P.TxPoolNode.Verifier)
	private readonly txPoolNodeVerifier!: Contracts.P2P.TxPoolNodeVerifier;

	@inject(Identifiers.TransactionPool.Worker)
	private readonly transactionPoolWorker!: Contracts.TransactionPool.Worker;

	@inject(Identifiers.Services.EventDispatcher.Service)
	private readonly events!: Contracts.Kernel.EventDispatcher;

	@inject(Identifiers.P2P.Logger)
	private readonly logger!: Contracts.P2P.Logger;

	@postConstruct()
	public initialize(): void {
		this.events.listen(Events.CryptoEvent.MilestoneChanged, {
			handle: () => this.#disconnectInvalidPeers(),
		});

		this.transactionPoolWorker.registerEventHandler("peer.removed", (ip: string) => {
			this.peerDisposer.disposePeer(ip);
		});
	}

	public isWhitelisted(peer: Contracts.P2P.Peer): boolean {
		return isWhitelisted(this.configuration.getOptional<string[]>("remoteAccess", []), peer.ip);
	}

	public async validateAndAcceptPeer(ip: string, options: Contracts.P2P.AcceptNewPeerOptions = {}): Promise<void> {
		if (this.repository.hasPeer(ip) || this.repository.hasPendingPeer(ip)) {
			return;
		}

		if (this.validatePeerIp(ip, options)) {
			await this.#acceptNewPeer(ip);
		}
	}

	public validatePeerIp(ip: string, options: Contracts.P2P.AcceptNewPeerOptions = {}): boolean {
		if (this.configuration.get("disableDiscovery")) {
			this.logger.warning(`Rejected ${ip} because the relay is in non-discovery mode.`);
			return false;
		}

		if (!isValidPeerIp(ip)) {
			return false;
		}

		if (!isWhitelisted(this.configuration.getRequired("whitelist"), ip)) {
			return false;
		}

		if (isBlacklisted(this.configuration.getRequired("blacklist"), ip)) {
			return false;
		}

		if (this.peerDisposer.isBanned(ip)) {
			return false;
		}

		const maxSameSubnetPeers = this.configuration.getRequired<number>("maxSameSubnetPeers");

		if (this.repository.getSameSubnetPeers(ip).length >= maxSameSubnetPeers && !options.seed) {
			this.logger.warningExtra(
				`Rejected ${ip} because we are already at the ${maxSameSubnetPeers} limit for peers sharing the same /24 subnet.`,
			);

			return false;
		}

		return true;
	}

	async #acceptNewPeer(ip: string): Promise<void> {
		const peer = this.app.get<Contracts.P2P.PeerFactory>(Identifiers.P2P.Peer.Factory)(ip);

		this.repository.setPendingPeer(peer);

		const txPoolNode = this.txPoolNodeFactory(ip);

		if ((await this.peerVerifier.verify(peer)) && (await this.txPoolNodeVerifier.verify(txPoolNode))) {
			this.repository.setPeer(peer);
			this.logger.debugExtra(`Accepted new peer ${peer.ip}:${peer.port} (v${peer.version})`);

			void this.events.dispatch(Events.PeerEvent.Added, peer);

			await this.transactionPoolWorker.setPeer(peer.ip);

			await this.peerCommunicator.pingPorts(peer);
			await this.peerDiscoverer.discoverPeers(peer);
			await this.ApiNodeDiscoverer.discoverApiNodes(peer);
		}

		this.repository.forgetPendingPeer(peer);
	}

	async #disconnectInvalidPeers(): Promise<void> {
		const peers = this.repository.getPeers();

		for (const peer of peers) {
			if (!peer.version || !isValidVersion(this.app, peer.version)) {
				this.peerDisposer.disposePeer(peer.ip);
			}
		}
	}
}
