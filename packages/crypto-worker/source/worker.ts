import { Contracts, Identifiers } from "@mainsail/contracts";
import { IpcWorker, Types } from "@mainsail/kernel";
import { inject, injectable, postConstruct } from "@mainsail/container";

@injectable()
export class CryptoSubprocessWorker implements IpcWorker.SubprocessWorker {
    @inject(Identifiers.Application)
    private readonly app!: Contracts.Kernel.Application;

    @inject(Identifiers.Ipc.WorkerFactory)
    private readonly createWorkerSubprocess!: IpcWorker.WorkerSubprocessFactory;

    private ipcSubprocess!: IpcWorker.WorkerSubprocess;

    @postConstruct()
    public async initialize(): Promise<void> {
        this.ipcSubprocess = this.createWorkerSubprocess();

        const flags = this.app.get<Types.KeyValuePair>(Identifiers.ConfigFlags);

        await this.ipcSubprocess.sendRequest("boot", flags);
    }

}
