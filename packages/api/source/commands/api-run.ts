import { Commands, Contracts, Utils } from "@mainsail/cli";
import { injectable, postConstruct } from "@mainsail/container";
import { assert } from "@mainsail/utils";
import { readJSONSync } from "fs-extra/esm";
import Joi from "joi";
import path from "path";
import { URL } from "url";

@injectable()
export class Command extends Commands.Command {
	public signature = "api:run";

	public description = "Run the API process in foreground. Exiting the process will stop it from running.";

	@postConstruct()
	public configure(): void {
		this.definition
			.setFlag("env", "", Joi.string().default("production"))
			.setFlag("skipPrompts", "Skip prompts.", Joi.boolean().default(false));
	}

	public async execute(): Promise<void> {
		const { name } = readJSONSync(path.resolve(new URL(".", import.meta.url).pathname, "../../package.json"));
		assert.string(name);

		const flags: Contracts.AnyObject = {
			...this.getFlags(),
			allowMissingConfigFiles: true,
			name: name.split("/")[1],
		};

		await Utils.Builder.buildApplication({
			flags,
			plugins: {},
		});

		// Prevent resolving execute method
		return new Promise(() => {});
	}
}
