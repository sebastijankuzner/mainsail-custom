import { Container } from "@mainsail/container";
import { Identifiers } from "@mainsail/contracts";
import { Configuration } from "@mainsail/crypto-config";
import { Application } from "@mainsail/kernel";
import { fileSync, setGracefulCleanup } from "tmp";

import { describe } from "../../test-framework/source";
import { Storage } from ".";

describe<{
	configuration: any;
	app: Application;
	config: Configuration;
}>("Storage", ({ it, beforeAll, beforeEach, assert, stub }) => {
	beforeAll(() => setGracefulCleanup());

	beforeEach(async (context) => {
		context.configuration = { getRequired: () => {} };

		context.app = new Application(new Container());
		context.app.bind(Identifiers.ServiceProvider.Configuration).toConstantValue(context.configuration);
	});

	it("boot - should instantiate BetterSqlite3 with file storage", (context) => {
		const temporaryFile = fileSync();

		stub(context.configuration, "getRequired").returnValueOnce(temporaryFile.name); // storage
		const storage = context.app.resolve(Storage);
		storage.boot();

		const database = storage.getDatabase();
		assert.equal(database.name, temporaryFile.name);
		assert.true(database.open);
		storage.dispose();
	});

	it("boot - should instantiate BetterSqlite3 in-memory<", (context) => {
		stub(context.configuration, "getRequired").returnValueOnce(":memory:"); // storage
		const storage = context.app.resolve(Storage);
		storage.boot();

		try {
			const database = storage.getDatabase();

			assert.equal(database.name, ":memory:");
			assert.true(database.open);
		} finally {
			storage.dispose();
		}
	});

	it("dispose - should close database", (context) => {
		stub(context.configuration, "getRequired").returnValueOnce(":memory:"); // storage
		const storage = context.app.resolve(Storage);
		storage.boot();
		const database = storage.getDatabase();

		storage.dispose();

		assert.false(database.open);
	});

	it("hasTransaction - should find transaction that was added", (context) => {
		stub(context.configuration, "getRequired").returnValueOnce(":memory:"); // storage
		const storage = context.app.resolve(Storage);
		storage.boot();

		try {
			storage.addTransaction({
				blockNumber: 100,
				hash: "first-tx-hash",
				senderPublicKey: "some-public-key",
				serialized: Buffer.from("test"),
			});

			const has = storage.hasTransaction("first-tx-hash");
			assert.true(has);
		} finally {
			storage.dispose();
		}
	});

	it("hasTransaction - should not find transaction that wasn't added", (context) => {
		stub(context.configuration, "getRequired").returnValueOnce(":memory:"); // storage
		const storage = context.app.resolve(Storage);
		storage.boot();

		try {
			storage.addTransaction({
				blockNumber: 100,
				hash: "first-tx-hash",
				senderPublicKey: "some-public-key",
				serialized: Buffer.from("test"),
			});

			const has = storage.hasTransaction("second-tx-id");
			assert.false(has);
		} finally {
			storage.dispose();
		}
	});

	it("getAllTransactions - should return all added transactions", (context) => {
		stub(context.configuration, "getRequired").returnValueOnce(":memory:"); // storage
		const storage = context.app.resolve(Storage);
		storage.boot();

		try {
			const storedTransaction1 = {
				blockNumber: 100,
				hash: "first-tx-hash",
				senderPublicKey: "some-public-key",
				serialized: Buffer.from("test"),
			};

			const storedTransaction2 = {
				blockNumber: 200,
				hash: "second-tx-hash",
				senderPublicKey: "second-public-key",
				serialized: Buffer.from("second-serialized"),
			};

			storage.addTransaction(storedTransaction1);
			storage.addTransaction(storedTransaction2);

			const allTransactions = [...storage.getAllTransactions()];
			assert.equal(allTransactions, [storedTransaction1, storedTransaction2]);
		} finally {
			storage.dispose();
		}
	});

	it("getOldTransactions - should return only old transactions", (context) => {
		stub(context.configuration, "getRequired").returnValueOnce(":memory:"); // storage
		const storage = context.app.resolve(Storage);
		storage.boot();

		try {
			const storedTransaction1 = {
				blockNumber: 100,
				hash: "first-tx-hash",
				senderPublicKey: "some-public-key",
				serialized: Buffer.from("test"),
			};

			const storedTransaction2 = {
				blockNumber: 200,
				hash: "second-tx-hash",
				senderPublicKey: "second-public-key",
				serialized: Buffer.from("second-serialized"),
			};

			storage.addTransaction(storedTransaction1);
			storage.addTransaction(storedTransaction2);

			const oldTransactions = [...storage.getOldTransactions(100)];
			assert.equal(oldTransactions, [storedTransaction1]);
		} finally {
			storage.dispose();
		}
	});

	it("getOldTransactions - should return all old transactions", (context) => {
		stub(context.configuration, "getRequired").returnValueOnce(":memory:"); // storage
		const storage = context.app.resolve(Storage);
		storage.boot();

		try {
			const storedTransaction1 = {
				blockNumber: 100,
				hash: "first-tx-hash",
				senderPublicKey: "some-public-key",
				serialized: Buffer.from("test"),
			};

			const storedTransaction2 = {
				blockNumber: 200,
				hash: "second-tx-hash",
				senderPublicKey: "second-public-key",
				serialized: Buffer.from("second-serialized"),
			};

			storage.addTransaction(storedTransaction1);
			storage.addTransaction(storedTransaction2);

			const oldTransactions = [...storage.getOldTransactions(200)];
			assert.equal(oldTransactions, [storedTransaction2, storedTransaction1]);
		} finally {
			storage.dispose();
		}
	});

	it("getOldTransactions - should return N old transactions", (context) => {
		stub(context.configuration, "getRequired").returnValueOnce(":memory:"); // storage
		const storage = context.app.resolve(Storage);
		storage.boot();

		try {
			const storedTransaction1 = {
				blockNumber: 100,
				hash: "first-tx-hash",
				senderPublicKey: "some-public-key",
				serialized: Buffer.from("test"),
			};

			const storedTransaction2 = {
				blockNumber: 200,
				hash: "second-tx-hash",
				senderPublicKey: "second-public-key",
				serialized: Buffer.from("second-serialized"),
			};

			const storedTransaction3 = {
				blockNumber: 300,
				hash: "third-tx-hash",
				senderPublicKey: "third-public-key",
				serialized: Buffer.from("third-serialized"),
			};

			storage.addTransaction(storedTransaction1);
			storage.addTransaction(storedTransaction2);
			storage.addTransaction(storedTransaction3);

			let oldTransactions = [...storage.getOldTransactions(300, 2)];
			assert.equal(oldTransactions, [storedTransaction3, storedTransaction2]);

			oldTransactions = [...storage.getOldTransactions(300, 5)];
			assert.equal(oldTransactions, [storedTransaction3, storedTransaction2, storedTransaction1]);

			oldTransactions = [...storage.getOldTransactions(100, 2)];
			assert.equal(oldTransactions, [storedTransaction1]);

			oldTransactions = [...storage.getOldTransactions(200, 2)];
			assert.equal(oldTransactions, [storedTransaction2, storedTransaction1]);
		} finally {
			storage.dispose();
		}
	});

	it("addTransaction - should add new transaction", (context) => {
		stub(context.configuration, "getRequired").returnValueOnce(":memory:"); // storage
		const storage = context.app.resolve(Storage);
		storage.boot();

		try {
			storage.addTransaction({
				blockNumber: 100,
				hash: "first-tx-hash",
				senderPublicKey: "some-public-key",
				serialized: Buffer.from("test"),
			});

			const has = storage.hasTransaction("first-tx-hash");
			assert.true(has);
		} finally {
			storage.dispose();
		}
	});

	it("addTransaction - should throw when adding same transaction twice", (context) => {
		stub(context.configuration, "getRequired").returnValueOnce(":memory:"); // storage
		const storage = context.app.resolve(Storage);
		storage.boot();

		try {
			storage.addTransaction({
				blockNumber: 100,
				hash: "first-tx-hash",
				senderPublicKey: "some-public-key",
				serialized: Buffer.from("test"),
			});

			assert.throws(() => {
				storage.addTransaction({
					blockNumber: 100,
					hash: "first-tx-hash",
					senderPublicKey: "some-public-key",
					serialized: Buffer.from("test"),
				});
			});
		} finally {
			storage.dispose();
		}
	});

	it("removeTransaction - should remove previously added transaction", (context) => {
		stub(context.configuration, "getRequired").returnValueOnce(":memory:"); // storage
		const storage = context.app.resolve(Storage);
		storage.boot();

		try {
			storage.addTransaction({
				blockNumber: 100,
				hash: "first-tx-hash",
				senderPublicKey: "some-public-key",
				serialized: Buffer.from("test"),
			});

			storage.removeTransaction("first-tx-hash");

			const has = storage.hasTransaction("first-tx-hash");
			assert.false(has);
		} finally {
			storage.dispose();
		}
	});

	it("flush - should remove all previously added transactions", (context) => {
		stub(context.configuration, "getRequired").returnValueOnce(":memory:"); // storage
		const storage = context.app.resolve(Storage);
		storage.boot();

		try {
			storage.addTransaction({
				blockNumber: 100,
				hash: "first-tx-hash",
				senderPublicKey: "dummy-sender-key-1",
				serialized: Buffer.from("dummy-serialized-1"),
			});

			storage.addTransaction({
				blockNumber: 100,
				hash: "second-tx-hash",
				senderPublicKey: "dummy-sender-key-2",
				serialized: Buffer.from("dummy-serialized-2"),
			});

			storage.flush();

			const allTransactions = [...storage.getAllTransactions()];
			assert.equal(allTransactions, []);
		} finally {
			storage.dispose();
		}
	});
});
