import { AggregatedSignature, Block, KeyPair, Precommit, Prevote, Proposal } from "./crypto/index.js";

export interface ValidatorKeyPair {
	readonly publicKey: string;
	getKeyPair(): Promise<KeyPair>;
}

export interface Validator {
	configure(keyPair: ValidatorKeyPair): Validator;
	getConsensusPublicKey(): string;
	prepareBlock(generatorAddress: string, round: number, timestamp: number): Promise<Block>;
	propose(
		validatorIndex: number,
		round: number,
		validRound: number | undefined,
		block: Block,
		lockProof?: AggregatedSignature,
	): Promise<Proposal>;
	prevote(
		validatorIndex: number,
		blockHeight: number,
		round: number,
		blockHash: string | undefined,
	): Promise<Prevote>;
	precommit(
		validatorIndex: number,
		blockHeight: number,
		round: number,
		blockHash: string | undefined,
	): Promise<Precommit>;
}

export interface ValidatorRepository {
	getValidator(publicKey: string): Validator | undefined;
	printLoadedValidators(): void;
}
