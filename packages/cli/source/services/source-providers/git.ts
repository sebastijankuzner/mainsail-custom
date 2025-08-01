import { isGit } from "@mainsail/utils";

import { execa } from "../../execa.js";
import { AbstractSource } from "./abstract-source.js";

export class Git extends AbstractSource {
	public constructor(paths: { data: string; temp: string }) {
		super(paths);
	}

	public async exists(value: string): Promise<boolean> {
		return isGit(value);
	}

	public async update(value: string): Promise<void> {
		const destination = this.getDestPath(value);

		execa.sync(`git`, ["reset", "--hard"], { cwd: destination });
		execa.sync(`git`, ["pull"], { cwd: destination });

		await this.installDependencies(value);
	}

	protected async preparePackage(value: string): Promise<void> {
		execa.sync(`git`, ["clone", value, this.getOriginPath()]);
	}
}
