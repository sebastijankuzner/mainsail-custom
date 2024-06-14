import { inject, injectable } from "@mainsail/container";
import { Contracts, Exceptions, Identifiers, Utils } from "@mainsail/contracts";
import { BigNumber } from "@mainsail/utils";
import { performance } from "perf_hooks";

import { sealBlock } from "./block.js";
import { IDFactory } from "./id.factory.js";

@injectable()
export class BlockFactory implements Contracts.Crypto.BlockFactory {
	@inject(Identifiers.Cryptography.Block.Serializer)
	private readonly serializer!: Contracts.Crypto.BlockSerializer;

	@inject(Identifiers.Cryptography.Block.Deserializer)
	private readonly deserializer!: Contracts.Crypto.BlockDeserializer;

	@inject(Identifiers.Cryptography.Block.IDFactory)
	private readonly idFactory!: IDFactory;

	@inject(Identifiers.Cryptography.Validator)
	private readonly validator!: Contracts.Crypto.Validator;

	@inject(Identifiers.Services.Log.Service)
	private readonly logger!: Contracts.Kernel.Logger;

	public async make(
		data: Utils.Mutable<Contracts.Crypto.BlockDataSerializable>,
		transactions: Contracts.Crypto.Transaction[],
	): Promise<Contracts.Crypto.Block> {
		const block = data as Utils.Mutable<Contracts.Crypto.BlockData>;

		const t1 = performance.now();

		block.id = await this.idFactory.make(data);

		const t2 = performance.now();

		const serialized: Buffer = await this.serializer.serializeWithTransactions(data);

		this.logger.notice(`[Validator]: Block id - ${t2 - t1}ms, serialized - ${performance.now() - t2} ms`);

		return sealBlock({
			data: block,
			serialized: serialized.toString("hex"),
			transactions,
		});

		// return this.fromData(block);
	}

	public async fromHex(hex: string): Promise<Contracts.Crypto.Block> {
		return this.#fromSerialized(Buffer.from(hex, "hex"));
	}

	public async fromBytes(buff: Buffer): Promise<Contracts.Crypto.Block> {
		return this.#fromSerialized(buff);
	}

	public async fromJson(json: Contracts.Crypto.BlockJson): Promise<Contracts.Crypto.Block> {
		// @ts-ignore
		const data: Utils.Mutable<Contracts.Crypto.BlockData> = { ...json };
		data.totalAmount = BigNumber.make(data.totalAmount);
		data.totalFee = BigNumber.make(data.totalFee);
		data.reward = BigNumber.make(data.reward);

		if (data.transactions) {
			for (const transaction of data.transactions) {
				transaction.amount = BigNumber.make(transaction.amount);
				transaction.fee = BigNumber.make(transaction.fee);
				transaction.nonce = BigNumber.make(transaction.nonce);
			}
		}

		return this.fromData(data);
	}

	public async fromData(data: Contracts.Crypto.BlockData): Promise<Contracts.Crypto.Block> {
		const t1 = performance.now();

		await this.#applySchema(data);

		const t2 = performance.now();

		const serialized: Buffer = await this.serializer.serializeWithTransactions(data);

		const t3 = performance.now();

		const deserialized = await this.deserializer.deserializeWithTransactions(serialized);

		this.logger.notice(
			`[Validator]: ApplySchema - ${t2 - t1}ms,  Serialize - ${t3 - t2}ms, Deserialize - ${performance.now() - t3}ms`,
		);

		return sealBlock({
			...deserialized,
			serialized: serialized.toString("hex"),
		});
	}

	async #fromSerialized(serialized: Buffer): Promise<Contracts.Crypto.Block> {
		const deserialized = await this.deserializer.deserializeWithTransactions(serialized);

		const validated: Contracts.Crypto.BlockData | undefined = await this.#applySchema(deserialized.data);

		if (validated) {
			deserialized.data = validated;
		}

		return sealBlock({
			...deserialized,
			serialized: serialized.toString("hex"),
		});
	}

	async #applySchema(data: Contracts.Crypto.BlockData): Promise<Contracts.Crypto.BlockData> {
		const result = this.validator.validate("block", data);

		if (!result.error) {
			return result.value;
		}

		for (const error of result.errors ?? []) {
			let fatal = false;

			const match = error.instancePath.match(/\.transactions\[(\d+)]/);
			if (match === null) {
				fatal = true;
			} else {
				const txIndex = match[1];

				if (data.transactions) {
					const tx = data.transactions[txIndex];

					if (tx.id === undefined) {
						fatal = true;
					}
				}
			}

			if (fatal) {
				throw new Exceptions.BlockSchemaError(
					data.height,
					`Invalid data${error.instancePath ? " at " + error.instancePath : ""}: ` +
						`${error.message}: ${JSON.stringify(error.data)}`,
				);
			}
		}

		return result.value;
	}
}
