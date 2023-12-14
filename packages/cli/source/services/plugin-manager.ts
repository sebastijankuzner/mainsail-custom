import { inject, injectable } from "@mainsail/container";
import { existsSync, readJSONSync, removeSync } from "fs-extra";
import { glob } from "glob";
import { join } from "path";

import * as Contracts from "../contracts";
import { Identifiers } from "../ioc";
import { Environment } from "./environment";
import { File, Git, NPM, Source } from "./source-providers";

@injectable()
export class PluginManager implements Contracts.PluginManager {
	@inject(Identifiers.Environment)
	private readonly environment!: Environment;

	public async list(token: string, network: string, name: string): Promise<Contracts.Plugin[]> {
		const plugins: Contracts.Plugin[] = [];

		const path = this.#getPluginsPath(token, network, name);
		const packagePaths = glob
			.sync("{@*/*/package.json,*/package.json}", { cwd: path })
			.map((packagePath) => join(path, packagePath).slice(0, -"/package.json".length));

		for (const packagePath of packagePaths) {
			const packageJson = readJSONSync(join(packagePath, "package.json"));

			plugins.push({
				name: packageJson.name,
				path: packagePath,
				version: packageJson.version,
			});
		}

		return plugins.sort((a, b) => a.name.localeCompare(b.name));
	}

	public async install(
		token: string,
		network: string,
		name: string,
		package_: string,
		version?: string,
	): Promise<void> {
		for (const Instance of [File, Git, NPM]) {
			const source: Source = new Instance({
				data: this.#getPluginsPath(token, network, name),
				temp: this.#getTempPath(token, network, name),
			});

			if (await source.exists(package_, version)) {
				return source.install(package_, version);
			}
		}

		throw new Error(`The given package [${package_}] is neither a git nor a npm package.`);
	}

	public async update(token: string, network: string, name: string, package_: string): Promise<void> {
		const paths = {
			data: this.#getPluginsPath(token, network, name),
			temp: this.#getTempPath(token, network, name),
		};
		const directory: string = join(paths.data, package_);

		if (!existsSync(directory)) {
			throw new Error(`The package [${package_}] does not exist.`);
		}

		if (existsSync(`${directory}/.git`)) {
			return new Git(paths).update(package_);
		}

		return new NPM(paths).update(package_);
	}

	public async remove(token: string, network: string, name: string, package_): Promise<void> {
		const directory: string = join(this.#getPluginsPath(token, network, name), package_);

		if (!existsSync(directory)) {
			throw new Error(`The package [${package_}] does not exist.`);
		}

		removeSync(directory);
	}

	#getPluginsPath(token: string, network: string, name: string): string {
		return join(this.environment.getPaths(token, network, name).data, "plugins");
	}

	#getTempPath(token: string, network: string, name: string): string {
		return join(this.environment.getPaths(token, network, name).temp, "plugins");
	}
}
