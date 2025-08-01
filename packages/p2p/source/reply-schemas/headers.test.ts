import { Validator } from "@mainsail/validation/source/validator";

import { describe, Sandbox } from "../../../test-framework/source";
import { headers as data } from "../../test/fixtures/responses/headers";
import { prepareValidatorContext } from "../../test/helpers/prepare-validator-context";
import { headers } from "./headers";

type Context = {
	sandbox: Sandbox;
	validator: Validator;
};

describe<Context>("Headers Schema", ({ it, assert, beforeEach, each }) => {
	beforeEach((context) => {
		context.sandbox = new Sandbox();

		context.validator = context.sandbox.app.resolve(Validator);

		prepareValidatorContext(context);
	});

	it("should pass validation", ({ validator }) => {
		const result = validator.validate(headers, data);

		assert.undefined(result.error);
	});

	it("should pass validation", ({ validator }) => {
		const result = validator.validate(headers, data);

		assert.undefined(result.error);
	});

	each(
		"blockNumber - should fail if not integer min 1",
		({ context: { validator }, dataset }: { context: Context; dataset: any }) => {
			const result = validator.validate(headers, {
				...data,
				blockNumber: dataset,
			});

			assert.defined(result.error);
		},
		[0, -1, 1.1, "1", null, undefined],
	);

	each(
		"proposedBlockHash - should pass if blockHash or undefined",
		({ context: { validator }, dataset }: { context: Context; dataset: any }) => {
			const result = validator.validate(headers, {
				...data,
				proposedBlockHash: dataset,
			});

			assert.undefined(result.error);
		},
		["a".repeat(64), undefined],
	);

	each(
		"proposedBlockHash - fail if not blockHash or undefined",
		({ context: { validator }, dataset }: { context: Context; dataset: any }) => {
			const result = validator.validate(headers, {
				...data,
				proposedBlockHash: dataset,
			});

			assert.defined(result.error);
		},
		["a".repeat(63), "a".repeat(65), 1, null],
	);

	each(
		"round - should fail if not integer min 0",
		({ context: { validator }, dataset }: { context: Context; dataset: any }) => {
			const result = validator.validate(headers, {
				...data,
				round: dataset,
			});

			assert.defined(result.error);
		},
		[-1, 1.1, "1", null, undefined],
	);

	each(
		"step - should fail if not integer min 0, max 2",
		({ context: { validator }, dataset }: { context: Context; dataset: any }) => {
			const result = validator.validate(headers, {
				...data,
				step: dataset,
			});

			assert.defined(result.error);
		},
		[-1, 1.1, "1", 3, null, undefined],
	);

	each(
		"validatorsSignedPrecommit - should fail if not boolean array",
		({ context: { validator }, dataset }: { context: Context; dataset: any }) => {
			const result = validator.validate(headers, {
				...data,
				validatorsSignedPrecommit: dataset,
			});

			assert.defined(result.error);
		},
		[0, null, undefined, [1], [null], [undefined]],
	);

	each(
		"validatorsSignedPrevote - should fail if not boolean array",
		({ context: { validator }, dataset }: { context: Context; dataset: any }) => {
			const result = validator.validate(headers, {
				...data,
				validatorsSignedPrevote: dataset,
			});

			assert.defined(result.error);
		},
		[0, null, undefined, [1], [null], [undefined]],
	);

	each(
		"version - should pass if node version",
		({ context: { validator }, dataset }: { context: Context; dataset: any }) => {
			const result = validator.validate(headers, {
				...data,
				version: dataset,
			});

			assert.undefined(result.error);
		},
		["1.1.1", "2.3.1"],
	);

	each(
		"version - should fail if not node version",
		({ context: { validator }, dataset }: { context: Context; dataset: any }) => {
			const result = validator.validate(headers, {
				...data,
				version: dataset,
			});

			assert.defined(result.error);
		},
		[0, null, undefined, "1", "1.1", "1.1.1.1"],
	);
});
