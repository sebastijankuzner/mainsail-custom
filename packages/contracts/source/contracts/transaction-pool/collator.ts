import { Transaction } from "../crypto/transactions.js";

export interface Collator {
	initialize(): void;
	getBlockCandidateTransactions(): Promise<Transaction[]>;
}
