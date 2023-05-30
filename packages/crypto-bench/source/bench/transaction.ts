import { fixtures } from "../fixtures";
import { ISandbox } from "../prepare-sandbox";

// TODO: different tx types

exports["tx-factory-fromData"] = async (sandbox: ISandbox) => {
    await sandbox.transactionFactory.fromData(fixtures.transactions.data);
}

exports["tx-factory-fromJson"] = async (sandbox: ISandbox) => {
    const tx = await sandbox.transactionFactory.fromJson(fixtures.transactions.json);

    await sandbox.transactionSerializer.serialize(tx);
}

exports["tx-factory-fromHex"] = async (sandbox: ISandbox) => {
    await sandbox.transactionFactory.fromHex(fixtures.transactions.serialized);
}
