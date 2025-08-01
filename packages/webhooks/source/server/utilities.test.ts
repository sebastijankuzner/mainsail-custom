import { notFound } from "@hapi/boom";
import { Events } from "@mainsail/contracts";

import { describe } from "../../../test-framework/source";
import { Webhook } from "../interfaces";
import { respondWithResource } from "./utilities";

describe("Utils", ({ it, assert }) => {
	const data: Webhook = {
		conditions: [
			{
				condition: "eq",
				key: "generatorAddress",
				value: "test-generator",
			},
			{
				condition: "gte",
				key: "fee",
				value: "123",
			},
		],
		enabled: true,
		event: Events.BlockEvent.Forged,
		id: "dummy_id",
		target: "https://httpbin.org/post",
		token: "ark",
	};

	it("respondWithResource should return transformed resource", () => {
		assert.equal(respondWithResource(data), { data: data });
	});

	it("respondWithResource should return not found", () => {
		assert.equal(respondWithResource(), notFound());
	});
});
