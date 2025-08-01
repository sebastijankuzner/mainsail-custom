import { injectable } from "@mainsail/container";
import { Contracts, Identifiers } from "@mainsail/contracts";
import { Providers } from "@mainsail/kernel";
import Joi from "joi";

import { Database } from "./database.js";
import { Listener } from "./listener.js";
import { Server } from "./server/index.js";

@injectable()
export class ServiceProvider extends Providers.ServiceProvider {
	public async register(): Promise<void> {
		// Setup Database...
		this.app.bind(Identifiers.Webhooks.Database).to(Database).inSingletonScope();
		this.app.get<Contracts.Webhooks.Database>(Identifiers.Webhooks.Database).boot();

		// Setup Server...
		this.app.bind(Identifiers.Webhooks.Server).to(Server).inSingletonScope();

		await this.app
			.get<Server>(Identifiers.Webhooks.Server)
			.register(this.config().get<Contracts.Types.JsonObject>("server")!);

		// Setup Listeners...
		this.#startListeners();
	}

	public async boot(): Promise<void> {
		await this.app.get<any>(Identifiers.Webhooks.Server).boot();
	}

	public async dispose(): Promise<void> {
		await this.app.get<any>(Identifiers.Webhooks.Server).dispose();
	}

	public async bootWhen(): Promise<boolean> {
		return this.config().getRequired<boolean>("enabled") === true && !this.app.isWorker();
	}

	public configSchema(): object {
		return Joi.object({
			enabled: Joi.boolean().required(),
			server: Joi.object({
				http: Joi.object({
					host: Joi.string()
						.ip({ version: ["ipv4", "ipv6"] })
						.required(),
					port: Joi.number().integer().min(1).max(65_535).required(),
				}).required(),
				whitelist: Joi.array().items(Joi.string()).required(),
			}).required(),
			timeout: Joi.number().integer().min(1).required(),
		}).unknown(true);
	}

	#startListeners(): void {
		this.app
			.get<Contracts.Kernel.EventDispatcher>(Identifiers.Services.EventDispatcher.Service)
			.listen("*", this.app.resolve(Listener));
	}
}
