import {
	ApplicationFactory,
	Commands,
	Contracts as CliContracts,
	Identifiers,
	InputParser,
	Plugins,
} from "@mainsail/cli";
import { Container, injectable } from "@mainsail/container";
import { Contracts } from "@mainsail/contracts";
import { existsSync } from "fs";
import { readJSONSync } from "fs-extra/esm";
import { platform } from "os";
import path from "path";

@injectable()
export class CommandLineInterface {
	#app!: CliContracts.Application;

	public constructor(private readonly argv: string[]) {}

	public async execute(dirname?: string): Promise<void> {
		if (!dirname) {
			dirname = new URL(".", import.meta.url).pathname;
		}

		// Set NODE_PATHS. Only required for plugins that uses @mainsail as peer dependencies.
		await this.#setNodePath(dirname);

		// Load the package information. Only needed for updates and installations.
		const package_: Contracts.Types.PackageJson = readJSONSync(path.join(dirname, "..", "package.json"));

		// Create the application we will work with
		this.#app = ApplicationFactory.make(new Container(), package_);

		// Check for updates
		await this.#app.get<CliContracts.Updater>(Identifiers.Updater).check();

		// Parse arguments and flags
		const { args, flags } = InputParser.parseArgv(this.argv);

		// Discover commands and commands from plugins
		const commands: CliContracts.CommandList = await this.#discoverCommands(dirname, flags);

		// Figure out what command we should run and offer help if necessary
		let commandSignature = args[0] as string | undefined;

		if (!commandSignature) {
			await commands.help.execute();

			process.exitCode = 2;
			return;
		}

		let commandInstance: Commands.Command = commands[commandSignature];

		if (!commandInstance) {
			commandSignature = await this.#app.resolve(Plugins.SuggestCommand).execute({
				// @ts-ignore
				bin: Object.keys(package_.bin)[0],
				signature: commandSignature,
				signatures: Object.keys(commands),
			});

			if (commandSignature) {
				commandInstance = commands[commandSignature];
			}
		}

		if (!commandInstance) {
			await commands.help.execute();

			process.exitCode = 2;
			return;
		}

		if (flags.help) {
			commandInstance.showHelp();

			return;
		}

		commandInstance.register(this.argv);

		await commandInstance.run();
	}

	async #setNodePath(dirname: string): Promise<void> {
		const delimiter = platform() === "win32" ? ";" : ":";

		if (!process.env.NODE_PATH) {
			process.env.NODE_PATH = "";
		}

		const setPath = (path: string) => {
			if (existsSync(path)) {
				process.env.NODE_PATH += `${delimiter}${path}`;
			}
		};

		setPath(path.join(dirname, "../"));
		setPath(path.join(dirname, "../node_modules"));

		const { Module } = await import("module");
		// @ts-ignore
		Module._initPaths();
	}

	async #discoverCommands(dirname: string, flags: any): Promise<CliContracts.CommandList> {
		const commandsDiscoverer = this.#app.resolve(Commands.DiscoverCommands);
		const commands: CliContracts.CommandList = await commandsDiscoverer.within(path.resolve(dirname, "./commands"));

		const plugins = await this.#app.get<CliContracts.PluginManager>(Identifiers.PluginManager).list();

		const commandsFromPlugins = await commandsDiscoverer.from(plugins.map((plugin) => plugin.path));

		for (const [key, value] of Object.entries(commandsFromPlugins)) {
			commands[key] = value;
		}

		this.#app.bind<CliContracts.CommandList>(Identifiers.Commands).toConstantValue(commands);
		return commands;
	}
}
