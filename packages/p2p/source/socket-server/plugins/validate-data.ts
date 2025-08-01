import { ResponseToolkit } from "@hapi/hapi";
import { inject, injectable, tagged } from "@mainsail/container";
import { Contracts, Identifiers } from "@mainsail/contracts";
import { Providers } from "@mainsail/kernel";

import { isValidVersion } from "../../utils/index.js";
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
import { BasePlugin } from "./base-plugin.js";

@injectable()
export class ValidateDataPlugin extends BasePlugin {
	@inject(Identifiers.Application.Instance)
	protected readonly app!: Contracts.Kernel.Application;

	@inject(Identifiers.ServiceProvider.Configuration)
	@tagged("plugin", "p2p")
	private readonly configuration!: Providers.PluginConfiguration;

	public register(server) {
		if (this.configuration.getRequired("developmentMode.enabled")) {
			return;
		}

		const allRoutesConfigByPath = {
			...this.app.resolve(GetBlocksRoute).getRoutesConfigByPath(),
			...this.app.resolve(GetMessagesRoute).getRoutesConfigByPath(),
			...this.app.resolve(GetApiNodesRoute).getRoutesConfigByPath(),
			...this.app.resolve(GetPeersRoute).getRoutesConfigByPath(),
			...this.app.resolve(GetProposalRoute).getRoutesConfigByPath(),
			...this.app.resolve(GetStatusRoute).getRoutesConfigByPath(),
			...this.app.resolve(PostPrecommitRoute).getRoutesConfigByPath(),
			...this.app.resolve(PostPrevoteRoute).getRoutesConfigByPath(),
			...this.app.resolve(PostProposalRoute).getRoutesConfigByPath(),
		};

		server.ext({
			method: async (request: Contracts.P2P.Request, h: ResponseToolkit) => {
				const version = request.payload?.headers?.version;
				if (version && !isValidVersion(this.app, version)) {
					return this.disposeAndReturnBadRequest(
						request,
						h,
						`[${request.path}] Validation failed (invalid version)`,
					);
				}

				const result = allRoutesConfigByPath[request.path]?.validation?.validate(request.payload);
				if (result && result.error) {
					return this.banAndReturnBadRequest(request, h, `[${request.path}] Validation failed (bad payload)`);
				}
				return h.continue;
			},
			type: "onPostAuth",
		});
	}
}
