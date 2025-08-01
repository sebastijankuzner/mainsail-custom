import { injectable } from "@mainsail/container";
import { Contracts, Identifiers } from "@mainsail/contracts";
import { Providers, Services } from "@mainsail/kernel";
import Joi from "joi";

import { PinoLogger } from "./driver.js";

@injectable()
export class ServiceProvider extends Providers.ServiceProvider {
	public async register(): Promise<void> {
		const logManager: Services.Log.LogManager = this.app.get<Services.Log.LogManager>(
			Identifiers.Services.Log.Manager,
		);

		await logManager.extend("pino", async () => {
			const logger = this.app.resolve<PinoLogger>(PinoLogger);

			if (this.app.thread() === "main") {
				return logger.make(this.config().all());
			}

			// Log output from workers is piped to main logger via Ipc.Subprocess.
			return logger.make({ workerMode: true });
		});

		logManager.setDefaultDriver("pino");
	}

	public async dispose(): Promise<void> {
		await this.app.get<Contracts.Kernel.Logger>(Identifiers.Services.Log.Service).dispose();
	}

	public configSchema(): object {
		return Joi.object({
			fileRotator: Joi.object({
				interval: Joi.string().required(),
			}).required(),
			levels: Joi.object({
				console: Joi.string().required(),
				file: Joi.string().required(),
			}).required(),
		}).unknown(true);
	}
}
