// eslint-disable-next-line unicorn/prevent-abbreviations
import { Commands, Identifiers, Services } from "@mainsail/cli";
import { inject, injectable, postConstruct } from "@mainsail/container";
import Joi from "joi";

@injectable()
export class Command extends Commands.Command {
	@inject(Identifiers.Environment)
	private readonly environment!: Services.Environment;

	public signature = "env:set";

	public description = "Set the value of an environment variable.";

	@postConstruct()
	public configure(): void {
		this.definition
			.setFlag(
				"key",
				"The environment variable that you wish to set.",
				Joi.alternatives().try(Joi.string(), Joi.number()).required(),
			)
			.setFlag(
				"value",
				"The value that you wish to set the environment variable to.",
				Joi.alternatives().try(Joi.string(), Joi.number()).required(),
			);
	}

	public async execute(): Promise<void> {
		this.environment.updateVariables(this.app.getCorePath("config", ".env"), {
			[this.getFlag("key")]: this.getFlag("value"),
		});
	}
}
