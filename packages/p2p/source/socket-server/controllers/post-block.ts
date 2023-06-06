import Hapi from "@hapi/hapi";
import { inject, injectable } from "@mainsail/container";
import { Contracts, Exceptions, Identifiers } from "@mainsail/contracts";
import { Utils } from "@mainsail/kernel";

import { mapAddr } from "../utils/map-addr";

interface Request extends Hapi.Request {
	payload: {
		block: Buffer;
	};
}
@injectable()
export class PostBlockController implements Contracts.P2P.Controller {
	@inject(Identifiers.LogService)
	private readonly logger!: Contracts.Kernel.Logger;

	@inject(Identifiers.BlockchainService)
	private readonly blockchain!: Contracts.Blockchain.Blockchain;

	@inject(Identifiers.Cryptography.Configuration)
	private readonly configuration!: Contracts.Crypto.IConfiguration;

	@inject(Identifiers.Cryptography.Block.Deserializer)
	private readonly deserializer!: Contracts.Crypto.IBlockDeserializer;

	@inject(Identifiers.Cryptography.Time.Slots)
	private readonly slots!: Contracts.Crypto.Slots;

	public async handle(request: Request, h: Hapi.ResponseToolkit): Promise<{ status: boolean; height: number }> {
		const blockBuffer: Buffer = request.payload.block;

		const deserializedHeader = await this.deserializer.deserializeHeader(blockBuffer);

		if (deserializedHeader.numberOfTransactions > this.configuration.getMilestone().block.maxTransactions) {
			throw new Exceptions.TooManyTransactionsError(deserializedHeader);
		}

		const deserialized: {
			data: Contracts.Crypto.IBlockData;
			transactions: Contracts.Crypto.ITransaction[];
		} = await this.deserializer.deserialize(blockBuffer);

		const block: Contracts.Crypto.IBlockData = {
			...deserialized.data,
			transactions: deserialized.transactions.map((tx) => tx.data),
		};

		if (this.blockchain.pingBlock(block)) {
			return { height: this.blockchain.getLastHeight(), status: true };
		}

		const lastDownloadedBlock: Contracts.Crypto.IBlockData = this.blockchain.getLastDownloadedBlock();

		if (!Utils.isBlockChained(lastDownloadedBlock, block, this.slots)) {
			return { height: this.blockchain.getLastHeight(), status: false };
		}

		this.logger.info(
			`Received new block at height ${block.height.toLocaleString()} with ${Utils.pluralize(
				"transaction",
				block.numberOfTransactions,
				true,
			)} from ${mapAddr(request.info.remoteAddress)}`,
		);

		await this.blockchain.handleIncomingBlock(block, false);

		return { height: this.blockchain.getLastHeight(), status: true };
	}
}