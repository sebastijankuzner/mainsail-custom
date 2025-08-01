import { Peer } from "../../models/peer.js";
import { handleAndCriteria, handleComparisonCriteria, handleOrCriteria, optimizeExpression } from "../search.js";
import { OrPeerCriteria, PeerCriteria } from "../types/criteria.js";
import { Expression } from "../types/expressions.js";

export class PeerFilter {
	public static async getExpression(...criteria: OrPeerCriteria[]): Promise<Expression<Peer>> {
		const expressions = await Promise.all(
			criteria.map((c) => handleOrCriteria(c, (c) => this.handlePeerCriteria(c))),
		);

		return optimizeExpression({ expressions, op: "and" });
	}

	private static async handlePeerCriteria(criteria: PeerCriteria): Promise<Expression<Peer>> {
		return handleAndCriteria(criteria, async (key) => {
			switch (key) {
				case "ip": {
					return handleOrCriteria(criteria.ip, async (c) => ({ op: "equal", property: "ip", value: c }));
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
