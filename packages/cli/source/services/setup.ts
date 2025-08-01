import { injectable } from "@mainsail/container";
import { join } from "path";

import { execa } from "../execa.js";

@injectable()
export class Setup {
	public isGlobal(): boolean {
		try {
			return this.getEntrypoint().startsWith(this.getGlobalRootDir().replace("node_modules", ""));
		} catch {
			return false;
		}
	}

	public getEntrypoint(): string {
		return process.argv[1];
	}

	public getGlobalEntrypoint(packageId: string): string {
		return join(this.getGlobalRootDir(), `${packageId}/bin/run.js`);
	}

	private getGlobalRootDir(): string {
		const { stdout, exitCode } = execa.sync(`pnpm root -g dir`, { shell: true });

		if (exitCode !== 0) {
			throw new Error("Cannot determine global pnpm dir");
		}

		return stdout;
	}
}
