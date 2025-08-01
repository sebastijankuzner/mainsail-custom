import { Container } from "@mainsail/container";
import { Identifiers } from "@mainsail/contracts";
import { Application, Providers } from "@mainsail/kernel";
import { NullEventDispatcher } from "@mainsail/kernel/source/services/events/drivers/null";
import { AnySchema } from "joi";
import { dirSync, setGracefulCleanup } from "tmp";

import { describe } from "../../test-framework/source";
import { defaults } from "./defaults";
import { ServiceProvider } from "./service-provider";

const importFresh = (moduleName) => import(`${moduleName}?${Date.now()}`);

type Context = {
	serviceProvider: ServiceProvider;
	pluginConfiguration: Providers.PluginConfiguration;
};

const init = (context: Context) => {
	const logger = {
		info: () => {},
		debug: () => {},
		error: () => {},
		notice: () => {},
	};

	const app = new Application(new Container());
	app.bind(Identifiers.ServiceProvider.Configuration).to(Providers.PluginConfiguration).inSingletonScope();
	app.bind(Identifiers.P2P.Peer.Repository).toConstantValue({});
	app.bind(Identifiers.TransactionPool.Query).toConstantValue({});
	app.bind(Identifiers.TransactionPool.Processor).toConstantValue({});
	app.bind(Identifiers.Transaction.Handler.Registry).toConstantValue({});
	app.bind(Identifiers.Services.EventDispatcher.Service).to(NullEventDispatcher);
	app.bind(Identifiers.Services.Log.Service).toConstantValue(logger);
	app.bind(Identifiers.Services.Filesystem.Service).toConstantValue({ existsSync: () => true });

	app.bind("path.cache").toConstantValue(dirSync().name);

	context.serviceProvider = app.resolve<ServiceProvider>(ServiceProvider);
	context.pluginConfiguration = app.get<Providers.PluginConfiguration>(Identifiers.ServiceProvider.Configuration);
	context.serviceProvider.setConfig(context.pluginConfiguration.from("webhooks", defaults));
};

const importDefaults = async () =>
	// @ts-ignore
	(await importFresh("../distribution/defaults.js")).defaults;
describe<Context>("ServiceProvider", ({ beforeEach, afterAll, it, assert }) => {
	beforeEach(init);

	afterAll(() => setGracefulCleanup());

	it("should register", async ({ serviceProvider }) => {
		await assert.resolves(() => serviceProvider.register());
	});

	it("should boot and dispose", async ({ serviceProvider }) => {
		await assert.resolves(() => serviceProvider.register());
		await assert.resolves(() => serviceProvider.boot());
		await assert.resolves(() => serviceProvider.dispose());
	});

	it("should bootWhen be true when enabled", async ({ serviceProvider, pluginConfiguration }) => {
		defaults.enabled = true;
		const instance = pluginConfiguration.from("webhooks", defaults);
		serviceProvider.setConfig(instance);

		assert.true(await serviceProvider.bootWhen());
	});

	it("should not be required", async ({ serviceProvider }) => {
		assert.false(await serviceProvider.required());
	});
});

describe<Context>("ServiceProvider.configSchema", ({ beforeEach, assert, it }) => {
	let defaults;

	beforeEach(async (context) => {
		init(context);

		for (const key of Object.keys(process.env)) {
			if (key.includes("MAINSAIL_WEBHOOKS_")) {
				delete process.env[key];
			}
		}

		defaults = await importDefaults();
	});

	it("should validate schema using defaults", async ({ serviceProvider }) => {
		const result = (serviceProvider.configSchema() as AnySchema).validate(defaults);

		assert.undefined(result.error);
		assert.false(result.value.enabled);
		assert.string(result.value.server.http.host);
		assert.number(result.value.server.http.port);
		assert.array(result.value.server.whitelist);
		for (const item of result.value.server.whitelist) {
			assert.string(item);
		}
		assert.number(result.value.timeout);
	});

	it("should allow configuration extension", async ({ serviceProvider }) => {
		defaults["customField"] = "dummy";

		const result = (serviceProvider.configSchema() as AnySchema).validate(defaults);

		assert.undefined(result.error);
		assert.equal(result.value.customField, "dummy");
	});

	it("should return true if process.env.MAINSAIL_WEBHOOKS_ENABLED is defined", async ({ serviceProvider }) => {
		process.env.MAINSAIL_WEBHOOKS_ENABLED = "true";

		const result = (serviceProvider.configSchema() as AnySchema).validate(await importDefaults());

		assert.undefined(result.error);
		assert.true(result.value.enabled);
	});

	it("should return value of process.env.MAINSAIL_WEBHOOKS_HOST if defined", async ({ serviceProvider }) => {
		process.env.MAINSAIL_WEBHOOKS_HOST = "127.0.0.1";

		const result = (serviceProvider.configSchema() as AnySchema).validate(await importDefaults());

		assert.undefined(result.error);
		assert.equal(result.value.server.http.host, "127.0.0.1");
	});

	it("should return value of process.env.MAINSAIL_WEBHOOKS_PORT if number", async ({ serviceProvider }) => {
		process.env.MAINSAIL_WEBHOOKS_PORT = "200";

		const result = (serviceProvider.configSchema() as AnySchema).validate(await importDefaults());

		assert.undefined(result.error);
		assert.equal(result.value.server.http.port, 200);
	});

	it("should return value of process.env.MAINSAIL_WEBHOOKS_TIMEOUT if defined", async ({ serviceProvider }) => {
		process.env.MAINSAIL_WEBHOOKS_TIMEOUT = "5000";

		const result = (serviceProvider.configSchema() as AnySchema).validate(await importDefaults());

		assert.undefined(result.error);
		assert.equal(result.value.timeout, 5000);
	});

	it("enabled is required && is boolean", async ({ serviceProvider }) => {
		defaults.enabled = 123;
		let result = (serviceProvider.configSchema() as AnySchema).validate(defaults);

		assert.equal(result.error.message, '"enabled" must be a boolean');

		delete defaults.enabled;
		result = (serviceProvider.configSchema() as AnySchema).validate(defaults);

		assert.equal(result.error.message, '"enabled" is required');
	});

	it("server is required && is object", async ({ serviceProvider }) => {
		defaults.server = false;
		let result = (serviceProvider.configSchema() as AnySchema).validate(defaults);

		assert.equal(result.error.message, '"server" must be of type object');

		delete defaults.server;
		result = (serviceProvider.configSchema() as AnySchema).validate(defaults);

		assert.equal(result.error.message, '"server" is required');
	});

	it("server.http is required && is object", async ({ serviceProvider }) => {
		defaults.server.http = false;
		let result = (serviceProvider.configSchema() as AnySchema).validate(defaults);

		assert.equal(result.error.message, '"server.http" must be of type object');

		delete defaults.server.http;
		result = (serviceProvider.configSchema() as AnySchema).validate(defaults);

		assert.equal(result.error.message, '"server.http" is required');
	});

	it("server.http.host is required && is IP address", async ({ serviceProvider }) => {
		defaults.server.http.host = false;
		let result = (serviceProvider.configSchema() as AnySchema).validate(defaults);

		assert.equal(result.error.message, '"server.http.host" must be a string');

		defaults.server.http.host = "dummy";
		result = (serviceProvider.configSchema() as AnySchema).validate(defaults);

		assert.equal(
			result.error.message,
			'"server.http.host" must be a valid ip address of one of the following versions [ipv4, ipv6] with a optional CIDR',
		);

		delete defaults.server.http.host;
		result = (serviceProvider.configSchema() as AnySchema).validate(defaults);

		assert.equal(result.error.message, '"server.http.host" is required');
	});

	it("server.http.port is required && is integer && >= 1 && <= 65535", async ({ serviceProvider }) => {
		defaults.server.http.port = false;
		let result = (serviceProvider.configSchema() as AnySchema).validate(defaults);

		assert.equal(result.error.message, '"server.http.port" must be a number');

		defaults.server.http.port = 1.12;
		result = (serviceProvider.configSchema() as AnySchema).validate(defaults);

		assert.equal(result.error.message, '"server.http.port" must be an integer');

		defaults.server.http.port = 0;
		result = (serviceProvider.configSchema() as AnySchema).validate(defaults);

		assert.equal(result.error.message, '"server.http.port" must be greater than or equal to 1');

		defaults.server.http.port = 65_536;
		result = (serviceProvider.configSchema() as AnySchema).validate(defaults);

		assert.equal(result.error.message, '"server.http.port" must be less than or equal to 65535');

		delete defaults.server.http.port;
		result = (serviceProvider.configSchema() as AnySchema).validate(defaults);

		assert.equal(result.error.message, '"server.http.port" is required');
	});

	it("server.whitelist is required && is array && contains strings", async ({ serviceProvider }) => {
		defaults.server.whitelist = false;
		let result = (serviceProvider.configSchema() as AnySchema).validate(defaults);

		assert.equal(result.error.message, '"server.whitelist" must be an array');

		defaults.server.whitelist = [false];
		result = (serviceProvider.configSchema() as AnySchema).validate(defaults);

		assert.equal(result.error.message, '"server.whitelist[0]" must be a string');

		delete defaults.server.whitelist;
		result = (serviceProvider.configSchema() as AnySchema).validate(defaults);

		assert.equal(result.error.message, '"server.whitelist" is required');
	});

	it("timeout is required && is integer && >= 1", async ({ serviceProvider }) => {
		defaults.timeout = false;
		let result = (serviceProvider.configSchema() as AnySchema).validate(defaults);

		assert.equal(result.error.message, '"timeout" must be a number');

		defaults.timeout = 1.1;
		result = (serviceProvider.configSchema() as AnySchema).validate(defaults);

		assert.equal(result.error.message, '"timeout" must be an integer');

		defaults.timeout = 0;
		result = (serviceProvider.configSchema() as AnySchema).validate(defaults);

		assert.equal(result.error.message, '"timeout" must be greater than or equal to 1');

		delete defaults.timeout;
		result = (serviceProvider.configSchema() as AnySchema).validate(defaults);

		assert.equal(result.error.message, '"timeout" is required');
	});
});
