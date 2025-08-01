import { Receipt } from "../../models/index.js";
import { handleAndCriteria, handleOrCriteria, optimizeExpression } from "../search.js";
import { OrReceiptCriteria, ReceiptCriteria } from "../types/criteria.js";
import { Expression } from "../types/expressions.js";

export class ReceiptFilter {
	public static async getExpression(...criteria: OrReceiptCriteria[]): Promise<Expression<Receipt>> {
		const expressions = await Promise.all(
			criteria.map((c) => handleOrCriteria(c, (c) => this.handleReceiptCriteria(c))),
		);

		return optimizeExpression({ expressions, op: "and" });
	}

	private static async handleReceiptCriteria(criteria: ReceiptCriteria): Promise<Expression<Receipt>> {
		return handleAndCriteria(criteria, async (key) => {
			switch (key) {
				case "transactionHash": {
					return handleOrCriteria(criteria.transactionHash, async (c) => ({
						op: "equal",
						property: "transactionHash",
						value: c,
					}));
				}
				default: {
					return { op: "true" };
				}
			}
		});
	}
}
