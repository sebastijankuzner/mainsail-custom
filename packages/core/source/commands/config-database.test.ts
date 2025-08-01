import { Identifiers } from "@mainsail/cli";
import { Console, describe } from "../../../test-framework/source";
import prompts from "prompts";
import { dirSync, setGracefulCleanup } from "tmp";

import { Command } from "./config-database";

describe<{
	cli: Console;
	envFile: string;
}>("ConfigDatabaseCommand", ({ beforeEach, afterAll, it, stub, assert }) => {
	beforeEach((context) => {
		process.env.MAINSAIL_PATH_CONFIG = dirSync().name;

		context.envFile = `${process.env.MAINSAIL_PATH_CONFIG}/core/.env`;

		context.cli = new Console();
	});

	afterAll(() => setGracefulCleanup());

	it("#Flags - should set the database host", async ({ cli, envFile }) => {
		const spyOnUpdateVariables = stub(cli.app.get(Identifiers.Environment), "updateVariables");

		await cli.withFlags({ host: "localhost" }).execute(Command);

		spyOnUpdateVariables.calledOnce();
		spyOnUpdateVariables.calledWith(envFile, { MAINSAIL_DB_HOST: "localhost" });
	});

	it("#Flags - should set the database port", async ({ cli, envFile }) => {
		const spyOnUpdateVariables = stub(cli.app.get(Identifiers.Environment), "updateVariables");

		await cli.withFlags({ port: "5432" }).execute(Command);

		spyOnUpdateVariables.calledOnce();
		spyOnUpdateVariables.calledWith(envFile, { MAINSAIL_DB_PORT: 5432 });
	});

	it("#Flags - should set the database name", async ({ cli, envFile }) => {
		const spyOnUpdateVariables = stub(cli.app.get(Identifiers.Environment), "updateVariables");

		await cli.withFlags({ database: "ark_mainnet" }).execute(Command);

		spyOnUpdateVariables.calledOnce();
		spyOnUpdateVariables.calledWith(envFile, { MAINSAIL_DB_DATABASE: "ark_mainnet" });
	});

	it("#Flags - should set the database user", async ({ cli, envFile }) => {
		const spyOnUpdateVariables = stub(cli.app.get(Identifiers.Environment), "updateVariables");

		await cli.withFlags({ username: "ark" }).execute(Command);

		spyOnUpdateVariables.calledOnce();
		spyOnUpdateVariables.calledWith(envFile, { MAINSAIL_DB_USERNAME: "ark" });
	});

	it("#Flags - should set the database password", async ({ cli, envFile }) => {
		const spyOnUpdateVariables = stub(cli.app.get(Identifiers.Environment), "updateVariables");

		await cli.withFlags({ password: "password" }).execute(Command);

		spyOnUpdateVariables.calledOnce();
		spyOnUpdateVariables.calledWith(envFile, { MAINSAIL_DB_PASSWORD: "password" });
	});

	it("#Prompts - should set the database host", async ({ cli, envFile }) => {
		const spyOnUpdateVariables = stub(cli.app.get(Identifiers.Environment), "updateVariables");

		prompts.inject(["dummy", undefined, undefined, undefined, undefined, true]);
		await cli.execute(Command);

		spyOnUpdateVariables.calledOnce();
		spyOnUpdateVariables.calledWith(envFile, {
			MAINSAIL_DB_DATABASE: "mainsail-db",
			MAINSAIL_DB_HOST: "dummy",
			MAINSAIL_DB_PASSWORD: "password",
			MAINSAIL_DB_PORT: 5432,
			MAINSAIL_DB_USERNAME: "mainsail",
		});
	});

	it("#Prompts - should set the database port", async ({ cli, envFile }) => {
		const spyOnUpdateVariables = stub(cli.app.get(Identifiers.Environment), "updateVariables");

		prompts.inject([undefined, 5000, undefined, undefined, undefined, true]);
		await cli.execute(Command);

		spyOnUpdateVariables.calledOnce();
		spyOnUpdateVariables.calledWith(envFile, {
			MAINSAIL_DB_DATABASE: "mainsail-db",
			MAINSAIL_DB_HOST: "localhost",
			MAINSAIL_DB_PASSWORD: "password",
			MAINSAIL_DB_PORT: 5000,
			MAINSAIL_DB_USERNAME: "mainsail",
		});
	});

	it("#Prompts - should set the database name", async ({ cli, envFile }) => {
		const spyOnUpdateVariables = stub(cli.app.get(Identifiers.Environment), "updateVariables");

		prompts.inject([undefined, undefined, "dummy", undefined, undefined, true]);
		await cli.execute(Command);

		spyOnUpdateVariables.calledOnce();
		spyOnUpdateVariables.calledWith(envFile, {
			MAINSAIL_DB_DATABASE: "dummy",
			MAINSAIL_DB_HOST: "localhost",
			MAINSAIL_DB_PASSWORD: "password",
			MAINSAIL_DB_PORT: 5432,
			MAINSAIL_DB_USERNAME: "mainsail",
		});
	});

	it("#Prompts - should set the database user", async ({ cli, envFile }) => {
		const spyOnUpdateVariables = stub(cli.app.get(Identifiers.Environment), "updateVariables");

		prompts.inject([undefined, undefined, undefined, "dummy", undefined, true]);
		await cli.execute(Command);

		spyOnUpdateVariables.calledOnce();
		spyOnUpdateVariables.calledWith(envFile, {
			MAINSAIL_DB_DATABASE: "mainsail-db",
			MAINSAIL_DB_HOST: "localhost",
			MAINSAIL_DB_PASSWORD: "password",
			MAINSAIL_DB_PORT: 5432,
			MAINSAIL_DB_USERNAME: "dummy",
		});
	});

	it("#Prompts - should set the database password", async ({ cli, envFile }) => {
		const spyOnUpdateVariables = stub(cli.app.get(Identifiers.Environment), "updateVariables");

		prompts.inject([undefined, undefined, undefined, undefined, "dummy", true]);
		await cli.execute(Command);

		spyOnUpdateVariables.calledOnce();
		spyOnUpdateVariables.calledWith(envFile, {
			MAINSAIL_DB_DATABASE: "mainsail-db",
			MAINSAIL_DB_HOST: "localhost",
			MAINSAIL_DB_PASSWORD: "dummy",
			MAINSAIL_DB_PORT: 5432,
			MAINSAIL_DB_USERNAME: "mainsail",
		});
	});

	it("#Prompts - should not update without a confirmation", async ({ cli, envFile }) => {
		const spyOnUpdateVariables = stub(cli.app.get(Identifiers.Environment), "updateVariables");

		prompts.inject([undefined, undefined, undefined, undefined, "dummy", false]);
		await assert.rejects(() => cli.execute(Command), "You'll need to confirm the input to continue.");

		spyOnUpdateVariables.neverCalled();
	});
});
