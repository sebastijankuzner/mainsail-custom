import { injectable } from "@mainsail/container";
import { Contracts, Identifiers } from "@mainsail/contracts";
import { Providers, Services } from "@mainsail/kernel";
import { assert } from "@mainsail/utils";
import Joi from "joi";

import {
	RevalidateApiNodeAction,
	ValidateAndAcceptApiNodeAction,
	ValidateAndAcceptPeerAction,
} from "./actions/index.js";
import { ApiNode } from "./api-node.js";
import { ApiNodeDiscoverer } from "./api-node-discoverer.js";
import { ApiNodeProcessor } from "./api-node-processor.js";
import { ApiNodeRepository } from "./api-node-repository.js";
import { ApiNodeVerifier } from "./api-node-verifier.js";
import { Broadcaster } from "./broadcaster.js";
import { BlockDownloader } from "./downloader/block-downloader.js";
import { MessageDownloader } from "./downloader/message-downloader.js";
import { ProposalDownloader } from "./downloader/proposal-downloader.js";
import { Header } from "./header.js";
import { HeaderService } from "./header-service.js";
import { Logger } from "./logger.js";
import { Peer } from "./peer.js";
import { PeerCommunicator } from "./peer-communicator.js";
import { PeerConnector } from "./peer-connector.js";
import { PeerDiscoverer } from "./peer-discoverer.js";
import { PeerDisposer } from "./peer-disposer.js";
import { PeerProcessor } from "./peer-processor.js";
import { PeerRepository } from "./peer-repository.js";
import { PeerVerifier } from "./peer-verifier.js";
import { Service } from "./service.js";
import { Server } from "./socket-server/server.js";
import { State } from "./state.js";
import { Throttle } from "./throttle.js";
import { TxPoolNode } from "./tx-pool-node.js";
import { TxPoolNodeVerifier } from "./tx-pool-node-verifier.js";
import { normalizeUrl } from "./utils/index.js";
import { makeFormats, makeKeywords, sanitizeRemoteAddress } from "./validation/index.js";

@injectable()
export class ServiceProvider extends Providers.ServiceProvider {
	public async register(): Promise<void> {
		this.#registerValidation();

		this.#registerFactories();

		this.#registerServices();

		this.#registerActions();
	}

	public async boot(): Promise<void> {
		await this.#buildServer();
	}

	public async dispose(): Promise<void> {
		await this.app.get<Contracts.P2P.Service>(Identifiers.P2P.Service).dispose();
		await this.app.get<Contracts.P2P.Server>(Identifiers.P2P.Server).dispose();
		await this.app.get<Contracts.P2P.PeerDisposer>(Identifiers.P2P.Peer.Disposer).disposePeers();
	}

	public async required(): Promise<boolean> {
		return true;
	}

	public configSchema(): Joi.AnySchema {
		return Joi.object({
			apiNodes: Joi.array().items(Joi.string()).default([]),
			apiNodesMaxContentLength: Joi.number().integer().min(0).required(),
			blacklist: Joi.array().items(Joi.string()).required(),
			developmentMode: Joi.object({
				enabled: Joi.bool().required(),
			}).required(),
			disableDiscovery: Joi.bool(),
			getBlocksTimeout: Joi.number().integer().min(0).required(),
			ignoreMinimumNetworkReach: Joi.bool(),
			maxPeersBroadcast: Joi.number().integer().min(0).required(),
			maxSameSubnetPeers: Joi.number().integer().min(0).required(),
			minimumNetworkReach: Joi.number().integer().min(0).required(),
			minimumVersions: Joi.array().items(Joi.string()).required(),
			peerBanTime: Joi.number().integer().min(0).required(),
			rateLimit: Joi.number().integer().min(1).required(),
			remoteAccess: Joi.array()
				.items(Joi.string().ip({ version: ["ipv4", "ipv6"] }))
				.required(),
			server: Joi.object({
				hostname: Joi.string()
					.ip({ version: ["ipv4", "ipv6"] })
					.required(),
				logLevel: Joi.number().integer().min(0).required(),
				port: Joi.number().integer().min(1).max(65_535).required(), // TODO: Check
			}).required(),
			skipDiscovery: Joi.bool(),
			txPoolPort: Joi.number().integer().min(0).required(),
			verifyTimeout: Joi.number().integer().min(0).required(),
			whitelist: Joi.array().items(Joi.string()).required(),
		}).unknown(true);
	}

	#registerFactories(): void {
		this.app.bind<(ip: string) => Peer>(Identifiers.P2P.Peer.Factory).toFactory(() => (ip: string) => {
			const sanitizedIp = sanitizeRemoteAddress(ip);
			assert.string(sanitizedIp);

			return this.app.resolve(Peer).init(sanitizedIp, Number(this.config().getRequired<number>("server.port")));
		});

		this.app.bind<(url: string) => ApiNode>(Identifiers.P2P.ApiNode.Factory).toFactory(() => (url: string) => {
			const normalizedUrl = normalizeUrl(url);
			return this.app.resolve(ApiNode).init(normalizedUrl);
		});

		this.app.bind<(ip: string) => TxPoolNode>(Identifiers.P2P.TxPoolNode.Factory).toFactory(() => (ip: string) => {
			const sanitizedIp = sanitizeRemoteAddress(ip);
			assert.string(sanitizedIp);

			return this.app.resolve(TxPoolNode).init(sanitizedIp, this.config().getRequired<number>("txPoolPort"));
		});

		this.app.bind<() => Header>(Identifiers.P2P.Header.Factory).toFactory(() => () => this.app.resolve(Header));
	}

	#registerServices(): void {
		this.app
			.bind<() => Promise<Throttle>>(Identifiers.P2P.Throttle.Factory)
			.toFactory(() => async () => await this.app.resolve(Throttle).initialize());

		this.app.bind(Identifiers.P2P.Logger).to(Logger).inSingletonScope();

		this.app.bind(Identifiers.P2P.Peer.Repository).to(PeerRepository).inSingletonScope();

		this.app.bind(Identifiers.P2P.ApiNode.Repository).to(ApiNodeRepository).inSingletonScope();

		this.app.bind(Identifiers.P2P.ApiNode.Discoverer).to(ApiNodeDiscoverer).inSingletonScope();

		this.app.bind(Identifiers.P2P.ApiNode.Verifier).to(ApiNodeVerifier).inSingletonScope();

		this.app.bind(Identifiers.P2P.ApiNode.Processor).to(ApiNodeProcessor).inSingletonScope();

		this.app.bind(Identifiers.P2P.TxPoolNode.Verifier).to(TxPoolNodeVerifier).inSingletonScope();

		this.app.bind(Identifiers.P2P.Peer.Connector).to(PeerConnector).inSingletonScope();

		this.app.bind(Identifiers.P2P.Peer.Communicator).to(PeerCommunicator).inSingletonScope();

		this.app.bind(Identifiers.P2P.Peer.Processor).to(PeerProcessor).inSingletonScope();

		this.app.bind(Identifiers.P2P.Peer.Disposer).to(PeerDisposer).inSingletonScope();

		this.app.bind(Identifiers.P2P.Peer.Verifier).to(PeerVerifier).inSingletonScope();

		this.app.bind(Identifiers.P2P.Header.Service).to(HeaderService).inSingletonScope();

		this.app.bind(Identifiers.P2P.Peer.Discoverer).to(PeerDiscoverer).inSingletonScope();

		this.app.bind(Identifiers.P2P.Downloader.Block).to(BlockDownloader).inSingletonScope();

		this.app.bind(Identifiers.P2P.Downloader.Proposal).to(ProposalDownloader).inSingletonScope();

		this.app.bind(Identifiers.P2P.Downloader.Message).to(MessageDownloader).inSingletonScope();

		this.app.bind(Identifiers.P2P.Service).to(Service).inSingletonScope();

		this.app.bind(Identifiers.P2P.Broadcaster).to(Broadcaster).inSingletonScope();

		this.app.bind(Identifiers.P2P.Server).to(Server).inSingletonScope();

		this.app.bind(Identifiers.P2P.State).to(State).inSingletonScope();
	}

	async #buildServer(): Promise<void> {
		const server = this.app.get<Contracts.P2P.Server>(Identifiers.P2P.Server);
		const serverConfig = this.config().getRequired<{ hostname: string; port: number }>("server");
		assert.defined(serverConfig);

		await server.initialize("P2P Server", serverConfig);
	}

	#registerActions(): void {
		this.app
			.get<Services.Triggers.Triggers>(Identifiers.Services.Trigger.Service)
			.bind("validateAndAcceptPeer", new ValidateAndAcceptPeerAction(this.app));

		this.app
			.get<Services.Triggers.Triggers>(Identifiers.Services.Trigger.Service)
			.bind("validateAndAcceptApiNode", new ValidateAndAcceptApiNodeAction(this.app));

		this.app
			.get<Services.Triggers.Triggers>(Identifiers.Services.Trigger.Service)
			.bind("revalidateApiNode", new RevalidateApiNodeAction(this.app));
	}

	#registerValidation(): void {
		for (const keyword of Object.values(makeKeywords())) {
			this.app.get<Contracts.Crypto.Validator>(Identifiers.Cryptography.Validator).addKeyword(keyword);
		}

		for (const [name, format] of Object.entries(makeFormats())) {
			this.app.get<Contracts.Crypto.Validator>(Identifiers.Cryptography.Validator).addFormat(name, format);
		}
	}
}
