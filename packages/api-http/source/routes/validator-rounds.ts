import Hapi from "@hapi/hapi";
import Joi from "joi";

import { ValidatorRoundsController } from "../controllers/validator-rounds";
import { pagination } from "../schemas";

export const register = (server: Hapi.Server): void => {
	const controller = server.app.app.resolve(ValidatorRoundsController);
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
				query: Joi.object({}).concat(pagination),
			},
		},
		path: "/validator-rounds",
	});
};