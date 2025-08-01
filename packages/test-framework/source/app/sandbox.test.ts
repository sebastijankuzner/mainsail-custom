import { Contracts, Identifiers } from "@mainsail/contracts";
import { readJSONSync } from "fs-extra/esm";
import { join } from "path";

import { describe } from "../index";
import { Sandbox } from "./sandbox";

describe("Sandbox", ({ it, assert, spyFn }) => {
	it("should create app", () => {
		const sandbox = new Sandbox();

		assert.defined(sandbox.app);
	});

	it("should boot", async () => {
		const sandbox = new Sandbox();

		const callback = spyFn();

		await assert.resolves(() => sandbox.boot(() => callback.call())).then(() => sandbox.dispose());
		callback.calledOnce();
	});

	it("should boot with configuration options", async () => {
		const sandbox = new Sandbox();

		const callback = spyFn();

		const coreOptions: Contracts.NetworkGenerator.Options = {
			blockTime: 8000,
			distribute: true,
			explorer: "http://dexplorer.ark.io",
			maxBlockPayload: 2_097_152,
			maxTxPerBlock: 150,
			network: "dummynet",
			premine: "53000000000000000",
			pubKeyHash: 23,
			rewardAmount: "200000000",
			rewardHeight: 75_600,
			symbol: "DѦ",
			token: "DARK",
			validators: 53,
			validatorRegistrationFee: "0",
			wif: 186,
		};

		await assert.resolves(() => sandbox.withConfigurationOptions(coreOptions).boot(() => callback.call()));
		callback.calledOnce();

		const crypto = readJSONSync(join(sandbox.getConfigurationPath(), "crypto.json"));
		assert.equal(crypto.network.client.token, "DARK");

		await assert.resolves(() => sandbox.dispose());
	});

	it("should dispose", async () => {
		const sandbox = new Sandbox();

		sandbox.app.bind(Identifiers.Services.Log.Service).toConstantValue({});
		sandbox.app.bind(Identifiers.Services.EventDispatcher.Service).toConstantValue({});

		await assert.resolves(() => sandbox.boot());
		await assert.resolves(() => sandbox.dispose());
	});

	it("should dispose with callback", async () => {
		const sandbox = new Sandbox();

		const callback = spyFn();

		sandbox.app.bind(Identifiers.Services.Log.Service).toConstantValue({});
		sandbox.app.bind(Identifiers.Services.EventDispatcher.Service).toConstantValue({});

		await assert.resolves(() => sandbox.boot());
		await assert.resolves(() => sandbox.dispose(() => callback.call()));
		callback.calledOnce();
	});

	it("should restore", async () => {
		const sandbox = new Sandbox();

		sandbox.snapshot();

		const testBinding = "test";

		sandbox.app.bind("test").toConstantValue(testBinding);

		assert.equal(sandbox.app.get("test"), testBinding);

		sandbox.restore();

		assert.throws(() => {
			sandbox.app.get("test");
		});
	});

	it("should register service provider", async () => {
		const sandbox = new Sandbox();

		sandbox.app.bind(Identifiers.Services.EventDispatcher.Service).toConstantValue({});

		const serviceProviderOptions = {
			klass: (await import("@mainsail/validation")).ServiceProvider,
			name: "@mainsail/validation",
			path: "@mainsail/validation",
		};

		assert.equal(await sandbox.registerServiceProvider(serviceProviderOptions), sandbox);
	});
});
