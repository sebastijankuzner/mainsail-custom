import { inject, injectable, tagged } from "@mainsail/container";
import { Contracts, Identifiers } from "@mainsail/contracts";
import { assert } from "@mainsail/utils";
import { strictEqual } from "assert";

@injectable()
export class TransactionValidator implements Contracts.Transactions.TransactionValidator {
	@inject(Identifiers.Evm.Instance)
	@tagged("instance", "validator")
	private readonly evm!: Contracts.Evm.Instance;

	@inject(Identifiers.Transaction.Handler.Registry)
	private readonly handlerRegistry!: Contracts.Transactions.TransactionHandlerRegistry;

	@inject(Identifiers.Cryptography.Transaction.Factory)
	private readonly transactionFactory!: Contracts.Crypto.TransactionFactory;

	public getEvm(): Contracts.Evm.Instance {
		return this.evm;
	}

	public async validate(
		context: Contracts.Transactions.TransactionValidatorContext,
		transaction: Contracts.Crypto.Transaction,
	): Promise<Contracts.Evm.TransactionReceipt> {
		const deserialized: Contracts.Crypto.Transaction = await this.transactionFactory.fromBytes(
			transaction.serialized,
		);
		strictEqual(transaction.hash, deserialized.hash);

		const { commitKey, gasLimit, timestamp, generatorAddress } = context;

		const handler = await this.handlerRegistry.getActivatedHandlerForData(transaction.data);
		const receipt = await handler.apply(
			{
				evm: {
					blockContext: {
						commitKey,
						gasLimit: BigInt(gasLimit),
						timestamp: BigInt(timestamp),
						validatorAddress: generatorAddress,
					},
					instance: this.evm,
				},
			},
			transaction,
		);

		assert.string(transaction.data.from);

		return receipt;
	}
}
