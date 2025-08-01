import { Constants } from "@mainsail/contracts";
import { Environment } from "@mainsail/kernel";

export const defaults = {
	allowedSenders: [],

	enabled: !Environment.isTrue(Constants.EnvironmentVariables.MAINSAIL_TRANSACTION_POOL_DISABLED),

	// Max transaction age in number of blocks produced since the transaction was created.
	// If a transaction stays that long in the pool without being included in any block,
	// then it will be removed.
	maxTransactionAge: 2700,

	// Based on limit used by other Ethereum clients such as Geth (128kb).
	maxTransactionBytes: 128 * 1000,

	// When the pool contains that many transactions, then a new transaction is
	// only accepted if its fee is higher than the transaction with the lowest
	// fee in the pool. In this case the transaction with the lowest fee is removed
	// from the pool in order to accommodate the new one.
	maxTransactionsInPool: Environment.get(Constants.EnvironmentVariables.MAINSAIL_MAX_TRANSACTIONS_IN_POOL, 15_000),

	maxTransactionsPerRequest: Environment.get(
		Constants.EnvironmentVariables.MAINSAIL_TRANSACTION_POOL_MAX_PER_REQUEST,
		40,
	),
	maxTransactionsPerSender: Environment.get(
		Constants.EnvironmentVariables.MAINSAIL_TRANSACTION_POOL_MAX_PER_SENDER,
		150,
	),

	rebroadcastThreshold: Environment.get(
		Constants.EnvironmentVariables.MAINSAIL_TRANSACTION_POOL_REBROADCAST_THRESHOLD,
		60,
	),

	storage: `${Environment.get(Constants.EnvironmentVariables.MAINSAIL_PATH_DATA)}/transaction-pool.sqlite`,
};
