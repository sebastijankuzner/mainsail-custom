import { readdirSync } from "fs";
import { sep } from "path";
import { run, mark, utils } from "micro-bmark";
import { prepareSandbox } from "./prepare-sandbox";

run(async () => {
    const sandbox = await prepareSandbox();

    const suites = readdirSync(__dirname + sep + 'bench')
        .filter((name) => name.endsWith(".js"))
        .sort();

    for (const suite of suites) {
        for (const [label, callback] of Object.entries(require(`.${sep}bench${sep}${suite}`))) {
            await mark(label, 250, async () => (callback as any)(sandbox));
        }
    }

    utils.logMem();

    await sandbox.workerPool.shutdown();
});
