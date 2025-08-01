import { Contracts, Events, Identifiers } from "@mainsail/contracts";
import { Lock } from "@mainsail/utils";

import { describe, Sandbox } from "../../test-framework/source";
import { Consensus } from "./consensus";

type Context = {
	sandbox: Sandbox;
	consensus: Consensus;
	blockProcessor: any;
	bootstrapper: any;
	cryptoConfiguration: any;
	state: any;
	prevoteProcessor: any;
	precommitProcessor: any;
	proposalProcessor: any;
	scheduler: any;
	validatorsRepository: any;
	validatorSet: any;
	proposerCalculator: any;
	logger: any;
	block: any;
	proposal: any;
	proposer: any;
	eventDispatcher: any;
	roundState: Contracts.Consensus.RoundState;
	roundStateRepository: any;
};

describe<Context>("Consensus", ({ it, beforeEach, assert, stub, spy, clock, each }) => {
	beforeEach((context) => {
		context.blockProcessor = {
			commit: () => {},
			process: () => {},
		};

		context.state = {
			getLastBlock: () => {},
			getBlockNumber: () => 1,
		};

		context.cryptoConfiguration = {
			getMilestoneDiff: () => ({}),
			isNewMilestone: () => false,
			setBlockNumber: () => {},
		};

		context.proposalProcessor = {
			process: () => {},
		};

		context.prevoteProcessor = {
			process: () => {},
		};

		context.precommitProcessor = {
			process: () => {},
		};

		context.scheduler = {
			clear: () => {},
			getNextBlockTimestamp: (value) => value + 4000,
			scheduleTimeoutBlockPrepare: () => true,
			scheduleTimeoutPrecommit: () => true,
			scheduleTimeoutPrevote: () => true,
			scheduleTimeoutPropose: () => true,
		};

		context.bootstrapper = {
			run: () => {},
		};

		context.validatorsRepository = {
			getValidator: () => {},
			getValidators: () => {},
		};

		context.roundStateRepository = {
			clear: () => {},
			getRoundState: () => context.roundState,
		};

		context.validatorSet = {
			getRoundValidators: () => {},
			getValidatorIndexByWalletAddress: () => "",
		};

		context.proposerCalculator = {
			getValidatorIndex: () => {},
		};

		context.logger = {
			info: () => {},
		};

		context.eventDispatcher = {
			dispatch: () => {},
		};

		context.block = {
			data: {
				number: 1,
				hash: "blockHash",
			},
		};

		context.proposal = {
			getData: () => ({
				block: context.block,
			}),
			blockNumber: 1,
			round: 0,
			serialized: Buffer.from(""),
			validRound: undefined,
			validatorPublicKey: "validatorPublicKey",
		};

		context.proposer = {};

		context.roundState = {
			aggregatePrevotes: () => {},
			getBlock: () => {},
			getProcessorResult: () => false,
			getProposal: () => context.proposal,
			hasPrecommit: () => false,
			hasPrevote: () => false,
			hasProcessorResult: () => false,
			hasProposal: () => false,
			blockNumber: 1,
			logPrecommits: () => {},
			logPrevotes: () => {},
			proposer: context.proposer,
			round: 0,
			setProcessorResult: () => {},
		} as unknown as Contracts.Consensus.RoundState;

		context.sandbox = new Sandbox();

		context.sandbox.app.bind(Identifiers.Cryptography.Configuration).toConstantValue(context.cryptoConfiguration);
		context.sandbox.app.bind(Identifiers.Processor.BlockProcessor).toConstantValue(context.blockProcessor);
		context.sandbox.app.bind(Identifiers.State.Store).toConstantValue(context.state);
		context.sandbox.app.bind(Identifiers.Consensus.Processor.PreVote).toConstantValue(context.prevoteProcessor);
		context.sandbox.app.bind(Identifiers.Consensus.Processor.PreCommit).toConstantValue(context.precommitProcessor);
		context.sandbox.app.bind(Identifiers.Consensus.Processor.Proposal).toConstantValue(context.proposalProcessor);
		context.sandbox.app.bind(Identifiers.Consensus.Bootstrapper).toConstantValue(context.bootstrapper);
		context.sandbox.app.bind(Identifiers.Consensus.Scheduler).toConstantValue(context.scheduler);
		context.sandbox.app.bind(Identifiers.Consensus.CommitLock).toConstantValue(new Lock());
		+context.sandbox.app.bind(Identifiers.Validator.Repository).toConstantValue(context.validatorsRepository);
		context.sandbox.app.bind(Identifiers.ValidatorSet.Service).toConstantValue(context.validatorSet);
		context.sandbox.app
			.bind(Identifiers.BlockchainUtils.ProposerCalculator)
			.toConstantValue(context.proposerCalculator);
		context.sandbox.app.bind(Identifiers.Services.EventDispatcher.Service).toConstantValue(context.eventDispatcher);
		context.sandbox.app
			.bind(Identifiers.Consensus.RoundStateRepository)
			.toConstantValue(context.roundStateRepository);
		context.sandbox.app.bind(Identifiers.Services.Log.Service).toConstantValue(context.logger);

		context.consensus = context.sandbox.app.resolve(Consensus);
	});

	it("#getBlockNumber - should return initial value", async ({ consensus }) => {
		assert.equal(consensus.getBlockNumber(), 1);
	});

	it("#getRound - should return initial value", async ({ consensus }) => {
		assert.equal(consensus.getRound(), 0);
	});

	it("#getStep - should return initial value", async ({ consensus }) => {
		assert.equal(consensus.getStep(), Contracts.Consensus.Step.Propose);
	});

	it("#getLockedRound - should return initial value", async ({ consensus }) => {
		assert.undefined(consensus.getLockedRound());
	});

	it("#getValidRound - should return initial value", async ({ consensus }) => {
		assert.undefined(consensus.getValidRound());
	});

	it("#getState - should return initial value", async ({ consensus }) => {
		assert.equal(consensus.getState(), {
			blockNumber: 1,
			lockedRound: undefined,
			round: 0,
			step: Contracts.Consensus.Step.Propose,
			validRound: undefined,
		});
	});

	it("#startRound - should clear scheduler, scheduleTimeout and should not propose is not local validator", async ({
		consensus,
		scheduler,
		validatorsRepository,
		roundStateRepository,
		eventDispatcher,
		proposer,
		logger,
	}) => {
		const spyScheduleClear = spy(scheduler, "clear");
		const spyScheduleTimeoutBlockPrepare = spy(scheduler, "scheduleTimeoutBlockPrepare");
		const spyLoggerInfo = spy(logger, "info");
		const spyGetValidator = stub(validatorsRepository, "getValidator").returnValue();
		const spyGetRoundState = stub(roundStateRepository, "getRoundState").returnValue({
			hasProposal: () => false,
			proposer: proposer,
		});
		const spyDispatch = spy(eventDispatcher, "dispatch");

		await consensus.startRound(0);

		spyScheduleClear.calledOnce();
		spyScheduleTimeoutBlockPrepare.calledOnce();

		spyGetValidator.calledOnce();
		spyGetValidator.calledWith(proposer.blsPublicKey);
		spyGetRoundState.calledOnce();
		spyGetRoundState.calledWith(1, 0);
		spyLoggerInfo.calledWith(`>> Starting new round: ${1}/${0} with proposer: ${proposer.address}`);
		spyDispatch.calledOnce();
		spyDispatch.calledWith(Events.ConsensusEvent.RoundStarted, {
			blockNumber: 1,
			lockedRound: undefined,
			round: 0,
			step: Contracts.Consensus.Step.Propose,
			validRound: undefined,
		});
	});

	it("#start round - should clear scheduler, scheduleTimeout and should propose", async ({
		consensus,
		validatorsRepository,
		roundStateRepository,
		logger,
		block,
		proposal,
		proposer,
		validatorSet,
		eventDispatcher,
		scheduler,
	}) => {
		const validator = {
			prepareBlock: () => {},
			propose: () => {},
		};

		const spyScheduleClear = spy(scheduler, "clear");
		const spyScheduleTimeoutBlockPrepare = spy(scheduler, "scheduleTimeoutBlockPrepare");
		const spyValidatorPrepareBlock = stub(validator, "prepareBlock").resolvedValue(block);
		const spyValidatorPropose = stub(validator, "propose").resolvedValue(proposal);

		const spyLoggerInfo = spy(logger, "info");
		const spyGetRoundState = stub(roundStateRepository, "getRoundState").returnValue({
			hasProposal: () => false,
			proposer,
		});
		const spyGetValidator = stub(validatorsRepository, "getValidator").returnValue(validator);
		const getValidatorIndexByWalletAddress = stub(validatorSet, "getValidatorIndexByWalletAddress").returnValue(1);
		const spyDispatch = spy(eventDispatcher, "dispatch");

		await consensus.startRound(0);

		spyScheduleClear.calledOnce();
		spyScheduleTimeoutBlockPrepare.calledOnce();

		spyGetRoundState.calledTimes(1);
		spyGetRoundState.calledWith(1, 0);
		spyGetValidator.calledOnce();
		spyGetValidator.calledWith(proposer.blsPublicKey);
		spyValidatorPrepareBlock.calledOnce();
		spyValidatorPrepareBlock.calledWith(proposer.address, 0);
		getValidatorIndexByWalletAddress.calledOnce();
		getValidatorIndexByWalletAddress.calledWith(proposer.address);
		spyValidatorPropose.calledOnce();
		spyValidatorPropose.calledWith(1, 0, undefined, block);
		spyLoggerInfo.calledWith(`>> Starting new round: ${1}/${0} with proposer: ${proposer.address}`);
		spyDispatch.called();
		spyDispatch.calledWith(Events.ConsensusEvent.RoundStarted, {
			blockNumber: 1,
			lockedRound: undefined,
			round: 0,
			step: Contracts.Consensus.Step.Propose,
			validRound: undefined,
		});
		assert.equal(consensus.getStep(), Contracts.Consensus.Step.Propose);
	});

	it("#onTimeoutStartRound - local validator should propose validRound", async ({
		consensus,
		validatorsRepository,
		roundStateRepository,
		logger,
		block,
		proposal,
		proposer,
		roundState,
		validatorSet,
		eventDispatcher,
		scheduler,
	}) => {
		const validator = {
			prepareBlock: () => {},
			propose: () => {},
		};

		const spyScheduleClear = spy(scheduler, "clear");
		const spyScheduleTimeoutBlockPrepare = spy(scheduler, "scheduleTimeoutBlockPrepare");

		const spyValidatorPrepareBlock = stub(validator, "prepareBlock").resolvedValue(block);
		const spyValidatorPropose = stub(validator, "propose").resolvedValue(proposal);

		const spyLoggerInfo = spy(logger, "info");
		const spyGetRoundState = stub(roundStateRepository, "getRoundState").returnValue({
			hasProposal: () => false,
			proposer,
		});

		const getValidatorIndexByWalletAddress = stub(validatorSet, "getValidatorIndexByWalletAddress").returnValue(1);
		const spyGetValidator = stub(validatorsRepository, "getValidator").returnValue(validator);

		const lockProof = {
			signature: "signature",
			validators: [],
		};

		const spyRoundStateAggregatePrevotes = stub(roundState, "aggregatePrevotes").returnValue(lockProof);
		const spyRoundStateGetBlock = stub(roundState, "getBlock").returnValue(block);
		const spyDispatch = spy(eventDispatcher, "dispatch");

		consensus.setValidRound(roundState);
		await consensus.startRound(1);

		spyScheduleClear.calledOnce();
		spyScheduleTimeoutBlockPrepare.calledOnce();

		spyGetRoundState.calledTimes(1);
		spyGetRoundState.calledWith(1, 1);
		spyGetValidator.calledOnce();
		spyGetValidator.calledWith(proposer.blsPublicKey);
		spyValidatorPrepareBlock.neverCalled();
		spyRoundStateAggregatePrevotes.calledOnce();
		spyRoundStateGetBlock.calledOnce();
		getValidatorIndexByWalletAddress.calledOnce();
		getValidatorIndexByWalletAddress.calledWith(proposer.address);
		spyValidatorPropose.calledOnce();
		spyValidatorPropose.calledWith(1, 1, 0, block, lockProof); // validator set, round, validRound, block, lockProof
		spyLoggerInfo.calledWith(`>> Starting new round: ${1}/${1} with proposer: ${proposer.address}`);
		spyLoggerInfo.calledWith(`Proposing valid block ${1}/${1} from round ${0} with block hash: ${block.data.hash}`);
		spyDispatch.calledOnce();
		spyDispatch.calledWith(Events.ConsensusEvent.RoundStarted, {
			blockNumber: 1,
			lockedRound: undefined,
			round: 1,
			step: Contracts.Consensus.Step.Propose,
			validRound: 0,
		});
		assert.equal(consensus.getStep(), Contracts.Consensus.Step.Propose);
	});

	it("#onTimeoutStartRound - should propose if proposal is ready", async ({
		consensus,
		proposalProcessor,
		proposal,
	}) => {
		const spyProposalProcess = spy(proposalProcessor, "process");

		consensus.setProposal(proposal);
		await consensus.onTimeoutStartRound();

		spyProposalProcess.calledOnce();
		spyProposalProcess.calledWith(proposal);

		assert.equal(consensus.getStep(), Contracts.Consensus.Step.Propose);
	});

	it("#onTimeoutStartRound - should skip propose if already proposed", async ({
		consensus,
		proposalProcessor,
		proposal,
		eventDispatcher,
	}) => {
		const spyProposalProcess = spy(proposalProcessor, "process");

		consensus.setProposal(proposal);
		await consensus.onTimeoutStartRound();
		await consensus.onTimeoutStartRound();

		spyProposalProcess.calledOnce();
		spyProposalProcess.calledWith(proposal);

		assert.equal(consensus.getStep(), Contracts.Consensus.Step.Propose);
	});

	it("#startRound - local validator should locked value", async () => {});

	it("#onProposal - should return if step !== propose", async ({ consensus, blockProcessor, roundState }) => {
		const spyBlockProcessorProcess = spy(blockProcessor, "process");

		consensus.setStep(Contracts.Consensus.Step.Prevote);
		await consensus.onProposal(roundState);

		spyBlockProcessorProcess.neverCalled();
		assert.equal(consensus.getStep(), Contracts.Consensus.Step.Prevote);
	});

	it("#onProposal - should return if blockNumber doesn't match", async ({
		consensus,
		blockProcessor,
		roundState,
	}) => {
		const spyBlockProcessorProcess = spy(blockProcessor, "process");

		roundState = { ...roundState, blockNumber: 3 };
		await consensus.onProposal(roundState);

		spyBlockProcessorProcess.neverCalled();
		assert.equal(consensus.getStep(), Contracts.Consensus.Step.Propose);
	});

	it("#onProposal - should return if round doesn't match", async ({ consensus, blockProcessor, roundState }) => {
		const spyBlockProcessorProcess = spy(blockProcessor, "process");

		roundState = { ...roundState, round: 2 };
		await consensus.onProposal(roundState);

		spyBlockProcessorProcess.neverCalled();
		assert.equal(consensus.getStep(), Contracts.Consensus.Step.Propose);
	});

	it("#onProposal - should return if proposal is undefined", async ({ consensus, blockProcessor, roundState }) => {
		const spyBlockProcessorProcess = spy(blockProcessor, "process");

		roundState.getProposal = () => {};
		await consensus.onProposal(roundState);

		spyBlockProcessorProcess.neverCalled();
		assert.equal(consensus.getStep(), Contracts.Consensus.Step.Propose);
	});

	it("#onProposal - should return if proposed validRound is defined", async ({
		consensus,
		blockProcessor,
		roundState,
		proposal,
	}) => {
		const spyBlockProcessorProcess = spy(blockProcessor, "process");

		proposal.validRound = 0;
		await consensus.onProposal(roundState);

		spyBlockProcessorProcess.neverCalled();
		assert.equal(consensus.getStep(), Contracts.Consensus.Step.Propose);
	});

	it("#onProposal - should return if not from valid proposer", async ({ consensus }) => {});

	it("#onProposal - broadcast prevote block hash, if block is valid & not locked", async ({
		consensus,
		validatorSet,
		validatorsRepository,
		roundState,
		block,
		logger,
		proposal,
		proposer,
		eventDispatcher,
	}) => {
		const spyGetProcessorResult = stub(roundState, "getProcessorResult").returnValue({ success: true });

		const prevote = {
			blockNumber: 1,
			round: 0,
		};

		const validator = {
			prevote: () => {},
		};
		const spyValidatorPrevote = stub(validator, "prevote").resolvedValue(prevote);

		const spyValidatorSetGetRoundValidators = stub(validatorSet, "getRoundValidators").returnValue([proposer]);
		const spyValidatorsRepositoryGetValidator = stub(validatorsRepository, "getValidator").returnValueOnce(
			validator,
		);
		const getValidatorIndexByWalletAddress = stub(validatorSet, "getValidatorIndexByWalletAddress").returnValue(1);
		const spyLoggerInfo = spy(logger, "info");
		const spyDispatch = spy(eventDispatcher, "dispatch");

		await consensus.onProposal(roundState);

		spyGetProcessorResult.calledOnce();

		spyValidatorSetGetRoundValidators.calledOnce();
		spyValidatorsRepositoryGetValidator.calledOnce();

		spyGetProcessorResult.calledOnce();
		getValidatorIndexByWalletAddress.calledOnce();
		spyValidatorPrevote.calledOnce();
		spyValidatorPrevote.calledWith(1, 1, 0, block.data.hash); // validatorIndex, blockNumber, round, blockHash

		spyLoggerInfo.calledWith(`Received proposal ${1}/${0} block hash: ${proposal.getData().block.data.hash}`);
		spyDispatch.calledOnce();
		spyDispatch.calledWith(Events.ConsensusEvent.ProposalAccepted, {
			blockNumber: 1,
			lockedRound: undefined,
			round: 0,
			step: Contracts.Consensus.Step.Prevote,
			validRound: undefined,
		});
		assert.equal(consensus.getStep(), Contracts.Consensus.Step.Prevote);
	});

	it("#onProposal - broadcast prevote undefined, if block is invalid", async ({
		consensus,
		validatorSet,
		validatorsRepository,
		prevoteProcessor,
		roundState,
		logger,
		proposal,
		proposer,
		eventDispatcher,
	}) => {
		const spyGetProcessorResult = stub(roundState, "getProcessorResult").returnValue({ success: false });

		const prevote = {
			blockNumber: 2,
			round: 0,
			serialized: Buffer.from(""),
		};

		const validator = {
			prevote: () => {},
		};
		const spyValidatorPrevote = stub(validator, "prevote").resolvedValue(prevote);

		const spyValidatorSetGetRoundValidators = stub(validatorSet, "getRoundValidators").returnValue([proposer]);
		const spyValidatorsRepositoryGetValidator = stub(validatorsRepository, "getValidator").returnValue(validator);
		const spyPrevoteProcess = spy(prevoteProcessor, "process");
		const getValidatorIndexByWalletAddress = stub(validatorSet, "getValidatorIndexByWalletAddress").returnValue(1);
		const spyLoggerInfo = spy(logger, "info");
		const spyDispatch = spy(eventDispatcher, "dispatch");

		await consensus.onProposal(roundState);

		spyGetProcessorResult.calledOnce();

		spyValidatorSetGetRoundValidators.calledOnce();
		spyValidatorsRepositoryGetValidator.calledOnce();
		getValidatorIndexByWalletAddress.calledOnce();

		spyValidatorPrevote.calledOnce();
		spyValidatorPrevote.calledWith(1, 1, 0);

		spyPrevoteProcess.calledOnce();
		spyPrevoteProcess.calledWith(prevote);
		spyLoggerInfo.calledWith(`Received proposal ${1}/${0} block hash: ${proposal.getData().block.data.hash}`);
		spyDispatch.calledOnce();
		spyDispatch.calledWith(Events.ConsensusEvent.ProposalAccepted, {
			blockNumber: 1,
			lockedRound: undefined,
			round: 0,
			step: Contracts.Consensus.Step.Prevote,
			validRound: undefined,
		});

		assert.equal(consensus.getStep(), Contracts.Consensus.Step.Prevote);
	});

	it("#onProposal - should skip prevote if already prevoted", async ({
		consensus,
		validatorSet,
		validatorsRepository,
		prevoteProcessor,
		roundState,
		logger,
		proposal,
		proposer,
		eventDispatcher,
	}) => {
		const spyGetProcessorResult = stub(roundState, "getProcessorResult").returnValue({ success: true });

		const prevote = {
			blockNumber: 2,
			round: 0,
		};

		const validator = {
			prevote: () => {},
		};
		const spyValidatorPrevote = stub(validator, "prevote").resolvedValue(prevote);

		const spyValidatorSetGetRoundValidators = stub(validatorSet, "getRoundValidators").returnValue([proposer]);
		const spyValidatorsRepositoryGetValidator = stub(validatorsRepository, "getValidator").returnValue([validator]);
		const spyPrevoteProcess = spy(prevoteProcessor, "process");
		const getValidatorIndexByWalletAddress = stub(validatorSet, "getValidatorIndexByWalletAddress").returnValue(1);
		const spyLoggerInfo = spy(logger, "info");
		const spyDispatch = spy(eventDispatcher, "dispatch");

		roundState.hasPrevote = () => true;
		await consensus.onProposal(roundState);

		spyGetProcessorResult.calledOnce();

		spyValidatorSetGetRoundValidators.calledOnce();
		spyValidatorsRepositoryGetValidator.calledOnce();
		getValidatorIndexByWalletAddress.calledOnce();

		spyValidatorPrevote.neverCalled();
		spyPrevoteProcess.neverCalled();

		spyLoggerInfo.calledWith(`Received proposal ${1}/${0} block hash: ${proposal.getData().block.data.hash}`);
		spyDispatch.calledOnce();
		spyDispatch.calledWith(Events.ConsensusEvent.ProposalAccepted, {
			blockNumber: 1,
			lockedRound: undefined,
			round: 0,
			step: Contracts.Consensus.Step.Prevote,
			validRound: undefined,
		});

		assert.equal(consensus.getStep(), Contracts.Consensus.Step.Prevote);
	});

	// TODO: Handle on processor
	it("#onProposal - broadcast prevote null, if block processor throws", async ({ consensus }) => {});

	it("#onProposal - broadcast prevote null, if locked value exists", async ({ consensus }) => {});

	it("#onProposalLocked - broadcast prevote block hash, if block is valid and lockedRound is undefined", async ({
		consensus,
		validatorSet,
		validatorsRepository,
		prevoteProcessor,
		roundState,
		block,
		proposal,
		proposer,
		logger,
		eventDispatcher,
	}) => {
		const spyGetProcessorResult = stub(roundState, "getProcessorResult").returnValue({ success: true });

		const prevote = {
			blockNumber: 1,
			round: 0,
		};

		const validator = {
			prevote: () => {},
		};
		const spyValidatorPrevote = stub(validator, "prevote").resolvedValue(prevote);

		const spyValidatorSetGetRoundValidators = stub(validatorSet, "getRoundValidators").returnValue([proposer]);
		const spyValidatorsRepositoryGetValidator = stub(validatorsRepository, "getValidator").returnValue(validator);
		const spyPrevoteProcess = spy(prevoteProcessor, "process");
		const getValidatorIndexByWalletAddress = stub(validatorSet, "getValidatorIndexByWalletAddress").returnValue(1);
		const spyLoggerInfo = spy(logger, "info");
		const spyDispatch = spy(eventDispatcher, "dispatch");

		stub(proposal, "getData").returnValue({ block, lockProof: { signature: "1234", validators: [] } });

		proposal.validRound = 0;
		roundState = { ...roundState, round: 1 };
		consensus.setRound(1);
		await consensus.onProposalLocked(roundState);

		spyGetProcessorResult.calledOnce();

		spyValidatorSetGetRoundValidators.calledOnce();
		spyValidatorsRepositoryGetValidator.calledOnce();
		getValidatorIndexByWalletAddress.calledOnce();

		spyValidatorPrevote.calledOnce();
		spyValidatorPrevote.calledWith(1, 1, 1, block.data.hash);

		spyPrevoteProcess.calledOnce();
		spyPrevoteProcess.calledWith(prevote);
		spyLoggerInfo.calledWith(
			`Received proposal ${1}/${1} with locked block hash: ${proposal.getData().block.data.hash}`,
		);
		spyDispatch.calledWith(Events.ConsensusEvent.ProposalAccepted, {
			blockNumber: 1,
			lockedRound: undefined,
			round: 1,
			step: Contracts.Consensus.Step.Prevote,
			validRound: undefined,
		});

		assert.equal(consensus.getStep(), Contracts.Consensus.Step.Prevote);
	});

	it("#onProposalLocked - broadcast prevote block hash, if block is valid and valid round is higher or equal than lockedRound ", async () => {});

	it("#onProposalLocked - broadcast prevote null, if block is valid and lockedRound is undefined", async ({
		consensus,
		validatorSet,
		validatorsRepository,
		prevoteProcessor,
		roundState,
		proposal,
		proposer,
		eventDispatcher,
		block,
	}) => {
		const spyGetProcessorResult = stub(roundState, "getProcessorResult").returnValue({ success: true });

		const prevote = {
			blockNumber: 1,
			round: 0,
			serialized: Buffer.from(""),
		};

		const validator = {
			prevote: () => {},
		};
		const spyValidatorPrevote = stub(validator, "prevote").resolvedValue(prevote);

		const spyValidatorSetGetRoundValidators = stub(validatorSet, "getRoundValidators").returnValue([proposer]);
		const spyValidatorsRepositoryGetValidator = stub(validatorsRepository, "getValidator").returnValue(validator);
		const getValidatorIndexByWalletAddress = stub(validatorSet, "getValidatorIndexByWalletAddress").returnValue(1);
		const spyPrevoteProcess = spy(prevoteProcessor, "process");
		const spyDispatch = spy(eventDispatcher, "dispatch");

		stub(proposal, "getData").returnValue({ block, lockProof: { signature: "1234", validators: [] } });

		proposal.validRound = 0;
		roundState = { ...roundState, round: 1 };
		consensus.setRound(1);
		await consensus.onProposalLocked(roundState);

		spyGetProcessorResult.calledOnce();

		spyValidatorSetGetRoundValidators.calledOnce();
		spyValidatorsRepositoryGetValidator.calledOnce();
		getValidatorIndexByWalletAddress.calledOnce();

		spyValidatorPrevote.calledOnce();
		spyValidatorPrevote.calledWith(1, 1, 1);

		spyPrevoteProcess.calledOnce();
		spyPrevoteProcess.calledWith(prevote);

		spyDispatch.calledOnce();
		spyDispatch.calledWith(Events.ConsensusEvent.ProposalAccepted, {
			blockNumber: 1,
			lockedRound: undefined,
			round: 1,
			step: Contracts.Consensus.Step.Prevote,
			validRound: undefined,
		});

		assert.equal(consensus.getStep(), Contracts.Consensus.Step.Prevote);
	});

	it("#onProposalLocked - broadcast prevote null, if block is valid and lockedRound is higher than validRound", async () => {});

	it("#onProposalLocked - should return if step === prevote", async ({ consensus, roundState, proposal }) => {
		proposal.validRound = 0;
		roundState = { ...roundState, round: 1 };
		consensus.setRound(1);
		consensus.setStep(Contracts.Consensus.Step.Prevote);
		await consensus.onProposalLocked(roundState);

		assert.equal(consensus.getStep(), Contracts.Consensus.Step.Prevote);
	});

	it("#onProposalLocked - should return if step === precommit", async ({ consensus, roundState, proposal }) => {
		proposal.validRound = 0;
		roundState = { ...roundState, round: 1 };
		consensus.setRound(1);
		consensus.setStep(Contracts.Consensus.Step.Precommit);
		await consensus.onProposalLocked(roundState);

		assert.equal(consensus.getStep(), Contracts.Consensus.Step.Precommit);
	});

	it("#onProposalLocked - should return if blockNumber doesn't match", async ({
		consensus,
		roundState,
		proposal,
	}) => {
		proposal.validRound = 0;
		roundState = { ...roundState, round: 1 };
		consensus.setRound(1);
		roundState = { ...roundState, blockNumber: 3 };
		await consensus.onProposalLocked(roundState);

		assert.equal(consensus.getStep(), Contracts.Consensus.Step.Propose);
	});

	it("#onProposalLocked - should return if round doesn't match", async ({ consensus, roundState, proposal }) => {
		proposal.validRound = 0;
		roundState = { ...roundState, round: 1 };
		await consensus.onProposalLocked(roundState);

		assert.equal(consensus.getStep(), Contracts.Consensus.Step.Propose);
	});

	it("#onProposalLocked - should return if proposal is undefined", async ({ consensus, roundState, proposal }) => {
		proposal.validRound = 0;
		roundState = { ...roundState, round: 1 };
		consensus.setRound(1);
		roundState.getProposal = () => {};
		await consensus.onProposalLocked(roundState);

		assert.equal(consensus.getStep(), Contracts.Consensus.Step.Propose);
	});

	it("#onProposalLocked - should return if validRound is undefined", async ({ consensus, roundState, proposal }) => {
		roundState = { ...roundState, round: 1 };
		consensus.setRound(1);
		await consensus.onProposalLocked(roundState);

		assert.equal(consensus.getStep(), Contracts.Consensus.Step.Propose);
	});

	it("#onProposalLocked - should return if validRound is higher than round", async ({
		consensus,
		roundState,
		proposal,
	}) => {
		proposal.validRound = 2;
		roundState = { ...roundState, round: 1 };
		consensus.setRound(1);
		await consensus.onProposalLocked(roundState);

		assert.equal(consensus.getStep(), Contracts.Consensus.Step.Propose);
	});

	it("#onProposalLocked - should return if validRound is equal to round", async ({
		consensus,
		roundState,
		proposal,
	}) => {
		proposal.validRound = 1;
		roundState = { ...roundState, round: 1 };
		consensus.setRound(1);
		await consensus.onProposalLocked(roundState);

		assert.equal(consensus.getStep(), Contracts.Consensus.Step.Propose);
	});

	it("#onMajorityPrevote - should set locked values, valid values and precommit, when step === prevote", async ({
		consensus,
		roundState,
		validatorSet,
		validatorsRepository,
		precommitProcessor,
		block,
		logger,
		proposal,
		proposer,
		eventDispatcher,
	}) => {
		const validator = {
			precommit: () => {},
		};

		const precommit = {
			blockNumber: 1,
			round: 0,
			serialized: Buffer.from(""),
		};

		const spyValidatorPrecommit = stub(validator, "precommit").resolvedValue(precommit);
		const spyGetRoundValidators = stub(validatorSet, "getRoundValidators").returnValue([proposer]);
		const spyGetValidator = stub(validatorsRepository, "getValidator").returnValue(validator);
		const spyPrecommitProcess = spy(precommitProcessor, "process");
		const getValidatorIndexByWalletAddress = stub(validatorSet, "getValidatorIndexByWalletAddress").returnValue(1);
		const spyLoggerInfo = spy(logger, "info");
		const spyDispatch = spy(eventDispatcher, "dispatch");

		roundState.getProcessorResult = () => ({ success: true });

		assert.undefined(consensus.getLockedRound());
		assert.undefined(consensus.getValidRound());

		consensus.setStep(Contracts.Consensus.Step.Prevote);
		await consensus.onMajorityPrevote(roundState);

		spyGetRoundValidators.calledOnce();
		spyGetValidator.calledOnce();
		spyGetValidator.calledWith(proposer.blsPublicKey);
		getValidatorIndexByWalletAddress.calledOnce();
		getValidatorIndexByWalletAddress.calledWith(proposer.address);
		spyValidatorPrecommit.calledOnce();
		spyValidatorPrecommit.calledWith(1, 1, 0, block.data.hash);
		spyPrecommitProcess.calledOnce();
		spyPrecommitProcess.calledWith(precommit);
		spyLoggerInfo.calledWith(
			`Received +2/3 prevotes for ${1}/${0} block hash: ${proposal.getData().block.data.hash}`,
		);
		spyDispatch.calledOnce();
		spyDispatch.calledWith(Events.ConsensusEvent.PrevotedProposal, {
			blockNumber: 1,
			lockedRound: 0,
			round: 0,
			step: Contracts.Consensus.Step.Precommit,
			validRound: 0,
		});

		assert.equal(consensus.getLockedRound(), 0);
		assert.equal(consensus.getValidRound(), 0);
		assert.equal(consensus.getStep(), Contracts.Consensus.Step.Precommit);
	});

	it("#onMajorityPrevote - should set valid values and precommit, when step === precommit", async ({
		consensus,
		roundState,
		eventDispatcher,
	}) => {
		const spyDispatch = spy(eventDispatcher, "dispatch");

		roundState.getProcessorResult = () => ({
			success: true,
		});

		assert.undefined(consensus.getLockedRound());
		assert.undefined(consensus.getValidRound());

		consensus.setStep(Contracts.Consensus.Step.Precommit);
		await consensus.onMajorityPrevote(roundState);

		assert.undefined(consensus.getLockedRound());
		assert.equal(consensus.getValidRound(), 0);
		assert.equal(consensus.getStep(), Contracts.Consensus.Step.Precommit);

		spyDispatch.calledOnce();
		spyDispatch.calledWith(Events.ConsensusEvent.PrevotedProposal, {
			blockNumber: 1,
			lockedRound: undefined,
			round: 0,
			step: Contracts.Consensus.Step.Precommit,
			validRound: 0,
		});
	});

	it("#onMajorityPrevote - should only be called once", async ({
		consensus,
		roundState,
		validatorSet,
		validatorsRepository,
		precommitProcessor,
		block,
		proposer,
	}) => {
		const validator = {
			precommit: () => {},
		};

		const precommit = {
			blockNumber: 1,
			round: 0,
			serialized: Buffer.from(""),
		};

		const spyValidatorPrecommit = stub(validator, "precommit").resolvedValue(precommit);
		const spyGetRoundValidators = stub(validatorSet, "getRoundValidators").returnValue([proposer]);
		const spyGetValidator = stub(validatorsRepository, "getValidator").returnValue(validator);
		const getValidatorIndexByWalletAddress = stub(validatorSet, "getValidatorIndexByWalletAddress").returnValue(1);
		const spyPrecommitProcess = spy(precommitProcessor, "process");

		roundState.getProcessorResult = () => ({ success: true });

		assert.undefined(consensus.getLockedRound());
		assert.undefined(consensus.getValidRound());

		consensus.setStep(Contracts.Consensus.Step.Prevote);
		await consensus.onMajorityPrevote(roundState);

		spyGetRoundValidators.calledOnce();
		spyGetValidator.calledOnce();
		spyGetValidator.calledWith(proposer.blsPublicKey);
		getValidatorIndexByWalletAddress.calledOnce();
		getValidatorIndexByWalletAddress.calledWith(proposer.address);
		spyValidatorPrecommit.calledOnce();
		spyValidatorPrecommit.calledWith(1, 1, 0, block.data.hash);
		spyPrecommitProcess.calledOnce();
		spyPrecommitProcess.calledWith(precommit);

		assert.equal(consensus.getLockedRound(), 0);
		assert.equal(consensus.getValidRound(), 0);
		assert.equal(consensus.getStep(), Contracts.Consensus.Step.Precommit);

		consensus.setStep(Contracts.Consensus.Step.Prevote);
		await consensus.onMajorityPrevote(roundState);

		spyGetRoundValidators.calledOnce();
		spyGetValidator.calledOnce();
		spyGetValidator.calledWith(proposer.blsPublicKey);
		spyValidatorPrecommit.calledOnce();
		spyValidatorPrecommit.calledWith(1, 1, 0, block.data.hash);
		spyPrecommitProcess.calledOnce();
		spyPrecommitProcess.calledWith(precommit);

		assert.equal(consensus.getLockedRound(), 0);
		assert.equal(consensus.getValidRound(), 0);
		assert.equal(consensus.getStep(), Contracts.Consensus.Step.Prevote);
	});

	it("#onMajorityPrevote - should skip precommit if already precommitted", async ({
		consensus,
		validatorSet,
		validatorsRepository,
		precommitProcessor,
		roundState,
		proposer,
	}) => {
		const validator = {
			precommit: () => {},
		};

		const precommit = {
			blockNumber: 2,
			round: 0,
			serialized: Buffer.from(""),
		};

		const spyValidatorPrecommit = stub(validator, "precommit").resolvedValue(precommit);
		const spyGetRoundValidators = stub(validatorSet, "getRoundValidators").returnValue([proposer]);
		const spyGetValidator = stub(validatorsRepository, "getValidator").returnValue(validator);
		const spyPrecommitProcess = spy(precommitProcessor, "process");

		roundState.getProcessorResult = () => ({ success: true });
		roundState.hasPrecommit = () => true;

		consensus.setStep(Contracts.Consensus.Step.Prevote);
		await consensus.onMajorityPrevote(roundState);

		spyGetRoundValidators.calledOnce();
		spyGetValidator.calledOnce();
		spyGetValidator.calledWith(proposer.blsPublicKey);

		spyValidatorPrecommit.neverCalled();
		spyPrecommitProcess.neverCalled();

		assert.equal(consensus.getStep(), Contracts.Consensus.Step.Precommit);
	});

	it("#onMajorityPrevote - should return if step === propose", async ({ consensus, roundState }) => {
		consensus.setStep(Contracts.Consensus.Step.Propose);
		await consensus.onMajorityPrevote(roundState);

		assert.undefined(consensus.getLockedRound());
		assert.undefined(consensus.getValidRound());
	});

	it("#onMajorityPrevote - should return if blockNumber doesn't match", async ({ consensus, roundState }) => {
		roundState = { ...roundState, blockNumber: 3 };
		consensus.setStep(Contracts.Consensus.Step.Prevote);
		await consensus.onMajorityPrevote(roundState);

		assert.undefined(consensus.getLockedRound());
		assert.undefined(consensus.getValidRound());
	});

	it("#onMajorityPrevote - should return if round doesn't match", async ({ consensus, roundState }) => {
		roundState = { ...roundState, round: 1 };
		consensus.setStep(Contracts.Consensus.Step.Prevote);
		await consensus.onMajorityPrevote(roundState);

		assert.undefined(consensus.getLockedRound());
		assert.undefined(consensus.getValidRound());
	});

	it("#onMajorityPrevote - should return if proposal is undefined", async ({ consensus, roundState }) => {
		roundState.getProposal = () => {};
		consensus.setStep(Contracts.Consensus.Step.Prevote);
		await consensus.onMajorityPrevote(roundState);

		assert.undefined(consensus.getLockedRound());
		assert.undefined(consensus.getValidRound());
	});

	it("#onMajorityPrevote - should return if processor result is false", async ({ consensus, roundState }) => {
		roundState.getProcessorResult = () => ({ success: false });
		consensus.setStep(Contracts.Consensus.Step.Prevote);
		await consensus.onMajorityPrevote(roundState);

		assert.undefined(consensus.getLockedRound());
		assert.undefined(consensus.getValidRound());
	});

	it("#onMajorityPrevoteAny - should schedule timeout prevote", async ({
		consensus,
		scheduler,
		roundState,
		eventDispatcher,
	}) => {
		const spyScheduleTimeout = spy(scheduler, "scheduleTimeoutPrevote");
		const spyDispatch = spy(eventDispatcher, "dispatch");

		consensus.setStep(Contracts.Consensus.Step.Prevote);
		await consensus.onMajorityPrevoteAny(roundState);

		spyScheduleTimeout.calledOnce();
		spyScheduleTimeout.calledWith(1, 0);
		assert.equal(consensus.getStep(), Contracts.Consensus.Step.Prevote);

		spyDispatch.calledOnce();
		spyDispatch.calledWith(Events.ConsensusEvent.PrevotedAny, {
			blockNumber: 1,
			lockedRound: undefined,
			round: 0,
			step: Contracts.Consensus.Step.Prevote,
			validRound: undefined,
		});
	});

	it("#onMajorityPrevoteAny - should return if step !== prevote", async ({
		consensus,
		scheduler,
		roundState,
		eventDispatcher,
	}) => {
		const spyScheduleTimeout = spy(scheduler, "scheduleTimeoutPrevote");
		const spyDispatch = spy(eventDispatcher, "dispatch");

		consensus.setStep(Contracts.Consensus.Step.Propose);
		await consensus.onMajorityPrevoteAny(roundState);

		spyScheduleTimeout.neverCalled();
		spyDispatch.neverCalled();
		assert.equal(consensus.getStep(), Contracts.Consensus.Step.Propose);
	});

	it("#onMajorityPrevoteAny - should return if blockNumber doesn't match", async ({
		consensus,
		scheduler,
		roundState,
		eventDispatcher,
	}) => {
		const spyScheduleTimeout = spy(scheduler, "scheduleTimeoutPrevote");
		const spyDispatch = spy(eventDispatcher, "dispatch");

		roundState = { ...roundState, blockNumber: 3 };
		consensus.setStep(Contracts.Consensus.Step.Prevote);
		await consensus.onMajorityPrevoteAny(roundState);

		spyScheduleTimeout.neverCalled();
		spyDispatch.neverCalled();
		assert.equal(consensus.getStep(), Contracts.Consensus.Step.Prevote);
	});

	it("#onMajorityPrevoteAny - should return if round doesn't match", async ({
		consensus,
		scheduler,
		roundState,
		eventDispatcher,
	}) => {
		const spyScheduleTimeout = spy(scheduler, "scheduleTimeoutPrevote");
		const spyDispatch = spy(eventDispatcher, "dispatch");

		roundState = { ...roundState, round: 1 };
		consensus.setStep(Contracts.Consensus.Step.Prevote);
		await consensus.onMajorityPrevoteAny(roundState);

		spyScheduleTimeout.neverCalled();
		spyDispatch.neverCalled();
		assert.equal(consensus.getStep(), Contracts.Consensus.Step.Prevote);
	});

	it("#onMajorityPrevoteAny - should not dispatch if timeout is scheduled", async ({
		consensus,
		scheduler,
		roundState,
		eventDispatcher,
	}) => {
		const spyScheduleTimeout = stub(scheduler, "scheduleTimeoutPrevote").returnValue(false);
		const spyDispatch = spy(eventDispatcher, "dispatch");

		consensus.setStep(Contracts.Consensus.Step.Prevote);
		await consensus.onMajorityPrevoteAny(roundState);

		spyScheduleTimeout.calledOnce();
		spyScheduleTimeout.calledWith(1, 0);
		assert.equal(consensus.getStep(), Contracts.Consensus.Step.Prevote);

		spyDispatch.neverCalled();
	});

	it("#onMajorityPrevoteNull - should precommit", async ({
		consensus,
		validatorSet,
		validatorsRepository,
		precommitProcessor,
		roundState,
		proposer,
		eventDispatcher,
	}) => {
		const validator = {
			precommit: () => {},
		};

		const precommit = {
			blockNumber: 1,
			round: 0,
			serialized: Buffer.from(""),
		};

		const spyValidatorPrecommit = stub(validator, "precommit").resolvedValue(precommit);
		const spyGetRoundValidators = stub(validatorSet, "getRoundValidators").returnValue([proposer]);
		const spyGetValidator = stub(validatorsRepository, "getValidator").returnValue(validator);
		const getValidatorIndexByWalletAddress = stub(validatorSet, "getValidatorIndexByWalletAddress").returnValue(1);
		const spyPrecommitProcess = spy(precommitProcessor, "process");
		const spyDispatch = spy(eventDispatcher, "dispatch");

		consensus.setStep(Contracts.Consensus.Step.Prevote);
		await consensus.onMajorityPrevoteNull(roundState);

		spyGetRoundValidators.calledOnce();
		spyGetValidator.calledOnce();
		spyGetValidator.calledWith(proposer.blsPublicKey);
		getValidatorIndexByWalletAddress.calledOnce();
		getValidatorIndexByWalletAddress.calledWith(proposer.address);

		spyValidatorPrecommit.calledOnce();
		spyValidatorPrecommit.calledWith(1, 1, 0);

		spyPrecommitProcess.calledOnce();
		spyPrecommitProcess.calledWith(precommit);

		spyDispatch.calledOnce();
		spyDispatch.calledWith(Events.ConsensusEvent.PrevotedNull, {
			blockNumber: 1,
			lockedRound: undefined,
			round: 0,
			step: Contracts.Consensus.Step.Precommit,
			validRound: undefined,
		});

		assert.equal(consensus.getStep(), Contracts.Consensus.Step.Precommit);
	});

	it("#onMajorityPrevoteNull - should return if step !== prevote", async ({ consensus, roundState }) => {
		consensus.setStep(Contracts.Consensus.Step.Precommit);
		await consensus.onMajorityPrevoteNull(roundState);

		assert.equal(consensus.getStep(), Contracts.Consensus.Step.Precommit);
	});

	it("#onMajorityPrevoteNull - should return if blockNumber doesn't match", async ({ consensus, roundState }) => {
		roundState = { ...roundState, blockNumber: 3 };
		consensus.setStep(Contracts.Consensus.Step.Prevote);
		await consensus.onMajorityPrevoteNull(roundState);

		assert.equal(consensus.getStep(), Contracts.Consensus.Step.Prevote);
	});

	it("#onMajorityPrevoteNull - should return if round doesn't match", async ({ consensus, roundState }) => {
		roundState = { ...roundState, round: 1 };
		consensus.setStep(Contracts.Consensus.Step.Prevote);
		await consensus.onMajorityPrevoteNull(roundState);

		assert.equal(consensus.getStep(), Contracts.Consensus.Step.Prevote);
	});

	it("#onMajorityPrecommitAny - should schedule timeout precommit", async ({
		consensus,
		scheduler,
		roundState,
		eventDispatcher,
	}) => {
		const spyScheduleTimeout = spy(scheduler, "scheduleTimeoutPrecommit");
		const spyDispatch = spy(eventDispatcher, "dispatch");

		assert.equal(consensus.getStep(), Contracts.Consensus.Step.Propose);

		await consensus.onMajorityPrecommitAny(roundState);

		spyScheduleTimeout.calledOnce();
		spyScheduleTimeout.calledWith(1, 0);

		spyDispatch.calledOnce();
		spyDispatch.calledWith(Events.ConsensusEvent.PrecommitedAny, {
			blockNumber: 1,
			lockedRound: undefined,
			round: 0,
			step: Contracts.Consensus.Step.Propose,
			validRound: undefined,
		});
		assert.equal(consensus.getStep(), Contracts.Consensus.Step.Propose);
	});

	it("#onMajorityPrecommitAny - should return if blockNumber doesn't match", async ({
		consensus,
		scheduler,
		roundState,
		eventDispatcher,
	}) => {
		const spyScheduleTimeout = spy(scheduler, "scheduleTimeoutPrecommit");
		const spyDispatch = spy(eventDispatcher, "dispatch");

		assert.equal(consensus.getStep(), Contracts.Consensus.Step.Propose);

		roundState = { ...roundState, blockNumber: 3 };
		await consensus.onMajorityPrecommitAny(roundState);

		spyScheduleTimeout.neverCalled();
		spyDispatch.neverCalled();
	});

	it("#onMajorityPrecommitAny - should return if round doesn't match", async ({
		consensus,
		scheduler,
		roundState,
		eventDispatcher,
	}) => {
		const spyScheduleTimeout = spy(scheduler, "scheduleTimeoutPrecommit");
		const spyDispatch = spy(eventDispatcher, "dispatch");

		assert.equal(consensus.getStep(), Contracts.Consensus.Step.Propose);

		roundState = { ...roundState, round: 2 };
		await consensus.onMajorityPrecommitAny(roundState);

		spyScheduleTimeout.neverCalled();
		spyDispatch.neverCalled();
	});

	it("#onMajorityPrecommitAny - should not dispatch if timeout is scheduled", async ({
		consensus,
		scheduler,
		roundState,
		eventDispatcher,
	}) => {
		const spyScheduleTimeout = stub(scheduler, "scheduleTimeoutPrecommit").returnValue(false);
		const spyDispatch = spy(eventDispatcher, "dispatch");

		assert.equal(consensus.getStep(), Contracts.Consensus.Step.Propose);

		await consensus.onMajorityPrecommitAny(roundState);

		spyScheduleTimeout.calledOnce();
		spyScheduleTimeout.calledWith(1, 0);
		spyDispatch.neverCalled();
	});

	it("#onMajorityPrecommit - should commit & increase blockNumber", async ({
		consensus,
		blockProcessor,
		roundState,
		roundStateRepository,
		logger,
		proposal,
		eventDispatcher,
	}) => {
		const fakeTimers = clock();

		const spyRoundStateGetBlock = stub(roundState, "getBlock").returnValue(proposal.getData().block);
		const spyRoundStateRepositoryClear = stub(roundStateRepository, "clear");
		const spyBlockProcessorCommit = spy(blockProcessor, "commit");
		const spyConsensusStartRound = stub(consensus, "startRound").callsFake(() => {});
		const spyLoggerInfo = spy(logger, "info");
		const spyDispatch = spy(eventDispatcher, "dispatch");

		roundState.getProcessorResult = () => ({ success: true });

		assert.equal(consensus.getBlockNumber(), 1);
		void consensus.onMajorityPrecommit(roundState);
		await fakeTimers.nextAsync();

		spyRoundStateGetBlock.calledOnce();
		spyBlockProcessorCommit.calledOnce();
		spyBlockProcessorCommit.calledWith(roundState);
		spyConsensusStartRound.calledOnce();
		spyConsensusStartRound.calledWith(0);
		spyRoundStateRepositoryClear.calledOnce();
		spyLoggerInfo.calledWith(
			`Received +2/3 precommits for ${1}/${0} block hash: ${proposal.getData().block.data.hash}`,
		);
		spyDispatch.calledOnce();
		spyDispatch.calledWith(Events.ConsensusEvent.PrecommitedProposal, {
			blockNumber: 1,
			lockedRound: undefined,
			round: 0,
			step: Contracts.Consensus.Step.Propose,
			validRound: undefined,
		});
		assert.equal(consensus.getBlockNumber(), 2);
	});

	it("#onMajorityPrecommit - should terminate if processor throws", async ({
		sandbox,
		consensus,
		blockProcessor,
		roundState,
		proposal,
	}) => {
		const fakeTimers = clock();

		const error = new Error("error");
		const spyAppTerminate = stub(sandbox.app, "terminate").callsFake(() => {});
		const spyRoundStateGetBlock = stub(roundState, "getBlock").returnValue(proposal.getData().block);
		const spyBlockProcessorCommit = stub(blockProcessor, "commit").rejectedValue(error);

		roundState.getProcessorResult = () => ({ success: true });

		assert.equal(consensus.getBlockNumber(), 1);
		void consensus.onMajorityPrecommit(roundState);
		await fakeTimers.nextAsync();

		spyRoundStateGetBlock.calledOnce();
		spyBlockProcessorCommit.calledOnce();
		spyBlockProcessorCommit.calledWith(roundState);
		spyAppTerminate.calledOnce();
		spyAppTerminate.calledWith("Failed to commit block", error);
	});

	it("#onMajorityPrecommit - should log and do nothing if result is invalid", async ({
		consensus,
		blockProcessor,
		roundState,
		logger,
		block,
		roundStateRepository,
		proposal,
	}) => {
		const fakeTimers = clock();

		const spyRoundStateGetBlock = stub(roundState, "getBlock").returnValue(proposal.getData().block);
		const spyBlockProcessorCommit = spy(blockProcessor, "commit");
		const spyRoundStateRepositoryClear = stub(roundStateRepository, "clear");
		const spyConsensusStartRound = stub(consensus, "startRound").callsFake(() => {});
		const spyLoggerInfo = spy(logger, "info");

		roundState.getProcessorResult = () => ({ success: false });

		assert.equal(consensus.getBlockNumber(), 1);
		void consensus.onMajorityPrecommit(roundState);
		await fakeTimers.nextAsync();

		spyRoundStateGetBlock.calledOnce();
		spyBlockProcessorCommit.neverCalled();
		spyConsensusStartRound.neverCalled();
		spyRoundStateRepositoryClear.neverCalled();
		spyLoggerInfo.calledWith(
			`Block ${block.data.hash} on block number ${1} received +2/3 precommits but is invalid`,
		);
		assert.equal(consensus.getBlockNumber(), 1);
	});

	it("#onMajorityPrecommit - should be called only once", async ({
		consensus,
		blockProcessor,
		roundState,
		proposal,
	}) => {
		const fakeTimers = clock();

		const spyRoundStateGetBlock = stub(roundState, "getBlock").returnValue(proposal.getData().block);
		const spyBlockProcessorCommit = spy(blockProcessor, "commit");
		const spyConsensusStartRound = stub(consensus, "startRound").callsFake(() => {});

		roundState.getProcessorResult = () => ({ success: true });

		assert.equal(consensus.getBlockNumber(), 1);
		void consensus.onMajorityPrecommit(roundState);
		await fakeTimers.nextAsync();

		spyBlockProcessorCommit.calledOnce();
		spyConsensusStartRound.calledOnce();
		assert.equal(consensus.getBlockNumber(), 2);

		await consensus.onMajorityPrecommit(roundState);

		spyRoundStateGetBlock.calledOnce();
		spyBlockProcessorCommit.calledOnce();
		spyConsensusStartRound.calledOnce();
		assert.equal(consensus.getBlockNumber(), 2);
	});

	it("#onMajorityPrecommit - should return if blockNumber doesn't match", async ({
		consensus,
		blockProcessor,
		roundState,
	}) => {
		const spyBlockProcessorCommit = spy(blockProcessor, "commit");
		const spyConsensusStartRound = stub(consensus, "startRound").callsFake(() => {});

		roundState.getProcessorResult = () => ({ success: true });

		roundState = { ...roundState, blockNumber: 2 };
		await consensus.onMajorityPrecommit(roundState);

		spyBlockProcessorCommit.neverCalled();
		spyConsensusStartRound.neverCalled();
	});

	// TODO: fix
	// it("#onMajorityPrecommit - should return if proposal is undefined", async ({
	// 	consensus,
	// 	blockProcessor,
	// 	roundState,
	// }) => {
	// 	const spyBlockProcessorCommit = spy(blockProcessor, "commit");
	// 	const spyConsensusStartRound = stub(consensus, "startRound").callsFake(() => {});

	// 	roundState.getProcessorResult = () => ({ success: true });

	// 	roundState.getProposal = () => undefined;
	// 	await consensus.onMajorityPrecommit(roundState);

	// 	spyBlockProcessorCommit.neverCalled();
	// 	spyConsensusStartRound.neverCalled();
	// });

	it("#onMinorityWithHigherRound - should start new round", async ({ consensus, roundState }) => {
		const fakeTimers = clock();
		const spyConsensusStartRound = stub(consensus, "startRound").callsFake(() => {});

		roundState = { ...roundState, round: 1 };
		void consensus.onMinorityWithHigherRound(roundState);
		await fakeTimers.nextAsync();

		spyConsensusStartRound.calledWith(roundState.round);
	});

	it("#onMinorityWithHigherRound - should return if blockNumber doesn't match", async ({ consensus, roundState }) => {
		const fakeTimers = clock();
		const spyConsensusStartRound = stub(consensus, "startRound").callsFake(() => {});

		roundState = { ...roundState, blockNumber: 3 };
		void consensus.onMinorityWithHigherRound(roundState);
		await fakeTimers.nextAsync();

		spyConsensusStartRound.neverCalled();
	});

	it("#onMinorityWithHigherRound - should return if round is not greater", async ({ consensus, roundState }) => {
		const fakeTimers = clock();
		const spyConsensusStartRound = stub(consensus, "startRound").callsFake(() => {});

		void consensus.onMinorityWithHigherRound(roundState);
		await fakeTimers.nextAsync();

		spyConsensusStartRound.neverCalled();
	});

	it("#onTimeoutPropose - should prevote null", async ({
		consensus,
		validatorSet,
		validatorsRepository,
		prevoteProcessor,
		proposer,
	}) => {
		const prevote = {
			blockNumber: 1,
			round: 0,
			serialized: Buffer.from(""),
		};

		const validator = {
			prevote: () => {},
		};
		const spyValidatorPrevote = stub(validator, "prevote").resolvedValue(prevote);

		const spyValidatorSetGetRoundValidators = stub(validatorSet, "getRoundValidators").returnValue([proposer]);
		const spyValidatorsRepositoryGetValidator = stub(validatorsRepository, "getValidator").returnValue(validator);
		const getValidatorIndexByWalletAddress = stub(validatorSet, "getValidatorIndexByWalletAddress").returnValue(1);
		const spyPrevoteProcess = spy(prevoteProcessor, "process");

		await consensus.onTimeoutPropose(1, 0);

		spyValidatorSetGetRoundValidators.calledOnce();
		spyValidatorsRepositoryGetValidator.calledOnce();
		getValidatorIndexByWalletAddress.calledOnce();

		spyValidatorPrevote.calledOnce();
		spyValidatorPrevote.calledWith(1, 1, 0);

		spyPrevoteProcess.calledOnce();
		spyPrevoteProcess.calledWith(prevote);

		assert.equal(consensus.getStep(), Contracts.Consensus.Step.Prevote);
	});

	it("#onTimeoutPropose - should return if step === prevote", async ({ consensus, prevoteProcessor }) => {
		const spyPrevoteProcess = spy(prevoteProcessor, "process");

		consensus.setStep(Contracts.Consensus.Step.Prevote);
		await consensus.onTimeoutPropose(1, 0);

		spyPrevoteProcess.neverCalled();
		assert.equal(consensus.getStep(), Contracts.Consensus.Step.Prevote);
	});

	it("#onTimeoutPropose - should return if step === precommit", async ({ consensus, prevoteProcessor }) => {
		const spyPrevoteProcess = spy(prevoteProcessor, "process");

		consensus.setStep(Contracts.Consensus.Step.Precommit);
		await consensus.onTimeoutPropose(1, 0);

		spyPrevoteProcess.neverCalled();
		assert.equal(consensus.getStep(), Contracts.Consensus.Step.Precommit);
	});

	it("#onTimeoutPropose - should return if blockNumber doesn't match", async ({ consensus, prevoteProcessor }) => {
		const spyPrevoteProcess = spy(prevoteProcessor, "process");

		await consensus.onTimeoutPropose(2, 0);

		spyPrevoteProcess.neverCalled();
		assert.equal(consensus.getStep(), Contracts.Consensus.Step.Propose);
	});

	it("#onTimeoutPropose - should return if round doesn't match", async ({ consensus, prevoteProcessor }) => {
		const spyPrevoteProcess = spy(prevoteProcessor, "process");

		await consensus.onTimeoutPropose(2, 1);

		spyPrevoteProcess.neverCalled();
		assert.equal(consensus.getStep(), Contracts.Consensus.Step.Propose);
	});

	it("#onTimeoutPrevote - should precommit null", async ({
		consensus,
		validatorSet,
		validatorsRepository,
		precommitProcessor,
		proposer,
	}) => {
		const validator = {
			precommit: () => {},
		};

		const precommit = {
			blockNumber: 1,
			round: 0,
		};

		const spyValidatorPrecommit = stub(validator, "precommit").resolvedValue(precommit);
		const spyGetRoundValidators = stub(validatorSet, "getRoundValidators").returnValue([proposer]);
		const spyGetValidator = stub(validatorsRepository, "getValidator").returnValue(validator);
		const getValidatorIndexByWalletAddress = stub(validatorSet, "getValidatorIndexByWalletAddress").returnValue(1);
		const spyPrevoteProcess = spy(precommitProcessor, "process");

		consensus.setStep(Contracts.Consensus.Step.Prevote);
		await consensus.onTimeoutPrevote(1, 0);

		spyGetRoundValidators.calledOnce();
		spyGetValidator.calledOnce();
		spyGetValidator.calledWith(proposer.blsPublicKey);
		getValidatorIndexByWalletAddress.calledOnce();
		getValidatorIndexByWalletAddress.calledWith(proposer.address);

		spyValidatorPrecommit.calledOnce();
		spyValidatorPrecommit.calledWith(1, 1, 0);

		spyPrevoteProcess.calledOnce();
		spyPrevoteProcess.calledWith(precommit);

		assert.equal(consensus.getStep(), Contracts.Consensus.Step.Precommit);
	});

	it("#onTimeoutPrevote - should return if step === propose", async ({ consensus, precommitProcessor }) => {
		const spyPrecommitProcess = spy(precommitProcessor, "process");

		consensus.setStep(Contracts.Consensus.Step.Propose);
		await consensus.onTimeoutPrevote(2, 0);

		spyPrecommitProcess.neverCalled();
		assert.equal(consensus.getStep(), Contracts.Consensus.Step.Propose);
	});

	it("#onTimeoutPrevote - should return if step === precommit", async ({ consensus, precommitProcessor }) => {
		const spyPrecommitProcess = spy(precommitProcessor, "process");

		consensus.setStep(Contracts.Consensus.Step.Precommit);
		await consensus.onTimeoutPrevote(2, 0);

		spyPrecommitProcess.neverCalled();
		assert.equal(consensus.getStep(), Contracts.Consensus.Step.Precommit);
	});

	it("#onTimeoutPrevote - should return if blockNumber doesn't match", async ({ consensus, precommitProcessor }) => {
		const spyPrecommitProcess = spy(precommitProcessor, "process");

		consensus.setStep(Contracts.Consensus.Step.Prevote);
		await consensus.onTimeoutPrevote(3, 0);

		spyPrecommitProcess.neverCalled();
		assert.equal(consensus.getStep(), Contracts.Consensus.Step.Prevote);
	});

	it("#onTimeoutPrevote - should return if round doesn't match", async ({ consensus, precommitProcessor }) => {
		const spyPrecommitProcess = spy(precommitProcessor, "process");

		consensus.setStep(Contracts.Consensus.Step.Prevote);
		await consensus.onTimeoutPrevote(2, 1);

		spyPrecommitProcess.neverCalled();
		assert.equal(consensus.getStep(), Contracts.Consensus.Step.Prevote);
	});

	each(
		"#onTimeoutPrecommit - should start next round",
		async ({ context: { consensus }, dataset: step }: { context: Context; dataset: Contracts.Consensus.Step }) => {
			const fakeTimers = clock();
			const spyConsensusStartRound = stub(consensus, "startRound").callsFake(() => {});

			consensus.setStep(step);
			void consensus.onTimeoutPrecommit(1, 0);
			await fakeTimers.nextAsync();

			spyConsensusStartRound.calledOnce();
			spyConsensusStartRound.calledWith(1);
		},
		[Contracts.Consensus.Step.Propose, Contracts.Consensus.Step.Prevote, Contracts.Consensus.Step.Precommit],
	);

	it("#onTimeoutPrecommit - should return if blockNumber doesn't match", async ({ consensus }) => {
		const fakeTimers = clock();
		const spyConsensusStartRound = stub(consensus, "startRound").callsFake(() => {});

		void consensus.onTimeoutPrecommit(3, 0);
		await fakeTimers.nextAsync();

		spyConsensusStartRound.neverCalled();
	});

	it("#onTimeoutPrecommit - should return if round doesn't match", async ({ consensus }) => {
		const fakeTimers = clock();
		const spyConsensusStartRound = stub(consensus, "startRound").callsFake(() => {});

		void consensus.onTimeoutPrecommit(2, 1);
		await fakeTimers.nextAsync();

		spyConsensusStartRound.neverCalled();
	});
});
