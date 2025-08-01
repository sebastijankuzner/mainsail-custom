import {
	Contracts as ApiDatabaseContracts,
	Identifiers as ApiDatabaseIdentifiers,
	Models,
} from "@mainsail/api-database";
import { inject, injectable } from "@mainsail/container";
import { Contracts, Events } from "@mainsail/contracts";
import { assert } from "@mainsail/utils";

import { AbstractListener, ListenerEvent, ListenerEventMapping } from "./abstract-listener.js";

@injectable()
export class Peers extends AbstractListener<Contracts.P2P.Peer, Models.Peer> {
	@inject(ApiDatabaseIdentifiers.PeerRepositoryFactory)
	private readonly peerRepositoryFactory!: ApiDatabaseContracts.PeerRepositoryFactory;

	protected getEventMapping(): ListenerEventMapping {
		return {
			[Events.PeerEvent.Added]: ListenerEvent.OnAdded,
			[Events.PeerEvent.Updated]: ListenerEvent.OnAdded, // upsert
			[Events.PeerEvent.Removed]: ListenerEvent.OnRemoved,
		};
	}

	protected getEventId(event: Contracts.P2P.Peer): string {
		const ip = event.ip;
		assert.string(ip);
		return ip;
	}

	protected mapEventToEntity(event: Contracts.P2P.Peer): Models.Peer {
		return {
			blockNumber: event.header.blockNumber,
			ip: event.ip,
			latency: event.latency,
			plugins: event.plugins as Record<string, any>,
			port: event.port,
			ports: event.ports as Record<string, any>,
			version: event.version,
		};
	}

	protected makeEntityRepository(
		dataSource: ApiDatabaseContracts.RepositoryDataSource,
	): ApiDatabaseContracts.Repository<Models.Peer> {
		return this.peerRepositoryFactory(dataSource);
	}
}
