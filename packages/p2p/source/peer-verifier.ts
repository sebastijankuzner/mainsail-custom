import { inject, injectable } from "@mainsail/container";
import { Constants, Contracts, Identifiers } from "@mainsail/contracts";
import { assert } from "@mainsail/utils";
import dayjs from "dayjs";

import { isValidVersion } from "./utils/index.js";

@injectable()
export class PeerVerifier implements Contracts.P2P.PeerVerifier {
	@inject(Identifiers.Application.Instance)
	private readonly app!: Contracts.Kernel.Application;

	@inject(Identifiers.P2P.Peer.Communicator)
	private readonly communicator!: Contracts.P2P.PeerCommunicator;

	@inject(Identifiers.P2P.Peer.Disposer)
	private readonly peerDisposer!: Contracts.P2P.PeerDisposer;

	@inject(Identifiers.Cryptography.Configuration)
	private readonly cryptoConfiguration!: Contracts.Crypto.Configuration;

	@inject(Identifiers.State.Store)
	private readonly stateStore!: Contracts.State.Store;

	@inject(Identifiers.Database.Service)
	private readonly database!: Contracts.Database.DatabaseService;

	@inject(Identifiers.Cryptography.Commit.Factory)
	private readonly commitFactory!: Contracts.Crypto.CommitFactory;

	@inject(Identifiers.P2P.Logger)
	private readonly logger!: Contracts.P2P.Logger;

	public async verify(peer: Contracts.P2P.Peer): Promise<boolean> {
		if (process.env[Constants.EnvironmentVariables.MAINSAIL_SKIP_PEER_STATE_VERIFICATION] === "true") {
			return true;
		}

		try {
			const status = await this.communicator.getStatus(peer);
			peer.version = status.config.version;

			this.#verifyConfig(status.config);

			this.#verifyVersion(status.config);

			await this.#verifyHighestCommonBlock(peer, status.state);

			peer.lastPinged = dayjs();
			peer.plugins = status.config.plugins;

			return true;
		} catch (error) {
			this.logger.debugExtra(`Peer ${peer.ip} verification failed: ${error.message}`);

			this.peerDisposer.banPeer(peer.ip, error);

			return false;
		}
	}

	#verifyConfig(config: Contracts.P2P.PeerConfig): void {
		if (config.network.nethash !== this.cryptoConfiguration.get("network.nethash")) {
			throw new Error("Invalid nethash");
		}

		// TODO: Verify genesis block id
	}

	#verifyVersion(config: Contracts.P2P.PeerConfig): void {
		if (!isValidVersion(this.app, config.version)) {
			throw new Error("Invalid version");
		}
	}

	async #verifyHighestCommonBlock(peer: Contracts.P2P.Peer, state: Contracts.P2P.PeerState): Promise<void> {
		const block = this.stateStore.getLastBlock();

		const blockNumberToRequest = state.blockNumber < block.data.number ? state.blockNumber : block.data.number;

		const { blocks } = await this.communicator.getBlocks(peer, { fromBlockNumber: blockNumberToRequest, limit: 1 });

		if (blocks.length !== 1) {
			throw new Error("Failed to get blocks from peer");
		}

		// TODO: Support header only requests
		const receivedCommit = await this.commitFactory.fromBytes(blocks[0]);

		const blockToCompare =
			block.data.number === blockNumberToRequest ? block : await this.database.getBlock(blockNumberToRequest);

		assert.defined(blockToCompare);

		if (receivedCommit.block.data.number !== blockToCompare.data.number) {
			throw new Error("Received block does not match the requested block number");
		}

		if (receivedCommit.block.data.hash !== blockToCompare.data.hash) {
			throw new Error("Received block does not match the requested hash. Peer is on a different chain.");
		}
	}
}
