import cryptoConfig from "../../../../core/bin/config/devnet/core/crypto.json";
import { describe } from "../../index";
import { FactoryBuilder } from "../factory-builder";
import { Identity } from "../types";
import { registerIdentityFactory } from "./identity";

describe<{
	factoryBuilder: FactoryBuilder;
}>("IdentityFactory", ({ beforeAll, it, assert }) => {
	beforeAll(async (context) => {
		context.factoryBuilder = new FactoryBuilder();

		await registerIdentityFactory(context.factoryBuilder, cryptoConfig);
	});

	it("should make an identity with a single passphrase", async ({ factoryBuilder }) => {
		const entity = await factoryBuilder.get("Identity").make<Identity>();

		assert.object(entity.keys);
		assert.string(entity.keys.publicKey);
		assert.string(entity.keys.privateKey);
		assert.string(entity.publicKey);
		assert.string(entity.privateKey);
		assert.string(entity.address);
		assert.string(entity.wif);
		assert.string(entity.passphrase);
	});
});
