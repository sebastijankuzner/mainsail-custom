import { fork } from "child_process";
import { injectable } from "@mainsail/container";
import { Providers, Ipc, IpcWorker } from "@mainsail/kernel";
import { Identifiers } from "@mainsail/contracts";
import { CryptoSubprocessWorker } from "./worker";
import { WorkerPool } from "./worker-pool";

@injectable()
export class ServiceProvider extends Providers.ServiceProvider {

    public async register(): Promise<void> {
        this.app.bind(Identifiers.Ipc.Worker).to(CryptoSubprocessWorker);
        this.app.bind(Identifiers.Ipc.WorkerPool).to(WorkerPool).inSingletonScope();

        this.app.bind(Identifiers.Ipc.WorkerFactory).toFactory(() => {
            return () => {
                const subprocess = fork(`${__dirname}/worker-script.js`);
                return new Ipc.Subprocess<IpcWorker.WorkerScriptHandler>(subprocess);
            };
        });

        this.app
            .bind(Identifiers.Ipc.WorkerSubprocessFactory)
            .toAutoFactory(Identifiers.Ipc.Worker);
    }

    public async boot(): Promise<void> {
        console.log("test");
        const factory = this.app.get<IpcWorker.WorkerFactory>(Identifiers.Ipc.WorkerSubprocessFactory);
        factory();
    }
}
