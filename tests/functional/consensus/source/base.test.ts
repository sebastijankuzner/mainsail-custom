import { describe, Sandbox } from "@mainsail/test-framework";

import crypto from "../config/crypto.json";
import validators from "../config/validators.json";
import { assertBlockHash, assertBockNumber } from "./asserts.js";
import { P2PRegistry } from "./p2p.js";
import { bootMany, bootstrapMany, runMany, setup, stopMany } from "./setup.js";
import { getLastCommit, prepareNodeValidators, snoozeForBlock } from "./utilities.js";

describe<{
	nodes: Sandbox[];
}>("Base", ({ beforeEach, afterEach, it }) => {
	beforeEach(async (context) => {
		const p2pRegistry = new P2PRegistry();

		const totalNodes = 2;

		context.nodes = [];

		for (let index = 0; index < totalNodes; index++) {
			context.nodes.push(
				await setup(index, p2pRegistry, crypto, prepareNodeValidators(validators, index, totalNodes)),
			);
		}

		await bootMany(context.nodes);
		await bootstrapMany(context.nodes);
		await runMany(context.nodes);
	});

	afterEach(async ({ nodes }) => {
		await stopMany(nodes);
	});

	it("should create new block", async ({ nodes }) => {
		await snoozeForBlock(nodes);

		const commit = await getLastCommit(nodes[0]);

		await assertBockNumber(nodes, 1);
		await assertBlockHash(nodes, commit.block.data.hash);
	});

	it("should create 3 new block", async ({ nodes }) => {
		await snoozeForBlock(nodes, 3);

		const commit = await getLastCommit(nodes[0]);

		await assertBockNumber(nodes, 3);
		await assertBlockHash(nodes, commit.block.data.hash);
	});
});
