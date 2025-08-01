import { inject, injectable, tagged } from "@mainsail/container";
import { Contracts, Identifiers } from "@mainsail/contracts";
import { Providers } from "@mainsail/kernel";
import { assert, IpAddress } from "@mainsail/utils";
import ip from "ip";

// @TODO review the implementation
@injectable()
export class PeerRepository implements Contracts.P2P.PeerRepository {
	@inject(Identifiers.ServiceProvider.Configuration)
	@tagged("plugin", "p2p")
	private readonly configuration!: Providers.PluginConfiguration;

	readonly #peers: Map<string, Contracts.P2P.Peer> = new Map<string, Contracts.P2P.Peer>();
	readonly #peersPending: Map<string, Contracts.P2P.Peer> = new Map<string, Contracts.P2P.Peer>();

	public getPeers(): Contracts.P2P.Peer[] {
		return [...this.#peers.values()];
	}

	public hasPeers(): boolean {
		return this.#peers.size > 0;
	}

	public getPeer(ip: string): Contracts.P2P.Peer {
		const peer: Contracts.P2P.Peer | undefined = this.#peers.get(ip);

		assert.defined(peer);

		return peer;
	}

	public setPeer(peer: Contracts.P2P.Peer): void {
		this.#peers.set(peer.ip, peer);
	}

	public forgetPeer(peer: Contracts.P2P.Peer): void {
		this.#peers.delete(peer.ip);
	}

	public hasPeer(ip: string): boolean {
		return this.#peers.has(ip);
	}

	public getPendingPeers(): Contracts.P2P.Peer[] {
		return [...this.#peersPending.values()];
	}

	public hasPendingPeers(): boolean {
		return this.#peersPending.size > 0;
	}

	public getPendingPeer(ip: string): Contracts.P2P.Peer {
		const peer = this.#peersPending.get(ip);

		assert.defined(peer);

		return peer;
	}

	public setPendingPeer(peer: Contracts.P2P.Peer): void {
		this.#peersPending.set(peer.ip, peer);
	}

	public forgetPendingPeer(peer: Contracts.P2P.Peer): void {
		this.#peersPending.delete(peer.ip);
	}

	public hasPendingPeer(ip: string): boolean {
		return this.#peersPending.has(ip);
	}

	public hasMinimumPeers(): boolean {
		if (this.configuration.getOptional<boolean>("ignoreMinimumNetworkReach", false)) {
			return true;
		}

		return Object.keys(this.getPeers()).length >= this.configuration.getRequired<number>("minimumNetworkReach");
	}

	public getSameSubnetPeers(peerIp: string): Contracts.P2P.Peer[] {
		return this.getPeers().filter((peer) => {
			if (!IpAddress.isIPv6Address(peer.ip) && !IpAddress.isIPv6Address(peerIp)) {
				return ip.cidr(`${peer.ip}/24`) === ip.cidr(`${peerIp}/24`);
			}

			return false;
		});
	}
}
