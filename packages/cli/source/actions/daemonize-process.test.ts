import { Container } from "@mainsail/container";
import { Constants } from "@mainsail/contracts";
import { describe } from "@mainsail/test-runner";
import esmock from "esmock";
import { Options as OraOptions, Ora } from "ora";
import os from "os";

import { Spinner } from "../components";
import { ProcessIdentifier } from "../contracts";
import { Identifiers } from "../ioc/index.js";
import { ProcessManager } from "../services";
import { AbortRunningProcess } from "./abort-running-process";
import { AbortUnknownProcess } from "./abort-unknown-process";
import { DaemonizeProcess } from "./daemonize-process";

let totalMem;
const { DaemonizeProcess: DaemonizeProcessProxy } = await esmock("./daemonize-process", {
	os: {
		totalmem: () => totalMem,
	},
});

describe<{
	action: DaemonizeProcess;
}>("DaemonizeProcess", ({ beforeEach, it, assert, stub, spy }) => {
	totalMem = 3 * Constants.Units.GIGABYTE;

	const options = {
		args: "core:run --daemon",
		name: "ark-core",
		script: "script",
	};

	const processManager: Partial<ProcessManager> = {
		has: (id: ProcessIdentifier) => false,
		isUnknown: (id: ProcessIdentifier) => false,
		start: (options_: Record<string, any>, flags: Record<string, any>): any => {},
	};

	const abortUnknownProcess: Partial<AbortUnknownProcess> = {
		execute: (processName: string) => {},
	};

	const abortRunningProcess: Partial<AbortRunningProcess> = {
		execute: (processName: string) => {},
	};

	const ora: Partial<Ora> = {
		stop: () => this,
	};

	const spinner: Spinner = {
		render: (options?: string | OraOptions | undefined): Ora => ora as Ora,
	};

	beforeEach((context) => {
		const container = new Container();
		container.bind(Identifiers.Application.Instance).toConstantValue(container);
		container.bind(Identifiers.ProcessManager).toConstantValue(processManager);
		container.bind(Identifiers.AbortUnknownProcess).toConstantValue(abortUnknownProcess);
		container.bind(Identifiers.AbortRunningProcess).toConstantValue(abortRunningProcess);
		container.bind(Identifiers.Spinner).toConstantValue(spinner);
		context.action = container.get(DaemonizeProcessProxy, { autobind: true });
	});

	it("should throw if the process has entered an unknown state", ({ action }) => {
		const spyOnHas = stub(processManager, "has").returnValue(true);
		const spyOnAbortUnknownProcessExecute = stub(abortUnknownProcess, "execute").callsFake(() => {
			throw new Error("Unknown");
		});

		assert.throws(() => action.execute(options, {}), "Unknown");

		spyOnHas.calledOnce();
		spyOnAbortUnknownProcessExecute.calledOnce();
	});

	it("should throw if the process is running", ({ action }) => {
		const spyOnHas = stub(processManager, "has").returnValue(true);
		const spyOnAbortRunningProcessExecute = stub(abortRunningProcess, "execute").callsFake(() => {
			throw new Error("Running");
		});

		assert.throws(() => action.execute(options, {}), "Running");
		spyOnHas.calledOnce();
		spyOnAbortRunningProcessExecute.calledOnce();
	});

	it("should start process with the [no-daemon] flag if the daemon flag is not set", ({ action }) => {
		const spyOnHas = spy(processManager, "has");
		const spyOnStart = spy(processManager, "start");

		action.execute(
			{
				args: "core:run",
				name: "ark-core",
				script: "script",
			},
			{},
		);

		spyOnHas.calledOnce();
		spyOnHas.calledWith("ark-core");
		spyOnStart.calledOnce();
		spyOnStart.calledWith(
			{
				args: "core:run",
				env: { MAINSAIL_ENV: undefined, NODE_ENV: "production" },
				name: "ark-core",
				node_args: undefined,
				script: "script",
			},
			{ "kill-timeout": 30_000, "max-restarts": 5, name: "ark-core", "no-daemon": true },
		);
	});

	it("should start process with the [no-daemon] flag if the daemon flag is to false", ({ action }) => {
		const spyOnHas = spy(processManager, "has");
		const spyOnStart = spy(processManager, "start");

		action.execute(
			{
				args: "core:run --daemon",
				name: "ark-core",
				script: "script",
			},
			{ daemon: false },
		);

		spyOnHas.calledOnce();
		spyOnHas.calledWith("ark-core");
		spyOnStart.calledWith(
			{
				args: "core:run --daemon",
				env: { MAINSAIL_ENV: undefined, NODE_ENV: "production" },
				name: "ark-core",
				node_args: undefined,
				script: "script",
			},
			{ "kill-timeout": 30_000, "max-restarts": 5, name: "ark-core", "no-daemon": true },
		);
	});

	it("should start process without the [--no-daemon] flag if the daemon flag is true", ({ action }) => {
		const spyOnHas = spy(processManager, "has");
		const spyOnStart = spy(processManager, "start");

		action.execute(
			{
				args: "core:run --daemon",
				name: "ark-core",
				script: "script",
			},
			{ daemon: true },
		);

		spyOnHas.calledOnce();
		spyOnHas.calledWith("ark-core");
		spyOnStart.calledWith(
			{
				args: "core:run --daemon",
				env: { MAINSAIL_ENV: undefined, NODE_ENV: "production" },
				name: "ark-core",
				node_args: undefined,
				script: "script",
			},
			{ "kill-timeout": 30_000, "max-restarts": 5, name: "ark-core" },
		);
	});

	it("should start process should run with potato settings", ({ action }) => {
		totalMem = 1 * Constants.Units.GIGABYTE;

		const spyOnHas = spy(processManager, "has");
		const spyOnStart = spy(processManager, "start");
		stub(os, "totalmem").returnValue(2 * 1024 ** 3 - 1);

		action.execute(
			{
				args: "core:run --daemon",
				name: "ark-core",
				script: "script",
			},
			{},
		);

		spyOnHas.calledOnce();
		spyOnHas.calledWith("ark-core");
		spyOnStart.calledWith(
			{
				args: "core:run --daemon",
				env: {
					MAINSAIL_ENV: undefined,
					NODE_ENV: "production",
				},
				name: "ark-core",
				node_args: {
					max_old_space_size: 500,
				},
				script: "script",
			},
			{ "kill-timeout": 30_000, "max-restarts": 5, name: "ark-core", "no-daemon": true },
		);
	});

	it("should throw if processManager.start throws", ({ action }) => {
		const spyOnStart = stub(processManager, "start").callsFake(() => {
			throw new Error("Dummy error");
		});

		assert.throws(
			() =>
				action.execute(
					{
						args: "core:run --daemon",
						name: "ark-core",
						script: "script",
					},
					{},
				),
			"Dummy error",
		);

		spyOnStart.calledOnce();
	});
});
