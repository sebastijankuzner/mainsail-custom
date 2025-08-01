import Hapi from "@hapi/hapi";
import { inject, injectable } from "@mainsail/container";
import { Contracts, Identifiers } from "@mainsail/contracts";

@injectable()
export class GetMessagesController implements Contracts.P2P.Controller {
	@inject(Identifiers.Application.Instance)
	private readonly app!: Contracts.Kernel.Application;

	public async handle(
		request: Contracts.P2P.GetMessagesRequest,
		h: Hapi.ResponseToolkit,
	): Promise<Contracts.P2P.GetMessagesResponse> {
		const { blockNumber, round, validatorsSignedPrevote, validatorsSignedPrecommit } = request.payload.headers;

		const consensus = this.app.get<Contracts.Consensus.Service>(Identifiers.Consensus.Service);
		const roundStateRepo = this.app.get<Contracts.Consensus.RoundStateRepository>(
			Identifiers.Consensus.RoundStateRepository,
		);

		if (blockNumber !== consensus.getBlockNumber() || round > consensus.getRound()) {
			return {
				precommits: [],
				prevotes: [],
			};
		}

		// Use the highest round with minority prevotes
		let roundState = roundStateRepo.getRoundState(blockNumber, consensus.getRound());
		if (roundState.round >= 1 && roundState.round > round && !roundState.hasMinorityPrevotesOrPrecommits()) {
			roundState = roundStateRepo.getRoundState(blockNumber, consensus.getRound() - 1);
		}

		if (round === roundState.round) {
			// Return only missing messages
			return {
				precommits: this.getPrecommits(validatorsSignedPrecommit, roundState),
				prevotes: this.getPrevotes(validatorsSignedPrevote, roundState),
			};
		} else {
			return {
				precommits: roundState.getPrecommits().map((precommit) => precommit.serialized),
				prevotes: roundState.getPrevotes().map((prevote) => prevote.serialized),
			};
		}
	}

	private getPrevotes(
		validatorsSignedPrevote: readonly boolean[],
		roundState: Contracts.Consensus.RoundState,
	): Buffer[] {
		const prevotes: Buffer[] = [];

		for (const [index, voted] of validatorsSignedPrevote.entries()) {
			if (voted) {
				continue;
			}

			const prevote = roundState.getPrevote(index);

			if (prevote) {
				prevotes.push(prevote.serialized);
			}
		}

		return prevotes;
	}

	private getPrecommits(
		validatorsSignedPrecommit: readonly boolean[],
		roundState: Contracts.Consensus.RoundState,
	): Buffer[] {
		const precommits: Buffer[] = [];

		for (const [index, voted] of validatorsSignedPrecommit.entries()) {
			if (voted) {
				continue;
			}

			const precommit = roundState.getPrecommit(index);

			if (precommit) {
				precommits.push(precommit.serialized);
			}
		}

		return precommits;
	}
}
