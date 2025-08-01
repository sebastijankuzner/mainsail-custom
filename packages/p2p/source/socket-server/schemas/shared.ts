import { Contracts } from "@mainsail/contracts";
import Joi from "joi";

export const makeHeaders = (configuration: Contracts.Crypto.Configuration) => {
	const roundValidators = configuration.getRoundValidators();

	return Joi.object({
		blockNumber: Joi.number().integer().min(1).required(),
		// eslint-disable-next-line unicorn/no-null
		proposedBlockHash: Joi.string().allow(null).required(),
		round: Joi.number().integer().min(0).required(),
		step: Joi.number().integer().min(0).max(2).required(),
		validatorsSignedPrecommit: Joi.array().items(Joi.boolean()).max(roundValidators).required(),
		validatorsSignedPrevote: Joi.array().items(Joi.boolean()).max(roundValidators).required(),
		version: Joi.string().required(),
	}).required();
};
