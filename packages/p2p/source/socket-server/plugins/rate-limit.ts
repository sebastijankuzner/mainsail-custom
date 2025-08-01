import Boom from "@hapi/boom";
import { inject, injectable, tagged } from "@mainsail/container";
import { Contracts, Identifiers } from "@mainsail/contracts";
import { Providers } from "@mainsail/kernel";

import { RateLimiter } from "../../rate-limiter.js";
import { buildRateLimiter } from "../../utils/build-rate-limiter.js";
import {
	GetApiNodesRoute,
	GetBlocksRoute,
	GetMessagesRoute,
	GetPeersRoute,
	GetProposalRoute,
	GetStatusRoute,
	PostPrecommitRoute,
	PostPrevoteRoute,
	PostProposalRoute,
} from "../routes/index.js";

@injectable()
export class RateLimitPlugin {
	@inject(Identifiers.Application.Instance)
	protected readonly app!: Contracts.Kernel.Application;

	@inject(Identifiers.ServiceProvider.Configuration)
	@tagged("plugin", "p2p")
	private readonly configuration!: Providers.PluginConfiguration;

	@inject(Identifiers.Cryptography.Configuration)
	private readonly cryptoConfiguration!: Contracts.Crypto.Configuration;

	private rateLimiter!: RateLimiter;

	public register(server) {
		this.rateLimiter = buildRateLimiter({
			rateLimit: this.configuration.getRequired<number>("rateLimit"),
			remoteAccess: this.configuration.getOptional<Array<string>>("remoteAccess", []),
			roundValidators: this.cryptoConfiguration.getRoundValidators(),
			whitelist: [],
		});

		const allRoutesConfigByPath = {
			...this.app.resolve(GetBlocksRoute).getRoutesConfigByPath(),
			...this.app.resolve(GetMessagesRoute).getRoutesConfigByPath(),
			...this.app.resolve(GetPeersRoute).getRoutesConfigByPath(),
			...this.app.resolve(GetApiNodesRoute).getRoutesConfigByPath(),
			...this.app.resolve(GetProposalRoute).getRoutesConfigByPath(),
			...this.app.resolve(GetStatusRoute).getRoutesConfigByPath(),
			...this.app.resolve(PostPrecommitRoute).getRoutesConfigByPath(),
			...this.app.resolve(PostPrevoteRoute).getRoutesConfigByPath(),
			...this.app.resolve(PostProposalRoute).getRoutesConfigByPath(),
		};

		server.ext({
			method: async (request, h) => {
				const endpoint = allRoutesConfigByPath[request.path].id;

				if (await this.rateLimiter.hasExceededRateLimit(request.info.remoteAddress, endpoint)) {
					return Boom.tooManyRequests("Rate limit exceeded");
				}
				return h.continue;
			},
			type: "onPreAuth",
		});
	}
}
