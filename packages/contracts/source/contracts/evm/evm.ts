export interface GenesisInfo {
	readonly account: string;
	readonly deployerAccount: string;
	readonly validatorContract: string;
	readonly usernameContract: string;
	readonly initialBlockNumber: bigint;
	readonly initialSupply: bigint;
}

export interface ProcessResult {
	readonly receipt: TransactionReceipt;
}

export interface SimulateResult {
	readonly receipt: TransactionReceipt;
}

export interface ViewResult {
	readonly success: boolean;
	readonly output?: Buffer;
}

export interface PreverifyTransactionResult {
	readonly success: boolean;
	readonly initialGasUsed: bigint;
	readonly error?: string;
}

export type CommitResult = Record<string, any>;

export interface AccountInfo {
	readonly nonce: bigint;
	readonly balance: bigint;
}

export interface AccountInfoExtended extends AccountInfo {
	readonly address: string;
	readonly legacyAttributes: LegacyAttributes;
}

export interface ImportLegacyColdWallet {
	readonly address: string;
	readonly balance: bigint;
	readonly legacyAttributes: LegacyAttributes;
}

export interface LegacyColdWallet {
	readonly address: string;
	readonly balance: bigint;
	readonly legacyAttributes: LegacyAttributes;
	readonly mergeInfo?: AccountMergeInfo;
}

export interface AccountMergeInfo {
	readonly address: string;
	readonly txHash: string;
}

export interface LegacyAttributes {
	readonly secondPublicKey?: string;
	readonly multiSignature?: LegacyMultiSignatureAttribute;
}

export interface LegacyMultiSignatureAttribute {
	readonly min: number;
	readonly publicKeys: string[];
}

export interface AccountUpdate {
	readonly address: string;
	readonly balance: bigint;
	readonly nonce: bigint;

	readonly vote?: string;
	readonly unvote?: string;
	readonly username?: string;
	readonly usernameResigned: boolean;
	readonly legacyMergeInfo?: AccountMergeInfo;
}

export interface AccountUpdateContext {
	readonly account: string;
	readonly commitKey: CommitKey;
	readonly nonce: bigint;
}

export interface PrepareNextCommitContext {
	readonly commitKey: CommitKey;
}

export interface PreverifyTransactionContext {
	readonly from: string;
	readonly legacyAddress?: string;
	/** Omit recipient when deploying a contract */
	readonly to?: string;
	readonly gasLimit: bigint;
	readonly value: bigint;
	readonly gasPrice: bigint;
	readonly nonce: bigint;
	readonly data: Buffer;
	readonly txHash: string;
	readonly index?: number;
	readonly specId: SpecId;
	readonly blockGasLimit: bigint;
}

export interface TransactionContext {
	readonly from: string;
	readonly legacyAddress?: string;
	/** Omit recipient when deploying a contract */
	readonly to?: string;
	readonly gasLimit: bigint;
	readonly value: bigint;
	readonly gasPrice: bigint;
	readonly nonce: bigint;
	readonly data: Buffer;
	readonly blockContext: BlockContext;
	readonly txHash: string;
	readonly index?: number;
	readonly specId: SpecId;
}

export interface TransactionSimulateContext {
	readonly from: string;
	/** Omit recipient when deploying a contract */
	readonly to?: string;
	readonly gasLimit: bigint;
	readonly value: bigint;
	readonly gasPrice: bigint;
	readonly nonce: bigint;
	readonly data: Buffer;
	readonly blockContext: BlockContext;
	readonly specId: SpecId;
}

export interface TransactionViewContext {
	readonly from: string;
	readonly to: string;
	readonly data: Buffer;
	readonly specId: SpecId;
	readonly gasLimit?: bigint;
}

export interface GetAccountsResult {
	readonly nextOffset?: bigint;
	readonly accounts: AccountInfoExtended[];
}

export interface GetLegacyColdWalletsResult {
	readonly nextOffset?: bigint;
	readonly wallets: LegacyColdWallet[];
}

export interface GetReceiptsResult {
	readonly nextOffset?: bigint;
	readonly receipts: TransactionReceipt[];
}

export interface GetReceiptResult {
	readonly receipt?: TransactionReceipt;
}

export interface BlockContext {
	readonly commitKey: CommitKey;
	readonly gasLimit: bigint;
	readonly timestamp: bigint;
	readonly validatorAddress: string;
}

export interface CalculateRoundValidatorsContext {
	readonly commitKey: CommitKey;
	readonly timestamp: bigint;
	readonly validatorAddress: string;
	readonly roundValidators: bigint;
	readonly specId: SpecId;
}
export interface UpdateRewardsAndVotesContext {
	readonly commitKey: CommitKey;
	readonly timestamp: bigint;
	readonly validatorAddress: string;
	readonly blockReward: bigint;
	readonly specId: SpecId;
}

export interface CommitKey {
	readonly blockNumber: bigint;
	readonly round: bigint;
	readonly blockHash?: string;
}

export interface TransactionReceipt {
	readonly gasUsed: bigint;
	readonly gasRefunded: bigint;
	readonly status: number;
	readonly contractAddress?: string;
	readonly logs: any;
	readonly output?: Buffer;

	// Only present when reading receipts explicitly via `get_receipts`
	readonly blockNumber?: bigint;
	readonly txHash?: string;
}

// Supported EVM specs
// https://github.com/ethereum/execution-specs
export enum SpecId {
	SHANGHAI = "Shanghai",
	LATEST = "Latest",
}
