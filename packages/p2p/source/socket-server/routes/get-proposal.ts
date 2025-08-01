import { injectable } from "@mainsail/container";

import { Routes } from "../../enums.js";
import { Codecs } from "../codecs/index.js";
import { GetProposalController } from "../controllers/index.js";
import { Schemas } from "../schemas/index.js";
import { Route, RouteConfig } from "./route.js";

@injectable()
export class GetProposalRoute extends Route {
	public getRoutesConfigByPath(): { [path: string]: RouteConfig } {
		const controller = this.getController();
		return {
			"/getProposal": {
				codec: Codecs.getProposal,
				handler: controller.handle,
				id: Routes.GetProposal,
				maxBytes: 1024,
				validation: Schemas.getProposal(this.cryptoConfiguration),
			},
		};
	}

	protected getController(): GetProposalController {
		return this.app.resolve(GetProposalController);
	}
}
