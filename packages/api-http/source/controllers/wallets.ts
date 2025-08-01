import Boom from "@hapi/boom";
import Hapi from "@hapi/hapi";
import {
	Contracts as ApiDatabaseContracts,
	Identifiers as ApiDatabaseIdentifiers,
	Models,
	Search,
} from "@mainsail/api-database";
import { inject, injectable } from "@mainsail/container";
import { FunctionSigs } from "@mainsail/evm-contracts";

import { TransactionResource } from "../resources/index.js";
import { WalletResource } from "../resources/wallet.js";
import { Controller } from "./controller.js";

@injectable()
export class WalletsController extends Controller {
	@inject(ApiDatabaseIdentifiers.TransactionRepositoryFactory)
	private readonly transactionRepositoryFactory!: ApiDatabaseContracts.TransactionRepositoryFactory;

	public async index(request: Hapi.Request) {
		const criteria: Search.Criteria.WalletCriteria = request.query;
		const pagination = this.getQueryPagination(request.query);
		const sorting = this.getListingOrder(request);
		const options = this.getListingOptions();

		const wallets = await this.walletRepositoryFactory().findManyByCriteria(criteria, sorting, pagination, options);

		return this.toPagination(wallets, WalletResource);
	}

	public async top(request: Hapi.Request) {
		const criteria: Search.Criteria.WalletCriteria = request.query;
		const pagination = this.getQueryPagination(request.query);
		const sorting = this.getListingOrder(request);
		const options = this.getListingOptions();

		const wallets = await this.walletRepositoryFactory().findManyByCriteria(criteria, sorting, pagination, options);

		return this.toPagination(wallets, WalletResource);
	}

	public async show(request: Hapi.Request) {
		const walletId = request.params.id as string;

		const wallet = await this.getWallet(walletId);

		return this.respondWithResource(wallet, WalletResource);
	}

	public async transactions(request: Hapi.Request) {
		const walletId = request.params.id as string;

		const wallet = await this.getWallet(walletId);
		if (!wallet) {
			return Boom.notFound("Wallet not found");
		}

		return this.getTransactions(request, { address: wallet.address });
	}

	public async transactionsSent(request: Hapi.Request) {
		const walletId = request.params.id as string;

		const wallet = await this.getWallet(walletId);
		if (!wallet) {
			return Boom.notFound("Wallet not found");
		}

		if (!wallet.publicKey) {
			return this.getEmptyPage();
		}

		return this.getTransactions(request, { senderPublicKey: wallet.publicKey });
	}

	public async transactionsReceived(request: Hapi.Request) {
		const walletId = request.params.id as string;

		const wallet = await this.getWallet(walletId);
		if (!wallet) {
			return Boom.notFound("Wallet not found");
		}

		return this.getTransactions(request, { to: wallet.address });
	}

	public async votes(request: Hapi.Request) {
		const walletId = request.params.id as string;

		const wallet = await this.getWallet(walletId);
		if (!wallet) {
			return Boom.notFound("Wallet not found");
		}

		if (!wallet.publicKey) {
			return this.getEmptyPage();
		}

		return this.getTransactions(request, {
			data: FunctionSigs.ConsensusV1.Vote,
			senderPublicKey: wallet.publicKey,
		});
	}

	private async getTransactions(request: Hapi.Request, criteria: Search.Criteria.TransactionCriteria) {
		const pagination = this.getListingPage(request);
		const sorting = this.getListingOrder(request);
		const options = this.getListingOptions();

		const transactions = await this.transactionRepositoryFactory().findManyByCriteria(
			this.walletRepositoryFactory(),
			{
				...request.query,
				...criteria,
			},
			sorting,
			pagination,
			options,
		);

		return this.toPagination(
			await this.enrichTransactionResult(transactions, { fullReceipt: request.query.fullReceipt }),
			TransactionResource,
		);
	}

	private async getWallet(walletId: string): Promise<Models.Wallet | null> {
		return this.walletRepositoryFactory()
			.createQueryBuilder()
			.select()
			.where("address = :address", { address: walletId })
			.orWhere("public_key = :publicKey", { publicKey: walletId })
			.orWhere("attributes @> :username", { username: { username: walletId } })
			.getOne();
	}
}
