import { readFileSync } from "fs";
import { ensureFileSync, removeSync } from "fs-extra/esm";

import { Console, describe } from "../../../test-framework/source";
import { Environment } from "./environment";

describe<{
	environment: Environment;
}>("Environment", ({ beforeEach, it, assert }) => {
	beforeEach((context) => {
		const cli = new Console();

		context.environment = cli.app.resolve(Environment);
	});

	it("should get all paths for the given token, network and name", async ({ environment }) => {
		assert.equal(Object.keys(environment.getPaths()), ["data", "config", "cache", "log", "temp"]);
	});

	it("should respect the MAINSAIL_PATH_CONFIG environment variable", async ({ environment }) => {
		process.env.MAINSAIL_PATH_CONFIG = "something";

		assert.true(environment.getPaths().config.endsWith("/something/core"));

		delete process.env.MAINSAIL_PATH_CONFIG;
	});

	it("should fail to update the variables if the file doesn't exist", async ({ environment }) => {
		assert.throws(() => environment.updateVariables("some-file", {}), "No environment file found at some-file.");
	});

	it("should update the variables", async ({ environment }) => {
		const environmentFile = `${process.env.MAINSAIL_PATH_CONFIG}/mainsail/.env`;

		removeSync(environmentFile);
		ensureFileSync(environmentFile);

		environment.updateVariables(environmentFile, { key: "value" });

		assert.equal(readFileSync(environmentFile).toString("utf8"), "key=value");
	});
});
