import { injectable } from "@mainsail/container";
import { Contracts, Identifiers } from "@mainsail/contracts";
import { TransactionRegistry } from "@mainsail/crypto-transaction";
import { Providers } from "@mainsail/kernel";
import { BigNumber } from "@mainsail/utils";

import { MultiPaymentTransactionHandler } from "./handlers/index.js";
import { makeKeywords } from "./validation/index.js";
import { MultiPaymentTransaction } from "./versions/1.js";

export * from "./builder.js";
export * from "./versions/index.js";

@injectable()
export class ServiceProvider extends Providers.ServiceProvider {
	public async register(): Promise<void> {
		this.#registerKeywords();

		this.#registerFees();

		this.#registerType();

		this.#registerHandler();
	}

	#registerKeywords(): void {
		for (const keyword of Object.values(
			makeKeywords(this.app.get<Contracts.Crypto.Configuration>(Identifiers.Cryptography.Configuration)),
		)) {
			this.app.get<Contracts.Crypto.Validator>(Identifiers.Cryptography.Validator).addKeyword(keyword);
		}
	}

	#registerFees(): void {
		this.app.get<Contracts.Fee.FeeRegistry>(Identifiers.Fee.Registry).set(
			MultiPaymentTransaction.key,
			{
				managed: BigNumber.make("500"),
			}[this.app.get<string>(Identifiers.Fee.Type)],
			MultiPaymentTransaction.version,
		);
	}

	#registerType(): void {
		this.app
			.get<TransactionRegistry>(Identifiers.Cryptography.Transaction.Registry)
			.registerTransactionType(MultiPaymentTransaction);
	}

	#registerHandler(): void {
		this.app.bind(Identifiers.Transaction.Handler.Instances).to(MultiPaymentTransactionHandler);
	}
}
