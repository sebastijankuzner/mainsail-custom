import Boom from "@hapi/boom";
import Hapi from "@hapi/hapi";
import {
	Contracts as ApiDatabaseContracts,
	Identifiers as ApiDatabaseIdentifiers,
	Search,
} from "@mainsail/api-database";
import { inject, injectable } from "@mainsail/container";
import { FunctionSigs } from "@mainsail/evm-contracts";

import { TransactionResource } from "../resources/index.js";
import { Controller } from "./controller.js";

@injectable()
export class VotesController extends Controller {
	@inject(ApiDatabaseIdentifiers.TransactionRepositoryFactory)
	private readonly transactionRepositoryFactory!: ApiDatabaseContracts.TransactionRepositoryFactory;

	public async index(request: Hapi.Request) {
		const criteria: Search.Criteria.TransactionCriteria = {
			...request.query,
			data: FunctionSigs.ConsensusV1.Vote,
		};

		const pagination = this.getListingPage(request);
		const sorting = this.getListingOrder(request);
		const options = this.getListingOptions();

		const walletRepository = this.walletRepositoryFactory();
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

	public async show(request: Hapi.Request) {
		const transaction = await this.transactionRepositoryFactory()
			.createQueryBuilder()
			.select()
			.where("hash = :hash", { hash: request.params.hash })
			.andWhere("SUBSTRING(data FROM 1 FOR 4) = :data", { data: `\\x${FunctionSigs.ConsensusV1.Vote.slice(2)}` })
			.getOne();

		if (!transaction) {
			return Boom.notFound("Vote not found");
		}

		return this.respondWithResource(
			await this.enrichTransaction(transaction, undefined, undefined, request.query.fullReceipt),
			TransactionResource,
		);
	}
}
