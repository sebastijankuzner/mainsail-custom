import { Identifiers } from "@mainsail/contracts";
import { schemas as keccak256Schemas } from "@mainsail/crypto-address-keccak256";
import { schemas as validationSchemas } from "@mainsail/crypto-validation";
import { Validator } from "@mainsail/validation";

import { describe, Sandbox } from "../../../test-framework/source";
import { schemas } from "../validation/index.js";
import { EthGetStorageAtAction } from "./index.js";

describe<{
	sandbox: Sandbox;
	action: EthGetStorageAtAction;
	validator: Validator;
	evm: any;
}>("EthGetCodeAction", ({ beforeEach, it, assert, spy }) => {
	beforeEach(async (context) => {
		context.evm = {
			storageAt: () => "0x0",
		};

		context.sandbox = new Sandbox();

		context.sandbox.app.bind(Identifiers.Evm.Instance).toConstantValue(context.evm);

		context.action = context.sandbox.app.resolve(EthGetStorageAtAction);
		context.validator = context.sandbox.app.resolve(Validator);
	});

	it("should have a name", ({ action }) => {
		assert.equal(action.name, "eth_getStorageAt");
	});

	it("schema should be ok", ({ action, validator }) => {
		validator.addSchema(keccak256Schemas.address);
		validator.addSchema(validationSchemas.prefixedQuantityHex);
		validator.addSchema(schemas.blockTag);
		validator.addSchema(action.schema);

		assert.undefined(
			validator.validate("jsonRpc_eth_getStorageAt", [
				"0x0000000000000000000000000000000000000000",
				"0x0",
				"latest",
			]).errors,
		);
		assert.defined(validator.validate("jsonRpc_eth_getStorageAt", [1]).errors);
		assert.defined(validator.validate("jsonRpc_eth_getStorageAt", {}).errors);
		assert.equal(
			validator.validate("jsonRpc_eth_getStorageAt", [
				"0x0000000000000000000000000000000000000000",
				"0x00000000000000000000000000000000000000000000000000000000000000000",
				"latest",
			]).errors![0].message,
			"must NOT have more than 66 characters",
		);
	});

	it("should return code", async ({ action, evm }) => {
		const spyStorageAt = spy(evm, "storageAt");

		assert.equal(await action.handle(["0x0000000000", "0x0", "latest"]), "0x0");
		spyStorageAt.calledOnce();
		spyStorageAt.calledWith("0x0000000000", BigInt(0));
	});
});
