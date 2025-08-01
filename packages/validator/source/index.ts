import { Keystore } from "@chainsafe/bls-keystore";
import { injectable } from "@mainsail/container";
import { Contracts, Identifiers } from "@mainsail/contracts";
import { Providers } from "@mainsail/kernel";
import { assert } from "@mainsail/utils";
import Joi from "joi";

import { BIP38, BIP39 } from "./keys/index.js";
import { Validator } from "./validator.js";
import { ValidatorRepository } from "./validator-repository.js";

@injectable()
export class ServiceProvider extends Providers.ServiceProvider {
	public async register(): Promise<void> {
		this.app.bind(Identifiers.Validator.Repository).toConstantValue(this.app.resolve(ValidatorRepository));
	}

	public async boot(): Promise<void> {
		const validators: Contracts.Validator.Validator[] = [];
		const validatorConfig = this.app.config<{ secrets: string[]; keystore?: string }>("validators");
		assert.defined(validatorConfig);
		const { secrets, keystore } = validatorConfig;

		for (const secret of secrets.values()) {
			const consensusKeyPair = await this.#getConsensusKeyPairFromSecret(secret);

			validators.push(
				this.app
					.resolve<Contracts.Validator.Validator>(Validator)
					.configure(await new BIP39().configure(consensusKeyPair)),
			);
		}

		// Load validator from keystore (if any)
		if (keystore) {
			const parsed = Keystore.parse(keystore);

			const configuration = this.app.getTagged<Providers.PluginConfiguration>(
				Identifiers.ServiceProvider.Configuration,
				"plugin",
				"validator",
			);

			validators.push(
				this.app
					.resolve<Contracts.Validator.Validator>(Validator)
					.configure(await new BIP38().configure(parsed, configuration.get("validatorKeystorePassword")!)),
			);

			// Wipe original password as it gets rotated in-memory
			configuration.unset("validatorKeystorePassword");
		}

		this.app.get<ValidatorRepository>(Identifiers.Validator.Repository).configure(validators);
	}

	public configSchema(): Joi.AnySchema {
		return Joi.object({
			txCollatorFactor: Joi.number().min(0).max(1).required(),
		}).unknown(true);
	}

	#getConsensusKeyPairFromSecret(secret: string): Promise<Contracts.Crypto.KeyPair> {
		const consensusKeyPairFactory = this.app.getTagged<Contracts.Crypto.KeyPairFactory>(
			Identifiers.Cryptography.Identity.KeyPair.Factory,
			"type",
			"consensus",
		);

		if (this.#isMnemonic(secret)) {
			return consensusKeyPairFactory.fromMnemonic(secret);
		}

		if (this.#isHexPrivateKey(secret)) {
			return consensusKeyPairFactory.fromPrivateKey(Buffer.from(secret, "hex"));
		}

		throw new Error("invalid validator secret, neither mnemonic nor private key ");
	}

	#isMnemonic(secret: string): boolean {
		const words = secret.split(/\s+/);
		return words.length >= 12 && words.length <= 24;
	}

	#isHexPrivateKey(secret: string): boolean {
		return /^[0-9a-fA-F]{64}$/.test(secret);
	}
}
