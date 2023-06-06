import { Contracts } from "@mainsail/contracts";
import { Requests } from "../ipc/handler";
import { Subprocess } from "../ipc/sub-process";
import { KeyValuePair } from "../types";

export interface WorkerScriptHandler {
    boot(flags: KeyValuePair): Promise<void>
    consensusSignature<K extends Requests<Contracts.Crypto.ISignature>>(method: K, ...args: Parameters<Contracts.Crypto.ISignature[K]>): Promise<ReturnType<Contracts.Crypto.ISignature[K]>>;
    walletSignature<K extends Requests<Contracts.Crypto.ISignature>>(method: K, ...args: Parameters<Contracts.Crypto.ISignature[K]>): Promise<ReturnType<Contracts.Crypto.ISignature[K]>>;
    blockFactory<K extends Requests<Contracts.Crypto.IBlockFactory>>(method: K, ...args: Parameters<Contracts.Crypto.IBlockFactory[K]>): Promise<ReturnType<Contracts.Crypto.IBlockFactory[K]>>;
    transactionFactory<K extends Requests<Contracts.Crypto.ITransactionFactory>>(method: K, ...args: Parameters<Contracts.Crypto.ITransactionFactory[K]>): Promise<ReturnType<Contracts.Crypto.ITransactionFactory[K]>>;
}

export type WorkerFactory = () => Worker;

export type WorkerSubprocess = Subprocess<WorkerScriptHandler>;

export type WorkerSubprocessFactory = () => WorkerSubprocess;

export interface Worker extends WorkerScriptHandler {
    getQueueSize(): number;
    kill(signal?: number | NodeJS.Signals): Promise<boolean>;
}

export interface WorkerPool {
    getWorker(): Promise<Worker>;
    warmup(workers: number): Promise<void>;
    shutdown(signal?: number | NodeJS.Signals): Promise<void>;
}