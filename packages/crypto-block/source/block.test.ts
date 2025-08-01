import { Contracts } from "@mainsail/contracts";
import clone from "lodash.clone";

import crypto from "../../core/bin/config/devnet/core/crypto.json";
import { describe, Factories } from "../../test-framework/source";
import { blockData } from "../test/fixtures/block";
import { sealBlock } from "./block";

describe<{}>("Block", ({ it, assert }) => {
	it("#sealBlock - should seal block", async () => {
		const transactionFactory = await Factories.factory("Transfer", crypto);

		const transaction1 = await transactionFactory.withStates("sign").make<Contracts.Crypto.Transaction>();
		const transaction2 = await transactionFactory
			.withOptions({ nonce: 1 })
			.withStates("sign")
			.make<Contracts.Crypto.Transaction>();

		const indexedTransaction1 = clone(transaction1);
		indexedTransaction1.data.transactionIndex = 1;
		const indexedTransaction2 = clone(transaction2);
		indexedTransaction2.data.transactionIndex = 1;

		const block = sealBlock({
			data: blockData,
			serialized: "serialized_content",
			transactions: [transaction1, transaction2],
		});

		assert.true(Object.isSealed(block));
		assert.equal(block.data, blockData);
		assert.equal(block.header, blockData);
		assert.equal(block.serialized, "serialized_content");
		assert.equal(block.transactions, [indexedTransaction1, indexedTransaction2]);
	});
});
