import { Container } from "@mainsail/container";
import { Contracts, Identifiers } from "@mainsail/contracts";
import { Configuration } from "@mainsail/crypto-config";

import { AddressFactory } from "../../crypto-address-base58/source/address.factory";
import { KeyPairFactory } from "../../crypto-key-pair-schnorr/source/pair";
import { PublicKeyFactory } from "../../crypto-key-pair-schnorr/source/public";
import { describeSkip } from "../../test-framework/source";
import { Stub } from "../../test-runner/distribution/stub";
import { Mempool } from ".";

describeSkip<{
	container: Container;
	logger: any;
	config: Configuration;
	createSenderMempool: Stub;
	createPublicKey: (mnemonic: string) => Promise<string>;
}>("Mempool", ({ it, beforeAll, assert, beforeEach, spy, stub, stubFn }) => {
	beforeAll((context) => {
		context.createSenderMempool = stubFn();
		context.logger = { debug: () => {} };

		context.container = new Container();
		context.container
			.bind(Identifiers.TransactionPool.SenderMempool.Factory)
			.toConstantValue(context.createSenderMempool);
		context.container.bind(Identifiers.Services.Log.Service).toConstantValue(context.logger);
		context.container.bind(Identifiers.Cryptography.Identity.Address.Factory).to(AddressFactory);
		context.container.bind(Identifiers.Cryptography.Identity.PublicKey.Factory).to(PublicKeyFactory);
		context.container.bind(Identifiers.Cryptography.Identity.KeyPair.Factory).to(KeyPairFactory);
		context.container.bind(Identifiers.Cryptography.Configuration).to(Configuration).inSingletonScope();

		context.config = context.container.get<Configuration>(Identifiers.Cryptography.Configuration);

		const factory = context.container.get<Contracts.Crypto.PublicKeyFactory>(
			Identifiers.Cryptography.Identity.PublicKey.Factory,
		);

		context.createPublicKey = async (mnemonic: string) => await factory.fromMnemonic(mnemonic);
	});

	beforeEach((context) => {
		stub(context.config, "getMilestone").returnValue({ address: { base58: "ark" } });
	});

	it("getSize - should return sum of transaction counts of sender states", async (context) => {
		const senderMempool1 = {
			addTransaction: () => {},
			getSize: () => 10,
			isDisposable: () => false,
		};

		const senderMempool2 = {
			addTransaction: () => {},
			getSize: () => 20,
			isDisposable: () => false,
		};

		context.createSenderMempool.returnValueNth(0, senderMempool1).returnValueNth(1, senderMempool2);

		const transaction1 = {
			data: { senderPublicKey: await context.createPublicKey("sender1") },
			id: "transaction1-id",
		} as Contracts.Crypto.Transaction;

		const transaction2 = {
			data: { senderPublicKey: await context.createPublicKey("sender2") },
			id: "transaction2-id",
		} as Contracts.Crypto.Transaction;

		const memory = context.container.get(Mempool, { autobind: true });
		await memory.addTransaction(transaction1);
		await memory.addTransaction(transaction2);
		const size = memory.getSize();

		assert.equal(size, 30);
	});

	it("hasSenderMempool - should return true if sender's transaction was added previously", async (context) => {
		const senderMempool = {
			addTransaction: () => {},
			isDisposable: () => false,
		};

		context.createSenderMempool.returnValue(senderMempool);

		const transaction = {
			data: { senderPublicKey: await context.createPublicKey("sender") },
			id: "transaction-id",
		} as Contracts.Crypto.Transaction;

		const memory = context.container.get(Mempool, { autobind: true });
		await memory.addTransaction(transaction);
		const has = memory.hasSenderMempool(transaction.data.senderPublicKey);

		assert.true(has);
	});

	it("hasSenderMempool - should return false if sender's transaction wasn't added previously", async (context) => {
		const senderMempool = {
			addTransaction: () => {},
			isDisposable: () => false,
		};

		context.createSenderMempool.returnValue(senderMempool);

		const transaction = {
			data: { senderPublicKey: await context.createPublicKey("sender") },
			id: "transaction-id",
		} as Contracts.Crypto.Transaction;

		const memory = context.container.get(Mempool, { autobind: true });
		await memory.addTransaction(transaction);
		const has = memory.hasSenderMempool(await context.createPublicKey("not sender"));

		assert.false(has);
	});

	it("getSenderMempool - should return sender state if sender's transaction was added previously", async (context) => {
		const senderMempool = {
			addTransaction: () => {},
			isDisposable: () => false,
		};

		context.createSenderMempool.returnValue(senderMempool);

		const transaction = {
			data: { senderPublicKey: await context.createPublicKey("sender") },
			id: "transaction-id",
		} as Contracts.Crypto.Transaction;

		const memory = context.container.get(Mempool, { autobind: true });
		await memory.addTransaction(transaction);

		assert.equal(memory.getSenderMempool(transaction.data.senderPublicKey), senderMempool);
	});

	it("getSenderMempool - should throw if sender's transaction wasn't added previously", async (context) => {
		const senderMempool = {
			addTransaction: () => {},
			isDisposable: () => false,
		};

		context.createSenderMempool.returnValueNth(0, senderMempool);

		const transaction = {
			data: { senderPublicKey: await context.createPublicKey("sender") },
			id: "transaction-id",
		} as Contracts.Crypto.Transaction;

		const key = await context.createPublicKey("not sender");

		const memory = context.container.get(Mempool, { autobind: true });
		await memory.addTransaction(transaction);
		const callback = () => memory.getSenderMempool(key);

		assert.throws(callback);
	});

	it("getSenderMempools - should return all sender states", async (context) => {
		const senderMempool1 = {
			addTransaction: () => {},
			isDisposable: () => false,
		};

		const senderMempool2 = {
			addTransaction: () => {},
			isDisposable: () => false,
		};

		context.createSenderMempool.returnValueNth(0, senderMempool1).returnValueNth(1, senderMempool2);

		const transaction1 = {
			data: { senderPublicKey: await context.createPublicKey("sender1") },
			id: "transaction1-id",
		} as Contracts.Crypto.Transaction;

		const transaction2 = {
			data: { senderPublicKey: await context.createPublicKey("sender2") },
			id: "transaction2-id",
		} as Contracts.Crypto.Transaction;

		const memory = context.container.get(Mempool, { autobind: true });
		await memory.addTransaction(transaction1);
		await memory.addTransaction(transaction2);
		const senderMempools = memory.getSenderMempools();

		assert.length([...senderMempools], 2);
	});

	it("addTransaction - should add transaction to sender state", async (context) => {
		const senderMempool = {
			addTransaction: () => {},
			isDisposable: () => false,
		};

		context.createSenderMempool.returnValue(senderMempool);

		const addTransactionSpy = spy(senderMempool, "addTransaction");

		const transaction = {
			data: { senderPublicKey: await context.createPublicKey("sender1") },
			id: "transaction-id",
		} as Contracts.Crypto.Transaction;

		const loggerSpy = spy(context.logger, "debug");

		const memory = context.container.get(Mempool, { autobind: true });
		await memory.addTransaction(transaction);

		addTransactionSpy.calledWith(transaction);
		loggerSpy.calledOnce();
	});

	it("addTransaction - should forget sender state if it's empty even if error was thrown", async (context) => {
		const error = new Error("Something went horribly wrong");

		const senderMempool = {
			addTransaction: () => {},
			isDisposable: () => true,
		};

		stub(senderMempool, "addTransaction").rejectedValue(error);

		context.createSenderMempool.returnValue(senderMempool);

		const transaction = {
			data: { senderPublicKey: await context.createPublicKey("sender1") },
			id: "transaction-id",
		} as Contracts.Crypto.Transaction;

		const loggerSpy = spy(context.logger, "debug");

		const memory = context.container.get(Mempool, { autobind: true });
		const promise = memory.addTransaction(transaction);

		await assert.rejects(() => promise, "Something went horribly wrong");

		const has = memory.hasSenderMempool(transaction.data.senderPublicKey);

		loggerSpy.calledTimes(2);
		assert.false(has);
	});

	it("removeTransaction - should return empty array when removing transaction of sender that wasn't previously added", async (context) => {
		const transaction = {
			data: { senderPublicKey: await context.createPublicKey("sender1") },
			id: "transaction-id",
		} as Contracts.Crypto.Transaction;

		const memory = context.container.get(Mempool, { autobind: true });
		const removedTransactions = await memory.removeTransaction(transaction.data.senderPublicKey, transaction.id);

		assert.equal(removedTransactions, []);
	});

	it("removeTransaction - should remove previously added transaction and return list of removed transactions", async (context) => {
		const transaction = {
			data: { senderPublicKey: await context.createPublicKey("sender1") },
			id: "transaction-id",
		} as Contracts.Crypto.Transaction;

		const senderMempool = {
			addTransaction: () => {},
			isDisposable: () => false,
			removeTransaction: () => {},
		};

		const removeTransactionStub = stub(senderMempool, "removeTransaction").returnValue([transaction]);

		context.createSenderMempool.returnValue(senderMempool);

		const loggerSpy = spy(context.logger, "debug");

		const memory = context.container.get(Mempool, { autobind: true });
		await memory.addTransaction(transaction);
		const removedTransactions = await memory.removeTransaction(transaction.data.senderPublicKey, transaction.id);

		removeTransactionStub.calledWith(transaction.id);
		assert.equal(removedTransactions, [transaction]);
		loggerSpy.calledOnce();
	});

	it("removeTransaction - should forget sender state if it's empty even if error was thrown", async (context) => {
		const error = new Error("Something went horribly wrong");
		const transaction = {
			data: { senderPublicKey: await context.createPublicKey("sender1") },
			id: "transaction-id",
		} as Contracts.Crypto.Transaction;

		const senderMempool = {
			addTransaction: () => {},
			isDisposable: () => {},
			removeTransaction: () => {},
		};

		stub(senderMempool, "removeTransaction").rejectedValue(error);
		stub(senderMempool, "isDisposable").returnValueNth(0, false).returnValueNth(1, true);

		context.createSenderMempool.returnValue(senderMempool);

		const loggerSpy = spy(context.logger, "debug");

		const memory = context.container.get(Mempool, { autobind: true });
		await memory.addTransaction(transaction);
		const promise = memory.removeTransaction(transaction.data.senderPublicKey, transaction.id);

		await assert.rejects(() => promise, "Something went horribly wrong");

		const has = memory.hasSenderMempool(transaction.data.senderPublicKey);

		loggerSpy.calledTimes(2);
		assert.false(has);
	});

	it("removeForgedTransaction - should return empty array when accepting transaction of sender that wasn't previously added", async (context) => {
		const memory = context.container.get(Mempool, { autobind: true });
		const removedTransactions = await memory.removeForgedTransaction(
			await context.createPublicKey("sender1"),
			"none",
		);

		assert.equal(removedTransactions, []);
	});

	it("removeForgedTransaction - should remove previously added transaction and return list of removed transactions", async (context) => {
		const transaction = {
			data: { senderPublicKey: await context.createPublicKey("sender1") },
			id: "transaction-id",
		} as Contracts.Crypto.Transaction;

		const senderMempool = {
			addTransaction: () => {},
			isDisposable: () => false,
			removeForgedTransaction: () => {},
		};

		const removeStub = stub(senderMempool, "removeForgedTransaction").returnValue([transaction]);

		context.createSenderMempool.returnValue(senderMempool);

		const loggerSpy = spy(context.logger, "debug");

		const memory = context.container.get(Mempool, { autobind: true });
		await memory.addTransaction(transaction);
		const removedTransactions = await memory.removeForgedTransaction(
			transaction.data.senderPublicKey,
			transaction.id,
		);

		removeStub.calledWith(transaction.id);
		assert.equal(removedTransactions, [transaction]);
		loggerSpy.calledOnce();
	});

	it("removeForgedTransaction - should forget sender state if it's empty even if error was thrown", async (context) => {
		const error = new Error("Something went horribly wrong");
		const transaction = {
			data: { senderPublicKey: await context.createPublicKey("sender1") },
			id: "transaction-id",
		} as Contracts.Crypto.Transaction;

		const senderMempool = {
			addTransaction: () => {},
			isDisposable: () => {},
			removeForgedTransaction: () => {},
		};

		stub(senderMempool, "removeForgedTransaction").rejectedValue(error);
		stub(senderMempool, "isDisposable").returnValueNth(0, false).returnValueNth(1, true);

		context.createSenderMempool.returnValue(senderMempool);

		const loggerSpy = spy(context.logger, "debug");

		const memory = context.container.get(Mempool, { autobind: true });
		await memory.addTransaction(transaction);
		const promise = memory.removeForgedTransaction(transaction.data.senderPublicKey, transaction.id);

		await assert.rejects(() => promise, "Something went horribly wrong");

		const has = memory.hasSenderMempool(transaction.data.senderPublicKey);

		loggerSpy.calledTimes(2);
		assert.false(has);
	});

	it("flush - should remove all sender states", async (context) => {
		const senderMempool = {
			addTransaction: () => {},
			isDisposable: () => false,
		};

		context.createSenderMempool.returnValue(senderMempool);

		const transaction = {
			data: { senderPublicKey: await context.createPublicKey("sender1") },
			id: "transaction-id",
		} as Contracts.Crypto.Transaction;

		const memory = context.container.get(Mempool, { autobind: true });
		await memory.addTransaction(transaction);
		memory.flush();
		const has = memory.hasSenderMempool(transaction.data.senderPublicKey);

		assert.false(has);
	});
});
