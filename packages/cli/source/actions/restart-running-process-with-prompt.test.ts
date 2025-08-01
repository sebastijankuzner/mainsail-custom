import { Container } from "@mainsail/container";

import { describe } from "../../../test-framework/source";
import { Prompt } from "../components";
import { ProcessIdentifier } from "../contracts";
import { Identifiers } from "../ioc/index.js";
import { ProcessManager } from "../services";
import { RestartProcess } from "./restart-process";
import { RestartRunningProcessWithPrompt } from "./restart-running-process-with-prompt";

describe<{
	action: RestartRunningProcessWithPrompt;
}>("RestartRunningProcessWithPrompt", ({ beforeEach, it, assert, stub, spy }) => {
	const processName = "ark-core";

	const processManager: Partial<ProcessManager> = {
		isOnline: (id: ProcessIdentifier) => false,
	};

	const restartProcess: Partial<RestartProcess> = {
		execute: (processName: string) => {},
	};

	const prompt: Partial<Prompt> = {
		render: async (options: object): Promise<{ confirm: boolean }> => ({
			confirm: false,
		}),
	};

	let spyOnExecute;

	beforeEach((context) => {
		spyOnExecute = spy(restartProcess, "execute");

		const container = new Container();
		container.bind(Identifiers.Application.Instance).toConstantValue(container);
		container.bind(Identifiers.ProcessManager).toConstantValue(processManager);
		container.bind(Identifiers.RestartProcess).toConstantValue(restartProcess);
		container.bind(Identifiers.Prompt).toConstantValue(prompt);
		context.action = container.get(RestartRunningProcessWithPrompt, { autobind: true });
	});

	it("should not restart the process if it is not online", async ({ action }) => {
		const spyIsOnline = stub(processManager, "isOnline").returnValue(false);
		const spyRender = spy(prompt, "render");

		await action.execute(processName);

		spyOnExecute.neverCalled();
		spyIsOnline.calledOnce();
		spyRender.neverCalled();
	});

	it("should not restart the process if it is not confirmed", async ({ action }) => {
		const spyIsOnline = stub(processManager, "isOnline").returnValue(true);
		const spyRender = stub(prompt, "render").resolvedValue({ confirm: false });

		await action.execute(processName);

		spyOnExecute.neverCalled();
		spyIsOnline.calledOnce();
		spyRender.calledOnce();
	});

	it("should restart the process", async ({ action }) => {
		const spyIsOnline = stub(processManager, "isOnline").returnValue(true);
		const spyRender = stub(prompt, "render").resolvedValue({ confirm: true });

		await action.execute(processName);

		spyOnExecute.calledOnce();
		spyIsOnline.calledOnce();
		spyRender.calledOnce();
	});
});
