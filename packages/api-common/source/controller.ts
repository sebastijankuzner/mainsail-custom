import Boom from "@hapi/boom";
import Hapi from "@hapi/hapi";
import { inject, injectable } from "@mainsail/container";
import { Contracts, Identifiers } from "@mainsail/contracts";

import { SchemaObject } from "./schemas.js";

@injectable()
export abstract class AbstractController {
	@inject(Identifiers.Application.Instance)
	protected readonly app!: Contracts.Kernel.Application;

	protected getQueryPagination(query: Hapi.RequestQuery): Contracts.Api.Pagination {
		return {
			limit: query.limit,
			offset: (query.page - 1) * query.limit || 0,
		};
	}

	protected getQueryCriteria(query: Hapi.RequestQuery, schemaObject: SchemaObject): unknown {
		const schemaObjectKeys = Object.keys(schemaObject);
		const criteria = {};
		for (const [key, value] of Object.entries(query)) {
			if (schemaObjectKeys.includes(key)) {
				criteria[key] = value;
			}
		}
		return criteria;
	}

	protected getListingPage(request: Hapi.Request): Contracts.Api.Pagination {
		const pagination = {
			limit: request.query.limit || 100,
			offset: (request.query.page - 1) * request.query.limit || 0,
		};

		if (request.query.offset) {
			pagination.offset = request.query.offset;
		}

		return pagination;
	}

	protected getListingOrder(request: Hapi.Request): Contracts.Api.Sorting {
		if (!request.query.orderBy) {
			return [];
		}

		const orderBy = Array.isArray(request.query.orderBy) ? request.query.orderBy : request.query.orderBy.split(",");

		return orderBy.map((s: string) => ({
			direction: s.split(":")[1] === "desc" ? "desc" : "asc",
			property: s.split(":")[0],
		}));
	}

	protected async respondWithResource(data, transformer): Promise<any> {
		if (!data) {
			return Boom.notFound();
		}

		return { data: await this.toResource(data, transformer) };
	}

	protected async respondWithCollection(data, transformer): Promise<object> {
		return {
			data: await this.toCollection(data, transformer),
		};
	}

	protected async toResource<T, R extends Contracts.Api.Resource>(
		item: T,
		transformer: new () => R,
	): Promise<ReturnType<R["transform"]>> {
		const resource = this.app.resolve<R>(transformer);
		return resource.transform(item) as ReturnType<R["transform"]>;
	}

	protected async toCollection<T, R extends Contracts.Api.Resource>(
		items: T[],
		transformer: new () => R,
	): Promise<ReturnType<R["transform"]>[]> {
		return Promise.all(items.map(async (item) => await this.toResource(item, transformer)));
	}

	protected async toPagination<T, R extends Contracts.Api.Resource>(
		resultsPage: Contracts.Api.ResultsPage<T>,
		transformer: new () => R,
	): Promise<Contracts.Api.ResultsPage<ReturnType<R["transform"]>>> {
		const items = await this.toCollection(resultsPage.results, transformer);

		return { ...resultsPage, results: items };
	}

	protected getEmptyPage(): Contracts.Api.ResultsPage<any> {
		return { meta: { totalCountIsEstimate: false }, results: [], totalCount: 0 };
	}
}
