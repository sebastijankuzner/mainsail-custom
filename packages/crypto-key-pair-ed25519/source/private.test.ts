import { Container } from "@mainsail/container";
import { Identifiers } from "@mainsail/contracts";
import { Configuration } from "@mainsail/crypto-config";

import { describe } from "../../test-framework/source";
import { KeyPairFactory } from "./pair";
import { PrivateKeyFactory } from "./private";

const mnemonic =
	"program fragile industry scare sun visit race erase daughter empty anxiety cereal cycle hunt airport educate giggle picture sunset apart jewel similar pulp moment";

describe<{ container: Container }>("PrivateKeyFactory", ({ assert, beforeEach, it }) => {
	beforeEach((context) => {
		context.container = new Container();
		context.container.bind(Identifiers.Cryptography.Configuration).to(Configuration).inSingletonScope();
		context.container.bind(Identifiers.Cryptography.Identity.KeyPair.Factory).to(KeyPairFactory).inSingletonScope();
	});

	it("should derive from an mnemonic", async (context) => {
		assert.is(
			await context.container.get(PrivateKeyFactory, { autobind: true }).fromMnemonic(mnemonic),
			"4ebec3c261b3edf63769f2de1b8a0474c149ca043d7535acf9880673c27e2c62",
		);
	});

	it("should derive from a WIF", async (context) => {
		assert.is(
			await context.container
				.get(PrivateKeyFactory, { autobind: true })
				.fromWIF("KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWn", 128),
			"0000000000000000000000000000000000000000000000000000000000000001",
		);
	});
});
