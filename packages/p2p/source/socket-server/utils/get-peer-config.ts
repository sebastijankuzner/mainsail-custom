import { Contracts, Identifiers } from "@mainsail/contracts";
import { Providers, Services } from "@mainsail/kernel";
import { assert } from "@mainsail/utils";

type PluginConfig = { package: string; options: any };

const transformPlugins = (plugins: PluginConfig[]): Contracts.P2P.PeerPlugins => {
	const result: Contracts.P2P.PeerPlugins = {};

	for (const pluginConfig of plugins) {
		const name = pluginConfig.package;
		// @README: This is a core specific convention. If a server should not be publicly discovered it should avoid this convention.
		const options = pluginConfig.options?.server?.http || pluginConfig.options?.server?.https || {};

		const port = Number(options.port);

		if (Number.isNaN(port) || name.includes("p2p")) {
			continue;
		}

		result[name] = {
			enabled: typeof pluginConfig.options.enabled === "boolean" ? pluginConfig.options.enabled : true, // default to true because "enabled" flag is in different place based on which plugin
			port,
		};
	}

	return result;
};

const getPluginsConfig = (plugins: PluginConfig[], app: Contracts.Kernel.Application) =>
	plugins.map((plugin) => {
		const serviceProvider: Providers.ServiceProvider = app
			.get<Providers.ServiceProviderRepository>(Identifiers.ServiceProvider.Repository)
			.get(plugin.package);

		const serviceProviderName: string | undefined = serviceProvider.name();

		assert.string(serviceProviderName);

		return {
			options: serviceProvider.config().all(),
			package: plugin.package,
		};
	});

export const getPeerConfig = (app: Contracts.Kernel.Application): Contracts.P2P.PeerConfig => {
	const configuration: Contracts.Crypto.Configuration = app.get(Identifiers.Cryptography.Configuration);

	return {
		network: {
			explorer: configuration.get("network.client.explorer"),
			name: configuration.get("network.name"),
			nethash: configuration.get("network.nethash"),
			token: {
				name: configuration.get("network.client.token"),
				symbol: configuration.get("network.client.symbol"),
			},
			version: configuration.get("network.pubKeyHash"),
		},
		plugins: transformPlugins(
			getPluginsConfig(
				app.get<Services.Config.ConfigRepository>(Identifiers.Config.Repository).get("app.main"),
				app,
			),
		),
		version: app.version(),
	};
};
