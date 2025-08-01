import { ApiNode } from "../../models/index.js";
import { handleAndCriteria, handleComparisonCriteria, handleOrCriteria, optimizeExpression } from "../search.js";
import { ApiNodeCriteria, OrApiNodeCriteria } from "../types/criteria.js";
import { Expression } from "../types/expressions.js";

export class ApiNodeFilter {
	public static async getExpression(...criteria: OrApiNodeCriteria[]): Promise<Expression<ApiNode>> {
		const expressions = await Promise.all(
			criteria.map((c) => handleOrCriteria(c, (c) => this.handleApiNodeCriteria(c))),
		);

		return optimizeExpression({ expressions, op: "and" });
	}

	private static async handleApiNodeCriteria(criteria: ApiNodeCriteria): Promise<Expression<ApiNode>> {
		return handleAndCriteria(criteria, async (key) => {
			switch (key) {
				case "url": {
					return handleOrCriteria(criteria.url, async (c) => ({ op: "equal", property: "url", value: c }));
				}
				case "version": {
					return handleOrCriteria(criteria.version, async (c) =>
						// @ts-ignore
						handleComparisonCriteria("version", c),
					);
				}
				default: {
					return { op: "true" };
				}
			}
		});
	}
}
