import { inject, injectable, tagged } from "@mainsail/container";
import { Constants, Contracts, Identifiers } from "@mainsail/contracts";
import { Providers } from "@mainsail/kernel";
import { groupBy, pluralize, randomNumber, shuffle } from "@mainsail/utils";
import dayjs from "dayjs";
import delay from "delay";

@injectable()
export class Service implements Contracts.P2P.Service {
	@inject(Identifiers.ServiceProvider.Configuration)
	@tagged("plugin", "p2p")
	private readonly configuration!: Providers.PluginConfiguration;

	@inject(Identifiers.P2P.State)
	private readonly state!: Contracts.P2P.State;

	@inject(Identifiers.P2P.Peer.Discoverer)
	private readonly peerDiscoverer!: Contracts.P2P.PeerDiscoverer;

	@inject(Identifiers.P2P.ApiNode.Discoverer)
	private readonly ApiNodeDiscoverer!: Contracts.P2P.ApiNodeDiscoverer;

	@inject(Identifiers.P2P.Peer.Verifier)
	private readonly peerVerifier!: Contracts.P2P.PeerVerifier;

	@inject(Identifiers.P2P.Peer.Repository)
	private readonly repository!: Contracts.P2P.PeerRepository;

	@inject(Identifiers.P2P.Peer.Disposer)
	private readonly peerDisposer!: Contracts.P2P.PeerDisposer;

	@inject(Identifiers.Services.Log.Service)
	private readonly logger!: Contracts.Kernel.Logger;

	#lastMinPeerCheck: dayjs.Dayjs = dayjs();
	#disposed = false;
	#mainLoopTimeout?: NodeJS.Timeout = undefined;
	#apiNodeCheckLoopTimeout?: NodeJS.Timeout = undefined;

	public async boot(): Promise<void> {
		if (process.env[Constants.EnvironmentVariables.MAINSAIL_ENV] === "test") {
			this.logger.info("Skipping P2P service boot, because test environment is used");

			return;
		}

		await this.ApiNodeDiscoverer.populateApiNodesFromConfiguration();

		await this.peerDiscoverer.populateSeedPeers();

		for (const [version, peers] of Object.entries(groupBy(this.repository.getPeers(), (peer) => peer.version))) {
			this.logger.info(`Discovered ${pluralize("peer", peers.length, true)} with v${version}.`);
		}

		void this.mainLoop();
		void this.#checkApiNodes();
	}

	public async mainLoop(): Promise<void> {
		await this.#checkMinPeers();
		await this.#checkReceivedMessages();

		if (!this.#disposed) {
			this.#mainLoopTimeout = setTimeout(() => this.mainLoop(), 2000);
		}
	}

	public async dispose(): Promise<void> {
		this.#disposed = true;
		clearTimeout(this.#mainLoopTimeout);
		clearTimeout(this.#apiNodeCheckLoopTimeout);
	}

	async #checkMinPeers(): Promise<void> {
		if (this.#lastMinPeerCheck.isAfter(dayjs().subtract(1, "minute"))) {
			return;
		}
		this.#lastMinPeerCheck = dayjs();

		if (!this.repository.hasMinimumPeers()) {
			this.logger.info(`Couldn't find enough peers. Falling back to seed peers.`);

			await this.peerDiscoverer.populateSeedPeers();

			for (const peer of shuffle(this.repository.getPeers()).slice(0, 8)) {
				await this.peerDiscoverer.discoverPeers(peer);
			}
		}
	}

	async #checkReceivedMessages(): Promise<void> {
		if (this.state.getLastMessageTime().isBefore(dayjs().subtract(8, "seconds"))) {
			const peersCount = Math.max(Math.ceil(this.repository.getPeers().length * 0.2), 5);

			await this.cleansePeers({
				fast: true,
				peerCount: peersCount,
			});
		}
	}

	async #checkApiNodes(): Promise<void> {
		await this.ApiNodeDiscoverer.discoverNewApiNodes();
		await this.ApiNodeDiscoverer.refreshApiNodes();

		if (!this.#disposed) {
			const nextTimeout = randomNumber(10, 20) * 60 * 1000;
			this.#apiNodeCheckLoopTimeout = setTimeout(() => this.#checkApiNodes(), nextTimeout);
		}
	}

	public async cleansePeers({ fast, peerCount }: { fast: boolean; peerCount: number }): Promise<void> {
		const max = Math.min(this.repository.getPeers().length, peerCount);
		const peers = shuffle(this.repository.getPeers()).slice(0, max);

		if (max === 0) {
			return;
		}

		let unresponsivePeers = 0;
		const pingDelay = fast ? 1500 : this.configuration.getRequired<number>("verifyTimeout");

		this.logger.info(`Checking ${pluralize("peer", max, true)}`);

		// we use Promise.race to cut loose in case some communicator.ping() does not resolve within the delay
		// in that case we want to keep on with our program execution while ping promises can finish in the background
		await new Promise<void>(async (resolve) => {
			let isResolved = false;

			// Simulates Promise.race, but doesn't cause "multipleResolvers" process error
			const resolvesFirst = () => {
				if (!isResolved) {
					isResolved = true;
					resolve();
				}
			};

			await Promise.all(
				peers.map(async (peer) => {
					if (!(await this.peerVerifier.verify(peer))) {
						unresponsivePeers++;

						this.peerDisposer.disposePeer(peer.ip);
					}
				}),
			).then(resolvesFirst);

			await delay(pingDelay).finally(resolvesFirst);
		});

		if (unresponsivePeers > 0) {
			this.logger.debug(`Removed ${pluralize("peer", unresponsivePeers, true)}`);
		}
	}

	public getNetworkBlockNumber(): number {
		const medians = this.repository
			.getPeers()
			.filter((peer) => peer.header.blockNumber)
			.map((peer) => peer.header.blockNumber)
			.sort((a, b) => a - b);

		return medians[Math.floor(medians.length / 2)] || 0;
	}
}
