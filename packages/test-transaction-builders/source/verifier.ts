import { injectable } from "@mainsail/container";
import { Contracts } from "@mainsail/contracts";

// Verifier which always accepts everything, useful when using the tx builder with invalid schema data.

@injectable()
export class AcceptAnyTransactionVerifier implements Contracts.Crypto.TransactionVerifier {
	public async verifyHash(data: Contracts.Crypto.TransactionData): Promise<boolean> {
		return true;
	}

	public async verifySchema(
		data: Contracts.Crypto.TransactionData,
		_: boolean,
	): Promise<Contracts.Crypto.SchemaValidationResult> {
		return {
			error: undefined,
			errors: undefined,
			value: data,
		};
	}

	public async verifyLegacySecondSignature(
		data: Contracts.Crypto.TransactionData,
		legacySecondPublicKey: string,
	): Promise<boolean> {
		return true;
	}
}
