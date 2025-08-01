import { injectable } from "@mainsail/container";
import { Contracts } from "@mainsail/contracts";
import { Services, Types } from "@mainsail/kernel";

@injectable()
export class ProcessBlockAction extends Services.Triggers.Action {
	public async execute(arguments_: Types.ActionArguments): Promise<Contracts.Processor.BlockProcessorResult> {
		const blockProcessor: Contracts.Processor.BlockProcessor = arguments_.blockProcessor;
		const roundState: Contracts.Consensus.RoundState = arguments_.roundState;

		return blockProcessor.process(roundState);
	}
}
