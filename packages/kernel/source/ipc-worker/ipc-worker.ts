import { Subprocess } from "../ipc/sub-process";
import { KeyValuePair } from "../types";

export interface WorkerScriptHandler {
    boot(flags: KeyValuePair): Promise<void>
}

export type WorkerFactory = () => SubprocessWorker;

export type WorkerSubprocess = Subprocess<WorkerScriptHandler>;

export type WorkerSubprocessFactory = () => WorkerSubprocess;

export interface SubprocessWorker { }
