import { Contracts, Identifiers } from "@mainsail/contracts";
import { Configuration } from "@mainsail/crypto-config";
import { Validator } from "@mainsail/validation/source/validator";

import cryptoJson from "../../core/bin/config/devnet/core/crypto.json";
import { describe, Sandbox } from "../../test-framework/source";
import { makeKeywords } from "./keywords";

describe<{
	sandbox: Sandbox;
	validator: Validator;
}>("Keywords", ({ it, beforeEach, assert }) => {
	beforeEach((context) => {
		context.sandbox = new Sandbox();

		context.validator = context.sandbox.app.resolve(Validator);

		context.sandbox.app.bind(Identifiers.Cryptography.Configuration).to(Configuration).inSingletonScope();
		context.sandbox.app.get<Configuration>(Identifiers.Cryptography.Configuration).setConfig(cryptoJson);
		context.sandbox.app.get<Configuration>(Identifiers.Cryptography.Configuration).setHeight(1);

		const keywords = makeKeywords(context.sandbox.app.get<Configuration>(Identifiers.Cryptography.Configuration));
		context.validator.addKeyword(keywords.limitToRoundValidators);
		context.validator.addKeyword(keywords.isValidatorIndex);
	});

	it("keyword limitToRoundValidators - should be ok", (context) => {
		const schema = {
			$id: "test",
			limitToRoundValidators: {},
		};
		context.validator.addSchema(schema);

		const { roundValidators } = context.sandbox.app
			.get<Contracts.Crypto.Configuration>(Identifiers.Cryptography.Configuration)
			.getMilestone(1);

		let matrix = new Array(roundValidators).fill(true);
		assert.undefined(context.validator.validate("test", matrix).error);

		matrix = new Array(roundValidators).fill(false);
		assert.undefined(context.validator.validate("test", matrix).error);

		matrix = new Array(roundValidators).fill(1);
		assert.undefined(context.validator.validate("test", matrix).error);

		matrix = new Array(roundValidators - 1).fill(false);
		assert.defined(context.validator.validate("test", matrix).error);

		assert.defined(context.validator.validate("test", {}).error);
		assert.defined(context.validator.validate("test", undefined).error);
		assert.defined(context.validator.validate("test", null).error);
		assert.defined(context.validator.validate("test", "12134354").error);
		assert.defined(context.validator.validate("test", []).error);
		assert.defined(context.validator.validate("test", 1).error);
	});

	it("keyword limitToRoundValidators - should be ok with minimum", (context) => {
		const schema = {
			$id: "test",
			limitToRoundValidators: {
				minimum: 0,
			},
		};
		context.validator.addSchema(schema);

		const { roundValidators } = context.sandbox.app
			.get<Contracts.Crypto.Configuration>(Identifiers.Cryptography.Configuration)
			.getMilestone(1);

		let matrix = new Array(roundValidators).fill(true);
		assert.undefined(context.validator.validate("test", matrix).error);

		matrix = new Array(roundValidators + 1).fill(true);
		assert.defined(context.validator.validate("test", matrix).error);

		assert.undefined(context.validator.validate("test", []).error);
		assert.undefined(context.validator.validate("test", [false]).error);
		assert.undefined(context.validator.validate("test", [true]).error);
	});

	it("keyword isValidatorIndex - should be ok", (context) => {
		const schema = {
			$id: "test",
			isValidatorIndex: {},
		};
		context.validator.addSchema(schema);

		const { roundValidators } = context.sandbox.app
			.get<Contracts.Crypto.Configuration>(Identifiers.Cryptography.Configuration)
			.getMilestone(1);

		for (let index = 0; index < roundValidators; index++) {
			assert.undefined(context.validator.validate("test", index).error);
		}

		assert.defined(context.validator.validate("test", 50.000_01).error);
		assert.defined(context.validator.validate("test", roundValidators).error);
		assert.defined(context.validator.validate("test", roundValidators + 1).error);
		assert.defined(context.validator.validate("test", "a").error);
		assert.defined(context.validator.validate("test", undefined).error);
	});

	it("keyword isValidatorIndex - should be ok for parent height", (context) => {
		const schema = {
			$id: "test",
			type: "object",
			properties: {
				height: {
					type: "integer",
				},
				validatorIndex: { isValidatorIndex: {} },
			},
		};
		context.validator.addSchema(schema);

		const { roundValidators } = context.sandbox.app
			.get<Contracts.Crypto.Configuration>(Identifiers.Cryptography.Configuration)
			.getMilestone(1);

		for (let index = 0; index < roundValidators; index++) {
			assert.undefined(context.validator.validate("test", { height: 1, validatorIndex: index }).error);
		}

		assert.defined(context.validator.validate("test", { height: 1, validatorIndex: roundValidators }).error);
	});

	it("keyword isValidatorIndex - should be ok for parent block", (context) => {
		const schema = {
			$id: "test",
			type: "object",
			properties: {
				data: {
					type: "object",
					properties: {
						serialized: {
							type: "string",
						},
					},
				},
				validatorIndex: { isValidatorIndex: {} },
			},
		};
		context.validator.addSchema(schema);

		let { roundValidators } = context.sandbox.app
			.get<Contracts.Crypto.Configuration>(Identifiers.Cryptography.Configuration)
			.getMilestone(1);

		const block1 = {
			// height=2
			serialized: "000173452bb48901020000000000000000000000000000000",
		};

		for (let index = 0; index < roundValidators; index++) {
			assert.undefined(context.validator.validate("test", { data: block1, validatorIndex: index }).error);
		}

		assert.defined(context.validator.validate("test", { data: block1, validatorIndex: roundValidators }).error);

		// change milestone to 15 validators at height 15
		context.sandbox.app
			.get<Contracts.Crypto.Configuration>(Identifiers.Cryptography.Configuration)
			.getMilestones()[2].height = 15;

		context.sandbox.app
			.get<Contracts.Crypto.Configuration>(Identifiers.Cryptography.Configuration)
			.getMilestones()[2].roundValidators = 15;

		const block2 = {
			// height=15
			serialized: "000173452bb489010f0000000000000000000000000000000",
		};

		for (let index = 0; index < 15; index++) {
			assert.undefined(context.validator.validate("test", { data: block2, validatorIndex: index }).error);
		}

		assert.defined(context.validator.validate("test", { data: block2, validatorIndex: 15 }).error);

		// block 1 still accepted
		for (let index = 0; index < roundValidators; index++) {
			assert.undefined(context.validator.validate("test", { data: block1, validatorIndex: index }).error);
		}

		assert.defined(context.validator.validate("test", { data: block1, validatorIndex: 53 }).error);
	});
});
