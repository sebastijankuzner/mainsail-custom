import Hapi from "@hapi/hapi";
import { inject, injectable } from "@mainsail/container";
import { Contracts, Identifiers } from "@mainsail/contracts";

import { Controller } from "./controller.js";

@injectable()
export class ConsensusController extends Controller {
	@inject(Identifiers.Consensus.Service)
	private readonly consensus!: Contracts.Consensus.Service;

	@inject(Identifiers.Consensus.RoundStateRepository)
	private readonly roundStateRepository!: Contracts.Consensus.RoundStateRepository;

	@inject(Identifiers.ValidatorSet.Service)
	private readonly validatorSet!: Contracts.ValidatorSet.Service;

	public async state(request: Hapi.Request) {
		const state = this.consensus.getState();

		const roundStates = this.roundStateRepository.getRoundStates();

		const proposals = roundStates
			.map((roundState) => roundState.getProposal())
			.filter((proposal): proposal is Contracts.Crypto.Proposal => !!proposal);
		const prevotes = roundStates.flatMap((roundState) => roundState.getPrevotes());
		const precommits = roundStates.flatMap((roundState) => roundState.getPrecommits());

		const validators = this.validatorSet.getRoundValidators();

		const collectMessages = (messages: ReadonlyArray<Contracts.Crypto.Prevote | Contracts.Crypto.Precommit>) => {
			const collected = {
				absent: validators,
			};

			for (const message of messages) {
				const validator = validators[message.validatorIndex];
				const key = `b/${message.blockNumber}/${message.round}/${message.blockHash}`;
				if (!collected[key]) {
					collected[key] = {};
				}

				const address = validator.address;
				collected[key][address] = message.signature;
				collected.absent.splice(
					collected.absent.findIndex((v) => v.address === address),
					1,
				);
			}

			return collected;
		};

		return {
			data: {
				blockNumber: state.blockNumber,
				round: state.round,
				step: state.step,
				// eslint-disable-next-line sort-keys-fix/sort-keys-fix
				lockedRound: state.lockedRound,
				lockedValue: state.lockedValue ? state.lockedValue.getProposal()?.getData().block.header.hash : null,
				validRound: state.validRound,
				validValue: state.validValue ? state.validValue.getProposal()?.getData().block.header.hash : null,
				// eslint-disable-next-line sort-keys-fix/sort-keys-fix
				precommits: collectMessages(precommits.sort((a, b) => b.round - a.round)),
				prevotes: collectMessages(prevotes.sort((a, b) => b.round - a.round)),
				proposals: proposals
					.sort((a, b) => b.round - a.round)
					.map((p) => ({
						data: p.toData(),
						lockProof: p.isDataDeserialized ? p.getData().lockProof : undefined,
						name: validators[p.validatorIndex].toString(),
					})),

				// validators: validators.map((v) => ({
				// 	index: this.validatorSet.getValidatorIndexByWalletPublicKey(v.getWalletPublicKey()),
				// 	walletPublicKey: v.toString(),
				// })),
			},
		};
	}
}
