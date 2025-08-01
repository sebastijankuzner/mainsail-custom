import { inject, injectable, tagged } from "@mainsail/container";
import { Contracts, Identifiers } from "@mainsail/contracts";
import { Providers } from "@mainsail/kernel";
import { shuffle } from "@mainsail/utils";
import dns from "dns";
import util from "util";

@injectable()
export class Checker {
	@inject(Identifiers.ServiceProvider.Configuration)
	@tagged("plugin", "networking-dns")
	private readonly configuration!: Providers.PluginConfiguration;

	@inject(Identifiers.Services.Log.Service)
	private readonly logger!: Contracts.Kernel.Logger;

	public async execute(): Promise<void> {
		const lookupService = util.promisify(dns.lookupService);

		for (const host of shuffle(this.configuration.getRequired<string[]>("hosts"))) {
			try {
				await lookupService(host, 53);

				return;
			} catch (error) {
				this.logger.error(error.message);
			}
		}

		throw new Error("Please check your DNS connectivity, couldn't connect to any host.");
	}
}
