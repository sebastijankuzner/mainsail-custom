import { Container } from "@mainsail/container";

import { describe } from "../../../test-framework/source";
import { ProcessIdentifier } from "../contracts";
import { Identifiers } from "../ioc/index.js";
import { ProcessManager } from "../services";
import { AbortRunningProcess } from "./abort-running-process";

describe<{
	action: AbortRunningProcess;
}>("AbortRunningProcess", ({ beforeEach, it, assert, stub }) => {
	const processName = "ark-core";

	const processManager: Partial<ProcessManager> = {
		isOnline: (id: ProcessIdentifier) => false,
	};

	beforeEach((context) => {
		const container = new Container();
		container.bind(Identifiers.ProcessManager).toConstantValue(processManager);
		context.action = container.get(AbortRunningProcess, { autobind: true });
	});

	it("should not throw if the process is not online", ({ action }) => {
		const spyIsErrored = stub(processManager, "isOnline").returnValue(false);

		action.execute(processName);
		spyIsErrored.calledOnce();
	});

	it("should throw if the process is not online", ({ action }) => {
		const spyIsErrored = stub(processManager, "isOnline").returnValue(true);

		assert.throws(() => {
			action.execute(processName);
		}, `The "${processName}" process is already running.`);
		spyIsErrored.calledOnce();
	});
});
