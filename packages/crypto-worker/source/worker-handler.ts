import { Application, IpcWorker, Types } from "@mainsail/kernel";
import { Container } from "@mainsail/container";
import { Contracts } from "@mainsail/contracts";

export class CryptoWorkerScriptHandler implements IpcWorker.WorkerScriptHandler {
    // @ts-ignore
    #app: Contracts.Kernel.Application;

    public async boot(flags: Types.KeyValuePair): Promise<void> {
        const app: Contracts.Kernel.Application = new Application(new Container());

        app.config("worker", true);

        await app.bootstrap({
            flags,
        });

        // eslint-disable-next-line @typescript-eslint/await-thenable
        await app.boot();

        this.#app = app;
    }

}
