import { Ipc } from "@mainsail/kernel";
import { CryptoWorkerScriptHandler } from "./worker-handler";

console.log("running worker script");

const ipcHandler = new Ipc.Handler(new CryptoWorkerScriptHandler());

ipcHandler.handleRequest("boot");
