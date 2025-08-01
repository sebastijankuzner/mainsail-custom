import { Contracts, Identifiers } from "@mainsail/contracts";
import { ServiceProvider as CoreCryptoAddressKeccak256 } from "@mainsail/crypto-address-keccak256";
import { ServiceProvider as CoreCryptoAddressBase58 } from "@mainsail/crypto-address-base58";
import { ServiceProvider as CryptoBlock } from "@mainsail/crypto-block";
import { ServiceProvider as CoreCryptoConfig } from "@mainsail/crypto-config";
import { ServiceProvider as CoreConsensusBls12381 } from "@mainsail/crypto-consensus-bls12-381";
import { ServiceProvider as CoreCryptoHashBcrypto } from "@mainsail/crypto-hash-bcrypto";
import { ServiceProvider as CoreCryptoKeyPairEcdsa } from "@mainsail/crypto-key-pair-ecdsa";
import { ServiceProvider as CoreCryptoSignatureEcdsa } from "@mainsail/crypto-signature-ecdsa";
import { ServiceProvider as CoreCryptoTransaction } from "@mainsail/crypto-transaction";
import { ServiceProvider as CoreCryptoTransactionEvmCall } from "@mainsail/crypto-transaction-evm-call";
import { ServiceProvider as CoreCryptoValidation } from "@mainsail/crypto-validation";
import { ServiceProvider as CoreCryptoWif } from "@mainsail/crypto-wif";
import { ServiceProvider as CoreSerializer } from "@mainsail/serializer";
import { ServiceProvider as CoreTransactions } from "@mainsail/transactions";
import { ServiceProvider as CoreValidation } from "@mainsail/validation";

import crypto from "../../../core/bin/config/devnet/core/crypto.json";
import { Sandbox } from "../../../test-framework/source/index.js";
import { Deserializer } from "../../source/deserializer.js";
import { MessageFactory } from "../../source/factory.js";
import { makeKeywords } from "../../source/keywords.js";
import { schemas } from "../../source/schemas.js";
import { Serializer } from "../../source/serializer.js";

export const prepareSandbox = async (context: { sandbox?: Sandbox }) => {
	context.sandbox = new Sandbox();

	context.sandbox.app.get<Contracts.Kernel.Repository>(Identifiers.Config.Repository).set("crypto", crypto);

	await context.sandbox.app.resolve(CoreSerializer).register();
	await context.sandbox.app.resolve(CoreValidation).register();
	await context.sandbox.app.resolve(CoreCryptoConfig).register();

	context.sandbox.app.bind(Identifiers.Services.EventDispatcher.Service).toConstantValue({ dispatchSync: () => {} });
	context.sandbox.app.bind(Identifiers.Services.Log.Service).toConstantValue({});

	await context.sandbox.app.resolve(CoreCryptoHashBcrypto).register();
	await context.sandbox.app.resolve(CoreCryptoSignatureEcdsa).register();
	await context.sandbox.app.resolve(CoreCryptoKeyPairEcdsa).register();
	await context.sandbox.app.resolve(CoreCryptoAddressKeccak256).register();
	await context.sandbox.app.resolve(CoreCryptoAddressBase58).register();
	await context.sandbox.app.resolve(CoreCryptoWif).register();
	await context.sandbox.app.resolve(CoreConsensusBls12381).register();
	await context.sandbox.app.resolve(CoreCryptoTransaction).register();
	await context.sandbox.app.resolve(CoreCryptoTransactionEvmCall).register();
	await context.sandbox.app.resolve(CoreTransactions).register();
	await context.sandbox.app.resolve(CoreCryptoValidation).register();
	await context.sandbox.app.resolve(CryptoBlock).register();

	context.sandbox.app.bind(Identifiers.Cryptography.Message.Serializer).to(Serializer);
	context.sandbox.app.bind(Identifiers.Cryptography.Message.Deserializer).to(Deserializer);
	context.sandbox.app.bind(Identifiers.Cryptography.Message.Factory).to(MessageFactory).inSingletonScope();

	for (const keyword of Object.values(
		makeKeywords(context.sandbox.app.get(Identifiers.Cryptography.Configuration)),
	)) {
		context.sandbox.app.get<Contracts.Crypto.Validator>(Identifiers.Cryptography.Validator).addKeyword(keyword);
	}

	for (const schema of Object.values(schemas)) {
		context.sandbox.app.get<Contracts.Crypto.Validator>(Identifiers.Cryptography.Validator).addSchema(schema);
	}
};
