import { injectable } from "@mainsail/container";

import { ProcessDescription, ProcessIdentifier, ProcessState } from "../contracts.js";
import { execa, Result, SyncResult } from "../execa.js";
import { Flags } from "../utils/flags.js";

@injectable()
export class ProcessManager {
	public list(): ProcessDescription[] {
		try {
			const { stdout } = this.#shellSync("pm2 jlist");

			if (!stdout) {
				return [];
			}

			if (typeof stdout !== "string") {
				return [];
			}

			const lastLine: string | undefined = stdout.split("\n").pop();

			if (!lastLine) {
				return [];
			}

			return Object.values(JSON.parse(lastLine));
		} catch {
			return [];
		}
	}

	public describe(id: ProcessIdentifier): ProcessDescription | undefined {
		const processes: ProcessDescription[] | undefined = this.list();

		if (processes.length <= 0) {
			return undefined;
		}

		return processes.find((process: ProcessDescription) => [process.id, process.name].includes(id));
	}

	public start(options: Record<string, any>, flags: Record<string, any>): SyncResult {
		let command = `pm2 start ${options.script}`;

		if (options.node_args) {
			command += ` --node-args="${Flags.castFlagsToString(options.node_args)}"`;
		}

		if (flags !== undefined && Object.keys(flags).length > 0) {
			command += ` ${Flags.castFlagsToString(flags)}`;
		}

		if (options.args) {
			command += ` -- ${options.args}`;
		}

		return this.#shellSync(command);
	}

	public stop(id: ProcessIdentifier, flags: Record<string, any> = {}): SyncResult {
		let command = `pm2 stop ${id}`;

		if (Object.keys(flags).length > 0) {
			command += ` ${Flags.castFlagsToString(flags)}`;
		}

		return this.#shellSync(command);
	}

	public restart(id: ProcessIdentifier, flags: Record<string, any> = { "update-env": true }): SyncResult {
		let command = `pm2 restart ${id}`;

		if (Object.keys(flags).length > 0) {
			command += ` ${Flags.castFlagsToString(flags)}`;
		}

		return this.#shellSync(command);
	}

	public reload(id: ProcessIdentifier): SyncResult {
		return this.#shellSync(`pm2 reload ${id}`);
	}

	public reset(id: ProcessIdentifier): SyncResult {
		return this.#shellSync(`pm2 reset ${id}`);
	}

	public delete(id: ProcessIdentifier): SyncResult {
		return this.#shellSync(`pm2 delete ${id}`);
	}

	public flush(): SyncResult {
		return this.#shellSync("pm2 flush");
	}

	public reloadLogs(): SyncResult {
		return this.#shellSync("pm2 reloadLogs");
	}

	public ping(): SyncResult {
		return this.#shellSync("pm2 ping");
	}

	public update(): SyncResult {
		return this.#shellSync("pm2 update");
	}

	public async trigger(id: ProcessIdentifier, processActionName: string, parameter?: string): Promise<Result> {
		return this.#shell(`pm2 trigger ${id} ${processActionName} ${parameter}`);
	}

	public status(id: ProcessIdentifier): ProcessState | undefined {
		const process: ProcessDescription | undefined = this.describe(id);

		return process ? process.pm2_env.status : undefined;
	}

	public isOnline(id: ProcessIdentifier): boolean {
		return this.status(id) === ProcessState.Online;
	}

	public isStopped(id: ProcessIdentifier): boolean {
		return this.status(id) === ProcessState.Stopped;
	}

	public isStopping(id: ProcessIdentifier): boolean {
		return this.status(id) === ProcessState.Stopping;
	}

	public isWaiting(id: ProcessIdentifier): boolean {
		return this.status(id) === ProcessState.Waiting;
	}

	public isLaunching(id: ProcessIdentifier): boolean {
		return this.status(id) === ProcessState.Launching;
	}

	public isErrored(id: ProcessIdentifier): boolean {
		return this.status(id) === ProcessState.Errored;
	}

	public isOneLaunch(id: ProcessIdentifier): boolean {
		return this.status(id) === ProcessState.OneLaunch;
	}

	public isUnknown(id: ProcessIdentifier): boolean {
		const processState: ProcessState | undefined = this.status(id);

		if (processState === undefined) {
			return true;
		}

		return !Object.values(ProcessState).includes(processState);
	}

	public has(id: ProcessIdentifier): boolean {
		try {
			const { stdout } = this.#shellSync(`pm2 id ${id} | awk '{ print $2 }'`);

			return !!stdout && !Number.isNaN(Number(stdout));
		} catch {
			return false;
		}
	}

	public missing(id: ProcessIdentifier): boolean {
		return !this.has(id);
	}

	async #shell(command: string): Promise<Result> {
		return execa.run(command, { shell: true });
	}

	#shellSync(command: string): SyncResult {
		return execa.sync(command, { shell: true });
	}
}
