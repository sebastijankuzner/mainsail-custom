import { Commands, Contracts, Identifiers } from "@mainsail/cli";
import { inject, injectable, postConstruct } from "@mainsail/container";
import Joi from "joi";

@injectable()
export class Command extends Commands.Command {
	@inject(Identifiers.PluginManager)
	private readonly pluginManager!: Contracts.PluginManager;

	public signature = "plugin:update";

	public description = "Updates a package and any packages that it depends on.";

	@postConstruct()
	public configure(): void {
		this.definition.setArgument("package", "The name of the package.", Joi.string().required());
	}

	public async execute(): Promise<void> {
		return await this.pluginManager.update(this.getArgument("package"));
	}
}
