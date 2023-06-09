import { Contracts, Identifiers } from "@mainsail/contracts";
import { Application, IpcWorker } from "@mainsail/kernel";
import { ServiceProvider as CoreCryptoTransaction } from "@mainsail/crypto-transaction";

import crypto from "@mainsail/core/bin/config/testnet/crypto.json";
import { ServiceProvider as CoreCryptoAddressBech32m } from "@mainsail/crypto-address-bech32m";
import { ServiceProvider as CoreCryptoConfig } from "@mainsail/crypto-config";
import { Configuration } from "@mainsail/crypto-config/source/configuration";
import { ServiceProvider as CoreCryptoHashBcrypto } from "@mainsail/crypto-hash-bcrypto";
import { ServiceProvider as CoreCryptoKeyPairSchnorr } from "@mainsail/crypto-key-pair-schnorr";
import { ServiceProvider as CoreCryptoSignatureSchnorr } from "@mainsail/crypto-signature-schnorr";
import { ServiceProvider as CoreCryptoTransactionTransfer } from "@mainsail/crypto-transaction-transfer";
import { ServiceProvider as CoreCryptoValidation } from "@mainsail/crypto-validation";
import { ServiceProvider as CoreCryptoWif } from "@mainsail/crypto-wif";
import { ServiceProvider as CoreWorker } from "@mainsail/crypto-worker";
import { ServiceProvider as CoreFees } from "@mainsail/fees";
import { ServiceProvider as CoreFeesStatic } from "@mainsail/fees-static";
import { ServiceProvider as CoreSerializer } from "@mainsail/serializer";
import { Sandbox } from "@mainsail/test-framework";
import { ServiceProvider as CoreValidation } from "@mainsail/validation";
import { BlockFactory, Deserializer, IDFactory, Serializer } from "@mainsail/crypto-block";

export interface ISandbox {
    readonly app: Application;
    readonly blockFactory: Contracts.Crypto.IBlockFactory;
    readonly transactionFactory: Contracts.Crypto.ITransactionFactory;
    readonly transactionSerializer: Contracts.Crypto.ITransactionSerializer;
    readonly workerPool: IpcWorker.WorkerPool;
    readonly worker: IpcWorker.Worker;
}

export const prepareSandbox = async (): Promise<ISandbox> => {
    const sandbox = new Sandbox();

    sandbox.app.bind(Identifiers.ConfigFlags).toConstantValue({ network: "testnet", token: "ark", env: "test" });

    await sandbox.app.resolve(CoreSerializer).register();
    await sandbox.app.resolve(CoreValidation).register();
    await sandbox.app.resolve(CoreCryptoConfig).register();
    await sandbox.app.resolve(CoreCryptoValidation).register();
    await sandbox.app.resolve(CoreCryptoHashBcrypto).register();
    await sandbox.app.resolve(CoreCryptoSignatureSchnorr).register();
    await sandbox.app.resolve(CoreCryptoKeyPairSchnorr).register();
    await sandbox.app.resolve(CoreCryptoAddressBech32m).register();
    await sandbox.app.resolve(CoreCryptoWif).register();
    await sandbox.app.resolve(CoreFees).register();
    await sandbox.app.resolve(CoreFeesStatic).register();
    await sandbox.app.resolve(CoreCryptoTransaction).register();
    await sandbox.app.resolve(CoreCryptoTransactionTransfer).register();
    await sandbox.app.resolve(CoreWorker).register();

    sandbox.app.bind(Identifiers.LogService).toConstantValue({ debug: () => { }, error: () => { }, info: () => { }, warning: () => { } });
    sandbox.app.bind(Identifiers.Cryptography.Block.Serializer).to(Serializer);
    sandbox.app.bind(Identifiers.Cryptography.Block.Deserializer).to(Deserializer);
    sandbox.app.bind(Identifiers.Cryptography.Block.IDFactory).to(IDFactory);
    sandbox.app.bind(Identifiers.Cryptography.Block.Factory).to(BlockFactory);

    sandbox.app.get<Configuration>(Identifiers.Cryptography.Configuration).setConfig(crypto);

    const workerPool = sandbox.app.get<IpcWorker.WorkerPool>(Identifiers.Ipc.WorkerPool);
    await workerPool.warmup(5);

    return {
        app: sandbox.app,
        blockFactory: sandbox.app.get<Contracts.Crypto.IBlockFactory>(Identifiers.Cryptography.Block.Factory),
        transactionFactory: sandbox.app.get<Contracts.Crypto.ITransactionFactory>(Identifiers.Cryptography.Transaction.Factory),
        transactionSerializer: sandbox.app.get<Contracts.Crypto.ITransactionSerializer>(Identifiers.Cryptography.Transaction.Serializer),
        workerPool,
        worker: await workerPool.getWorker(),
    };
};
