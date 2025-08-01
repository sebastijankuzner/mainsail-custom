import { Contracts, Exceptions } from "@mainsail/contracts";
import { BigNumber } from "@mainsail/utils";

import { describe } from "../../test-framework/source";

describe<{
	transaction: any;
}>("Errors", ({ it, assert, beforeAll }) => {
	beforeAll((context) => {
		context.transaction = {
			data: {
				amount: BigNumber.make(100),
				gasPrice: 900 * 1e9,
				hash: "dummy-tx-id",
				network: 30,
				nonce: BigNumber.make(1),
				from: "dummy-sender-key",
				type: Contracts.Crypto.TransactionType.Transfer,
			},
			hash: "dummy-tx-id",
			key: "some-key",
			serialized: Buffer.from("dummy"),
			type: Contracts.Crypto.TransactionType.Transfer,
		};
	});

	it("TransactionAlreadyInPoolError", (context) => {
		const error = new Exceptions.TransactionAlreadyInPoolError(context.transaction);

		assert.instance(error, Exceptions.PoolError);
		assert.equal(error.type, "ERR_DUPLICATE");
		assert.equal(error.message, `tx ${context.transaction.hash} is already in pool`);
	});

	it("TransactionExceedsMaximumByteSizeError", (context) => {
		const error = new Exceptions.TransactionExceedsMaximumByteSizeError(context.transaction, 1024);

		assert.instance(error, Exceptions.PoolError);
		assert.equal(error.type, "ERR_TOO_LARGE");
		assert.equal(error.message, `tx ${context.transaction.hash} exceeds size limit of 1024 byte(s)`);
	});

	it("TransactionFeeTooLowError", (context) => {
		const error = new Exceptions.TransactionFeeTooLowError(context.transaction);

		assert.instance(error, Exceptions.PoolError);
		assert.equal(error.type, "ERR_LOW_FEE");
		assert.equal(error.message, `tx ${context.transaction.hash} fee is too low to enter the pool`);
	});

	it("SenderExceededMaximumTransactionCountError", (context) => {
		const error = new Exceptions.SenderExceededMaximumTransactionCountError(context.transaction, 1);

		assert.instance(error, Exceptions.PoolError);
		assert.equal(error.type, "ERR_EXCEEDS_MAX_COUNT");
		assert.equal(error.message, `tx ${context.transaction.hash} exceeds sender's transaction count limit of 1`);
	});

	it("TransactionPoolFullError", (context) => {
		const error = new Exceptions.TransactionPoolFullError(context.transaction, new BigNumber(1000 * 1e9));

		assert.instance(error, Exceptions.PoolError);
		assert.equal(error.type, "ERR_POOL_FULL");
		assert.equal(
			error.message,
			`tx ${context.transaction.hash} fee 900000000000 is lower than 1000000000000 already in pool`,
		);
	});

	it("TransactionFailedToApplyError", (context) => {
		const error = new Exceptions.TransactionFailedToApplyError(
			context.transaction,
			new Error("Something went horribly wrong"),
		);

		assert.instance(error, Exceptions.PoolError);
		assert.equal(error.type, "ERR_APPLY");
		assert.equal(error.message, `tx ${context.transaction.hash} cannot be applied: Something went horribly wrong`);
	});

	it("TransactionFailedToVerifyError", (context) => {
		const error = new Exceptions.TransactionFailedToVerifyError(context.transaction);

		assert.instance(error, Exceptions.PoolError);
		assert.equal(error.type, "ERR_BAD_DATA");
		assert.equal(error.message, `tx ${context.transaction.hash} didn't pass verification`);
	});

	it("TransactionFromWrongNetworkError", (context) => {
		const error = new Exceptions.TransactionFromWrongNetworkError(context.transaction, 23);

		assert.instance(error, Exceptions.PoolError);
		assert.equal(error.type, "ERR_WRONG_NETWORK");
		assert.equal(error.message, `tx ${context.transaction.hash} network 30 doesn't match node's network 23`);
	});

	it("InvalidTransactionDataError", (context) => {
		const error = new Exceptions.InvalidTransactionDataError("Version 1 not supported");

		assert.instance(error, Exceptions.PoolError);
		assert.equal(error.type, "ERR_BAD_DATA");
		assert.equal(error.message, "Invalid transaction data: Version 1 not supported");
	});
});
