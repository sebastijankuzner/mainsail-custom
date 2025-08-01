import { injectable } from "@mainsail/container";
import { Contracts, Exceptions } from "@mainsail/contracts";
import { ByteBuffer } from "@mainsail/utils";
import { schnorr } from "bcrypto";

@injectable()
export class Signature implements Contracts.Crypto.Signature {
	public async sign(message: Buffer, privateKey: Buffer): Promise<string> {
		return schnorr.sign(message, privateKey).toString("hex");
	}

	public async verify(signature: Buffer, message: Buffer, publicKey: Buffer): Promise<boolean> {
		// Remove leading byte ('02' / '03') from ECDSA key
		if (publicKey.byteLength === 33) {
			publicKey = publicKey.subarray(1);
		}

		return schnorr.verify(message, signature, publicKey);
	}

	public serialize(buffer: ByteBuffer, signature: string): void {
		buffer.writeBytes(Buffer.from(signature, "hex"));
	}

	public deserialize(buffer: ByteBuffer): Buffer {
		return buffer.readBytes(64);
	}

	public async aggregate(signatures: Buffer[]): Promise<string> {
		throw new Exceptions.NotImplemented(this.constructor.name, "aggregate");
	}

	public async signRecoverable(message: Buffer, privateKey: Buffer): Promise<Contracts.Crypto.EcdsaSignature> {
		throw new Exceptions.NotImplemented(this.constructor.name, "signRecoverable");
	}

	public async verifyRecoverable(
		signature: Contracts.Crypto.EcdsaSignature,
		message: Buffer,
		publicKey: Buffer,
	): Promise<boolean> {
		throw new Exceptions.NotImplemented(this.constructor.name, "verifyRecoverable");
	}

	public recoverPublicKey(message: Buffer, signature: Contracts.Crypto.EcdsaSignature): string {
		throw new Exceptions.NotImplemented(this.constructor.name, "recoverPublicKey");
	}
}
