import { Consensus } from "@mainsail/consensus/distribution/consensus.js";
import { Contracts, Identifiers } from "@mainsail/contracts";
import { describe, Sandbox } from "@mainsail/test-framework";

import crypto from "../config/crypto.json";
import validators from "../config/validators.json";
import { assertBlockId, assertBockHeight, assertBockRound } from "./asserts.js";
import { Validator } from "./contracts.js";
import { P2PRegistry } from "./p2p.js";
import { bootMany, bootstrapMany, runMany, setup, stopMany } from "./setup.js";
import {
	getLastCommit,
	getValidators,
	makeProposal,
	prepareNodeValidators,
	snoozeForBlock,
	snoozeForRound,
} from "./utilities.js";
import { makeCustomProposal, makeTransactionBuilderContext } from "./custom-proposal.js";
import { EvmCalls } from "@mainsail/test-transaction-builders";

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

	it("#single propose - should forge 3 blocks with all validators signing", async ({ nodes, validators }) => {
		await runMany(nodes);

		await snoozeForBlock(nodes);

		await assertBockHeight(nodes, 1);
		await assertBockRound(nodes, 0);
		await assertBlockId(nodes);
		assert.equal((await getLastCommit(nodes[0])).block.data.generatorAddress, validators[0].publicKey);

		await snoozeForBlock(nodes);

		await assertBockHeight(nodes, 2);
		await assertBockRound(nodes, 0);
		await assertBlockId(nodes);
		assert.equal((await getLastCommit(nodes[0])).block.data.generatorAddress, validators[0].publicKey);

		await snoozeForBlock(nodes);

		await assertBockHeight(nodes, 3);
		await assertBockRound(nodes, 0);
		await assertBlockId(nodes);
		assert.equal((await getLastCommit(nodes[0])).block.data.generatorAddress, validators[0].publicKey);
	});

	it("#missing propose - should not accept block", async ({ nodes }) => {
		const node0 = nodes[0];
		const stubPropose = stub(node0.app.get<Consensus>(Identifiers.Consensus.Service), "propose");

		stubPropose.callsFake(async () => {
			stubPropose.restore();
		});

		await runMany(nodes);

		await snoozeForBlock(nodes);

		await assertBockHeight(nodes, 1);
		await assertBockRound(nodes, 1);
		await assertBlockId(nodes);

		// Next block
		await snoozeForBlock(nodes, 2);
		await assertBockHeight(nodes, 2);
		await assertBockRound(nodes, 0);
	});

	it("#missing propose - should not accept block for 3 rounds", async ({ nodes }) => {
		const rounds = 3;
		const node0 = nodes[0];
		const stubPropose = stub(node0.app.get<Consensus>(Identifiers.Consensus.Service), "propose");

		stubPropose.callsFake(async () => {});

		await runMany(nodes);

		await snoozeForRound(nodes, rounds);
		stubPropose.restore();

		await snoozeForBlock(nodes);

		await assertBockHeight(nodes, 1);
		await assertBockRound(nodes, rounds + 1); // +1 for accepted block
		await assertBlockId(nodes);

		// Next block
		await snoozeForBlock(nodes, 2);
		await assertBockHeight(nodes, 2);
		await assertBockRound(nodes, 0);
	});

	it("#invalid proposer - should not accept block", async ({ nodes, validators, p2p }) => {
		const node0 = nodes[0];
		const stubPropose = stub(node0.app.get<Consensus>(Identifiers.Consensus.Service), "propose");

		stubPropose.callsFake(async () => {
			stubPropose.restore();
		});

		await runMany(nodes);

		const proposal0 = await makeProposal(nodes[1], validators[1], 1, 0, Date.now());
		await p2p.broadcastProposal(proposal0);

		await snoozeForBlock(nodes);

		await assertBockHeight(nodes, 1);
		await assertBockRound(nodes, 1);
		await assertBlockId(nodes);

		assert.equal(p2p.proposals.getMessages(1, 0).length, 1); // Assert number of proposals
		assert.equal(p2p.prevotes.getMessages(1, 0).length, totalNodes); // Assert number of prevotes
		assert.equal(p2p.precommits.getMessages(1, 0).length, totalNodes); // Assert number of precommits

		// Assert all nodes prevote
		assert.equal(
			p2p.prevotes.getMessages(1, 0).map((prevote) => prevote.blockId),
			Array.from({ length: totalNodes }).fill(undefined),
		);

		// Assert all nodes precommit (null)
		assert.equal(
			p2p.precommits.getMessages(1, 0).map((precommit) => precommit.blockId),
			Array.from({ length: totalNodes }).fill(undefined),
		);

		// Next block
		await snoozeForBlock(nodes, 2);
		await assertBockHeight(nodes, 2);
		await assertBockRound(nodes, 0);
	});

	it("#double propose - one by one - should take the first proposal", async ({ nodes, validators, p2p }) => {
		const node0 = nodes[0];
		const stubPropose = stub(nodes[0].app.get<Consensus>(Identifiers.Consensus.Service), "propose");
		stubPropose.callsFake(async () => {
			stubPropose.restore();
		});

		await runMany(nodes);

		const proposal0 = await makeProposal(node0, validators[0], 1, 0, Date.now());
		const proposal1 = await makeProposal(node0, validators[0], 1, 0, Date.now());

		await p2p.broadcastProposal(proposal0);
		await p2p.broadcastProposal(proposal1);

		await snoozeForBlock(nodes);

		await assertBockHeight(nodes, 1);
		await assertBockRound(nodes, 0);
		await assertBlockId(nodes, proposal0.getData().block.data.id);

		assert.equal(p2p.proposals.getMessages(1, 0).length, 2); // Assert number of proposals
		assert.equal(p2p.prevotes.getMessages(1, 0).length, totalNodes); // Assert number of prevotes
		assert.equal(p2p.precommits.getMessages(1, 0).length, totalNodes); // Assert number of precommits

		// Assert all nodes prevote
		assert.equal(
			p2p.prevotes.getMessages(1, 0).map((prevote) => prevote.blockId),
			[
				proposal0.getData().block.data.id,
				proposal0.getData().block.data.id,
				proposal0.getData().block.data.id,
				proposal0.getData().block.data.id,
				proposal0.getData().block.data.id,
			],
		);

		// Assert all nodes precommit
		assert.equal(
			p2p.precommits.getMessages(1, 0).map((precommit) => precommit.blockId),
			Array.from({ length: totalNodes }).fill(proposal0.getData().block.data.id),
		);

		// Next block
		await snoozeForBlock(nodes, 2);
		await assertBockHeight(nodes, 2);
		await assertBockRound(nodes, 0);
	});

	it("#double propose - 50 : 50 split - should not accept block", async ({ nodes, validators, p2p }) => {
		const node0 = nodes[0];
		const stubPropose = stub(nodes[0].app.get<Consensus>(Identifiers.Consensus.Service), "propose");
		stubPropose.callsFake(async () => {
			stubPropose.restore();
		});

		await runMany(nodes);

		const proposal0 = await makeProposal(node0, validators[0], 1, 0, Date.now());
		const proposal1 = await makeProposal(node0, validators[0], 1, 0, Date.now());

		await p2p.broadcastProposal(proposal0, [0, 1, 2]);
		await p2p.broadcastProposal(proposal1, [3, 4]);

		await snoozeForBlock(nodes);

		await assertBockHeight(nodes, 1);
		await assertBockRound(nodes, 1);
		await assertBlockId(nodes);

		assert.equal(p2p.proposals.getMessages(1, 0).length, 2); // Assert number of proposals
		assert.equal(p2p.prevotes.getMessages(1, 0).length, totalNodes); // Assert number of prevotes
		assert.equal(p2p.precommits.getMessages(1, 0).length, totalNodes); // Assert number of precommits

		// Assert all nodes prevote
		assert.equal(
			p2p.prevotes.getMessages(1, 0).map((prevote) => prevote.blockId),
			[
				proposal0.getData().block.data.id,
				proposal0.getData().block.data.id,
				proposal0.getData().block.data.id,
				proposal1.getData().block.data.id,
				proposal1.getData().block.data.id,
			],
		);

		// Assert all nodes precommit (null)
		assert.equal(
			p2p.precommits.getMessages(1, 0).map((precommit) => precommit.blockId),
			Array.from({ length: totalNodes }).fill(undefined),
		);

		// Next block
		await snoozeForBlock(nodes, 2);
		await assertBockHeight(nodes, 2);
		await assertBockRound(nodes, 0);
	});

	it("#double propose - 50 : 50 split - should not accept block for 3 rounds", async ({ nodes, validators, p2p }) => {
		const rounds = 3;

		const node0 = nodes[0];
		const stubPropose = stub(nodes[0].app.get<Consensus>(Identifiers.Consensus.Service), "propose");
		stubPropose.callsFake(async () => {});

		await runMany(nodes);

		for (let round = 0; round < rounds; round++) {
			const proposal0 = await makeProposal(node0, validators[0], 1, round, Date.now());
			const proposal1 = await makeProposal(node0, validators[0], 1, round, Date.now());

			await p2p.broadcastProposal(proposal0, [0, 1, 2]);
			await p2p.broadcastProposal(proposal1, [3, 4]);

			await snoozeForRound(nodes, round);

			assert.equal(p2p.proposals.getMessages(1, round).length, 2); // Assert number of proposals
			assert.equal(p2p.prevotes.getMessages(1, round).length, totalNodes); // Assert number of prevotes
			assert.equal(p2p.precommits.getMessages(1, round).length, totalNodes); // Assert number of precommits

			// Assert all nodes prevote
			assert.equal(
				p2p.prevotes.getMessages(1, round).map((prevote) => prevote.blockId),
				[
					proposal0.getData().block.data.id,
					proposal0.getData().block.data.id,
					proposal0.getData().block.data.id,
					proposal1.getData().block.data.id,
					proposal1.getData().block.data.id,
				],
			);

			// Assert all nodes precommit (null)
			assert.equal(
				p2p.precommits.getMessages(1, round).map((precommit) => precommit.blockId),
				Array.from({ length: totalNodes }).fill(undefined),
			);
		}

		stubPropose.restore();
		await snoozeForBlock(nodes);

		await assertBockHeight(nodes, 1);
		await assertBockRound(nodes, rounds + 1); // +1 for accepted block
		await assertBlockId(nodes);

		// Next block
		await snoozeForBlock(nodes, 2);
		await assertBockHeight(nodes, 2);
		await assertBockRound(nodes, 0);
	});

	it("#double propose - majority : minority split - should  accept block broadcasted to majority", async ({
		nodes,
		validators,
		p2p,
	}) => {
		const node0 = nodes[0];
		const stubPropose = stub(nodes[0].app.get<Consensus>(Identifiers.Consensus.Service), "propose");
		stubPropose.callsFake(async () => {
			stubPropose.restore();
		});

		await runMany(nodes);

		const proposal0 = await makeProposal(node0, validators[0], 1, 0, Date.now());
		const proposal1 = await makeProposal(node0, validators[0], 1, 0, Date.now());

		await p2p.broadcastProposal(proposal0, [0, 1, 2, 3]);
		await p2p.broadcastProposal(proposal1, [4]);

		const nodesSubset = nodes.slice(0, 4);
		await snoozeForBlock(nodesSubset);

		await assertBockHeight(nodesSubset, 1);
		await assertBockRound(nodesSubset, 0);
		await assertBlockId(nodesSubset);

		assert.equal(p2p.proposals.getMessages(1, 0).length, 2); // Assert number of proposals
		assert.equal(p2p.prevotes.getMessages(1, 0).length, totalNodes); // Assert number of prevotes
		assert.equal(p2p.precommits.getMessages(1, 0).length, totalNodes - 1); // Assert number of precommits

		// Assert all nodes prevote
		assert.equal(
			p2p.prevotes.getMessages(1, 0).map((prevote) => prevote.blockId),
			[
				proposal0.getData().block.data.id,
				proposal0.getData().block.data.id,
				proposal0.getData().block.data.id,
				proposal0.getData().block.data.id,
				proposal1.getData().block.data.id,
			],
		);

		// // Assert all nodes precommit (null)
		assert.equal(
			p2p.precommits.getMessages(1, 0).map((precommit) => precommit.blockId),
			Array.from({ length: totalNodes - 1 }).fill(proposal0.getData().block.data.id),
		);

		// Download blocks
		await p2p.postCommit(nodes[4].app, await getLastCommit(nodes[0]));
		await snoozeForBlock([nodes[4]], 1);

		// Next block
		await snoozeForBlock(nodes, 2);
		await assertBockHeight(nodes, 2);
		await assertBockRound(nodes, 0);
	});

	it("#multi propose - propose per node - should not accept block", async ({ nodes, validators, p2p }) => {
		const node0 = nodes[0];
		const stubPropose = stub(nodes[0].app.get<Consensus>(Identifiers.Consensus.Service), "propose");
		stubPropose.callsFake(async () => {
			stubPropose.restore();
		});

		await runMany(nodes);

		const proposal0 = await makeProposal(node0, validators[0], 1, 0, Date.now());
		const proposal1 = await makeProposal(node0, validators[0], 1, 0, Date.now());
		const proposal2 = await makeProposal(node0, validators[0], 1, 0, Date.now());
		const proposal3 = await makeProposal(node0, validators[0], 1, 0, Date.now());
		const proposal4 = await makeProposal(node0, validators[0], 1, 0, Date.now());

		await p2p.broadcastProposal(proposal0, [0]);
		await p2p.broadcastProposal(proposal1, [1]);
		await p2p.broadcastProposal(proposal2, [2]);
		await p2p.broadcastProposal(proposal3, [3]);
		await p2p.broadcastProposal(proposal4, [4]);

		await snoozeForBlock(nodes);

		await assertBockHeight(nodes, 1);
		await assertBockRound(nodes, 1);
		await assertBlockId(nodes);

		assert.equal(p2p.proposals.getMessages(1, 0).length, 5); // Assert number of proposals
		assert.equal(p2p.prevotes.getMessages(1, 0).length, totalNodes); // Assert number of prevotes
		assert.equal(p2p.precommits.getMessages(1, 0).length, totalNodes); // Assert number of precommits

		// Assert all nodes prevote
		assert.equal(
			p2p.prevotes.getMessages(1, 0).map((prevote) => prevote.blockId),
			[
				proposal0.getData().block.data.id,
				proposal1.getData().block.data.id,
				proposal2.getData().block.data.id,
				proposal3.getData().block.data.id,
				proposal4.getData().block.data.id,
			],
		);

		// Assert all nodes precommit (null)
		assert.equal(
			p2p.precommits.getMessages(1, 0).map((precommit) => precommit.blockId),
			Array.from({ length: totalNodes }).fill(undefined),
		);

		// // Next block
		await snoozeForBlock(nodes, 2);
		await assertBockHeight(nodes, 2);
		await assertBockRound(nodes, 0);
	});

	it("should propose block with evm calls", async ({ nodes, validators }) => {
		const node0 = nodes[0];

		const stubPropose = stub(node0.app.get<Consensus>(Identifiers.Consensus.Service), "propose");
		stubPropose.callsFake(async () => {
			const context = makeTransactionBuilderContext(node0, nodes, validators);

			const transactions: Contracts.Crypto.Transaction[] = [];
			for (let i = 0; i < 150; i++) {
				transactions.push(await EvmCalls.makeEvmCall(context, { nonceOffset: i }));
			}

			const proposal = await makeCustomProposal({ node: node0, validators }, transactions);

			void node0.app
				.get<Contracts.Consensus.ProposalProcessor>(Identifiers.Consensus.Processor.Proposal)
				.process(proposal);

			stubPropose.restore();
		});

		await runMany(nodes);

		// // Next block
		await snoozeForBlock(nodes, 2);
		await assertBockHeight(nodes, 2);
		await assertBockRound(nodes, 0);
	});
});
