import { Identifiers } from "@mainsail/contracts";
import { IpcWorker, Types } from "@mainsail/kernel";
import { inject, injectable, postConstruct } from "@mainsail/container";

@injectable()
export class WorkerPool implements IpcWorker.WorkerPool {
    @inject(Identifiers.Ipc.WorkerFactory)
    private readonly createWorker!: IpcWorker.WorkerFactory;

    private workers: IpcWorker.Worker[] = [];

    @inject(Identifiers.ConfigFlags)
    private readonly flags: Types.KeyValuePair;

    @postConstruct()
    public initialize() {
        const workerCount: number = 1;

        for (let i = 0; i < workerCount; i++) {
            const worker = this.createWorker();
            this.workers.push(worker);
        }
    }

    public async getWorker(): Promise<IpcWorker.Worker> {
        const worker = this.workers.reduce((prev, next) => {
            if (prev.getQueueSize() < next.getQueueSize()) {
                return prev;
            } else {
                return next;
            }
        });

        await worker.boot(this.flags);

        return worker;
    }

}
