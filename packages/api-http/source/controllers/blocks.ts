import Boom from "@hapi/boom";
import Hapi from "@hapi/hapi";
import {
	Contracts as ApiDatabaseContracts,
	Identifiers as ApiDatabaseIdentifiers,
	Models,
	Search,
} from "@mainsail/api-database";
import { inject, injectable } from "@mainsail/container";
import { assert } from "@mainsail/utils";

import { BlockResource, TransactionResource } from "../resources/index.js";
import { Controller } from "./controller.js";

@injectable()
export class BlocksController extends Controller {
	@inject(ApiDatabaseIdentifiers.BlockRepositoryFactory)
	private readonly blockRepositoryFactory!: ApiDatabaseContracts.BlockRepositoryFactory;

	@inject(ApiDatabaseIdentifiers.TransactionRepositoryFactory)
	private readonly transactionRepositoryFactory!: ApiDatabaseContracts.TransactionRepositoryFactory;

	public async index(request: Hapi.Request) {
		const criteria: Search.Criteria.BlockCriteria = request.query;
		const pagination = this.getListingPage(request);
		const sorting = this.getListingOrder(request);
		const options = this.getListingOptions();

		const blocks = await this.blockRepositoryFactory().findManyByCriteria(criteria, sorting, pagination, options);
		if (blocks.results.length === 0) {
			return this.toPagination(blocks, BlockResource);
		}

		const generatorAddresses = blocks.results.map(({ proposer }) => proposer);
		const generators = await this.walletRepositoryFactory()
			.createQueryBuilder()
			.select()
			.where("address IN (:...addresses)", { addresses: generatorAddresses })
			.getMany();

		return this.toPagination(
			await this.enrichBlockResult(blocks, {
				generators: generators.reduce((accumulator, current) => {
					assert.string(current.address);
					accumulator[current.address] = current;
					return accumulator;
				}, {}),
			}),
			BlockResource,
		);
	}

	public async first(request: Hapi.Request) {
		const block = await this.blockRepositoryFactory()
			.createQueryBuilder()
			.select()
			.where("number = :number", { number: 0 })
			.getOne();

		return this.respondEnrichedBlock(block, request);
	}

	public async last(request: Hapi.Request) {
		const block = await this.blockRepositoryFactory()
			.createQueryBuilder()
			.select()
			.orderBy("number", "DESC")
			.limit(1)
			.getOne();

		return this.respondEnrichedBlock(block, request);
	}

	public async show(request: Hapi.Request) {
		const blockRepository = this.blockRepositoryFactory();
		const blockCriteria = this.getBlockCriteriaByIdOrHeight(request.params.id);

		const block = await blockRepository.findOneByCriteria(blockCriteria);

		return this.respondEnrichedBlock(block, request);
	}

	public async transactions(request: Hapi.Request) {
		const blockCriteria = this.getBlockCriteriaByIdOrHeight(request.params.id);
		const block = await this.blockRepositoryFactory().findOneByCriteria(blockCriteria);

		if (!block) {
			return Boom.notFound("Block not found");
		}

		const pagination = this.getListingPage(request);
		const sorting = this.getListingOrder(request);
		const options = this.getListingOptions();

		const walletRepository = this.walletRepositoryFactory();
		const criteria: Search.Criteria.TransactionCriteria = { ...request.query, blockHash: block.hash };

		const transactions = await this.transactionRepositoryFactory().findManyByCriteria(
			walletRepository,
			criteria,
			sorting,
			pagination,
			options,
		);

		return this.toPagination(
			await this.enrichTransactionResult(transactions, { fullReceipt: request.query.fullReceipt }),
			TransactionResource,
		);
	}

	private async respondEnrichedBlock(block: Models.Block | null, request: Hapi.Request) {
		return this.respondWithResource(await this.enrichBlock(block), BlockResource);
	}
}
