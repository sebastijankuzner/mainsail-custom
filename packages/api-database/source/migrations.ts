import { inject, injectable } from "@mainsail/container";
import { Contracts, Identifiers } from "@mainsail/contracts";
import { DataSource, QueryFailedError } from "typeorm";

import { IMigrations } from "./contracts";
import { Identifiers as ApiDatabaseIdentifiers } from "./identifiers";

@injectable()
export class Migrations implements IMigrations {
	@inject(Identifiers.Application)
	public readonly app!: Contracts.Kernel.Application;

	@inject(Identifiers.LogService)
	private readonly logger!: Contracts.Kernel.Logger;

	@inject(ApiDatabaseIdentifiers.DataSource)
	private readonly dataSource!: DataSource;

	public async run(): Promise<void> {
		this.logger.info(`running migrations...`);

		await this.#synchronizeEntities();
		await this.dataSource.runMigrations();
	}

	async #synchronizeEntities(): Promise<void> {
		try {
			// Manually run 'synchronize' to create entity tables once. We cannot rely on TypeORM to run it unconditionally
			// when creating the datasource since it will fail to establish a connection when it runs into the 'Table already exists' error.
			await this.dataSource.synchronize(false);
		} catch (error) {
			if (!(error instanceof QueryFailedError)) {
				throw error;
			}

			// https://www.postgresql.org/docs/current/errcodes-appendix.html
			// 42P07 	duplicate_table
			if ((error as any).code !== "42P07") {
				throw error;
			}

			this.logger.info(`entities already synchronized`);
		}
	}
}