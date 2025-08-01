import { injectable } from "@mainsail/container";
import { Identifiers } from "@mainsail/contracts";
import { Providers } from "@mainsail/kernel";

import { HashFactory } from "./hash.factory.js";

@injectable()
export class ServiceProvider extends Providers.ServiceProvider {
	public async register(): Promise<void> {
		this.app.bind(Identifiers.Cryptography.Hash.Size.HASH256).toConstantValue(32);
		this.app.bind(Identifiers.Cryptography.Hash.Size.RIPEMD160).toConstantValue(20);
		this.app.bind(Identifiers.Cryptography.Hash.Size.SHA256).toConstantValue(32);

		this.app.bind(Identifiers.Cryptography.Hash.Factory).to(HashFactory).inSingletonScope();
	}
}
