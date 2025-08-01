import { Identifiers } from "@mainsail/contracts";
import { Validator } from "@mainsail/validation";

import cryptoJson from "../../../core/bin/config/devnet/core/crypto.json";
import { schemas as cryptoBlockSchemas } from "../../../crypto-block/distribution/index.js";
import { Configuration } from "../../../crypto-config/distribution/index.js";
import { makeKeywords as makeMessageKeywords } from "../../../crypto-messages/distribution/keywords.js";
import { schemas as cryptoTransactionSchemas } from "../../../crypto-transaction/distribution/index.js";
import { schemas as cryptoValidationSchemas } from "../../../crypto-validation/distribution/index.js";
import { Sandbox } from "../../../test-framework/source/index.js";
import { makeKeywords } from "../../source/validation/keywords.js";

type Context = {
	sandbox: Sandbox;
	validator: Validator;
};

export const prepareValidatorContext = (context: Context) => {
	context.sandbox.app.bind(Identifiers.Cryptography.Configuration).to(Configuration).inSingletonScope();
	context.sandbox.app.get<Configuration>(Identifiers.Cryptography.Configuration).setConfig(cryptoJson);
	context.sandbox.app.get<Configuration>(Identifiers.Cryptography.Configuration).setHeight(1);

	const keywords = makeKeywords();
	context.validator.addKeyword(keywords.buffer);

	const configuration = context.sandbox.app.get<Configuration>(Identifiers.Cryptography.Configuration);
	const messageKeywords = makeMessageKeywords(configuration);
	context.validator.addKeyword(messageKeywords.limitToRoundValidators);
	context.validator.addKeyword(messageKeywords.isValidatorIndex);

	context.validator.addSchema(cryptoValidationSchemas.hex);
	context.validator.addSchema(cryptoBlockSchemas.blockHash);
	context.validator.addSchema(cryptoTransactionSchemas.transactionId);
};
