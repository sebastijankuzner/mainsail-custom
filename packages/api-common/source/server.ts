import Boom from "@hapi/boom";
import { Server as HapiServer, ServerInjectOptions, ServerInjectResponse, ServerRoute } from "@hapi/hapi";
import { inject, injectable } from "@mainsail/container";
import { Contracts, Identifiers } from "@mainsail/contracts";
import { Providers } from "@mainsail/kernel";
import { merge } from "@mainsail/utils";
import { readFileSync } from "fs";

import { Processor } from "./rcp/index.js";

@injectable()
export abstract class AbstractServer {
	@inject(Identifiers.Application.Instance)
	protected readonly app!: Contracts.Kernel.Application;

	@inject(Identifiers.Services.Log.Service)
	protected readonly logger!: Contracts.Kernel.Logger;

	private server!: Contracts.Api.ApiServer;

	protected abstract baseName(): string;
	private serverType!: Contracts.Api.ServerType;

	public get prettyName(): string {
		return `${this.baseName()} (${this.serverType})`;
	}

	public get uri(): string {
		return this.server.info.uri;
	}

	public async initialize(type: Contracts.Api.ServerType, optionsServer: Contracts.Types.JsonObject): Promise<void> {
		this.server = new HapiServer(this.getServerOptions(optionsServer));

		this.serverType = type;

		const timeout: number = this.pluginConfiguration().getRequired<number>("plugins.socketTimeout");
		this.server.listener.timeout = timeout;
		this.server.listener.keepAliveTimeout = timeout;
		this.server.listener.headersTimeout = timeout;

		this.server.app.app = this.app;
		this.server.app.schemas = this.schemas();
		this.server.app.rpc = this.app.resolve(Processor);

		this.server.ext("onPreHandler", (request, h) => {
			request.headers["content-type"] = "application/json";
			return h.continue;
		});

		this.server.ext("onPreResponse", (request, h) => {
			if ("isBoom" in request.response && request.response.isBoom && request.response.isServer) {
				if (request.response.name === "QueryFailedError") {
					const message = `${request.response.name} ${request.response.message}`;
					this.logger.warning(`${request.path} - ${message}`);
					request.response = Boom.badRequest(message);
				} else {
					this.logger.error(`${request.path} - ${request.response.stack ?? request.response.message}`);
				}
			}
			return h.continue;
		});

		this.server.route({
			handler() {
				return { data: "Hello World from Mainsail API!" };
			},
			method: "GET",
			path: "/",
		});
	}

	public async boot(): Promise<void> {
		try {
			await this.server.start();

			this.logger.info(`${this.prettyName} Server started at ${this.server.info.uri}`);
		} catch (error) {
			await this.app.terminate(`Failed to start ${this.prettyName} Server!`, error);
		}
	}

	public async dispose(): Promise<void> {
		try {
			await this.server.stop();

			this.logger.info(`${this.prettyName} Server stopped at ${this.server.info.uri}`);
		} catch (error) {
			await this.app.terminate(`Failed to stop ${this.prettyName} Server!`, error);
		}
	}

	// @todo: add proper types
	public async register(plugins: any): Promise<void> {
		return this.server.register(plugins);
	}

	public async route(routes: ServerRoute | ServerRoute[]): Promise<void> {
		return this.server.route(routes);
	}

	public getRoute(method: string, path: string): ServerRoute | undefined {
		return this.server.table().find((route) => route.method === method.toLowerCase() && route.path === path);
	}

	public getRPCProcessor(): Contracts.Api.RPC.Processor {
		return this.server.app.rpc;
	}

	public async inject(options: string | ServerInjectOptions): Promise<ServerInjectResponse> {
		return this.server.inject(options);
	}

	protected abstract pluginConfiguration(): Providers.PluginConfiguration;
	protected abstract defaultOptions(): Record<string, any>;
	protected abstract schemas(): any;

	private getServerOptions(options: Record<string, any>): object {
		options = { ...options };

		delete options.enabled;

		if (options.tls) {
			options.tls.key = readFileSync(options.tls.key).toString();
			options.tls.cert = readFileSync(options.tls.cert).toString();
		}

		const defaultOptions = this.defaultOptions();
		return merge(defaultOptions, options);
	}
}
