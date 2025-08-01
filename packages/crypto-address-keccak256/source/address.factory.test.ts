import { Container } from "@mainsail/container";
import { Identifiers } from "@mainsail/contracts";
import { Configuration } from "@mainsail/crypto-config";
import { ServiceProvider as ECDSA } from "@mainsail/crypto-key-pair-ecdsa";
import { ServiceProvider as Schnorr } from "@mainsail/crypto-key-pair-schnorr";
import { Application } from "@mainsail/kernel";
import { ServiceProvider as CoreValidation } from "@mainsail/validation";

import { describe } from "../../test-framework/source";
import { AddressFactory } from "./address.factory";

const mnemonic =
	"program fragile industry scare sun visit race erase daughter empty anxiety cereal cycle hunt airport educate giggle picture sunset apart jewel similar pulp moment";

const wif = "SDuW66dyGZ1zPZdN7ncEevbJdjaQTj9pT4LcmKzQ7eLFoyCXEdkx";

describe<{ app: Application }>("AddressFactory", ({ assert, beforeEach, it }) => {
	beforeEach(async (context) => {
		context.app = new Application(new Container());
		context.app.bind(Identifiers.Cryptography.Configuration).to(Configuration).inSingletonScope();

		await context.app.resolve(CoreValidation).register();
	});

	it("should derive an address from an mnemonic (schnorr)", async (context) => {
		await context.app.resolve<Schnorr>(Schnorr).register();

		assert.is(
			await context.app.resolve(AddressFactory).fromMnemonic(mnemonic),
			"0x4D9AED240463043cFcf5B5Df16b9ad523930A181",
		);
	});

	it("should derive an address from an mnemonic (secp256k1)", async (context) => {
		await context.app.resolve<ECDSA>(ECDSA).register();

		assert.is(
			await context.app.resolve(AddressFactory).fromMnemonic(mnemonic),
			"0xC7C50f33278bDe272ffe23865fF9fBd0155a5175",
		);
	});

	it("should derive an address from a public key (schnorr)", async (context) => {
		await context.app.resolve<Schnorr>(Schnorr).register();

		assert.is(
			await context.app
				.resolve(AddressFactory)
				.fromPublicKey("e84093c072af70004a38dd95e34def119d2348d5261228175d032e5f2070e19f"),
			"0x4D9AED240463043cFcf5B5Df16b9ad523930A181",
		);
	});

	it("should derive an address from a public key (secp256k1)", async (context) => {
		await context.app.resolve<ECDSA>(ECDSA).register();

		assert.is(
			await context.app
				.resolve(AddressFactory)
				.fromPublicKey("03e84093c072af70004a38dd95e34def119d2348d5261228175d032e5f2070e19f"),
			"0xC7C50f33278bDe272ffe23865fF9fBd0155a5175",
		);
	});

	it("should derive an address from wif", async (context) => {
		await context.app.resolve<Schnorr>(Schnorr).register();

		assert.is(await context.app.resolve(AddressFactory).fromWIF(wif), "0x4D9AED240463043cFcf5B5Df16b9ad523930A181");
	});

	it("should validate addresses", async (context) => {
		await context.app.resolve<ECDSA>(ECDSA).register();

		assert.true(await context.app.resolve(AddressFactory).validate("0xC7C50f33278bDe272ffe23865fF9fBd0155a5175"));
		assert.true(await context.app.resolve(AddressFactory).validate("0xC7C50f33278bDe272ffe23865fF9fBd0155a5175"));
		assert.false(await context.app.resolve(AddressFactory).validate("0xC7C50f33278bde272ffe23865ff9fbd0155a5175"));
		assert.false(
			await context.app
				.resolve(AddressFactory)
				.validate("m0d1q05ypy7qw2hhqqz28rwetc6dauge6g6g65npy2qht5pjuheqwrse7gxkhwv"),
		);
	});

	it("should convert from and to buffer", async (context) => {
		await context.app.resolve<ECDSA>(ECDSA).register();

		const buffer = await context.app.resolve(AddressFactory).toBuffer("0xC7C50f33278bDe272ffe23865fF9fBd0155a5175");
		assert.equal(buffer.byteLength, 20);

		const restored = await context.app.resolve(AddressFactory).fromBuffer(buffer);
		assert.equal(restored, "0xC7C50f33278bDe272ffe23865fF9fBd0155a5175");
	});
});
