import { Consensus } from "@mainsail/consensus/distribution/consensus.js";
import { Identifiers } from "@mainsail/contracts";
import { describe, Sandbox } from "@mainsail/test-framework";
import { sleep } from "@mainsail/utils";

import crypto from "../config/crypto.json";
import validators from "../config/validators.json";
import { assertBlockId, assertBockHeight, assertBockRound } from "./asserts.js";
import { Validator } from "./contracts.js";
import { P2PRegistry } from "./p2p.js";
import { bootMany, bootstrapMany, runMany, setup, stopMany } from "./setup.js";
import {
	getLastCommit,
	getValidators,
	makePrevote,
	makeProposal,
	prepareNodeValidators,
	snoozeForBlock,
} from "./utilities.js";

describe<{
	nodes: Sandbox[];
	validators: Validator[];
	p2p: P2PRegistry;
}>("Propose", ({ beforeEach, afterEach, it, assert, stub }) => {
	const totalNodes = 5;

	beforeEach(async (context) => {
		context.p2p = new P2PRegistry();

		context.nodes = [];
		for (let index = 0; index < totalNodes; index++) {
			context.nodes.push(
				await setup(index, context.p2p, crypto, prepareNodeValidators(validators, index, totalNodes)),
			);
		}

		await bootMany(context.nodes);
		await bootstrapMany(context.nodes);

		context.validators = await getValidators(context.nodes[0], validators);
	});

	afterEach(async ({ nodes }) => {
		await stopMany(nodes);
	});

	it("should confirm block, if < minority does not prevote", async ({ nodes, p2p }) => {
		const node0 = nodes[0];
		const stubPrevote = stub(node0.app.get<Consensus>(Identifiers.Consensus.Service), "prevote");

		stubPrevote.callsFake(async () => {
			stubPrevote.restore();
		});

		await runMany(nodes);
		await snoozeForBlock(nodes);

		await assertBockHeight(nodes, 1);
		await assertBockRound(nodes, 0);
		await assertBlockId(nodes);

		assert.equal(p2p.proposals.getMessages(1, 0).length, 1); // Assert number of proposals
		assert.equal(p2p.prevotes.getMessages(1, 0).length, totalNodes - 1); // Assert number of prevotes
		assert.equal(p2p.precommits.getMessages(1, 0).length, totalNodes); // Assert number of precommits

		// Next block
		await snoozeForBlock(nodes);

		await assertBockHeight(nodes, 2);
		await assertBockRound(nodes, 0);
		await assertBlockId(nodes);
	});

	it("should not confirm block, if > minority does not prevote", async ({ nodes, p2p }) => {
		const node0 = nodes[0];
		const stubPrevote0 = stub(node0.app.get<Consensus>(Identifiers.Consensus.Service), "prevote");
		stubPrevote0.callsFake(async () => {
			stubPrevote0.restore();
		});

		const node1 = nodes[1];
		const stubPrevote1 = stub(node1.app.get<Consensus>(Identifiers.Consensus.Service), "prevote");
		stubPrevote1.callsFake(async () => {
			stubPrevote1.restore();
		});

		await runMany(nodes);
		await sleep(500);

		assert.equal(p2p.precommits.getMessages(1, 0).length, 0);
	});

	it("should confirm block, if < minority prevote null", async ({ nodes, validators, p2p }) => {
		const node0 = nodes[0];
		const stubPrevote = stub(node0.app.get<Consensus>(Identifiers.Consensus.Service), "prevote");

		const prevote = await makePrevote(node0, validators[0], 1, 0);

		stubPrevote.callsFake(async () => {
			stubPrevote.restore();
			await p2p.broadcastPrevote(prevote);
		});

		await runMany(nodes);
		await snoozeForBlock(nodes);

		await assertBockHeight(nodes, 1);
		await assertBockRound(nodes, 0);
		await assertBlockId(nodes);

		assert.equal(p2p.proposals.getMessages(1, 0).length, 1); // Assert number of proposals
		assert.equal(p2p.prevotes.getMessages(1, 0).length, totalNodes); // Assert number of prevotes
		assert.equal(p2p.precommits.getMessages(1, 0).length, totalNodes); // Assert number of precommits

		// Assert all nodes prevote
		const commit = await getLastCommit(nodes[0]);
		assert.equal(
			p2p.prevotes.getMessages(1, 0).map((prevote) => prevote.blockId),
			[undefined, commit.block.data.id, commit.block.data.id, commit.block.data.id, commit.block.data.id],
		);

		// Next block
		await snoozeForBlock(nodes);

		await assertBockHeight(nodes, 2);
		await assertBockRound(nodes, 0);
		await assertBlockId(nodes);
	});

	it("should not confirm block, if > minority prevote null", async ({ nodes, validators, p2p }) => {
		const node0 = nodes[0];
		const stubPrevote0 = stub(node0.app.get<Consensus>(Identifiers.Consensus.Service), "prevote");
		const prevote0 = await makePrevote(node0, validators[0], 1, 0);

		stubPrevote0.callsFake(async () => {
			stubPrevote0.restore();
			await p2p.broadcastPrevote(prevote0);
		});

		const node1 = nodes[1];
		const stubPrevote1 = stub(node1.app.get<Consensus>(Identifiers.Consensus.Service), "prevote");
		const prevote1 = await makePrevote(node1, validators[1], 1, 0);

		stubPrevote1.callsFake(async () => {
			stubPrevote1.restore();
			await p2p.broadcastPrevote(prevote1);
		});

		await runMany(nodes);
		await snoozeForBlock(nodes);

		await assertBockHeight(nodes, 1);
		await assertBockRound(nodes, 1);
		await assertBlockId(nodes);

		assert.equal(p2p.proposals.getMessages(1, 0).length, 1); // Assert number of proposals
		assert.equal(p2p.prevotes.getMessages(1, 0).length, totalNodes); // Assert number of prevotes
		assert.equal(p2p.precommits.getMessages(1, 0).length, totalNodes); // Assert number of precommits

		// Assert all nodes prevote
		const blockId = p2p.prevotes.getMessages(1, 0)[3].blockId;
		assert.defined(blockId);
		assert.equal(
			p2p.prevotes.getMessages(1, 0).map((prevote) => prevote.blockId),
			[undefined, undefined, blockId, blockId, blockId],
		);

		// Next block
		await snoozeForBlock(nodes);

		await assertBockHeight(nodes, 2);
		await assertBockRound(nodes, 0);
		await assertBlockId(nodes);
	});

	it("should confirm block, if < minority prevote random block", async ({ nodes, validators, p2p }) => {
		const node0 = nodes[0];
		const stubPrevote = stub(node0.app.get<Consensus>(Identifiers.Consensus.Service), "prevote");

		const proposal = await makeProposal(node0, validators[0], 1, 0, Date.now());
		const prevote = await makePrevote(node0, validators[0], 1, 0, proposal.getData().block.data.id);

		stubPrevote.callsFake(async () => {
			stubPrevote.restore();
			await p2p.broadcastPrevote(prevote);
		});

		await runMany(nodes);
		await snoozeForBlock(nodes);

		await assertBockHeight(nodes, 1);
		await assertBockRound(nodes, 0);
		await assertBlockId(nodes);

		assert.equal(p2p.proposals.getMessages(1, 0).length, 1); // Assert number of proposals
		assert.equal(p2p.prevotes.getMessages(1, 0).length, totalNodes); // Assert number of prevotes
		assert.equal(p2p.precommits.getMessages(1, 0).length, totalNodes); // Assert number of precommits

		// Assert all nodes prevote
		const commit = await getLastCommit(nodes[0]);
		assert.equal(
			p2p.prevotes.getMessages(1, 0).map((prevote) => prevote.blockId),
			[
				proposal.getData().block.data.id,
				commit.block.data.id,
				commit.block.data.id,
				commit.block.data.id,
				commit.block.data.id,
			],
		);

		// Next block
		await snoozeForBlock(nodes);

		await assertBockHeight(nodes, 2);
		await assertBockRound(nodes, 0);
		await assertBlockId(nodes);
	});

	it("should not confirm block, if > minority prevote random block", async ({ nodes, validators, p2p }) => {
		const node0 = nodes[0];
		const node1 = nodes[1];

		const proposal = await makeProposal(node0, validators[0], 1, 0, Date.now());
		const prevote0 = await makePrevote(node0, validators[0], 1, 0, proposal.getData().block.data.id);
		const stubPrevote0 = stub(node0.app.get<Consensus>(Identifiers.Consensus.Service), "prevote");
		stubPrevote0.callsFake(async () => {
			stubPrevote0.restore();
			await p2p.broadcastPrevote(prevote0);
		});

		const prevote1 = await makePrevote(node1, validators[1], 1, 0, proposal.getData().block.data.id);
		const stubPrevote1 = stub(node1.app.get<Consensus>(Identifiers.Consensus.Service), "prevote");
		stubPrevote1.callsFake(async () => {
			stubPrevote1.restore();
			await p2p.broadcastPrevote(prevote1);
		});

		await runMany(nodes);
		await snoozeForBlock(nodes);

		await assertBockHeight(nodes, 1);
		await assertBockRound(nodes, 1);
		await assertBlockId(nodes);

		assert.equal(p2p.proposals.getMessages(1, 0).length, 1); // Assert number of proposals
		assert.equal(p2p.prevotes.getMessages(1, 0).length, totalNodes); // Assert number of prevotes
		assert.equal(p2p.precommits.getMessages(1, 0).length, totalNodes); // Assert number of precommits

		// Assert all nodes prevote
		const blockId = p2p.prevotes.getMessages(1, 0)[3].blockId;
		assert.defined(blockId);
		assert.equal(
			p2p.prevotes.getMessages(1, 0).map((prevote) => prevote.blockId),
			[proposal.getData().block.data.id, proposal.getData().block.data.id, blockId, blockId, blockId],
		);

		// Next block
		await snoozeForBlock(nodes);

		await assertBockHeight(nodes, 2);
		await assertBockRound(nodes, 0);
		await assertBlockId(nodes);
	});

	it("should confirm block, if < minority prevote multiple random blocks", async ({ nodes, validators, p2p }) => {
		const node0 = nodes[0];
		const stubPrevote = stub(node0.app.get<Consensus>(Identifiers.Consensus.Service), "prevote");

		const proposal0 = await makeProposal(node0, validators[0], 1, 0, Date.now());
		const proposal1 = await makeProposal(node0, validators[0], 1, 0, Date.now());
		const proposal2 = await makeProposal(node0, validators[0], 1, 0, Date.now());
		const proposal3 = await makeProposal(node0, validators[0], 1, 0, Date.now());
		const proposal4 = await makeProposal(node0, validators[0], 1, 0, Date.now());
		const prevote0 = await makePrevote(node0, validators[0], 1, 0, proposal0.getData().block.data.id);
		const prevote1 = await makePrevote(node0, validators[0], 1, 0, proposal1.getData().block.data.id);
		const prevote2 = await makePrevote(node0, validators[0], 1, 0, proposal2.getData().block.data.id);
		const prevote3 = await makePrevote(node0, validators[0], 1, 0, proposal3.getData().block.data.id);
		const prevote4 = await makePrevote(node0, validators[0], 1, 0, proposal4.getData().block.data.id);

		stubPrevote.callsFake(async () => {
			stubPrevote.restore();
			await p2p.broadcastPrevote(prevote0);
			await p2p.broadcastPrevote(prevote1);
			await p2p.broadcastPrevote(prevote2);
			await p2p.broadcastPrevote(prevote3);
			await p2p.broadcastPrevote(prevote4);
		});

		await runMany(nodes);
		await snoozeForBlock(nodes);

		await assertBockHeight(nodes, 1);
		await assertBockRound(nodes, 0);
		await assertBlockId(nodes);

		assert.equal(p2p.proposals.getMessages(1, 0).length, 1); // Assert number of proposals
		assert.equal(p2p.prevotes.getMessages(1, 0).length, totalNodes + 4); // Assert number of prevotes
		assert.equal(p2p.precommits.getMessages(1, 0).length, totalNodes); // Assert number of precommits

		// Assert all nodes prevote
		const commit = await getLastCommit(nodes[0]);
		assert.equal(
			p2p.prevotes.getMessages(1, 0).map((prevote) => prevote.blockId),
			[
				proposal0.getData().block.data.id,
				proposal1.getData().block.data.id,
				proposal2.getData().block.data.id,
				proposal3.getData().block.data.id,
				proposal4.getData().block.data.id,
				commit.block.data.id,
				commit.block.data.id,
				commit.block.data.id,
				commit.block.data.id,
			],
		);

		// Next block
		await snoozeForBlock(nodes);

		await assertBockHeight(nodes, 2);
		await assertBockRound(nodes, 0);
		await assertBlockId(nodes);
	});
});
