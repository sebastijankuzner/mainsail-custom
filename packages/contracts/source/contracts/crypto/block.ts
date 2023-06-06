import { BigNumber } from "@mainsail/utils";

import { ITransaction, ITransactionData, ITransactionJson } from "./transactions";

export interface IBlockVerification {
	verified: boolean;
	errors: string[];
	containsMultiSignatures: boolean;
}

export type IBlockHeader = Exclude<IBlockData, "transactions">;

export interface IBlock {
	data: IBlockData;
	header: IBlockHeader;
	serialized: string;
	transactions: ITransaction[];
}

export interface IBlockData {
	id: string;

	timestamp: number;
	version: number;
	height: number;
	previousBlock: string;
	numberOfTransactions: number;
	totalAmount: BigNumber;
	totalFee: BigNumber;
	reward: BigNumber;
	payloadLength: number;
	payloadHash: string;
	generatorPublicKey: string;

	serialized?: string;
	transactions: ITransactionData[];
}

export interface IBlockJson {
	id: string;

	timestamp: number;
	version: number;
	height: number;
	previousBlock: string;
	numberOfTransactions: number;
	totalAmount: string;
	totalFee: string;
	reward: string;
	payloadLength: number;
	payloadHash: string;
	generatorPublicKey: string;

	serialized?: string;
	transactions: ITransactionJson[];
}

export interface IBlockDeserializer {
	deserialize(serialized: Buffer): Promise<{ data: IBlockData; transactions: ITransaction[] }>;
	deserializeHeader(serialized: Buffer): Promise<IBlockHeader>;
}

export interface IBlockFactory {
	make(data: any): Promise<IBlock>;

	fromHex(hex: string): Promise<IBlock>;

	fromBytes(buff: Buffer): Promise<IBlock>;

	fromJson(json: IBlockJson): Promise<IBlock>;

	fromData(data: IBlockData): Promise<IBlock>;
}

export type IBlockDataSerializable = Omit<IBlockData, "id">;

export interface IBlockSerializer {
	size(block: IBlock): number;

	serialize(block: IBlockDataSerializable): Promise<Buffer>;

	serializeWithTransactions(block: IBlockDataSerializable): Promise<Buffer>;
}

export interface IBlockVerifier {
	verify(block: IBlock): Promise<IBlockVerification>;
}