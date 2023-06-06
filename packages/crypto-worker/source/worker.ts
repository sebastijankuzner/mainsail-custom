import { Contracts, Identifiers } from "@mainsail/contracts";
import { Ipc, IpcWorker, Types, Utils } from "@mainsail/kernel";
import { inject, injectable, postConstruct } from "@mainsail/container";

@injectable()
export class Worker implements IpcWorker.Worker {
    @inject(Identifiers.Ipc.WorkerSubprocessFactory)
    private readonly createWorkerSubprocess!: IpcWorker.WorkerSubprocessFactory;

    private ipcSubprocess!: Ipc.Subprocess<IpcWorker.WorkerScriptHandler>;

    #booted = false;
    #booting = false;

    @postConstruct()
    public async postConstruct(): Promise<void> {
        this.ipcSubprocess = this.createWorkerSubprocess();
    }

    public async boot(flags: Types.KeyValuePair): Promise<void> {
        while (this.#booting) {
            await Utils.sleep(50);
        }

        if (this.#booted) {
            return;
        }

        this.#booting = true;

        await this.ipcSubprocess.sendRequest("boot", flags);

        this.#booting = false;
        this.#booted = true;
    }

    public async kill(signal?: number | NodeJS.Signals): Promise<boolean> {
        // TODO: gracefull shutdown
        return this.ipcSubprocess.kill(signal);
    }

    public getQueueSize(): number {
        return this.ipcSubprocess.getQueueSize();
    }

    public async consensusSignature<K extends Ipc.Requests<Contracts.Crypto.ISignature>>(method: K, ...args: Parameters<Contracts.Crypto.ISignature[K]>): Promise<ReturnType<Contracts.Crypto.ISignature[K]>> {
        return this.ipcSubprocess.sendRequest("consensusSignature", method, args);
    }

    public async walletSignature<K extends Ipc.Requests<Contracts.Crypto.ISignature>>(method: K, ...args: Parameters<Contracts.Crypto.ISignature[K]>): Promise<ReturnType<Contracts.Crypto.ISignature[K]>> {
        return this.ipcSubprocess.sendRequest("walletSignature", method, args);
    }

    public async blockFactory<K extends Ipc.Requests<Contracts.Crypto.IBlockFactory>>(method: K, ...args: Parameters<Contracts.Crypto.IBlockFactory[K]>): Promise<ReturnType<Contracts.Crypto.IBlockFactory[K]>> {
        return this.ipcSubprocess.sendRequest("blockFactory", method, args);
    }

    public async transactionFactory<K extends Ipc.Requests<Contracts.Crypto.ITransactionFactory>>(method: K, ...args: Parameters<Contracts.Crypto.ITransactionFactory[K]>): Promise<ReturnType<Contracts.Crypto.ITransactionFactory[K]>> {
        return this.ipcSubprocess.sendRequest("transactionFactory", method, args);
    }
}