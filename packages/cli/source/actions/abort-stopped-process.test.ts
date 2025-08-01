import { Container } from "@mainsail/container";

import { describe } from "../../../test-framework/source";
import { ProcessIdentifier } from "../contracts";
import { Identifiers } from "../ioc/index.js";
import { ProcessManager } from "../services";
import { AbortStoppedProcess } from "./abort-stopped-process";

describe<{
	action: AbortStoppedProcess;
}>("AbortStoppedProcess", ({ beforeEach, it, assert, stub }) => {
	const processName = "ark-core";

	const processManager: Partial<ProcessManager> = {
		isStopped: (id: ProcessIdentifier) => false,
	};

	beforeEach((context) => {
		const container = new Container();
		container.bind(Identifiers.ProcessManager).toConstantValue(processManager);
		context.action = container.get(AbortStoppedProcess, { autobind: true });
	});

	it("should not throw if the process is running", ({ action }) => {
		const spyIsErrored = stub(processManager, "isStopped").returnValue(false);

		action.execute(processName);
		spyIsErrored.calledOnce();
	});

	it("should throw if the process is not running", ({ action }) => {
		const spyIsErrored = stub(processManager, "isStopped").returnValue(true);

		assert.throws(() => {
			action.execute(processName);
		}, `The "${processName}" process is not running.`);
		spyIsErrored.calledOnce();
	});
});
