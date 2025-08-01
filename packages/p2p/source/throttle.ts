import { inject, injectable, tagged } from "@mainsail/container";
import { Contracts, Identifiers } from "@mainsail/contracts";
import { Providers, Types } from "@mainsail/kernel";
import delay from "delay";

import { RateLimiter } from "./rate-limiter.js";
import { buildRateLimiter } from "./utils/index.js";

@injectable()
export class Throttle {
	@inject(Identifiers.ServiceProvider.Configuration)
	@tagged("plugin", "p2p")
	private readonly configuration!: Providers.PluginConfiguration;

	@inject(Identifiers.Cryptography.Configuration)
	private readonly cryptoConfiguration!: Contracts.Crypto.Configuration;

	@inject(Identifiers.Services.Queue.Factory)
	private readonly createQueue!: Types.QueueFactory;

	@inject(Identifiers.Services.Log.Service)
	private readonly logger!: Contracts.Kernel.Logger;

	#queue!: Contracts.Kernel.Queue;

	#outgoingRateLimiter!: RateLimiter;

	public async initialize(): Promise<Throttle> {
		this.#outgoingRateLimiter = buildRateLimiter({
			rateLimit: this.configuration.getRequired<number>("rateLimit"),

			remoteAccess: [],

			roundValidators: this.cryptoConfiguration.getRoundValidators(),
			// White listing anybody here means we would not throttle ourselves when sending
			// them requests, ie we could spam them.
			whitelist: [],
		});

		this.#queue = await this.createQueue();
		await this.#queue.start();

		return this;
	}

	public async throttle(peer: Contracts.P2P.Peer, event: string): Promise<void> {
		return new Promise<void>((resolve) => {
			void this.#queue.push({
				handle: async () => {
					await this.#process(peer, event, resolve);
				},
			});
		});
	}

	async #process(peer: Contracts.P2P.Peer, event: string, resolve: () => void): Promise<void> {
		if (await this.#outgoingRateLimiter.hasExceededRateLimitNoConsume(peer.ip, event)) {
			this.logger.debug(
				`Throttling outgoing requests to ${peer.ip}/${event} to avoid triggering their rate limit`,
			);

			await delay(100);

			void this.#queue.push({
				handle: async () => {
					await this.#process(peer, event, resolve);
				},
			});
		} else {
			await this.#outgoingRateLimiter.consume(peer.ip, event);

			resolve();
		}
	}
}
