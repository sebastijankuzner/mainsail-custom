import Joi from "joi";

const isSchema = (value: Joi.Schema | SchemaObject): value is Joi.Schema => Joi.isSchema(value);

// Criteria

export type SchemaObject = {
	[x: string]: Joi.Schema | SchemaObject;
};

export const createCriteriaSchema = (schemaObject: SchemaObject): Joi.ObjectSchema => {
	const schema = {};

	for (const [key, value] of Object.entries(schemaObject)) {
		schema[key] = Joi.array()
			.single()
			.items(isSchema(value) ? value : createCriteriaSchema(value));
	}

	return Joi.object(schema);
};

export const createRangeCriteriaSchema = (item: Joi.Schema): Joi.Schema =>
	Joi.alternatives(item, Joi.object({ from: item, to: item }).or("from", "to"));

// Sorting

export const createSortingSchema = (schemaObject: SchemaObject, wildcardPaths: string[] = []): Joi.ObjectSchema => {
	const getObjectPaths = (object: SchemaObject): string[] =>
		Object.entries(object).flatMap(([key, value]) =>
			isSchema(value) ? key : getObjectPaths(value).map((p) => `${key}.${p}`),
		);

	const exactPaths = getObjectPaths(schemaObject);

	const orderBy = Joi.custom((value, helpers) => {
		if (value === "") {
			return [];
		}

		const sortingCriteria: string[] = Array.isArray(value) ? value : [value];

		// properties may only contain letters (a-z) and can optionally be delimited by `.`
		// and not exceed 50 characters.
		const propertyRegex = /^(?=.{1,50}$)(?!.*\.\.)(?!.*\.$)(?!^\.)[.a-z]+$/i;

		for (const criteria of sortingCriteria) {
			for (const item of criteria.split(",")) {
				const pair = item.split(":");
				const property = String(pair[0]);
				const direction = pair.length === 1 ? "asc" : pair[1];

				if (!exactPaths.includes(property) && !wildcardPaths.find((wp) => property.startsWith(`${wp}.`))) {
					return helpers.message({
						custom: `Unknown orderBy property '${property}'`,
					});
				}

				if (!propertyRegex.test(property)) {
					return helpers.message({
						custom: `Invalid property name '${property}'`,
					});
				}

				if (direction !== "asc" && direction !== "desc") {
					return helpers.message({
						custom: `Unexpected orderBy direction '${direction}' for property '${property}'`,
					});
				}
			}
		}

		return value;
	});

	return Joi.object({ orderBy });
};

export const pagination = Joi.object({
	limit: Joi.number().integer().min(1).default(100).max(Joi.ref("$configuration.plugins.pagination.limit")),
	offset: Joi.number().integer().min(0),
	page: Joi.number().integer().positive().default(1),
});

export const equalCriteria = (value: any) => value;
export const numericCriteria = (value: any) =>
	Joi.alternatives().try(
		value,
		Joi.object().keys({ from: value }),
		Joi.object().keys({ to: value }),
		Joi.object().keys({ from: value, to: value }),
	);
export const containsCriteria = (value: any) => value;
export const orCriteria = (criteria: any) => Joi.alternatives().try(criteria, Joi.array().items(criteria));
export const orEqualCriteria = (value: any) => orCriteria(equalCriteria(value));
export const orNumericCriteria = (value: any) => orCriteria(numericCriteria(value));
export const orContainsCriteria = (value: any) => orCriteria(containsCriteria(value));
