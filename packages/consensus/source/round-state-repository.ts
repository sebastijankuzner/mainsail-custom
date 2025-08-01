import { inject, injectable } from "@mainsail/container";
import { Contracts, Identifiers } from "@mainsail/contracts";

import { RoundState } from "./round-state.js";
@injectable()
export class RoundStateRepository implements Contracts.Consensus.RoundStateRepository {
	@inject(Identifiers.Application.Instance)
	private readonly app!: Contracts.Kernel.Application;

	#roundStates = new Map<string, Contracts.Consensus.RoundState>();

	public getRoundState(blockNumber: number, round: number): Contracts.Consensus.RoundState {
		const key = `${blockNumber}-${round}`;

		if (!this.#roundStates.has(key)) {
			this.#roundStates.set(key, this.#createRoundState(blockNumber, round));
		}

		return this.#roundStates.get(key)!;
	}

	public getRoundStates(): Contracts.Consensus.RoundState[] {
		return [...this.#roundStates.values()];
	}

	public clear(): void {
		this.#roundStates.clear();
	}

	#createRoundState(blockNumber: number, round: number): Contracts.Consensus.RoundState {
		return this.app.resolve(RoundState).configure(blockNumber, round);
	}
}
