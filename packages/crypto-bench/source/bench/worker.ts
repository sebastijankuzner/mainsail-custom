import { fixtures } from "../fixtures";
import { ISandbox } from "../prepare-sandbox";

// TODO: batch requests

// exports["worker-tx-factory-fromData"] = async (sandbox: ISandbox) => {
//     // TODO: requires marshalling between worker boundaries
//     // Error: transaction.nonce.toBigInt is not a function
//     // await sandbox.worker.transactionFactory("fromData", fixtures.transactions.data);
// }

exports["worker-tx-factory-fromJson"] = async (sandbox: ISandbox) => {
    await sandbox.worker.transactionFactory("fromJson", fixtures.transactions.json);
}

exports["worker-tx-factory-fromHex"] = async (sandbox: ISandbox) => {
    await sandbox.worker.transactionFactory("fromHex", fixtures.transactions.serialized);
}

exports["worker-block-factory-fromData-json-with-tx"] = async (sandbox: ISandbox) => {
    await sandbox.worker.blockFactory("fromJson", fixtures.blocks.withTransactionsJson);
}

exports["worker-bls12-381-verify"] = async (sandbox: ISandbox) => {
    const { message, signature, publicKey } = fixtures["bls12-381"];
    await sandbox.worker.consensusSignature("verify", signature, message, publicKey);
}

exports["worker-schnorr-verify"] = async (sandbox: ISandbox) => {
    const { message, signature, publicKey } = fixtures.schnorr;
    await sandbox.worker.walletSignature("verify", signature, message, publicKey);
}
