import Sntp from "@hapi/sntp";
import { inject, injectable, tagged } from "@mainsail/container";
import { Contracts, Identifiers } from "@mainsail/contracts";
import { Providers } from "@mainsail/kernel";
import { shuffle } from "@mainsail/utils";

@injectable()
export class Checker {
	@inject(Identifiers.ServiceProvider.Configuration)
	@tagged("plugin", "networking-dns")
	private readonly configuration!: Providers.PluginConfiguration;

	@inject(Identifiers.Services.Log.Service)
	private readonly logger!: Contracts.Kernel.Logger;

	public async execute(): Promise<void> {
		const timeout: number = this.configuration.getOptional("timeout", 2000);

		for (const host of shuffle(this.configuration.getOptional<string[]>("hosts", []))) {
			try {
				await Sntp.time({
					host,
					timeout,
				});

				return;
			} catch (error) {
				this.logger.error(`Host ${host} responded with: ${error.message}`);
			}
		}

		throw new Error("Please check your NTP connectivity, couldn't connect to any host.");
	}
}
