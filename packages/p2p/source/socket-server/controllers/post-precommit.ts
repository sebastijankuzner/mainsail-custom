import Hapi from "@hapi/hapi";
import { inject, injectable } from "@mainsail/container";
import { Contracts, Identifiers } from "@mainsail/contracts";

interface Request extends Hapi.Request {
	payload: {
		precommit: Buffer;
	};
}

@injectable()
export class PostPrecommitController implements Contracts.P2P.Controller {
	@inject(Identifiers.Consensus.Handler)
	private readonly consensusHandler!: Contracts.Consensus.IHandler;

	@inject(Identifiers.Cryptography.Message.Factory)
	private readonly factory!: Contracts.Crypto.IMessageFactory;

	public async handle(request: Request, h: Hapi.ResponseToolkit): Promise<{}> {
		const precommit = await this.factory.makePrecommitFromBytes(request.payload.precommit);

		await this.consensusHandler.onPrecommit(precommit);

		return {};
	}
}