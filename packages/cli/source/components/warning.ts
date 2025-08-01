import { inject, injectable } from "@mainsail/container";
import { bgYellow, white } from "kleur/colors";

import { Identifiers } from "../ioc/index.js";
import type { Logger } from "../services/logger.js";

@injectable()
export class Warning {
	@inject(Identifiers.Logger)
	private readonly logger!: Logger;

	public render(message: string): void {
		this.logger.warning(white(bgYellow(`[WARNING] ${message}`)));
	}
}
