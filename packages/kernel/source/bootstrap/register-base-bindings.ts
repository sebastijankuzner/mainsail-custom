import { inject, injectable } from "@mainsail/container";
import { Constants, Contracts, Identifiers } from "@mainsail/contracts";
import { assert } from "@mainsail/utils";
import path from "path";
import { URL } from "url";

@injectable()
export class RegisterBaseBindings implements Contracts.Kernel.Bootstrapper {
	@inject(Identifiers.Application.Instance)
	private readonly app!: Contracts.Kernel.Application;

	@inject(Identifiers.Services.Filesystem.Service)
	private readonly fileSystem!: Contracts.Kernel.Filesystem;

	public async bootstrap(): Promise<void> {
		const flags: Record<string, string> | undefined = this.app.config("app.flags");

		const { version } = this.fileSystem.readJSONSync<Contracts.Types.PackageJson>(
			path.resolve(new URL(".", import.meta.url).pathname, "../../package.json"),
		);

		assert.defined(version);
		assert.defined(flags);

		this.app.bind<string>(Identifiers.Application.Environment).toConstantValue(flags.env);
		this.app.bind<string>(Identifiers.Application.Name).toConstantValue(flags.name);
		this.app.bind<string>(Identifiers.Application.Thread).toConstantValue(flags.thread || "main");
		this.app.bind<string>(Identifiers.Application.Version).toConstantValue(version);

		// @@TODO implement a getter/setter that sets vars locally and in the process.env variables
		process.env[Constants.EnvironmentVariables.MAINSAIL_ENV] = flags.env;
		// process.env[Constants.EnvironmentVariables.MAINSAIL_ENV] = process.env.MAINSAIL_ENV;
		process.env[Constants.EnvironmentVariables.MAINSAIL_TOKEN] = flags.token;
		process.env[Constants.EnvironmentVariables.MAINSAIL_NETWORK_NAME] = flags.network;
		process.env[Constants.EnvironmentVariables.MAINSAIL_VERSION] = version;
	}
}
