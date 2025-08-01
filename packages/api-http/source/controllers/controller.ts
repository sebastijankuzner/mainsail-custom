import { AbstractController } from "@mainsail/api-common";
import {
	Contracts as ApiDatabaseContracts,
	Identifiers as ApiDatabaseIdentifiers,
	Models,
	Search,
} from "@mainsail/api-database";
import { inject, injectable, tagged } from "@mainsail/container";
import { Contracts, Identifiers } from "@mainsail/contracts";
import { Providers } from "@mainsail/kernel";
import { assert } from "@mainsail/utils";

import { EnrichedBlock, EnrichedTransaction } from "../resources/index.js";

@injectable()
export class Controller extends AbstractController {
	@inject(Identifiers.ServiceProvider.Configuration)
	@tagged("plugin", "api-http")
	protected readonly apiConfiguration!: Providers.PluginConfiguration;

	@inject(ApiDatabaseIdentifiers.StateRepositoryFactory)
	protected readonly stateRepositoryFactory!: ApiDatabaseContracts.StateRepositoryFactory;

	@inject(ApiDatabaseIdentifiers.ConfigurationRepositoryFactory)
	private readonly configurationRepositoryFactory!: ApiDatabaseContracts.ConfigurationRepositoryFactory;

	@inject(ApiDatabaseIdentifiers.ReceiptRepositoryFactory)
	protected readonly receiptRepositoryFactory!: ApiDatabaseContracts.ReceiptRepositoryFactory;

	@inject(ApiDatabaseIdentifiers.WalletRepositoryFactory)
	protected readonly walletRepositoryFactory!: ApiDatabaseContracts.WalletRepositoryFactory;

	protected getListingOptions(): Contracts.Api.Options {
		const estimateTotalCount = this.apiConfiguration.getOptional<boolean>("options.estimateTotalCount", true);

		return {
			estimateTotalCount,
		};
	}

	protected async getState(): Promise<Models.State> {
		const stateRepository = this.stateRepositoryFactory();
		const state = await stateRepository.createQueryBuilder().getOne();
		return state ?? ({ blockNumber: "0", supply: "0" } as Models.State);
	}

	protected async getConfiguration(): Promise<Models.Configuration> {
		const configurationRepository = this.configurationRepositoryFactory();
		const configuration = await configurationRepository.createQueryBuilder().getOne();

		return configuration ?? ({} as Models.Configuration);
	}

	protected async getReceipts(hashes: string[], full = false): Promise<Record<string, Models.Receipt>> {
		const receiptRepository = this.receiptRepositoryFactory();

		const receipts = await receiptRepository
			.createQueryBuilder("receipt")
			.select(this.getReceiptColumns(full))
			.whereInIds(hashes)
			.getMany();

		return receipts.reduce((accumulator, current) => {
			accumulator[current.transactionHash] = current;
			return accumulator;
		}, {});
	}

	protected async enrichBlockResult(
		resultPage: Search.ResultsPage<Models.Block>,
		{ state, generators }: { state?: Models.State; generators: Record<string, Models.Wallet> },
	): Promise<Search.ResultsPage<EnrichedBlock>> {
		state = state ?? (await this.getState());

		const enriched: Promise<EnrichedBlock | null>[] = [];
		for (const block of resultPage.results) {
			enriched.push(this.enrichBlock(block, state, generators[block.proposer]));
		}

		// @ts-ignore
		resultPage.results = await Promise.all(enriched);
		return resultPage as Search.ResultsPage<EnrichedBlock>;
	}

	protected async enrichBlock(
		block: Models.Block | null,
		state?: Models.State,
		generator?: Models.Wallet,
	): Promise<EnrichedBlock | null> {
		if (!block) {
			return null;
		}

		const promises: Promise<any>[] = [];
		if (!state) {
			promises.push(
				(async () => {
					state = await this.getState();
				})(),
			);
		}

		if (!generator) {
			promises.push(
				(async () => {
					generator = (await this.walletRepositoryFactory()
						.createQueryBuilder()
						.select()
						.where("address = :address", { address: block.proposer })
						.getOne()) ?? {
						address: block.proposer,
						attributes: {},
						balance: "0",
						nonce: "0",
						publicKey: "",
						updated_at: "0",
					};
				})(),
			);
		}

		if (promises.length > 0) {
			await Promise.all(promises);
		}

		assert.defined(generator);
		assert.defined(state);

		return { ...block, generator, state };
	}

	protected async enrichTransactionResult(
		resultPage: Search.ResultsPage<Models.Transaction>,
		context?: { state?: Models.State; fullReceipt?: boolean },
	): Promise<Search.ResultsPage<EnrichedTransaction>> {
		const [state, receipts] = await Promise.all([
			context?.state ?? this.getState(),
			this.getReceipts(
				resultPage.results.map((tx) => tx.hash),
				context?.fullReceipt ?? false,
			),
		]);

		return {
			...resultPage,
			results: await Promise.all(
				resultPage.results.map((tx) =>
					this.enrichTransaction(tx, state, receipts[tx.hash] ?? null, context?.fullReceipt),
				),
			),
		};
	}

	protected async enrichTransaction(
		transaction: Models.Transaction,
		state?: Models.State,
		receipt?: Models.Receipt | null,
		fullReceipt?: boolean,
	): Promise<EnrichedTransaction> {
		const [_state, receipts] = await Promise.all([
			state ? state : this.getState(),
			receipt !== undefined ? receipt : this.getReceipts([transaction.hash], fullReceipt),
		]);

		return { ...transaction, receipt: receipt ?? receipts?.[transaction.hash] ?? undefined, state: _state };
	}

	protected getBlockCriteriaByIdOrHeight(idOrHeight: string): Search.Criteria.OrBlockCriteria {
		const asHeight = Number(idOrHeight);
		// NOTE: This assumes all block ids are sha256 and never a valid number below this threshold.
		return !isNaN(asHeight) && asHeight <= Number.MAX_SAFE_INTEGER ? { number: asHeight } : { hash: idOrHeight };
	}

	protected getReceiptColumns(fullReceipt?: boolean): string[] {
		let columns = [
			"receipt.transactionHash",
			"receipt.status",
			"receipt.gasUsed",
			"receipt.gasRefunded",
			"receipt.contractAddress",
		];
		if (fullReceipt) {
			columns = [...columns, "receipt.output", "receipt.logs"];
		}

		return columns;
	}
}
