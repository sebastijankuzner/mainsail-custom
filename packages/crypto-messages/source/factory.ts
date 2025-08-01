import { inject, injectable } from "@mainsail/container";
import { Contracts, Exceptions, Identifiers } from "@mainsail/contracts";
import { ByteBuffer } from "@mainsail/utils";

import { Precommit } from "./precommit.js";
import { Prevote } from "./prevote.js";
import { Proposal } from "./proposal.js";

@injectable()
export class MessageFactory implements Contracts.Crypto.MessageFactory {
	@inject(Identifiers.Application.Instance)
	private readonly app!: Contracts.Kernel.Application;

	@inject(Identifiers.Cryptography.Message.Serializer)
	private readonly serializer!: Contracts.Crypto.MessageSerializer;

	@inject(Identifiers.Cryptography.Message.Deserializer)
	private readonly deserializer!: Contracts.Crypto.MessageDeserializer;

	@inject(Identifiers.Cryptography.Block.Factory)
	private readonly blockFactory!: Contracts.Crypto.BlockFactory;

	@inject(Identifiers.Cryptography.Block.Deserializer)
	private readonly blockDeserializer!: Contracts.Crypto.BlockDeserializer;

	@inject(Identifiers.Cryptography.Validator)
	private readonly validator!: Contracts.Crypto.Validator;

	@inject(Identifiers.CryptoWorker.WorkerPool)
	private readonly workerPool!: Contracts.Crypto.WorkerPool;

	public async makeProposal(
		data: Contracts.Crypto.MakeProposalData,
		keyPair: Contracts.Crypto.KeyPair,
	): Promise<Contracts.Crypto.Proposal> {
		const worker = await this.workerPool.getWorker();

		const bytes = await this.serializer.serializeProposal(data, { includeSignature: false });
		const signature = await worker.consensusSignature("sign", bytes, Buffer.from(keyPair.privateKey, "hex"));
		const serialized = Buffer.concat([bytes, Buffer.from(signature, "hex")]);
		return this.makeProposalFromBytes(serialized);
	}

	public async makeProposalFromBytes(bytes: Buffer): Promise<Contracts.Crypto.Proposal> {
		const data = await this.deserializer.deserializeProposal(bytes);
		return this.makeProposalFromData(data, bytes);
	}

	public async makeProposalFromData(
		proposalData: Contracts.Crypto.ProposalData,
		serialized?: Buffer,
	): Promise<Contracts.Crypto.Proposal> {
		this.#applySchema("proposal", proposalData);
		const header = await this.#getBlockHeaderFromProposedData(Buffer.from(proposalData.data.serialized, "hex"));

		if (!serialized) {
			serialized = await this.serializer.serializeProposal(proposalData, { includeSignature: true });
		}

		return this.app.resolve<Proposal>(Proposal).initialize({
			...proposalData,
			blockNumber: header.number,
			dataSerialized: proposalData.data.serialized,
			serialized,
		});
	}

	async makeProposedDataFromBytes(bytes: Buffer): Promise<Contracts.Crypto.ProposedData> {
		const buffer = ByteBuffer.fromBuffer(bytes);

		const lockProofLength = buffer.readUint8();
		let lockProof: Contracts.Crypto.AggregatedSignature | undefined;
		if (lockProofLength > 0) {
			const lockProofBuffer = buffer.readBytes(lockProofLength);
			lockProof = await this.deserializer.deserializeLockProof(lockProofBuffer);
		}

		const block = await this.blockFactory.fromBytes(buffer.getRemainder());

		return {
			block,
			lockProof,
			serialized: bytes.toString("hex"),
		};
	}

	public async makePrevote(
		data: Contracts.Crypto.MakePrevoteData,
		keyPair: Contracts.Crypto.KeyPair,
	): Promise<Contracts.Crypto.Prevote> {
		const worker = await this.workerPool.getWorker();

		const bytes = await this.serializer.serializePrevoteForSignature({
			blockHash: data.blockHash,
			blockNumber: data.blockNumber,
			round: data.round,
			type: data.type,
		});
		const signature = await worker.consensusSignature("sign", bytes, Buffer.from(keyPair.privateKey, "hex"));
		const serialized = await this.serializer.serializePrevote({ ...data, signature });
		return this.makePrevoteFromBytes(serialized);
	}

	public async makePrevoteFromBytes(bytes: Buffer): Promise<Contracts.Crypto.Precommit> {
		const data = await this.deserializer.deserializePrevote(bytes);
		return this.makePrevoteFromData(data, bytes);
	}

	public async makePrevoteFromData(
		data: Contracts.Crypto.PrevoteData,
		serialized?: Buffer,
	): Promise<Contracts.Crypto.Prevote> {
		this.#applySchema("prevote", data);

		if (!serialized) {
			serialized = await this.serializer.serializePrevote(data);
		}

		return new Prevote({ ...data, serialized });
	}

	public async makePrecommit(
		data: Contracts.Crypto.MakePrecommitData,
		keyPair: Contracts.Crypto.KeyPair,
	): Promise<Contracts.Crypto.Precommit> {
		const worker = await this.workerPool.getWorker();

		const bytes = await this.serializer.serializePrecommitForSignature({
			blockHash: data.blockHash,
			blockNumber: data.blockNumber,
			round: data.round,
			type: data.type,
		});
		const signature = await worker.consensusSignature("sign", bytes, Buffer.from(keyPair.privateKey, "hex"));

		const serialized = await this.serializer.serializePrecommit({ ...data, signature });
		return this.makePrecommitFromBytes(serialized);
	}

	public async makePrecommitFromBytes(bytes: Buffer): Promise<Contracts.Crypto.Precommit> {
		const data = await this.deserializer.deserializePrecommit(bytes);
		return this.makePrecommitFromData(data, bytes);
	}

	public async makePrecommitFromData(
		data: Contracts.Crypto.PrecommitData,
		serialized?: Buffer,
	): Promise<Contracts.Crypto.Precommit> {
		this.#applySchema("precommit", data);

		if (!serialized) {
			serialized = await this.serializer.serializePrecommit(data);
		}

		return new Precommit({ ...data, serialized });
	}

	// Performance can be improved by returning only a block height
	async #getBlockHeaderFromProposedData(bytes: Buffer): Promise<Contracts.Crypto.BlockHeader> {
		const buffer = ByteBuffer.fromBuffer(bytes);

		const lockProofLength = buffer.readUint8();
		buffer.skip(lockProofLength);

		return this.blockDeserializer.deserializeHeader(buffer.getRemainder());
	}

	#applySchema<T>(schema: string, data: T): T {
		const result = this.validator.validate(schema, data);

		if (!result.error) {
			return result.value;
		}

		throw new Exceptions.MessageSchemaError(schema, result.error);
	}
}
