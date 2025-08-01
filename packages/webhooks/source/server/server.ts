import Boom, { badData } from "@hapi/boom";
import { Server as HapiServer, ServerInjectOptions, ServerInjectResponse } from "@hapi/hapi";
import { inject, injectable } from "@mainsail/container";
import { Contracts, Identifiers } from "@mainsail/contracts";
import { cloneDeep } from "@mainsail/utils";
import { randomBytes } from "crypto";

import { whitelist } from "./plugins/whitelist.js";
import { destroy, show, store, update } from "./schema.js";
import { respondWithResource } from "./utilities.js";

export type WebhookAppState = { database: Contracts.Webhooks.Database };
export type WebhookServer = HapiServer<WebhookAppState>;

@injectable()
export class Server {
	@inject(Identifiers.Application.Instance)
	private readonly app!: Contracts.Kernel.Application;

	@inject(Identifiers.Webhooks.Database)
	private readonly database!: Contracts.Webhooks.Database;

	@inject(Identifiers.Services.Log.Service)
	private readonly logger!: Contracts.Kernel.Logger;

	#server!: WebhookServer;

	public async register(optionsServer: Contracts.Types.JsonObject): Promise<void> {
		this.#server = new HapiServer(this.#getServerOptions(optionsServer));
		this.#server.app.database = this.database;

		this.#server.ext({
			async method(request, h) {
				request.headers["content-type"] = "application/json";

				return h.continue;
			},
			type: "onPreHandler",
		});

		await this.#registerPlugins(optionsServer);

		this.#registerRoutes();
	}

	public async boot(): Promise<void> {
		try {
			await this.#server.start();

			this.logger.info(`Webhook Server started at ${this.#server.info.uri}`);
		} catch (error) {
			await this.app.terminate(`Failed to start Webhook Server!`, error);
		}
	}

	public async dispose(): Promise<void> {
		try {
			await this.#server.stop();

			this.logger.info(`Webhook Server stopped at ${this.#server.info.uri}`);
		} catch (error) {
			await this.app.terminate(`Failed to stop Webhook Server!`, error);
		}
	}

	public async inject(options: string | ServerInjectOptions): Promise<ServerInjectResponse> {
		return this.#server.inject(options);
	}

	#getServerOptions(options: Record<string, any>): object {
		options = {
			...options.http,
			whitelist: options.whitelist,
		};

		delete options.http;
		delete options.enabled;
		delete options.whitelist;

		return {
			router: {
				stripTrailingSlash: true,
			},
			routes: {
				/* c8 ignore next 3 */
				payload: {
					async failAction(request, h, error) {
						return badData(error.message);
					},
				},
				/* c8 ignore next 3 */
				validate: {
					async failAction(request, h, error) {
						return badData(error.message);
					},
				},
			},
			...options,
		};
	}

	async #registerPlugins(config: Contracts.Types.JsonObject): Promise<void> {
		await this.#server.register({
			options: {
				whitelist: config.whitelist,
			},
			plugin: whitelist,
		});
	}

	#registerRoutes(): void {
		this.#server.route({
			handler() {
				return { data: "Hello World!" };
			},
			method: "GET",
			path: "/",
		});

		this.#server.route({
			handler: (request) => ({
				// @ts-ignore TODO: check typings
				data: request.server.app.database.all().map((webhook) => {
					webhook = { ...webhook };
					delete webhook.token;
					return webhook;
				}),
			}),
			method: "GET",
			path: "/api/webhooks",
		});

		this.#server.route({
			handler(request: any, h) {
				const token: string = randomBytes(32).toString("hex");

				return h
					.response(
						respondWithResource({
							...request.server.app.database.create({
								...request.payload,
								token: token.slice(0, 32),
							}),
							token,
						}),
					)
					.code(201);
			},
			method: "POST",
			options: {
				plugins: {
					pagination: {
						enabled: false,
					},
				},
				validate: store,
			},
			path: "/api/webhooks",
		});

		this.#server.route({
			async handler(request) {
				// @ts-ignore TODO: check typings
				if (!request.server.app.database.hasById(request.params.id)) {
					return Boom.notFound();
				}

				const webhook: Contracts.Webhooks.Webhook | undefined = cloneDeep(
					// @ts-ignore TODO: check typings
					request.server.app.database.findById(request.params.id),
				);

				/* c8 ignore next 3 */
				if (!webhook) {
					return Boom.badImplementation();
				}

				delete webhook.token;

				return respondWithResource(webhook);
			},
			method: "GET",
			options: {
				validate: show,
			},
			path: "/api/webhooks/{id}",
		});

		this.#server.route({
			handler: (request, h) => {
				// @ts-ignore TODO: check typings
				if (!request.server.app.database.hasById(request.params.id)) {
					return Boom.notFound();
				}

				// @ts-ignore TODO: check typings
				request.server.app.database.update(request.params.id, request.payload as Contracts.Webhooks.Webhook);

				return h.response().code(204);
			},
			method: "PUT",
			options: {
				validate: update,
			},
			path: "/api/webhooks/{id}",
		});

		this.#server.route({
			handler: (request, h) => {
				// @ts-ignore TODO: check typings
				if (!request.server.app.database.hasById(request.params.id)) {
					return Boom.notFound();
				}

				// @ts-ignore TODO: check typings
				request.server.app.database.destroy(request.params.id);

				return h.response().code(204);
			},
			method: "DELETE",
			options: {
				validate: destroy,
			},
			path: "/api/webhooks/{id}",
		});
	}
}
