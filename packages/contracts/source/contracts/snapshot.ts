import { Commit } from "./crypto/index.js";
import { CommitKey } from "./evm/evm.js";

export interface LegacyImporter {
	run(genesisBlock: Commit): Promise<LegacyImportResult>;
	prepare(snapshotPath: string): Promise<void>;
	prepareRestore(): Promise<void>;
	import(options: LegacyImportOptions): Promise<LegacyImportResult>;

	wallets: ImportedLegacyWallet[];
	validators: ImportedLegacyValidator[];
	voters: ImportedLegacyVoter[];
	snapshotHash: string;
	genesisBlockNumber: bigint;
	previousGenesisBlockHash: string;
	totalSupply: bigint;
	result: LegacyImportResult | undefined;
}

export interface LegacyImportOptions {
	readonly timestamp: number;
	readonly commitKey: CommitKey;
	readonly mockFakeValidatorBlsKeys?: boolean;
}

export interface LegacyImportResult {
	readonly initialTotalSupply: bigint;
	readonly importedValidatorsWithBlsKey: number;
	readonly importedValidatorsWithoutBlsKey: number;
	readonly importedUsernames: number;
	readonly importedVoters: number;
}

export interface ImportedLegacyWallet {
	readonly arkAddress: string;
	readonly ethAddress?: string;
	readonly publicKey?: string;
	readonly balance: bigint; // WEI - 18 decimals

	// Legacy attributes for the 'legacy' storage
	readonly legacyAttributes: ImportedLegacyWalletAttributes;
}

export interface ImportedLegacyWalletAttributes {
	readonly secondPublicKey?: string;
	readonly multiSignature?: ImportedLegacyMultiSignatureAttribute;
}

export interface ImportedLegacyMultiSignatureAttribute {
	readonly min: number;
	readonly publicKeys: string[];
}

export interface ImportedLegacyVoter {
	readonly arkAddress: string;
	readonly ethAddress?: string;
	readonly publicKey: string;
	readonly vote: string;
}

export interface ImportedLegacyValidator {
	readonly arkAddress: string;
	readonly ethAddress?: string;
	readonly publicKey: string;
	readonly isResigned: boolean;

	username: string;
	blsPublicKey?: string;
}
