import { BlockData } from "../contracts/crypto/block.js";
import { Exception } from "./base.js";

export class TooManyTransactionsError extends Exception {
	public constructor(block: BlockData) {
		super(
			`Received block ${block.hash} number ${block.number} contained too many transactions (${block.transactionsCount}).`,
		);
	}
}

export class UnchainedBlockError extends Exception {
	public constructor(lastHeight: number, nextHeight: number) {
		super(`Last received block ${nextHeight} cannot be chained to ${lastHeight}.`);
	}
}

export class PeerStatusResponseError extends Exception {
	public constructor(ip: string) {
		super(`Failed to retrieve status from peer ${ip}.`);
	}
}

export class PeerPingTimeoutError extends Exception {
	public constructor(latency: number) {
		super(`Ping timeout (${latency} ms)`);
	}
}

export class PeerVerificationFailedError extends Exception {
	public constructor() {
		super("Peer verification failed.");
	}
}

export class MissingCommonBlockError extends Exception {
	public constructor() {
		super("Couldn't find any common blocks.");
	}
}

export class InvalidApiNodeUrlError extends Exception {
	public constructor(url: string) {
		super(`Invalid API Node url: ${url}`);
	}
}
