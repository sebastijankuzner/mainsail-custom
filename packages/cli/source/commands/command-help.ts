import { inject, injectable } from "@mainsail/container";
import { Contracts } from "@mainsail/contracts";
import { blue, bold } from "kleur/colors";

import { AppHeader } from "../components/index.js";
import { Application } from "../contracts.js";
import { Identifiers } from "../ioc/index.js";

@injectable()
export class CommandHelp {
	@inject(Identifiers.Application.Instance)
	protected readonly app!: Application;

	@inject(Identifiers.Package)
	protected readonly pkg!: Contracts.Types.PackageJson;

	public render(command): string {
		let helpMessage = `${this.app.get<AppHeader>(Identifiers.AppHeader).render()}

${blue(bold("Description"))}
${command.description}`;

		const arguments_: string = this.#buildArguments(command);

		if (arguments_) {
			helpMessage += `${blue(bold("\n\nArguments"))}
${arguments_}`;
		}

		const flags: string = this.#buildFlags(command);

		if (flags) {
			helpMessage += `${blue(bold("\n\nFlags"))}
${flags}`;
		}

		return helpMessage;
	}

	#buildArguments(command): string {
		const arguments_ = command.definition.getArguments();

		if (Object.keys(arguments_).length <= 0) {
			return "";
		}

		const { options, descriptions, longestProperty } = this.#buildProperties(arguments_);

		const output: string[] = [];
		for (const [index, option] of options.entries()) {
			output.push(`${option.padEnd(longestProperty, " ")}    ${descriptions[index]}`);
		}

		return output.join("\n");
	}

	#buildFlags(command): string {
		const flags = command.definition.getFlags();

		if (Object.keys(flags).length <= 0) {
			return "";
		}

		const { options, descriptions, longestProperty } = this.#buildProperties(flags);

		const output: string[] = [];
		for (const [index, option] of options.entries()) {
			output.push(`--${option.padEnd(longestProperty, " ")}    ${descriptions[index]}`);
		}

		return output.join("\n");
	}

	#buildProperties<T extends Record<string, any>>(properties: T) {
		const options: string[] = [];
		const descriptions: string[] = [];

		for (const option of Object.keys(properties)) {
			options.push(option);
			descriptions.push(properties[option].description);
		}

		return {
			descriptions,
			longestProperty: options.reduce((a, b) => (a.length > b.length ? a : b)).length,
			options,
		};
	}
}
