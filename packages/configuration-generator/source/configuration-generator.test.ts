import { Application } from "@mainsail/kernel";
import { BigNumber } from "@mainsail/utils";
import envPaths from "env-paths";
import fs from "fs-extra/esm";
import { join } from "path";

import { describe } from "../../test-framework/source";
import { makeApplication } from "./application-factory";
import { ConfigurationGenerator } from "./configuration-generator";
import { Identifiers as InternalIdentifiers } from "./identifiers";

describe<{
	app: Application;
	generator: ConfigurationGenerator;
}>("NetworkGenerator", ({ beforeEach, it, assert, stub, match }) => {
	const paths = envPaths("myn", { suffix: "core" });
	const configCore = join(paths.config, "devnet");

	beforeEach(async (context) => {
		context.app = await makeApplication(configCore);
		context.generator = context.app.get<ConfigurationGenerator>(InternalIdentifiers.ConfigurationGenerator);
	});

	// TODO: fix stubs
	it.skip("should generate a new configuration", async ({ generator }) => {
		const existsSync = stub(fs, "pathExistsSync");
		const ensureDirSync = stub(fs, "ensureDirSync");
		const writeJSONSync = stub(fs, "writeJSONSync");
		const writeFileSync = stub(fs, "writeFileSync");

		await generator.generate({
			network: "devnet",
			symbol: "my",
			token: "myn",
		});

		existsSync.calledWith(configCore);

		ensureDirSync.calledWith(configCore);

		writeJSONSync.calledTimes(5);
		writeFileSync.calledOnce();

		writeJSONSync.calledWith(
			match("crypto.json"),
			match({
				genesisBlock: {
					block: {
						generatorAddress: match.string,
						height: 0,
						id: match.string,
						numberOfTransactions: 160,
						payloadHash: match.string,
						payloadLength: match.number,
						previousBlock: "0000000000000000000000000000000000000000000000000000000000000000",
						reward: BigNumber.ZERO,
						timestamp: match.number,
						totalAmount: BigNumber.make("12500000000000000"),
						totalFee: BigNumber.ZERO,
						transactions: match.array,
						version: 1,
					},
				},
				milestones: [
					match({
						roundValidators: 0,
						address: match.object,
						block: match.object,
						blockTime: 8000,
						epoch: match.string,
						height: 0,
						reward: "0",
						satoshi: match.object,
					}),
					match({
						roundValidators: 53,
						height: 1,
					}),
					match({
						height: 75_600,
						reward: "200000000",
					}),
				],
				network: {
					chainId: match.number,
					client: { explorer: "", symbol: "my", token: "myn" },
					name: "devnet",
					nethash: match.string,
					pubKeyHash: 30,
					slip44: 1,
					wif: 186,
				},
			}),
			{ spaces: 4 },
		);
	});

	// TODO: fix stubs
	it.skip("should log if logger is provided", async ({ generator, app }) => {
		const logger = {
			info: () => {},
		};

		app.bind(InternalIdentifiers.LogService).toConstantValue(logger);

		const log = stub(logger, "info");
		const existsSync = stub(fs, "existsSync");
		const ensureDirSync = stub(fs, "ensureDirSync");
		const writeJSONSync = stub(fs, "writeJSONSync");
		const writeFileSync = stub(fs, "writeFileSync");

		await generator.generate({
			network: "devnet",
			symbol: "my",
			token: "myn",
		});

		existsSync.calledWith(configCore);
		ensureDirSync.calledWith(configCore);
		writeJSONSync.calledTimes(5);
		writeFileSync.calledOnce();
		log.calledTimes(8);
	});

	// TODO: fix stubs
	it.skip("should throw if the core configuration destination already exists", async ({ generator }) => {
		stub(fs, "existsSync").returnValueOnce(true);

		await assert.rejects(
			() =>
				generator.generate({
					network: "devnet",
					symbol: "my",
					token: "myn",
				}),
			`${configCore} already exists.`,
		);
	});

	// TODO: fix stubs
	it.skip("should generate a new configuration with additional flags", async ({ generator }) => {
		const existsSync = stub(fs, "existsSync");
		const ensureDirSync = stub(fs, "ensureDirSync");
		const writeJSONSync = stub(fs, "writeJSONSync");
		const writeFileSync = stub(fs, "writeFileSync");

		await generator.generate({
			blockTime: 9000,
			coreDBDatabase: "database",
			coreDBHost: "localhost",
			coreDBPassword: "password",
			coreDBPort: 5432,
			coreDBUsername: "username",
			coreP2PPort: 4000,
			coreWebhooksPort: 4004,
			distribute: true,
			epoch: new Date(new Date().toISOString().slice(0, 11) + "00:00:00.000Z"),
			explorer: "myex.io",
			force: false,
			maxBlockPayload: 123_444,
			maxTxPerBlock: 122,
			network: "devnet",
			overwriteConfig: false,
			peers: ["127.0.0.1"],
			premine: "12500000000000000",
			pubKeyHash: 168,
			rewardAmount: "200000000",
			rewardHeight: 23_000,
			symbol: "my",
			token: "myn",
			validators: 53,
			wif: 27,
		});

		existsSync.calledWith(configCore);
		ensureDirSync.calledWith(configCore);
		writeJSONSync.calledTimes(5);
		writeFileSync.calledOnce();

		writeJSONSync.calledWith(
			match("crypto.json"),
			match({
				genesisBlock: {
					block: {
						generatorAddress: match.string,
						height: 0,
						id: match.string,
						numberOfTransactions: 212,
						payloadHash: match.string,
						payloadLength: match.number,
						previousBlock: "0000000000000000000000000000000000000000000000000000000000000000",
						reward: BigNumber.ZERO,
						timestamp: match.number,
						totalAmount: BigNumber.make("12499999999999969"),
						totalFee: BigNumber.ZERO,
						transactions: match.array,
						version: 1,
					},
				},
				milestones: [
					match({
						roundValidators: 0,
						address: match.object,
						block: match.object,
						blockTime: 9000,
						epoch: match.string,
						height: 0,
						reward: "0",
						satoshi: match.object,
						stageTimeoutout: 2000,
						stageTimeoutoutIncrease: 2000,
					}),
					match({
						roundValidators: 53,
						height: 1,
					}),
					match({
						height: 23_000,
						reward: "200000000",
					}),
				],
				network: {
					chainId: match.number,
					client: { explorer: "myex.io", symbol: "my", token: "myn" },
					name: "devnet",
					nethash: match.string,

					pubKeyHash: 168,
					slip44: 1,
					wif: 27,
				},
			}),
			{ spaces: 4 },
		);
	});
});
