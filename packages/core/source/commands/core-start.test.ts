import { Identifiers, Services } from "@mainsail/cli";
import { writeJSONSync } from "fs-extra/esm";
import { dirSync, setGracefulCleanup } from "tmp";

import { Console, describe } from "../../../test-framework/source";
import { Command } from "./core-start";

describe<{
	cli: Console;
	processManager: Services.ProcessManager;
}>("CoreStartCommand", ({ beforeEach, afterAll, it, assert, stub, match }) => {
	beforeEach((context) => {
		process.env.MAINSAIL_PATH_CONFIG = dirSync().name;

		writeJSONSync(`${process.env.MAINSAIL_PATH_CONFIG}/delegates.json`, { secrets: ["bip39"] });

		context.cli = new Console();
		context.processManager = context.cli.app.get(Identifiers.ProcessManager);
	});

	afterAll(() => setGracefulCleanup());

	it("should throw if the process does not exist", async ({ processManager, cli }) => {
		const spyStart = stub(processManager, "start");

		await cli.execute(Command);

		spyStart.calledWith(
			{
				args: "core:run --network='devnet' --token='ark' --v=0 --env='production' --skipPrompts=false",
				env: {
					MAINSAIL_ENV: "production",
					NODE_ENV: "production",
				},
				name: "mainsail",
				node_args: undefined,
				script: match.string,
			},
			{ "kill-timeout": 30_000, "max-restarts": 5, name: "mainsail" },
		);
	});
});
