import { Constants } from "@mainsail/contracts";
import { Environment } from "@mainsail/kernel";

export const defaults = {
	enabled: Environment.isTrue(Constants.EnvironmentVariables.MAINSAIL_WEBHOOKS_ENABLED),
	server: {
		http: {
			host: Environment.get(Constants.EnvironmentVariables.MAINSAIL_WEBHOOKS_HOST, "0.0.0.0"),
			port: Environment.get(Constants.EnvironmentVariables.MAINSAIL_WEBHOOKS_PORT, 4004),
		},
		whitelist: Environment.get<undefined>(Constants.EnvironmentVariables.MAINSAIL_WEBHOOKS_WHITELIST)?.split(
			",",
		) ?? ["127.0.0.1", "::ffff:127.0.0.1"],
	},
	timeout: Environment.get(Constants.EnvironmentVariables.MAINSAIL_WEBHOOKS_TIMEOUT, 1500),
};
