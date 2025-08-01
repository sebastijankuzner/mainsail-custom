/* eslint-disable unicorn/prevent-abbreviations */
import { writeFileSync } from "fs";
import { ensureDirSync, removeSync } from "fs-extra/esm";
import { dirSync, setGracefulCleanup } from "tmp";

import { Console, describe } from "../../../test-framework/source";
import { Command } from "./env-list";

describe<{
	cli: Console;
}>("EnvListCommand", ({ beforeEach, afterAll, it, assert, stub }) => {
	beforeEach((context) => {
		process.env.MAINSAIL_PATH_CONFIG = dirSync().name;

		context.cli = new Console();
	});

	afterAll(() => setGracefulCleanup());

	it("should fail if the environment configuration doesn't exist", async ({ cli }) => {
		await assert.rejects(
			() => cli.execute(Command),
			`No environment file found at ${process.env.MAINSAIL_PATH_CONFIG}/core/.env`,
		);
	});

	it("should list all environment variables", async ({ cli }) => {
		let message: string;
		stub(console, "log").callsFake((m) => (message = m));

		ensureDirSync(`${process.env.MAINSAIL_PATH_CONFIG}/core`);

		const environmentFile = `${process.env.MAINSAIL_PATH_CONFIG}/core/.env`;
		removeSync(environmentFile);
		writeFileSync(environmentFile, "someKey=someValue", { flag: "w" });

		await cli.execute(Command);

		assert.true(message.includes("Key"));
		assert.true(message.includes("Value"));
		assert.true(message.includes("someKey"));
		assert.true(message.includes("someValue"));
	});
});
