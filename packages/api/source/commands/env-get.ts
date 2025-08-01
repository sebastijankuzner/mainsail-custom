// eslint-disable-next-line unicorn/prevent-abbreviations
import { Commands } from "@mainsail/cli";
import { injectable, postConstruct } from "@mainsail/container";
import { parse } from "envfile";
import { existsSync, readFileSync } from "fs";
import Joi from "joi";

@injectable()
export class Command extends Commands.Command {
	public signature = "env:get";

	public description = "Get the value of an environment variable.";

	@postConstruct()
	public configure(): void {
		this.definition.setFlag(
			"key",
			"The name of the environment variable that you wish to get the value of.",
			Joi.string().required(),
		);
	}

	public async execute(): Promise<void> {
		const environmentFile: string = this.app.getCorePath("config", ".env");

		if (!existsSync(environmentFile)) {
			this.components.fatal(`No environment file found at ${environmentFile}.`);
		}

		const environment: object = parse(readFileSync(environmentFile).toString("utf8"));
		const key: string = this.getFlag("key");

		if (!environment[key]) {
			this.components.fatal(`The "${key}" doesn't exist.`);
		}

		this.components.log(environment[key]);
	}
}
