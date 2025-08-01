import { inject, injectable } from "@mainsail/container";

import { Identifiers } from "../ioc/index.js";
import type { Logger } from "../services/logger.js";

@injectable()
export class Log {
	@inject(Identifiers.Logger)
	private readonly logger!: Logger;

	public render(message: string): void {
		this.logger.log(message);
	}
}
