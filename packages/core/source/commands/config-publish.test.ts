import { Identifiers } from "@mainsail/cli";
import fs from "fs";
import { dirSync, setGracefulCleanup } from "tmp";

import { Console, describe } from "../../../test-framework/source";
import { Command } from "./config-publish";

describe<{
	cli: Console;
}>("ConfigPublishCommand", ({ beforeEach, afterAll, it, assert, stub, spy }) => {
	beforeEach((context) => {
		process.env.MAINSAIL_PATH_CONFIG = dirSync().name;

		context.cli = new Console();
	});

	afterAll(() => setGracefulCleanup());

	// TODO: fix stub
	it.skip("should throw if the destination already exists", async ({ cli }) => {
		stub(fs, "existsSync").returnValueOnce(true);

		await assert.rejects(
			() => cli.execute(Command),
			"Please use the --reset flag if you wish to reset your configuration.",
		);
	});

	// TODO: fix stub
	it.skip("should throw if the configuration files cannot be found", async ({ cli }) => {
		stub(fs, "existsSync").returnValue(false);

		await assert.rejects(() => cli.execute(Command), "Couldn't find the core configuration files");
	});

	// TODO: fix stub
	it.skip("should throw if the environment file cannot be found", async ({ cli }) => {
		const responseValues = [false, true, false];
		stub(fs, "existsSync").callsFake(() => responseValues.shift());

		const spyEnsure = spy(fs, "ensureDirSync");

		await assert.rejects(() => cli.execute(Command), "Couldn't find the environment file");

		spyEnsure.calledOnce();
	});

	// TODO: fix stub
	it.skip("should publish the configuration", async ({ cli }) => {
		const responseValues = [false, true, true];
		stub(fs, "existsSync").callsFake(() => responseValues.shift());

		const spyEnsure = spy(fs, "ensureDirSync");
		const spyCopy = spy(fs, "copySync");

		await cli.execute(Command);

		spyEnsure.calledOnce();
		spyCopy.calledTimes(2);
	});

	// TODO: fix stub
	it.skip("should reset the configuration", async ({ cli }) => {
		const responseValues = [false, true, true];
		stub(fs, "existsSync").callsFake(() => responseValues.shift());

		const spyRemove = spy(fs, "removeSync");
		const spyEnsure = spy(fs, "ensureDirSync");
		const spyCopy = spy(fs, "copySync");

		await cli.withFlags({ reset: true }).execute(Command);

		spyRemove.calledOnce();
		spyEnsure.calledOnce();
		spyCopy.calledTimes(2);
	});

	// TODO: fix stub
	it.skip("should publish the configuration via prompt", async ({ cli }) => {
		const responseValues = [false, true, true];
		stub(fs, "existsSync").callsFake(() => responseValues.shift());

		const spyEnsure = spy(fs, "ensureDirSync");
		const spyCopy = spy(fs, "copySync");

		stub(cli.app.get(Identifiers.Prompt), "render").returnValue({
			confirm: true,
			network: "mainnet",
		});

		await cli.execute(Command);

		spyEnsure.calledOnce();
		spyCopy.calledTimes(2);
	});

	// TODO: fix stub
	it.skip("should throw if no network is selected via prompt", async ({ cli }) => {
		const responseValues = [false, true, true];
		stub(fs, "existsSync").callsFake(() => responseValues.shift());

		const spyEnsure = spy(fs, "ensureDirSync");
		const spyCopy = spy(fs, "copySync");

		stub(cli.app.get(Identifiers.Prompt), "render").returnValue({
			confirm: true,
			network: undefined,
		});

		await assert.rejects(
			() => cli.withFlags({ network: undefined }).execute(Command),
			"You'll need to select the network to continue.",
		);

		spyEnsure.neverCalled();
		spyCopy.neverCalled();
	});

	// TODO: fix stub
	it.skip("should throw if the selected network is invalid via prompt", async ({ cli }) => {
		const responseValues = [false, true, true];
		stub(fs, "existsSync").callsFake(() => responseValues.shift());

		const spyEnsure = spy(fs, "ensureDirSync");
		const spyCopy = spy(fs, "copySync");

		stub(cli.app.get(Identifiers.Prompt), "render").returnValue({
			confirm: false,
			network: "mainnet",
		});

		await assert.rejects(
			() => cli.withFlags({ network: undefined }).execute(Command),
			"You'll need to confirm the network to continue.",
		);

		spyEnsure.neverCalled();
		spyCopy.neverCalled();
	});

	// TODO: fix stub
	it.skip("should publish the configuration via prompt without flag set before", async ({ cli }) => {
		const responseValues = [false, true, true];
		stub(fs, "existsSync").callsFake(() => responseValues.shift());

		const spyEnsure = spy(fs, "ensureDirSync");
		const spyCopy = spy(fs, "copySync");

		stub(cli.app.get(Identifiers.Prompt), "render").returnValue({
			confirm: true,
			network: "mainnet",
		});

		await cli.withFlags({ network: undefined }).execute(Command);

		spyEnsure.calledOnce();
		spyCopy.calledTimes(2);
	});
});
