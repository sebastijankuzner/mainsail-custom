import { readdirSync } from "fs";
import { run, mark, utils } from "micro-bmark";

run(async () => {
    const suites = readdirSync(__dirname)
        .filter((name) => name.endsWith(".js"))
        .filter((name) => name !== "index.js")
        .filter((name) => name !== "helpers.js")
        .sort();

    for (const suite of suites) {
        for (const [label, callback] of Object.entries(require(`./${suite}`))) {
            await mark(label, callback);
        }
    }

    utils.logMem();
    utils.getTime();
});
