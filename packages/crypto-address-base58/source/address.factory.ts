import { inject, injectable, tagged } from "@mainsail/container";
import { Contracts, Identifiers } from "@mainsail/contracts";
import { Hash256, RIPEMD160 } from "bcrypto";
import { base58 } from "bstring";

@injectable()
export class AddressFactory implements Contracts.Crypto.AddressFactory {
	@inject(Identifiers.Cryptography.Configuration)
	private readonly configuration!: Contracts.Crypto.Configuration;

	@inject(Identifiers.Cryptography.Identity.KeyPair.Factory)
	@tagged("type", "wallet")
	private readonly keyPairFactory!: Contracts.Crypto.KeyPairFactory;

	@inject(Identifiers.Cryptography.Identity.PublicKey.Factory)
	@tagged("type", "wallet")
	private readonly publicKeyFactory!: Contracts.Crypto.PublicKeyFactory;

	public async fromMnemonic(passphrase: string): Promise<string> {
		return this.fromPublicKey((await this.keyPairFactory.fromMnemonic(passphrase)).publicKey);
	}

	public async fromPublicKey(publicKey: string): Promise<string> {
		const buffer: Buffer = RIPEMD160.digest(Buffer.from(publicKey, "hex"));
		const payload: Buffer = Buffer.alloc(21);

		payload.writeUInt8(this.configuration.get("network.pubKeyHash"), 0);
		buffer.copy(payload, 1);

		return this.#encodeCheck(payload);
	}

	public async fromWIF(wif: string): Promise<string> {
		return this.fromPublicKey(await this.publicKeyFactory.fromWIF(wif));
	}

	public async fromMultiSignatureAsset(asset: Contracts.Crypto.MultiSignatureAsset): Promise<string> {
		return this.fromPublicKey(await this.publicKeyFactory.fromMultiSignatureAsset(asset));
	}

	public async fromPrivateKey(privateKey: Contracts.Crypto.KeyPair): Promise<string> {
		return this.fromPublicKey(privateKey.publicKey);
	}

	public async fromBuffer(buffer: Buffer): Promise<string> {
		return this.#encodeCheck(buffer);
	}

	public async toBuffer(address: string): Promise<Buffer> {
		const result: Buffer = this.#decodeCheck(address);

		const pubKeyHash = this.configuration.get("network.pubKeyHash");

		if (result[0] !== pubKeyHash) {
			throw new Error(`Expected address network byte ${pubKeyHash}, but got ${result[0]}.`);
		}

		return result;
	}

	public async validate(address: string): Promise<boolean> {
		try {
			return this.#decodeCheck(address)[0] === this.configuration.get("network.pubKeyHash");
		} catch {
			return false;
		}
	}

	#encodeCheck(buffer: Buffer): string {
		const checksum = Hash256.digest(buffer);

		return base58.encode(Buffer.concat([buffer, checksum], buffer.length + 4));
	}

	#decodeCheck(address: string): Buffer {
		const buffer: Buffer = base58.decode(address);
		const payload: Buffer = buffer.subarray(0, -4);
		const checksum: Buffer = Hash256.digest(payload);

		if (checksum.readUInt32LE(0) !== buffer.subarray(-4).readUInt32LE(0)) {
			throw new Error("Invalid checksum for base58 string.");
		}

		return payload;
	}
}
