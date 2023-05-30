import { fixtures } from "../fixtures";
import { ISandbox } from "../prepare-sandbox";

exports["block-factory-fromData"] = async (sandbox: ISandbox) => {
    await sandbox.blockFactory.fromData(fixtures.blocks.withoutTransactions);
}

exports["block-factory-fromData-with-tx"] = async (sandbox: ISandbox) => {
    await sandbox.blockFactory.fromData(fixtures.blocks.withTransactions);
}

exports["block-factory-fromData-json"] = async (sandbox: ISandbox) => {
    await sandbox.blockFactory.fromJson(fixtures.blocks.withoutTransactionsJson);
}

exports["block-factory-fromData-json-with-tx"] = async (sandbox: ISandbox) => {
    await sandbox.blockFactory.fromJson(fixtures.blocks.withTransactionsJson);
}

// TODO: full block

exports["block-factory-fromHex"] = async (sandbox: ISandbox) => {
    await sandbox.blockFactory.fromHex(fixtures.blocks.serialized);
}

exports["block-factory-fromHex-with-tx"] = async (sandbox: ISandbox) => {
    await sandbox.blockFactory.fromHex(fixtures.blocks.serializedWithTransactions);
}