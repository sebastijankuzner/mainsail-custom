import Hapi from "@hapi/hapi";
import {
	Contracts as ApiDatabaseContracts,
	Identifiers as ApiDatabaseIdentifiers,
	Models,
} from "@mainsail/api-database";
import { inject, injectable } from "@mainsail/container";
import { Contracts } from "@mainsail/contracts";
import dayjs from "dayjs";

import { Controller } from "./controller.js";

@injectable()
export class NodeController extends Controller {
	@inject(ApiDatabaseIdentifiers.PluginRepositoryFactory)
	private readonly pluginRepositoryFactory!: ApiDatabaseContracts.PluginRepositoryFactory;

	@inject(ApiDatabaseIdentifiers.TransactionRepositoryFactory)
	private readonly transactionRepositoryFactory!: ApiDatabaseContracts.TransactionRepositoryFactory;

	@inject(ApiDatabaseIdentifiers.TransactionTypeRepositoryFactory)
	private readonly transactionTypeRepositoryFactory!: ApiDatabaseContracts.TransactionTypeRepositoryFactory;

	@inject(ApiDatabaseIdentifiers.PeerRepositoryFactory)
	private readonly peerRepositoryFactory!: ApiDatabaseContracts.PeerRepositoryFactory;

	public async status(request: Hapi.Request) {
		const state = await this.getState();
		const medianPeerBlockNumber = await this.peerRepositoryFactory().getMedianPeerBlockNumber();
		const ownBlockNumber = Number(state?.blockNumber ?? 0);

		return {
			data: {
				blocksCount: state ? medianPeerBlockNumber - ownBlockNumber : 0,
				now: ownBlockNumber,
				synced: ownBlockNumber >= medianPeerBlockNumber,
				timestamp: dayjs().unix(),
			},
		};
	}

	public async syncing(request: Hapi.Request) {
		const state = await this.getState();
		const medianPeerBlockNumber = await this.peerRepositoryFactory().getMedianPeerBlockNumber();
		const ownBlockNumber = Number(state?.blockNumber ?? 0);

		return {
			data: {
				blockNumber: ownBlockNumber,
				blocks: state ? medianPeerBlockNumber - ownBlockNumber : 0,
				id: state?.id ?? 0,
				syncing: ownBlockNumber < medianPeerBlockNumber,
			},
		};
	}

	public async fees(request: Hapi.Request) {
		const configuration = await this.getConfiguration();
		const cryptoConfiguration = configuration.cryptoConfiguration as Contracts.Crypto.NetworkConfig;
		const genesisTimestamp = cryptoConfiguration.genesisBlock.block.timestamp;

		const transactionTypes = await this.transactionTypeRepositoryFactory()
			.createQueryBuilder()
			.select()
			.addOrderBy("key", "ASC")
			.getMany();

		const result = await this.transactionRepositoryFactory().getFeeStatistics(genesisTimestamp, request.query.days);

		const grouped = {};

		for (const transactionType of transactionTypes) {
			grouped[transactionType.key] = {
				avg: result?.avg ?? "0",
				max: result?.max ?? "0",
				min: result?.min ?? "0",
				sum: result?.sum ?? "0",
			};
		}

		return { data: grouped, meta: { days: request.query.days } };
	}

	public async configuration(request: Hapi.Request) {
		const configuration = await this.getConfiguration();
		const plugins = await this.getPlugins();

		const cryptoConfiguration = configuration.cryptoConfiguration as Contracts.Crypto.NetworkConfig;
		const network = cryptoConfiguration.network;

		return {
			data: {
				constants: configuration.activeMilestones,
				core: {
					version: configuration.version,
				},
				explorer: network.client.explorer,
				nethash: network.nethash,
				ports: this.buildPortMapping(plugins),
				slip44: network.slip44,
				symbol: network.client.symbol,
				token: network.client.token,
				version: network.pubKeyHash,
				wif: network.wif,
			},
		};
	}

	public async configurationCrypto(request: Hapi.Request) {
		const configuration = await this.getConfiguration();
		return {
			data: configuration?.cryptoConfiguration ?? {},
		};
	}

	private buildPortMapping(plugins: Record<string, Models.Plugin>) {
		const result = {};
		const keys = ["@mainsail/p2p", "@mainsail/api-http", "@mainsail/api-database", "@mainsail/webhooks"];

		for (const key of keys) {
			if (plugins[key] && plugins[key].configuration.enabled) {
				const { configuration } = plugins[key];
				if (configuration.server && configuration.server.enabled) {
					result[key] = +configuration.server.port;
					continue;
				}

				result[key] = +configuration.port;
			}
		}

		return result;
	}

	private async getPlugins(): Promise<Record<string, Models.Plugin>> {
		const pluginRepository = this.pluginRepositoryFactory();

		let plugins = await pluginRepository.createQueryBuilder().select().getMany();
		plugins = [{ configuration: this.apiConfiguration.all(), name: "@mainsail/api-http" }, ...plugins];

		const mappings: Record<string, Models.Plugin> = {};

		for (const plugin of plugins) {
			mappings[plugin.name] = plugin;
		}

		return mappings;
	}
}
