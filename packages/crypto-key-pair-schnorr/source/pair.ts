import { inject, injectable } from "@mainsail/container";
import { Contracts, Identifiers } from "@mainsail/contracts";
import { schnorr, SHA256 } from "bcrypto";
import { decode } from "wif";

@injectable()
export class KeyPairFactory implements Contracts.Crypto.KeyPairFactory {
	@inject(Identifiers.Cryptography.Configuration)
	private readonly configuration!: Contracts.Crypto.Configuration;

	public async fromMnemonic(mnemonic: string): Promise<Contracts.Crypto.KeyPair> {
		return this.fromPrivateKey(SHA256.digest(Buffer.from(mnemonic, "utf8")));
	}

	public async fromPrivateKey(privateKey: Buffer): Promise<Contracts.Crypto.KeyPair> {
		return {
			compressed: true,
			privateKey: privateKey.toString("hex"),
			publicKey: schnorr.publicKeyCreate(privateKey).toString("hex"),
		};
	}

	public async fromWIF(wif: string): Promise<Contracts.Crypto.KeyPair> {
		const decoded = decode(wif, this.configuration.get("network.wif"));
		const privateKey = Buffer.from(decoded.privateKey);

		return {
			compressed: decoded.compressed,
			privateKey: privateKey.toString("hex"),
			publicKey: schnorr.publicKeyCreate(privateKey, decoded.compressed).toString("hex"),
		};
	}
}
