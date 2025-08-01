import { SpecId } from "../evm/evm.js";
import { CommitJson } from "./commit.js";

export type NetworkConfig = {
	genesisBlock: CommitJson;
	milestones: Milestone[];
	network: Network;
};

export type NetworkConfigPartial = {
	genesisBlock: CommitJson;
	milestones: MilestonePartial[];
	network: Network;
};

export type Network = {
	name: string;
	pubKeyHash: number;
	nethash: string;
	chainId: number;
	wif: number;
	slip44: number;
	client: {
		token: string;
		symbol: string;
		explorer: string;
	};
};

export type MilestoneBlock = {
	maxPayload: number;
	maxGasLimit: number;
	version: number;
};
export type MilestoneSatoshi = {
	decimals: number;
	denomination: number;
};
export type MilestoneTimeouts = {
	tolerance: number;
	blockTime: number;
	blockPrepareTime: number;
	stageTimeout: number;
	stageTimeoutIncrease: number;
};

export type MilestoneGas = {
	minimumGasLimit: number;
	maximumGasLimit: number;
	minimumGasPrice: number;
	maximumGasPrice: number;
};

export type MilestoneSnapshot = {
	snapshotHash: string;
	previousGenesisBlockHash: string;
};

export type Milestone = {
	height: number;
	roundValidators: number;
	address: Record<string, any>;
	block: MilestoneBlock;
	epoch: string;
	evmSpec: SpecId;
	gas: MilestoneGas;
	reward: string;
	satoshi: MilestoneSatoshi;
	timeouts: MilestoneTimeouts;
	snapshot?: MilestoneSnapshot;
	validatorRegistrationFee: string;
};

export type MilestonePartial = Partial<Milestone> & {
	height: number;
};

export type MilestoneKey = keyof Milestone;

export type MilestoneDiff = { [key in MilestoneKey]?: string };

export type MilestoneSearchResult<T> = {
	found: boolean;
	height: number;
	data: T | null;
};
