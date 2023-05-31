import { Identifiers } from "@mainsail/contracts";
import { IpcWorker } from "@mainsail/kernel";
import { inject, injectable, postConstruct } from "@mainsail/container";

@injectable()
export class WorkerPool {
    @inject(Identifiers.Ipc.WorkerFactory)
    private readonly createWorker!: IpcWorker.WorkerSubprocessFactory;

    private workers: IpcWorker.SubprocessWorker[] = [];

    @postConstruct()
    public initialize() {
        const workerCount: number = 1;

        for (let i = 0; i < workerCount; i++) {
            const worker = this.createWorker();
            this.workers.push(worker);
        }
    }

}
