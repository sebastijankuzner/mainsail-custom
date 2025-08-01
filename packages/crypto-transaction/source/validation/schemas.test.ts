import { Contracts, Identifiers } from "@mainsail/contracts";
import { schemas as addressSchemas } from "@mainsail/crypto-address-keccak256";
import { schemas as base58addressSchemas } from "@mainsail/crypto-address-base58";
import { Configuration } from "@mainsail/crypto-config";
import { schemas as keyPairSchemas } from "@mainsail/crypto-key-pair-ecdsa";
import { makeKeywords as makeBaseKeywords, schemas as baseSchemas } from "@mainsail/crypto-validation";
import { BigNumber } from "@mainsail/utils";
import { Validator } from "@mainsail/validation/source/validator";

import cryptoJson from "../../../core/bin/config/devnet/core/crypto.json";
import { describe, Sandbox } from "../../../test-framework/source";
import { makeKeywords } from "./keywords";
import { schemas, transactionBaseSchema } from "./schemas";
import { extendSchema, signedSchema, strictSchema } from "./utilities";

describe<{
	sandbox: Sandbox;
	validator: Validator;
}>("Schemas", ({ it, assert, beforeEach }) => {
	beforeEach((context) => {
		context.sandbox = new Sandbox();

		context.sandbox.app.bind(Identifiers.Cryptography.Configuration).to(Configuration).inSingletonScope();
		context.sandbox.app.get<Configuration>(Identifiers.Cryptography.Configuration).setConfig(cryptoJson);

		context.validator = context.sandbox.app.resolve(Validator);

		for (const keyword of Object.values({
			...makeBaseKeywords(context.sandbox.app.get<Configuration>(Identifiers.Cryptography.Configuration)),
			...makeKeywords(context.sandbox.app.get<Configuration>(Identifiers.Cryptography.Configuration)),
		})) {
			context.validator.addKeyword(keyword);
		}

		for (const schema of Object.values({
			...baseSchemas,
			...keyPairSchemas,
			...schemas,
			...addressSchemas,
			...base58addressSchemas,
		})) {
			context.validator.addSchema(schema);
		}
	});

	it("transactionId - should be ok", ({ validator }) => {
		assert.undefined(validator.validate("transactionId", "0".repeat(64)).error);

		const validChars = "0123456789abcdef";

		for (const char of validChars) {
			assert.undefined(validator.validate("transactionId", char.repeat(64)).error);
		}
	});

	it("transactionId - should not be ok", ({ validator }) => {
		assert.defined(validator.validate("transactionId", "0".repeat(63)).error);
		assert.defined(validator.validate("transactionId", "0".repeat(65)).error);
		assert.defined(validator.validate("transactionId", 123).error);
		assert.defined(validator.validate("transactionId", null).error);
		assert.defined(validator.validate("transactionId").error);
		assert.defined(validator.validate("transactionId", {}).error);

		const invalidChars = "ABCDEFGHIJKLghijkl!#$%&'|+/";

		for (const char of invalidChars) {
			assert.defined(validator.validate("transactionId", char.repeat(64)).error);
		}
	});

	it("networkByte - should be ok", ({ validator }) => {
		assert.undefined(validator.validate("networkByte", 10000).error);
	});

	it("networkByte - should not be ok", ({ validator }) => {
		assert.defined(validator.validate("networkByte", 123).error);
		assert.defined(validator.validate("networkByte", null).error);
		assert.defined(validator.validate("networkByte").error);
		assert.defined(validator.validate("networkByte", {}).error);
	});

	const schema = extendSchema(transactionBaseSchema, {
		$id: "transaction",
		properties: {
			type: { minimum: 0, type: "integer" },
		},
	});

	const transactionOriginal = {
		gasLimit: 21_000,
		gasPrice: 5 * 1e9,
		hash: "1".repeat(64),
		network: 10_000,
		nonce: 1,
		from: "0x" + "a".repeat(40),
		senderPublicKey: "a".repeat(66),
		value: 0,
	};

	it("transactionBaseSchema - should be valid", ({ validator }) => {
		validator.addSchema(schema);

		assert.undefined(validator.validate("transaction", transactionOriginal).error);
	});

	it("transactionBaseSchema - should allow addtional properties", ({ validator }) => {
		validator.addSchema(schema);

		const transaction = {
			...transactionOriginal,
			test: "test",
		};

		assert.undefined(validator.validate("transaction", transaction).error);
	});

	it("transactionBaseSchema - should have required fields", ({ validator }) => {
		validator.addSchema(schema);

		const requiredFields = ["value", "gasPrice", "nonce", "senderPublicKey"];
		for (const field of requiredFields) {
			const transaction = {
				...transactionOriginal,
			};

			delete transaction[field];

			assert.true(validator.validate("transaction", transaction).error.includes(field));
		}

		const optionalFields = ["id", "network", "v", "r", "s", "typeGroup", "version"];
		for (const field of optionalFields) {
			const transaction = {
				...transactionOriginal,
			};

			delete transaction[field];

			assert.undefined(validator.validate("transaction", transaction).error);
		}
	});

	it("transactionBaseSchema - value should be big number min 0", ({ validator }) => {
		validator.addSchema(schema);

		const validValues = [0, "0", BigNumber.ZERO, "1", BigNumber.ONE, 100, "100", BigNumber.make(100)];
		for (const value of validValues) {
			const transaction = {
				...transactionOriginal,
				value,
			};

			assert.undefined(validator.validate("transaction", transaction).error);
		}

		const invalidValues = [-1, "-1", 1.1, BigNumber.make(-1), -1, null, undefined, {}, "test"];

		for (const value of invalidValues) {
			const transaction = {
				...transactionOriginal,
				value,
			};

			assert.true(validator.validate("transaction", transaction).error.includes("value"));
		}
	});

	it("transactionBaseSchema - gasPrice should be number min 5 gwei", ({ sandbox, validator }) => {
		sandbox.app.get<Configuration>(Identifiers.Cryptography.Configuration).setHeight(1);
		validator.addSchema(schema);

		const validValues = [5, 10, 100];
		for (const value of validValues) {
			const transaction = {
				...transactionOriginal,
				gasPrice: value * 1e9,
			};

			assert.undefined(validator.validate("transaction", transaction).error);
		}

		const invalidValues = [0, -1, "-1", 1.1, BigNumber.make(-1), -1, null, undefined, {}, "test", 1 + 10000 * 1e9];

		for (const value of invalidValues) {
			const transaction = {
				...transactionOriginal,
				gasPrice: value,
			};

			assert.true(validator.validate("transaction", transaction).error.includes("gasPrice"));
		}
	});

	it("transactionBaseSchema - gasPrice should accept 0 for genesis block", ({ sandbox, validator }) => {
		const configuration = sandbox.app.get<Configuration>(Identifiers.Cryptography.Configuration);
		configuration.setHeight(1);

		const genesisBlock: Contracts.Crypto.BlockData = configuration.get("genesisBlock.block");

		validator.addSchema(schema);

		const transaction = {
			...transactionOriginal,
			gasPrice: 0,
		};

		genesisBlock.transactions.push(transaction as unknown as Contracts.Crypto.TransactionData);

		assert.undefined(validator.validate("transaction", transaction).error);

		// Fails for non-genesis tx
		transaction.hash = "2".repeat(64);
		assert.true(validator.validate("transaction", transaction).error.includes("gasPrice"));

		// But works on height 0
		configuration.setHeight(0);
		assert.undefined(validator.validate("transaction", transaction).error);
	});

	it("transactionBaseSchema - id should be transactionId", ({ validator }) => {
		validator.addSchema(schema);

		const validChars = "0123456789abcdef";

		for (const char of validChars) {
			const transaction = {
				...transactionOriginal,
				hash: char.repeat(64),
			};

			assert.undefined(validator.validate("transaction", transaction).error);
		}

		const invalidValues = ["0".repeat(63), "0".repeat(65), "G".repeat(64), "g".repeat(64), {}, "test"];

		for (const value of invalidValues) {
			const transaction = {
				...transactionOriginal,
				hash: value,
			};

			assert.true(validator.validate("transaction", transaction).error.includes("hash"));
		}
	});

	it("transactionBaseSchema - network should be valid networkByte", ({ validator }) => {
		validator.addSchema(schema);

		const invalidValues = [20, {}, "test"];

		for (const value of invalidValues) {
			const transaction = {
				...transactionOriginal,
				network: value,
			};

			assert.true(validator.validate("transaction", transaction).error.includes("network"));
		}
	});

	it("transactionBaseSchema - nonce should be big number min 0", ({ validator }) => {
		validator.addSchema(schema);

		const validValues = [0, "0", BigNumber.ZERO, 1, "1", BigNumber.ONE, 100, "100", BigNumber.make(100)];

		for (const value of validValues) {
			const transaction = {
				...transactionOriginal,
				nonce: value,
			};

			assert.undefined(validator.validate("transaction", transaction).error);
		}

		const invalidValues = [-1, "-1", 1.1, BigNumber.make(-1), -1, null, undefined, {}, "test"];

		for (const value of invalidValues) {
			const transaction = {
				...transactionOriginal,
				nonce: value,
			};

			assert.true(validator.validate("transaction", transaction).error.includes("nonce"));
		}
	});

	it.skip("transactionBaseSchema - signature should be alphanumeric", ({ validator }) => {
		validator.addSchema(schema);

		const validChars = "0123456789abcdefghijklmnopqrstuvwxyz";

		for (const char of validChars) {
			const transaction = {
				...transactionOriginal,
				signature: char.repeat(130),
			};

			assert.undefined(validator.validate("transaction", transaction).error);
		}

		const invalidValues = [..."ABCDEFGHJKLMNPQRSTUVWXYZ", "/", "!", "&", {}];

		for (const value of invalidValues) {
			const transaction = {
				...transactionOriginal,
				signature: value,
			};

			assert.true(validator.validate("transaction", transaction).error.includes("signature"));
		}
	});

	it.skip("transactionBaseSchema - signatures should be alphanumeric, 130 length, min 1 and max 16, unique items", ({
		validator,
	}) => {
		validator.addSchema(schema);

		const validChars = "0123456789abcdefghijklmnopqrstuvwxyz";

		for (const char of validChars) {
			const transaction = {
				...transactionOriginal,
				signatures: [char.repeat(130)],
			};

			assert.undefined(validator.validate("transaction", transaction).error);
		}

		const invalidValues = [
			"a".repeat(129),
			"a".repeat(131),
			"A".repeat(130),
			"/".repeat(130),
			"!".repeat(130),
			"&".repeat(130),
			null,
			undefined,
			{},
		];
		for (const value of invalidValues) {
			const transaction = {
				...transactionOriginal,
				signatures: [value],
			};

			assert.true(validator.validate("transaction", transaction).error.includes("signatures"));
		}

		// Len 0
		assert.true(
			validator
				.validate("transaction", {
					...transactionOriginal,
					signatures: [],
				})
				.error.includes("signatures"),
		);

		// Len > 16
		assert.true(
			validator
				.validate("transaction", {
					...transactionOriginal,
					signatures: [
						"a".repeat(130),
						"b".repeat(130),
						"c".repeat(130),
						"d".repeat(130),
						"e".repeat(130),
						"f".repeat(130),
						"g".repeat(130),
						"h".repeat(130),
						"i".repeat(130),
						"j".repeat(130),
						"k".repeat(130),
						"l".repeat(130),
						"m".repeat(130),
						"n".repeat(130),
						"o".repeat(130),
						"p".repeat(130),
						"r".repeat(130),
					],
				})
				.error.includes("signatures"),
		);

		// Unique
		assert.true(
			validator
				.validate("transaction", {
					...transactionOriginal,
					signatures: ["a".repeat(130), "a".repeat(130)],
				})
				.error.includes("signatures"),
		);
	});

	it.skip("signedSchema - should be ok with signature", ({ validator }) => {
		validator.addSchema(signedSchema(schema));

		const transaction = {
			...transactionOriginal,
		};

		assert.undefined(validator.validate("transactionSigned", transaction).error);
	});

	it.skip("signedSchema - should be ok with signatures", ({ validator }) => {
		validator.addSchema(signedSchema(schema));

		const transaction = {
			...transactionOriginal,
			signatures: ["a".repeat(130)],
		};

		delete transaction.signature;

		assert.undefined(validator.validate("transactionSigned", transaction).error);
	});

	it.skip("signedSchema - should be ok with signature & signatures", ({ validator }) => {
		validator.addSchema(signedSchema(schema));

		const transaction = {
			...transactionOriginal,
			signatures: ["a".repeat(130)],
		};

		assert.undefined(validator.validate("transactionSigned", transaction).error);
	});

	it.skip("signedSchema - should not be ok without signature and signatures", ({ validator }) => {
		validator.addSchema(signedSchema(schema));

		const transaction = {
			...transactionOriginal,
		};
		delete transaction.signature;

		assert.defined(validator.validate("transactionSigned", transaction).error);
	});

	it.skip("strictSchema - should not have any additonal properties", ({ validator }) => {
		validator.addSchema(strictSchema(schema));

		assert.undefined(
			validator.validate("transactionStrict", {
				...transactionOriginal,
			}).error,
		);

		assert.defined(
			validator.validate("transactionStrict", {
				...transactionOriginal,
				test: "test",
			}).error,
		);
	});

	it.skip("strictSchema - should not be ok without signature and signatures", ({ validator }) => {
		validator.addSchema(signedSchema(schema));

		const transaction = {
			...transactionOriginal,
		};
		delete transaction.signature;

		assert.defined(validator.validate("transactionStrict", transaction).error);
	});
});
