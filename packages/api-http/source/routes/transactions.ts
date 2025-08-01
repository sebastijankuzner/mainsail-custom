import Hapi from "@hapi/hapi";
import { Schemas } from "@mainsail/api-common";
import { Contracts } from "@mainsail/contracts";
import Joi from "joi";

import { TransactionsController } from "../controllers/transactions.js";
import { transactionSortingSchema } from "../schemas/index.js";

export const register = (server: Contracts.Api.ApiServer): void => {
	const controller = server.app.app.resolve(TransactionsController);
	server.bind(controller);

	server.route({
		handler: (request: Hapi.Request) => controller.index(request),
		method: "GET",
		options: {
			plugins: {
				pagination: {
					enabled: true,
				},
			},
			validate: {
				query: Joi.object({
					...server.app.schemas.transactionCriteriaSchemas,
					fullReceipt: Joi.bool().default(false),
					orderBy: server.app.schemas.transactionsOrderBy,
				})
					.concat(transactionSortingSchema)
					.concat(Schemas.pagination),
			},
		},
		path: "/transactions",
	});

	server.route({
		handler: (request: Hapi.Request) => controller.show(request),
		method: "GET",
		options: {
			validate: {
				params: Joi.object({
					hash: Joi.string().hex().length(64),
				}),
				query: Joi.object({
					fullReceipt: Joi.bool().default(false),
				}),
			},
		},
		path: "/transactions/{hash}",
	});

	server.route({
		handler: (request: Hapi.Request) => controller.schemas(request),
		method: "GET",
		path: "/transactions/schemas",
	});
};
