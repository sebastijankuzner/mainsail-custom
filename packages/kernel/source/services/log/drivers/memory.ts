import { injectable } from "@mainsail/container";
import { Contracts } from "@mainsail/contracts";
import { isEmpty, prettyTime } from "@mainsail/utils";
import chalk, { ChalkInstance } from "chalk";
import { differenceInMilliseconds, format } from "date-fns";
import { inspect } from "util";

@injectable()
export class MemoryLogger implements Contracts.Kernel.Logger {
	protected readonly levelStyles: Record<string, ChalkInstance> = {
		alert: chalk.red,
		critical: chalk.red,
		debug: chalk.magenta,
		emergency: chalk.bgRed,
		error: chalk.red,
		info: chalk.blue,
		notice: chalk.green,
		warning: chalk.yellow,
	};

	protected silentConsole = false;

	#lastTimestamp: Date = new Date();

	public async make(options: unknown): Promise<Contracts.Kernel.Logger> {
		return this;
	}

	public emergency(message: string): void {
		this.log("emergency", message);
	}

	public alert(message: string): void {
		this.log("alert", message);
	}

	public critical(message: string): void {
		this.log("critical", message);
	}

	public error(message: string): void {
		this.log("error", message);
	}

	public warning(message: string): void {
		this.log("warning", message);
	}

	public notice(message: string): void {
		this.log("notice", message);
	}

	public info(message: string): void {
		this.log("info", message);
	}

	public debug(message: string): void {
		this.log("debug", message);
	}

	public isValidLevel(level: string): boolean {
		return !!this.levelStyles[level];
	}

	public suppressConsoleOutput(suppress: boolean): void {
		this.silentConsole = suppress;
	}

	public async dispose(): Promise<void> {}

	protected log(level: string, message: string): void {
		if (this.silentConsole) {
			return;
		}

		if (isEmpty(message)) {
			return;
		}

		if (typeof message !== "string") {
			message = inspect(message, { depth: 1 });
		}

		level = level ? this.levelStyles[level](`[${level.toUpperCase()}] `) : "";

		const timestamp: string = format(new Date(), "yyyy-MM-dd HH:MM:ss.SSS");
		const timestampDiff: string = this.getTimestampDiff();

		process.stdout.write(`[${timestamp}] ${level}${message}${timestampDiff}\n`);
	}

	protected getTimestampDiff(): string {
		const now = new Date();

		const diff: number = differenceInMilliseconds(now, this.#lastTimestamp);

		this.#lastTimestamp = new Date();

		return chalk.yellow(` +${diff ? prettyTime(diff) : "0ms"}`);
	}
}
