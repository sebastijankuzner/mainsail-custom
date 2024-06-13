import { inject, injectable } from "@mainsail/container";
import { Contracts, Identifiers } from "@mainsail/contracts";
import { Utils } from "@mainsail/kernel";
import { BigNumber } from "@mainsail/utils";
import { performance } from "perf_hooks";

@injectable()
export class Validator implements Contracts.Validator.Validator {
	@inject(Identifiers.Cryptography.Block.Factory)
	private readonly blockFactory!: Contracts.Crypto.BlockFactory;

	@inject(Identifiers.Cryptography.Message.Serializer)
	private readonly messageSerializer!: Contracts.Crypto.MessageSerializer;

	@inject(Identifiers.Cryptography.Hash.Factory)
	private readonly hashFactory!: Contracts.Crypto.HashFactory;

	@inject(Identifiers.Cryptography.Configuration)
	private readonly cryptoConfiguration!: Contracts.Crypto.Configuration;

	@inject(Identifiers.Cryptography.Message.Factory)
	private readonly messagesFactory!: Contracts.Crypto.MessageFactory;

	@inject(Identifiers.State.Service)
	protected readonly stateService!: Contracts.State.Service;

	@inject(Identifiers.Transaction.Validator.Factory)
	private readonly createTransactionValidator!: Contracts.Transactions.TransactionValidatorFactory;

	@inject(Identifiers.Cryptography.Transaction.Factory)
	private readonly transactionFactory!: Contracts.Crypto.TransactionFactory;

	@inject(Identifiers.Services.Log.Service)
	private readonly logger!: Contracts.Kernel.Logger;

	@inject(Identifiers.TransactionPool.Worker)
	private readonly txPoolWorker!: Contracts.TransactionPool.Worker;

	#keyPair!: Contracts.Validator.ValidatorKeyPair;

	public configure(keyPair: Contracts.Validator.ValidatorKeyPair): Contracts.Validator.Validator {
		this.#keyPair = keyPair;

		return this;
	}

	public getConsensusPublicKey(): string {
		return this.#keyPair.publicKey;
	}

	public async prepareBlock(
		generatorPublicKey: string,
		round: number,
		timestamp: number,
	): Promise<Contracts.Crypto.Block> {
		const transactions = await this.#getTransactionsForForging();

		const t1 = performance.now();

		const block = await this.#makeBlock(round, generatorPublicKey, transactions, timestamp);

		console.log(`[Validator] prepareBlock took ${performance.now() - t1}ms`);

		return block;
	}

	public async propose(
		validatorIndex: number,
		round: number,
		validRound: number | undefined,
		block: Contracts.Crypto.Block,
		lockProof?: Contracts.Crypto.AggregatedSignature,
	): Promise<Contracts.Crypto.Proposal> {
		const serializedProposedBlock = await this.messageSerializer.serializeProposed({ block, lockProof });
		return this.messagesFactory.makeProposal(
			{
				data: { serialized: serializedProposedBlock.toString("hex") },
				round,
				validRound,
				validatorIndex,
			},
			await this.#keyPair.getKeyPair(),
		);
	}

	public async prevote(
		validatorIndex: number,
		height: number,
		round: number,
		blockId: string | undefined,
	): Promise<Contracts.Crypto.Prevote> {
		return this.messagesFactory.makePrevote(
			{
				blockId,
				height,
				round,
				type: Contracts.Crypto.MessageType.Prevote,
				validatorIndex,
			},
			await this.#keyPair.getKeyPair(),
		);
	}

	public async precommit(
		validatorIndex: number,
		height: number,
		round: number,
		blockId: string | undefined,
	): Promise<Contracts.Crypto.Precommit> {
		return this.messagesFactory.makePrecommit(
			{
				blockId,
				height,
				round,
				type: Contracts.Crypto.MessageType.Precommit,
				validatorIndex,
			},
			await this.#keyPair.getKeyPair(),
		);
	}

	async #getTransactionsForForging(): Promise<Contracts.Crypto.Transaction[]> {
		const t1 = performance.now();

		const transactionBytes = await this.txPoolWorker.getTransactionBytes();

		const t2 = performance.now();

		const validator = this.createTransactionValidator();
		const candidateTransactions: Contracts.Crypto.Transaction[] = [];
		const failedTransactions: Contracts.Crypto.Transaction[] = [];

		const timeLimit = performance.now() + this.cryptoConfiguration.getMilestone().timeouts.blockPrepareTime * 0.75;

		for (const bytes of transactionBytes) {
			if (performance.now() > timeLimit) {
				break;
			}

			const transaction = await this.transactionFactory.fromBytes(bytes);

			if (failedTransactions.some((t) => t.data.senderPublicKey === transaction.data.senderPublicKey)) {
				continue;
			}

			try {
				await validator.validate(transaction);
				candidateTransactions.push(transaction);
			} catch (error) {
				this.logger.warning(`${transaction.id} failed to collate: ${error.message}`);
				failedTransactions.push(transaction);
			}
		}

		this.txPoolWorker.setFailedTransactions(failedTransactions);

		console.log(
			`[Validator] getTransactionsForForging took ${performance.now() - t1}ms, get: [${t2 - t1}ms, process: ${performance.now() - t2}ms`,
		);

		return candidateTransactions;
	}

	async #makeBlock(
		round: number,
		generatorPublicKey: string,
		transactions: Contracts.Crypto.Transaction[],
		timestamp: number,
	): Promise<Contracts.Crypto.Block> {
		const totals: { amount: BigNumber; fee: BigNumber } = {
			amount: BigNumber.ZERO,
			fee: BigNumber.ZERO,
		};

		const payloadBuffers: Buffer[] = [];
		const transactionData: Contracts.Crypto.TransactionData[] = [];

		// The initial payload length takes the overhead for each serialized transaction into account
		// which is a uint32 per transaction to store the individual length.
		let payloadLength = transactions.length * 4;
		for (const { data, serialized } of transactions) {
			Utils.assert.defined<string>(data.id);

			totals.amount = totals.amount.plus(data.amount);
			totals.fee = totals.fee.plus(data.fee);

			payloadBuffers.push(Buffer.from(data.id, "hex"));
			transactionData.push(data);
			payloadLength += serialized.length;
		}

		const previousBlock = this.stateService.getStore().getLastBlock();
		const height = previousBlock.data.height + 1;

		return this.blockFactory.make({
			generatorPublicKey,
			height,
			numberOfTransactions: transactions.length,
			payloadHash: (await this.hashFactory.sha256(payloadBuffers)).toString("hex"),
			payloadLength,
			previousBlock: previousBlock.data.id,
			reward: BigNumber.make(this.cryptoConfiguration.getMilestone(height).reward),
			round,
			timestamp,
			totalAmount: totals.amount,
			totalFee: totals.fee,
			transactions: transactionData,
			version: 1,
		});
	}
}
