import { Contracts, Identifiers, Utils } from "@mainsail/contracts";
import clone from "lodash.clonedeep";

import { describe, Sandbox } from "../../test-framework/source";
import {
	blockData,
	blockDataJson,
	blockDataWithTransactions,
	blockDataWithTransactionsJson,
	serialized,
	serializedWithTransactions,
} from "../test/fixtures/block";
import { assertBlockData, assertTransactionData } from "../test/helpers/asserts";
import { prepareSandbox } from "../test/helpers/prepare-sandbox";
import { BlockFactory } from "./factory";
import { schemas } from "./schemas";
import { Serializer } from "./serializer";

describe<{
	expectBlock: ({ data }: { data: Contracts.Crypto.BlockData }) => void;
	sandbox: Sandbox;
	factory: BlockFactory;
	serializer: Serializer;
}>("Factory", ({ it, assert, beforeEach }) => {
	const blockDataOriginal = clone(blockData);
	// Recalculated id
	const blockDataWithTransactionsOriginal = clone(blockDataWithTransactions);
	let blockDataClone: Utils.Mutable<Contracts.Crypto.BlockData>;
	let blockDataWithTransactionsClone: Utils.Mutable<Contracts.Crypto.BlockData>;

	beforeEach(async (context) => {
		blockDataClone = clone(blockDataOriginal);
		blockDataWithTransactionsClone = clone(blockDataWithTransactionsOriginal);

		await prepareSandbox(context);

		for (const schema of Object.values(schemas)) {
			context.sandbox.app.get<Contracts.Crypto.Validator>(Identifiers.Cryptography.Validator).addSchema(schema);
		}

		context.factory = context.sandbox.app.resolve(BlockFactory);
		context.serializer = context.sandbox.app.resolve(Serializer);
	});

	it("#make - should make a block", async ({ factory, sandbox }) => {
		const block = await factory.make(blockData, []);

		assertBlockData(assert, block.data, blockData);
		assertBlockData(assert, block.header, blockData);
		assert.equal(block.transactions, []);
		assert.equal(block.serialized, serialized);
	});

	it("#make - should make a block with transactions", async ({ factory }) => {
		const block = await factory.make(blockDataWithTransactionsOriginal, [
			// @ts-ignore
			{ data: blockDataWithTransactionsOriginal.transactions[0] },
			// @ts-ignore
			{ data: blockDataWithTransactionsOriginal.transactions[1] },
		]);

		assertBlockData(assert, block.data, blockDataWithTransactionsOriginal);
		assertBlockData(assert, block.header, blockDataWithTransactionsOriginal);
		assert.length(block.transactions, blockDataWithTransactionsOriginal.transactions.length);
		assert.equal(block.serialized, serializedWithTransactions);

		for (let index = 0; index < blockDataWithTransactionsOriginal.transactions.length; index++) {
			assertTransactionData(
				assert,
				block.transactions[index].data,
				blockDataWithTransactionsOriginal.transactions[index],
			);
		}
	});

	it("#fromHex - should create a block instance from hex", async ({ factory }) => {
		const block = await factory.fromHex(serialized);

		assertBlockData(assert, block.data, blockDataClone);
		assertBlockData(assert, block.header, blockDataClone);
		assert.equal(block.transactions, []);
		assert.equal(block.serialized, serialized);
	});

	it("#fromHex - should create a block instance with transactions from hex", async ({ factory }) => {
		const block = await factory.fromHex(serializedWithTransactions);

		assertBlockData(assert, block.data, blockDataWithTransactionsClone);
		assertBlockData(assert, block.header, blockDataWithTransactionsClone);
		assert.equal(block.serialized, serializedWithTransactions);

		assert.length(block.transactions, blockDataWithTransactionsClone.transactions.length);
	});

	it("#fromBytes - should create a block instance from a buffer", async ({ factory }) => {
		const block = await factory.fromBytes(Buffer.from(serialized, "hex"));

		assertBlockData(assert, block.data, blockDataClone);
		assertBlockData(assert, block.header, blockDataClone);
		assert.equal(block.transactions, []);
		assert.equal(block.serialized, serialized);
	});

	it("#fromBytes - should create a block with transactions instance from a buffer", async ({ factory }) => {
		const block = await factory.fromBytes(Buffer.from(serializedWithTransactions, "hex"));

		assertBlockData(assert, block.data, blockDataWithTransactionsClone);
		assertBlockData(assert, block.header, blockDataWithTransactionsClone);
		assert.equal(block.serialized, serializedWithTransactions);

		assert.length(block.transactions, blockDataWithTransactionsClone.transactions.length);
	});

	it("#fromData - should create a block instance from an object", async (context) => {
		const block = await context.factory.fromData(blockData);

		assertBlockData(assert, block.data, blockData);
		assertBlockData(assert, block.header, blockData);
		assert.equal(block.transactions, []);
		assert.string(block.serialized);
	});

	it("#fromData - should create a block with transactions instance from an object", async (context) => {
		const block = await context.factory.fromData(blockDataWithTransactionsOriginal);

		assertBlockData(assert, block.data, blockDataWithTransactionsOriginal);
		assertBlockData(assert, block.header, blockDataWithTransactionsOriginal);
		assert.string(block.serialized);

		for (let index = 0; index < blockDataWithTransactionsOriginal.transactions.length; index++) {
			assertTransactionData(
				assert,
				block.transactions[index].data,
				blockDataWithTransactionsOriginal.transactions[index],
			);
		}
	});

	it("#fromData - should throw on invalid input data - block property has an unexpected value", async ({
		factory,
	}) => {
		const b2 = Object.assign({}, blockData, { fee: "abcd" });
		await assert.rejects(
			() => factory.fromData(b2),
			'Invalid data at /fee: must pass "bignumber" keyword validation: undefined',
		);
	});

	it("#fromData - should throw on invalid input data - required block property is missing", async ({ factory }) => {
		const partialBlock = {
			...blockDataClone,
			proposer: undefined,
		} as unknown as Contracts.Crypto.BlockData;

		await assert.rejects(
			() => factory.fromData(partialBlock),
			" Invalid data: must have required property 'proposer': undefined",
		);
	});

	it("#fromData - should throw on invalid transaction data", async ({ factory }) => {
		// @ts-ignore
		delete blockDataWithTransactionsClone.transactions[0].hash;

		await assert.rejects(
			() => factory.fromData(blockDataWithTransactionsClone),
			"Invalid data at /transactions/0: must have required property 'hash': undefined",
		);
	});

	it("#fromJson - should create a block instance from JSON", async ({ factory }) => {
		const block = await factory.fromJson(blockDataJson);

		// Recalculated id
		blockDataClone.hash = blockDataJson.hash;

		assertBlockData(assert, block.data, blockDataClone);
		assertBlockData(assert, block.header, blockDataClone);
		assert.equal(block.transactions, []);
		assert.string(block.serialized);
	});

	it("#fromJson - should create a block instance with transactions from JSON", async ({ factory }) => {
		const block = await factory.fromJson(blockDataWithTransactionsJson);

		// Recalculated id
		blockDataWithTransactionsClone.hash = blockDataWithTransactionsJson.hash;

		assertBlockData(assert, block.data, blockDataWithTransactionsClone);
		assertBlockData(assert, block.header, blockDataWithTransactionsClone);
		assert.string(block.serialized);
		assert.length(block.transactions, blockDataWithTransactionsClone.transactions.length);

		for (let index = 0; index < blockDataWithTransactionsClone.transactions.length; index++) {
			// Recalculated id
			blockDataWithTransactionsClone.transactions[index].id = block.transactions[index].data.id;

			assertTransactionData(
				assert,
				block.transactions[index].data,
				blockDataWithTransactionsClone.transactions[index],
			);
		}
	});
});
