import { describe, Sandbox } from "../../../test-framework/source";
import { prepareSandbox, ApiContext } from "../../test/helpers/prepare-sandbox";
import { request } from "../../test/helpers/request";

import blocks from "../../test/fixtures/blocks.json";
import blocksResponse from "../../test/fixtures/blocks.response.json";
import blockTransactions from "../../test/fixtures/block_transactions.json";
import blockTransactionsResponse from "../../test/fixtures/block_transactions.response.json";
import wallets from "../../test/fixtures/wallets.json";

describe<{
	sandbox: Sandbox;
}>("Blocks", ({ it, afterAll, assert, afterEach, beforeAll, beforeEach, nock }) => {
	let apiContext: ApiContext;

	let options = {};

	beforeAll(async (context) => {
		nock.enableNetConnect();
		apiContext = await prepareSandbox(context);
	});

	afterAll((context) => {
		nock.disableNetConnect();
		apiContext.dispose();
	});

	beforeEach(async (context) => {
		await apiContext.reset();
		await apiContext.walletRepository.save(wallets);
	});

	afterEach(async (context) => {
		await apiContext.reset();
	});

	it("/blocks", async () => {
		const { statusCode, data } = await request("/blocks", options);
		assert.equal(statusCode, 200);
	});

	it("/blocks/first", async () => {
		await apiContext.blockRepository.save(blocks);

		const { statusCode, data } = await request("/blocks/first", options);
		assert.equal(statusCode, 200);
		assert.equal(data.data, blocksResponse[0]);
	});

	it("/blocks/last", async () => {
		await apiContext.blockRepository.save(blocks);

		const { statusCode, data } = await request("/blocks/last", options);
		assert.equal(statusCode, 200);
		assert.equal(data.data, blocksResponse[blocksResponse.length - 1]);
	});

	it("/blocks/{height}", async () => {
		await apiContext.blockRepository.save(blocks);

		const { statusCode, data } = await request("/blocks/1", options);
		assert.equal(statusCode, 200);
		assert.equal(data.data, blocksResponse[1]);
	});

	it("/blocks/{id}", async () => {
		await apiContext.blockRepository.save(blocks);

		const id = blocksResponse[blocksResponse.length - 1].hash;
		const { statusCode, data } = await request(`/blocks/${id}`, options);
		assert.equal(statusCode, 200);
		assert.equal(data.data, blocksResponse[blocksResponse.length - 1]);
	});

	it("/blocks/{id}/transactions", async () => {
		await apiContext.blockRepository.save(blocks);
		await apiContext.transactionRepository.save(blockTransactions);

		const { statusCode, data } = await request(`/blocks/1/transactions`, options);
		assert.equal(statusCode, 200);
		assert.equal(data.data, blockTransactionsResponse);
	});

	it("/blocks/{id}/transactions - 404 (Not Found)", async () => {
		await assert.rejects(async () => request(`/blocks/xxx/transactions`, options), "Response code 404 (Not Found)");
	});
});
