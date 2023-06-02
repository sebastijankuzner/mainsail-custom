import { fork } from "child_process";
import { injectable } from "@mainsail/container";
import { Providers, Ipc } from "@mainsail/kernel";
import { Identifiers } from "@mainsail/contracts";
import { Worker } from "./worker";
import { WorkerPool } from "./worker-pool";

@injectable()
export class ServiceProvider extends Providers.ServiceProvider {

    public async register(): Promise<void> {
        this.app.bind(Identifiers.Ipc.Worker).to(Worker);
        this.app.bind(Identifiers.Ipc.WorkerPool).to(WorkerPool).inSingletonScope();

        this.app.bind(Identifiers.Ipc.WorkerSubprocessFactory).toFactory(() => {
            return () => {
                const subprocess = fork(`${__dirname}/worker-script.js`);
                return new Ipc.Subprocess(subprocess);
            };
        });

        this.app
            .bind(Identifiers.Ipc.WorkerFactory)
            .toAutoFactory(Identifiers.Ipc.Worker);
    }

}
