import {
	Contracts as ApiDatabaseContracts,
	Identifiers as ApiDatabaseIdentifiers,
	Models,
} from "@mainsail/api-database";
import { inject, injectable } from "@mainsail/container";
import { Contracts, Events } from "@mainsail/contracts";

import { AbstractListener, ListenerEvent, ListenerEventMapping } from "./abstract-listener.js";

@injectable()
export class ApiNodes extends AbstractListener<Contracts.P2P.ApiNode, Models.ApiNode> {
	@inject(ApiDatabaseIdentifiers.ApiNodeRepositoryFactory)
	private readonly apiNodeRepositoryFactory!: ApiDatabaseContracts.ApiNodeRepositoryFactory;

	protected getEventMapping(): ListenerEventMapping {
		return {
			[Events.ApiNodeEvent.Added]: ListenerEvent.OnAdded,
			[Events.ApiNodeEvent.Removed]: ListenerEvent.OnRemoved,
		};
	}

	protected getEventId(event: Contracts.P2P.ApiNode): string {
		return event.url;
	}

	protected mapEventToEntity(event: Contracts.P2P.ApiNode): Models.ApiNode {
		return {
			height: event.height,
			latency: event.latency,
			url: event.url,
			version: event.version,
		};
	}

	protected makeEntityRepository(
		dataSource: ApiDatabaseContracts.RepositoryDataSource,
	): ApiDatabaseContracts.Repository<Models.ApiNode> {
		return this.apiNodeRepositoryFactory(dataSource);
	}
}
