import { Container } from "@mainsail/container";

import { describe } from "../../../test-framework/source";
import { ProcessIdentifier } from "../contracts";
import { Identifiers } from "../ioc/index.js";
import { ProcessManager } from "../services";
import { RestartProcess } from "./restart-process";
import { RestartRunningProcess } from "./restart-running-process";

describe<{
	action: RestartRunningProcess;
}>("RestartRunningProcess", ({ beforeEach, it, assert, stub, spy }) => {
	const processName = "ark-core";

	const processManager: Partial<ProcessManager> = {
		isOnline: (id: ProcessIdentifier) => false,
	};

	const restartProcess: Partial<RestartProcess> = {
		execute: (processName: string) => {},
	};

	beforeEach((context) => {
		const container = new Container();
		container.bind(Identifiers.Application.Instance).toConstantValue(container);
		container.bind(Identifiers.ProcessManager).toConstantValue(processManager);
		container.bind(Identifiers.RestartProcess).toConstantValue(restartProcess);
		context.action = container.get(RestartRunningProcess, { autobind: true });
	});

	it("should not restart the process if it is not online", ({ action }) => {
		const spyOnExecute = spy(restartProcess, "execute");
		const spyIsOnline = stub(processManager, "isOnline").returnValue(false);

		action.execute(processName);

		spyOnExecute.neverCalled();
		spyIsOnline.calledOnce();
	});

	it("should restart the process", ({ action }) => {
		const spyOnExecute = spy(restartProcess, "execute");
		const spyIsOnline = stub(processManager, "isOnline").returnValue(true);

		action.execute(processName);

		spyOnExecute.calledOnce();
		spyIsOnline.calledOnce();
	});
});
