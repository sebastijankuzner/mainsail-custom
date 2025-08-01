import { inject, injectable } from "@mainsail/container";
import { Contracts, Exceptions, Identifiers } from "@mainsail/contracts";
import { BigNumber } from "@mainsail/utils";

@injectable()
export abstract class Transaction implements Contracts.Crypto.Transaction {
	@inject(Identifiers.Cryptography.Identity.Address.Factory)
	protected readonly addressFactory!: Contracts.Crypto.AddressFactory;

	@inject(Identifiers.Cryptography.Configuration)
	protected readonly configuration!: Contracts.Crypto.Configuration;

	public static key: string | undefined = undefined;

	public data!: Contracts.Crypto.TransactionData;
	public serialized!: Buffer;

	public get hash(): string {
		return this.data.hash;
	}

	public get key(): string {
		return (this as any).__proto__.constructor.key;
	}

	public static getSchema(): Contracts.Crypto.TransactionSchema {
		throw new Exceptions.NotImplemented(this.constructor.name, "getSchema");
	}

	public static getData(json: Contracts.Crypto.TransactionJson): Contracts.Crypto.TransactionData {
		const data: Contracts.Crypto.TransactionData = { ...json } as unknown as Contracts.Crypto.TransactionData;
		data.value = BigNumber.make(data.value);
		data.nonce = BigNumber.make(data.nonce);
		return data;
	}
}
