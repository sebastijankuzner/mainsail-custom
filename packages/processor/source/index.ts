import { injectable } from "@mainsail/container";
import { Identifiers } from "@mainsail/contracts";
import { Providers, Services } from "@mainsail/kernel";

import { ProcessBlockAction } from "./actions/process-block.js";
import { BlockProcessor } from "./block-processor.js";
import { BlockVerifier } from "./block-verifier.js";
import { TransactionProcessor } from "./transaction-processor.js";
import {
	ChainedVerifier,
	GasLimitVerifier,
	GeneratorVerifier,
	LegacyAttributeVerifier,
	RewardVerifier,
	SizeVerifier,
	TimestampVerifier,
	TransactionDuplicatesVerifier,
	TransactionLengthVerifier,
	TransactionsRootVerifier,
	VersionVerifier,
} from "./verifiers/index.js";

@injectable()
export class ServiceProvider extends Providers.ServiceProvider {
	public async register(): Promise<void> {
		this.app.bind(Identifiers.Processor.BlockVerifier).to(BlockVerifier).inSingletonScope();

		for (const handler of [
			ChainedVerifier,
			SizeVerifier,
			TimestampVerifier,
			GeneratorVerifier,
			VersionVerifier,
			RewardVerifier,
			TransactionLengthVerifier,
			TransactionDuplicatesVerifier,
			TransactionsRootVerifier,
			GasLimitVerifier,
			LegacyAttributeVerifier,
		]) {
			this.app.bind(Identifiers.Processor.BlockVerifierHandlers).to(handler);
		}

		this.app.bind(Identifiers.Processor.BlockProcessor).to(BlockProcessor).inSingletonScope();
		this.app.bind(Identifiers.Processor.TransactionProcessor).to(TransactionProcessor).inSingletonScope();

		this.#registerActions();
	}

	public async required(): Promise<boolean> {
		return true;
	}

	#registerActions(): void {
		this.app
			.get<Services.Triggers.Triggers>(Identifiers.Services.Trigger.Service)
			.bind("processBlock", new ProcessBlockAction());
	}
}
