import { BigNumber } from "@mainsail/utils";

export interface Wallet {
	getAddress(): string;

	getBalance(): BigNumber;
	setBalance(balance: BigNumber): void;
	increaseBalance(balance: BigNumber): Wallet;
	decreaseBalance(balance: BigNumber): Wallet;

	getNonce(): BigNumber;
	setNonce(nonce: BigNumber): void;
	increaseNonce(): void;
	decreaseNonce(): void;

	// legacy
	getLegacyAddress(): string | undefined;
	hasLegacySecondPublicKey(): boolean;
	legacySecondPublicKey(): string;
}

export interface ValidatorWallet {
	address: string;
	blsPublicKey: string;
	voteBalance: BigNumber;
	votersCount: number;
	fee: BigNumber;
	isResigned: boolean;
}
