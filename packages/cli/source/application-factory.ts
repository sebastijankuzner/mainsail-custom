import { Container } from "@mainsail/container";
import { Contracts } from "@mainsail/contracts";
import { assert } from "@mainsail/utils";

import { ActionFactory } from "./action-factory.js";
import {
	AbortErroredProcess,
	AbortMissingProcess,
	AbortRunningProcess,
	AbortStoppedProcess,
	AbortUnknownProcess,
	DaemonizeProcess,
	RestartProcess,
	RestartRunningProcess,
	RestartRunningProcessWithPrompt,
} from "./actions/index.js";
import { Application } from "./application.js";
import { ComponentFactory } from "./component-factory.js";
import {
	AppHeader,
	Ask,
	AskDate,
	AskHidden,
	AskNumber,
	AskPassword,
	AutoComplete,
	Box,
	Clear,
	Confirm,
	Error,
	Fatal,
	Info,
	Listing,
	Log,
	MultiSelect,
	NewLine,
	Prompt,
	Select,
	Spinner,
	Success,
	Table,
	TaskList,
	Title,
	Toggle,
	Warning,
} from "./components/index.js";
import { envPaths as environmentPaths } from "./env-paths.js";
import { Input, InputValidator } from "./input/index.js";
import { Identifiers } from "./ioc/index.js";
import { Output } from "./output/index.js";
import {
	Config,
	Environment,
	Installer,
	Logger,
	PluginManager,
	ProcessManager,
	Setup,
	Updater,
} from "./services/index.js";
import { Process } from "./utils/index.js";

export class ApplicationFactory {
	public static make(container: Container, package_: Contracts.Types.PackageJson): Application {
		const app: Application = new Application(container);

		// Package
		app.bind(Identifiers.Package).toConstantValue(package_);

		// Paths
		assert.string(package_.name);
		app.bind(Identifiers.ConsolePaths).toConstantValue(environmentPaths.get(package_.name));

		const applicationName = package_.name?.split("/")[1];
		assert.string(applicationName);

		app.bind(Identifiers.Application.Name).toConstantValue(applicationName);

		// Factories
		app.bind(Identifiers.ActionFactory).to(ActionFactory).inSingletonScope();

		app.bind(Identifiers.ComponentFactory).to(ComponentFactory).inSingletonScope();

		app.bind<(type: string) => Process>(Identifiers.ProcessFactory).toFactory(
			(context: Contracts.Kernel.Container.ResolutionContext) =>
				(type: string): Process => {
					const process: Process = container.get(Process, { autobind: true });
					process.initialize(type);

					return process;
				},
		);

		// Services
		app.bind(Identifiers.Output).to(Output).inSingletonScope();

		app.bind(Identifiers.Logger).to(Logger).inSingletonScope();

		app.bind(Identifiers.Config).to(Config).inSingletonScope();

		app.bind(Identifiers.Updater).to(Updater).inSingletonScope();

		app.bind(Identifiers.ProcessManager).to(ProcessManager).inSingletonScope();

		app.bind(Identifiers.PluginManager).to(PluginManager).inSingletonScope();

		app.bind(Identifiers.Installer).to(Installer).inSingletonScope();

		app.bind(Identifiers.Environment).to(Environment).inSingletonScope();

		app.bind(Identifiers.Setup).to(Setup).inSingletonScope();

		// Input
		app.bind(Identifiers.Input).to(Input).inSingletonScope();

		app.bind(Identifiers.InputValidator).to(InputValidator).inSingletonScope();

		// Actions
		app.bind(Identifiers.AbortErroredProcess).to(AbortErroredProcess).inSingletonScope();

		app.bind(Identifiers.AbortMissingProcess).to(AbortMissingProcess).inSingletonScope();

		app.bind(Identifiers.AbortRunningProcess).to(AbortRunningProcess).inSingletonScope();

		app.bind(Identifiers.AbortStoppedProcess).to(AbortStoppedProcess).inSingletonScope();

		app.bind(Identifiers.AbortUnknownProcess).to(AbortUnknownProcess).inSingletonScope();

		app.bind(Identifiers.DaemonizeProcess).to(DaemonizeProcess).inSingletonScope();

		app.bind(Identifiers.RestartProcess).to(RestartProcess).inSingletonScope();

		app.bind(Identifiers.RestartRunningProcess).to(RestartRunningProcess).inSingletonScope();

		app.bind(Identifiers.RestartRunningProcessWithPrompt).to(RestartRunningProcessWithPrompt).inSingletonScope();

		// Components
		app.bind(Identifiers.AppHeader).to(AppHeader).inSingletonScope();

		app.bind(Identifiers.Ask).to(Ask).inSingletonScope();

		app.bind(Identifiers.AskDate).to(AskDate).inSingletonScope();

		app.bind(Identifiers.AskHidden).to(AskHidden).inSingletonScope();

		app.bind(Identifiers.AskNumber).to(AskNumber).inSingletonScope();

		app.bind(Identifiers.AskPassword).to(AskPassword).inSingletonScope();

		app.bind(Identifiers.AutoComplete).to(AutoComplete).inSingletonScope();

		app.bind(Identifiers.Box).to(Box).inSingletonScope();

		app.bind(Identifiers.Clear).to(Clear).inSingletonScope();

		app.bind(Identifiers.Confirm).to(Confirm).inSingletonScope();

		app.bind(Identifiers.Error).to(Error).inSingletonScope();

		app.bind(Identifiers.Fatal).to(Fatal).inSingletonScope();

		app.bind(Identifiers.Info).to(Info).inSingletonScope();

		app.bind(Identifiers.Listing).to(Listing).inSingletonScope();

		app.bind(Identifiers.Log).to(Log).inSingletonScope();

		app.bind(Identifiers.MultiSelect).to(MultiSelect).inSingletonScope();

		app.bind(Identifiers.NewLine).to(NewLine).inSingletonScope();

		app.bind(Identifiers.Prompt).to(Prompt).inSingletonScope();

		app.bind(Identifiers.Select).to(Select).inSingletonScope();

		app.bind(Identifiers.Spinner).to(Spinner).inSingletonScope();

		app.bind(Identifiers.Success).to(Success).inSingletonScope();

		app.bind(Identifiers.Table).to(Table).inSingletonScope();

		app.bind(Identifiers.TaskList).to(TaskList).inSingletonScope();

		app.bind(Identifiers.Title).to(Title).inSingletonScope();

		app.bind(Identifiers.Toggle).to(Toggle).inSingletonScope();

		app.bind(Identifiers.Warning).to(Warning).inSingletonScope();

		app.rebind(Identifiers.ApplicationPaths).toConstantValue(
			app.get<Environment>(Identifiers.Environment).getPaths(),
		);

		return app;
	}
}
