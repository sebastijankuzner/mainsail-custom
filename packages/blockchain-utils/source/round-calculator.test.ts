import { Exceptions, Identifiers } from "@mainsail/contracts";

import crypto from "../../core/bin/config/devnet/core/crypto.json";
import { Configuration } from "../../crypto-config/distribution/index";
import { describe, Sandbox } from "../../test-framework/source";
import { RoundCalculator } from "./round-calculator";

type Context = {
	configuration: Configuration;
	roundCalculator: RoundCalculator;
};

const setup = (context: Context) => {
	const sandbox = new Sandbox();

	sandbox.app.bind(Identifiers.Cryptography.Configuration).to(Configuration).inSingletonScope();

	context.configuration = sandbox.app.get<Configuration>(Identifiers.Cryptography.Configuration);
	context.configuration.setConfig(crypto);

	context.roundCalculator = sandbox.app.resolve<RoundCalculator>(RoundCalculator);
};

describe<Context>("Round Calculator - calculateRoundInfoByRound", ({ assert, beforeEach, it, stub }) => {
	beforeEach(setup);

	it("dynamic delegate count - should calculate the correct with dynamic delegate count", ({
		configuration,
		roundCalculator,
	}) => {
		const milestones = [
			{ roundValidators: 0, height: 0 },
			{ roundValidators: 53, height: 1 },
			{ roundValidators: 53, height: 54 },
		];

		const config = { ...crypto, milestones };
		configuration.setConfig(config);

		const testVector = [
			// Round 0
			{ roundValidators: 0, nextRound: 1, round: 0, roundHeight: 0 },
			// Round 1
			{ roundValidators: 53, nextRound: 1, round: 1, roundHeight: 1 },
			// Round 2
			{ roundValidators: 53, nextRound: 2, round: 2, roundHeight: 54 },
			// Round 3
			{ roundValidators: 53, nextRound: 3, round: 3, roundHeight: 107 },
		];

		for (const { round, roundHeight, nextRound, roundValidators } of testVector) {
			const result = roundCalculator.calculateRoundInfoByRound(round);
			assert.is(result.round, round);
			assert.is(result.roundHeight, roundHeight);
			assert.true(roundCalculator.isNewRound(result.roundHeight));
			assert.is(result.nextRound, nextRound);
			assert.is(result.maxValidators, roundValidators);
		}
	});
});

describe<Context>("Round Calculator - calculateRound", ({ assert, beforeEach, it, stub }) => {
	beforeEach(setup);

	it("static delegate count - should calculate the round when nextRound is the same", ({
		configuration,
		roundCalculator,
	}) => {
		const { roundValidators } = configuration.getMilestone(1);

		for (let index = 0, height = roundValidators; index < 1000; index++, height += roundValidators) {
			const { round, nextRound } = roundCalculator.calculateRound(height - 1);
			assert.is(round, index + 1);
			assert.is(nextRound, index + 1);
		}
	});

	it("static delegate count - should calculate the round when nextRound is not the same", ({
		configuration,
		roundCalculator,
	}) => {
		const { roundValidators } = configuration.getMilestone(1);

		for (let index = 0, height = roundValidators; index < 1000; index++, height += roundValidators) {
			const { round, nextRound } = roundCalculator.calculateRound(height);
			assert.is(round, index + 1);
			assert.is(nextRound, index + 2);
		}
	});

	it("static delegate count - should calculate the correct round", ({ configuration, roundCalculator }) => {
		const { roundValidators } = configuration.getMilestone(1);

		for (let index = 0; index < 1000; index++) {
			const { round, nextRound } = roundCalculator.calculateRound(index + 1);
			assert.is(round, Math.floor(index / roundValidators) + 1);
			assert.is(nextRound, Math.floor((index + 1) / roundValidators) + 1);
		}
	});

	it("static delegate count - should calculate correct round for each height in round", ({
		configuration,
		roundCalculator,
	}) => {
		const milestones = [{ roundValidators: 4, height: 0 }];

		const config = { ...crypto, milestones };
		configuration.setConfig(config);

		const testVector = [
			// Round 0
			{ roundValidators: 0, height: 0, nextRound: 1, round: 0, roundHeight: 0 },
			// Round 1
			{ roundValidators: 4, height: 1, nextRound: 1, round: 1, roundHeight: 1 },
			{ roundValidators: 4, height: 2, nextRound: 1, round: 1, roundHeight: 1 },
			{ roundValidators: 4, height: 3, nextRound: 1, round: 1, roundHeight: 1 },
			{ roundValidators: 4, height: 4, nextRound: 2, round: 1, roundHeight: 1 },
			// Round 2
			{ roundValidators: 4, height: 5, nextRound: 2, round: 2, roundHeight: 5 },
			{ roundValidators: 4, height: 6, nextRound: 2, round: 2, roundHeight: 5 },
			{ roundValidators: 4, height: 7, nextRound: 2, round: 2, roundHeight: 5 },
			{ roundValidators: 4, height: 8, nextRound: 3, round: 2, roundHeight: 5 },
			// Round 3
			{ roundValidators: 4, height: 9, nextRound: 3, round: 3, roundHeight: 9 },
			{ roundValidators: 4, height: 10, nextRound: 3, round: 3, roundHeight: 9 },
			{ roundValidators: 4, height: 11, nextRound: 3, round: 3, roundHeight: 9 },
			{ roundValidators: 4, height: 12, nextRound: 4, round: 3, roundHeight: 9 },
		];

		for (const item of testVector) {
			const result = roundCalculator.calculateRound(item.height);
			assert.is(result.round, item.round);
			assert.is(result.roundHeight, item.roundHeight);
			assert.true(roundCalculator.isNewRound(result.roundHeight));
			assert.is(result.nextRound, item.nextRound);
			assert.is(result.maxValidators, item.roundValidators);
		}
	});

	it("dynamic delegate count - should calculate the correct with dynamic delegate count", ({
		configuration,
		roundCalculator,
	}) => {
		const milestones = [
			{ roundValidators: 2, height: 0 },
			{ roundValidators: 3, height: 3 },
			{ roundValidators: 1, height: 9 },
			{ roundValidators: 3, height: 12 },
		];

		const config = { ...crypto, milestones };
		configuration.setConfig(config);

		const testVector = [
			// Round 0 - milestone
			{ roundValidators: 0, height: 0, nextRound: 1, round: 0, roundHeight: 0 },
			// Round 1 - milestone
			{ roundValidators: 2, height: 1, nextRound: 1, round: 1, roundHeight: 1 },
			{ roundValidators: 2, height: 2, nextRound: 2, round: 1, roundHeight: 1 },
			// Round 2 - milestone change
			{ roundValidators: 3, height: 3, nextRound: 2, round: 2, roundHeight: 3 },
			{ roundValidators: 3, height: 4, nextRound: 2, round: 2, roundHeight: 3 },
			{ roundValidators: 3, height: 5, nextRound: 3, round: 2, roundHeight: 3 },
			// Round 3
			{ roundValidators: 3, height: 6, nextRound: 3, round: 3, roundHeight: 6 },
			{ roundValidators: 3, height: 7, nextRound: 3, round: 3, roundHeight: 6 },
			{ roundValidators: 3, height: 8, nextRound: 4, round: 3, roundHeight: 6 },
			// Round 4 - 6 - milestone change
			{ roundValidators: 1, height: 9, nextRound: 5, round: 4, roundHeight: 9 },
			{ roundValidators: 1, height: 10, nextRound: 6, round: 5, roundHeight: 10 },
			{ roundValidators: 1, height: 11, nextRound: 7, round: 6, roundHeight: 11 },
			// Round 7 - milestone change
			{ roundValidators: 3, height: 12, nextRound: 7, round: 7, roundHeight: 12 },
			{ roundValidators: 3, height: 13, nextRound: 7, round: 7, roundHeight: 12 },
			{ roundValidators: 3, height: 14, nextRound: 8, round: 7, roundHeight: 12 },
			// Round 8
			{ roundValidators: 3, height: 15, nextRound: 8, round: 8, roundHeight: 15 },
		];

		for (const { height, round, roundHeight, nextRound, roundValidators } of testVector) {
			const result = roundCalculator.calculateRound(height);
			assert.is(result.round, round);
			assert.is(result.roundHeight, roundHeight);
			assert.true(roundCalculator.isNewRound(result.roundHeight));
			assert.is(result.nextRound, nextRound);
			assert.is(result.maxValidators, roundValidators);
		}
	});

	it("dynamic delegate count - should calculate the correct with dynamic delegate count (2)", ({
		configuration,
		roundCalculator,
	}) => {
		const milestones = [
			{ roundValidators: 3, height: 0 },
			{ roundValidators: 7, height: 4 },
			{ roundValidators: 4, height: 11 },
			{ roundValidators: 53, height: 15 },
		];

		const config = { ...crypto, milestones };
		configuration.setConfig(config);

		const testVector = [
			// Round 0
			{ roundValidators: 0, height: 0, nextRound: 1, round: 0, roundHeight: 0 },
			// Round 1
			{ roundValidators: 3, height: 1, nextRound: 1, round: 1, roundHeight: 1 },
			{ roundValidators: 3, height: 2, nextRound: 1, round: 1, roundHeight: 1 },
			{ roundValidators: 3, height: 3, nextRound: 2, round: 1, roundHeight: 1 },
			// Round 2
			{ roundValidators: 7, height: 4, nextRound: 2, round: 2, roundHeight: 4 },
			{ roundValidators: 7, height: 10, nextRound: 3, round: 2, roundHeight: 4 },
			// Round 3
			{ roundValidators: 4, height: 11, nextRound: 3, round: 3, roundHeight: 11 },
			{ roundValidators: 4, height: 14, nextRound: 4, round: 3, roundHeight: 11 },
			{ roundValidators: 53, height: 15, nextRound: 4, round: 4, roundHeight: 15 },
			{ roundValidators: 53, height: 67, nextRound: 5, round: 4, roundHeight: 15 },
			// Round 4
			{ roundValidators: 53, height: 68, nextRound: 5, round: 5, roundHeight: 68 },
		];

		for (const { height, round, roundHeight, nextRound, roundValidators } of testVector) {
			configuration.setHeight(height);

			const result = roundCalculator.calculateRound(height);

			assert.is(result.round, round);
			assert.is(result.roundHeight, roundHeight);
			assert.true(roundCalculator.isNewRound(result.roundHeight));
			assert.is(result.nextRound, nextRound);
			assert.is(result.maxValidators, roundValidators);
		}
	});

	it("dynamic validator count - should throw if round delegates is not changed on new round", ({
		configuration,
		roundCalculator,
	}) => {
		const milestones = [
			{ roundValidators: 0, height: 0 },
			{ roundValidators: 3, height: 1 },
			{ roundValidators: 4, height: 4 },
		];

		const config = { ...crypto, milestones };
		configuration.setConfig(config);

		const stubGetNextMilestoneWithKey = stub(configuration, "getNextMilestoneWithNewKey")
			// nextMilestone
			.returnValueNth(0, {
				data: 3,
				found: true,
				height: 1,
			})
			// getMilestones
			.returnValueNth(1, {
				data: 3,
				found: true,
				height: 1,
			})
			.returnValueNth(2, {
				data: 4,
				found: true,
				height: 4,
			})
			.returnValueNth(3, {
				data: 4,
				found: true,
				height: 4,
			})
			.returnValueNth(4, {
				data: undefined,
				found: false,
				height: 8,
			})
			.returnValueNth(5, {
				data: 4,
				found: true,
				height: 4,
			})
			.returnValueNth(6, {
				data: undefined,
				found: false,
				height: 5,
			});

		roundCalculator.calculateRound(1);

		stubGetNextMilestoneWithKey.reset();
		roundCalculator.calculateRound(2);

		stubGetNextMilestoneWithKey.reset();

		assert.throws(
			() => roundCalculator.calculateRound(5),
			new Exceptions.InvalidMilestoneConfigurationError(
				"Bad milestone at height: 5. The number of validators can only be changed at the beginning of a new round.",
			),
		);
	});
});

describe<Context>("Round Calculator", ({ assert, beforeEach, it }) => {
	beforeEach(setup);

	it("should determine the beginning of a new round", ({ configuration, roundCalculator }) => {
		assert.true(roundCalculator.isNewRound(0));
		assert.true(roundCalculator.isNewRound(1));
		assert.false(roundCalculator.isNewRound(2));
		assert.false(roundCalculator.isNewRound(52));
		assert.false(roundCalculator.isNewRound(53));
		assert.true(roundCalculator.isNewRound(54));
		assert.false(roundCalculator.isNewRound(103));
		assert.true(roundCalculator.isNewRound(107));
		assert.false(roundCalculator.isNewRound(159));
	});

	it("should be ok when changing delegate count", ({ configuration, roundCalculator }) => {
		const milestones = [
			{ roundValidators: 1, height: 0 }, // R0
			{ roundValidators: 2, height: 1 }, // R1
			{ roundValidators: 3, height: 3 }, // R2
			{ roundValidators: 1, height: 6 }, // R3
			{ roundValidators: 53, height: 10 }, // R7
			{ roundValidators: 53, height: 62 }, // R8
		];

		configuration.set("milestones", milestones);

		// 1 Delegate
		assert.true(roundCalculator.isNewRound(0));

		// 2 Delegates
		assert.true(roundCalculator.isNewRound(1));
		assert.false(roundCalculator.isNewRound(2));

		// 3 Delegates
		assert.true(roundCalculator.isNewRound(3));
		assert.false(roundCalculator.isNewRound(4));
		assert.false(roundCalculator.isNewRound(5));

		// 1 Delegate
		assert.true(roundCalculator.isNewRound(6));
		assert.true(roundCalculator.isNewRound(7));
		assert.true(roundCalculator.isNewRound(8));
		assert.true(roundCalculator.isNewRound(9));

		// 53 Delegates
		assert.true(roundCalculator.isNewRound(10));
		assert.false(roundCalculator.isNewRound(11));
		assert.true(roundCalculator.isNewRound(63));
	});
});

describe<Context>("RoundCalculator - getMilestonesWhichAffectActiveDelegateCount", ({ assert, beforeEach, it }) => {
	beforeEach(setup);

	it("should return milestones which changes delegate count", ({ configuration, roundCalculator }) => {
		configuration.setConfig({
			...crypto,
			milestones: [{ roundValidators: 4, height: 1 }],
		});

		const milestones = [
			{ roundValidators: 4, height: 0 },
			{ roundValidators: 4, height: 1 },
			{ roundValidators: 4, height: 5 },
			{ roundValidators: 8, height: 9 },
			{ roundValidators: 8, height: 15 },
		];

		const config = { ...crypto, milestones };
		configuration.setConfig({ ...crypto, milestones: milestones });

		assert.length(roundCalculator.getMilestonesWhichAffectActiveValidatorCount(configuration), 2);
	});
});
