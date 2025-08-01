import { inject, injectable } from "@mainsail/container";
import { Contracts, Identifiers } from "@mainsail/contracts";
import { pascalCase } from "@mainsail/utils";

// @TODO revisit the implementation of the class and see if it can be removed
@injectable()
export abstract class ClassManager {
	@inject(Identifiers.Application.Instance)
	protected readonly app!: Contracts.Kernel.Application;

	#defaultDriver: string;

	// @TODO revisit the implementation of the class and see if it can be removed
	//
	// #drivers: Map<string, Class> = new Map<string, Class>();

	public constructor() {
		this.#defaultDriver = this.getDefaultDriver();
	}

	public async driver<T>(name?: string): Promise<T> {
		return this.#createDriver<T>(name || this.#defaultDriver);
	}

	// @TODO revisit the implementation of the class and see if it can be removed
	//
	// public async extend(name: string, driver: Class): Promise<void> {
	//     this.#drivers.set(name, driver);
	// }

	public setDefaultDriver(name: string): void {
		this.#defaultDriver = name;
	}

	// @TODO revisit the implementation of the class and see if it can be removed
	//
	// public getDrivers(): Class[] {
	//     return Object.values(this.#drivers);
	// }

	async #createDriver<T>(name: string): Promise<T> {
		const creatorFunction = `create${pascalCase(name)}Driver`;

		if (typeof this[creatorFunction] !== "function") {
			throw new TypeError(`${name} driver is not supported by ${this.constructor.name}.`);
		}

		return this[creatorFunction]();
	}

	protected abstract getDefaultDriver(): string;
}
