import { Keystore } from "@chainsafe/bls-keystore";
import { Commands, Contracts, Utils } from "@mainsail/cli";
import { injectable, postConstruct } from "@mainsail/container";
import { assert } from "@mainsail/utils";
import { existsSync } from "fs";
import { readJSONSync } from "fs-extra/esm";
import Joi from "joi";
import path from "path";
import { URL } from "url";

@injectable()
export class Command extends Commands.Command {
	public signature = "core:run";

	public description = "Run the Core process in foreground. Exiting the process will stop it from running.";

	@postConstruct()
	public configure(): void {
		this.definition
			.setFlag("env", "", Joi.string().default("production"))
			.setFlag("disableDiscovery", "Permanently disable all peer discovery.", Joi.boolean())
			.setFlag("skipDiscovery", "Skip the initial peer discovery.", Joi.boolean())
			.setFlag("ignoreMinimumNetworkReach", "Ignore the minimum network reach on start.", Joi.boolean())
			.setFlag("launchMode", "The mode the relay will be launched in (seed only at the moment).", Joi.string())
			.setFlag("password", "A custom password that encrypts the BIP39. Referred to as BIP38.", Joi.string())
			.setFlag("skipPrompts", "Skip prompts.", Joi.boolean().default(false));
	}

	public async execute(): Promise<void> {
		const { name } = readJSONSync(path.resolve(new URL(".", import.meta.url).pathname, "../../package.json"));
		assert.string(name);

		const flags: Contracts.AnyObject = {
			...this.getFlags(),
			name: name.split("/")[1],
		};

		await Utils.Builder.buildApplication({
			flags,
			plugins: {
				"@mainsail/p2p": Utils.Builder.buildPeerFlags(flags),
				...(await this.buildValidatorConfiguration(flags)),
			},
		});

		// Prevent resolving execute method
		return new Promise(() => {});
	}

	async buildValidatorConfiguration(flags: Contracts.AnyObject): Promise<Record<string, any> | undefined> {
		const validatorsConfig = this.app.getCorePath("config", "validators.json");

		if (!existsSync(validatorsConfig)) {
			return {};
		}

		const validators: Record<string, any> = readJSONSync(validatorsConfig);
		if (!validators.keystore) {
			return {};
		}

		let password = flags.password;

		// ask for password
		if (!password) {
			const response = await this.components.prompt([
				{
					message: "Please enter your validator keystore decryption password.",
					name: "password",
					type: "password",
					validate: (value) => (typeof value !== "string" ? "The password has to be a string." : true),
				},
			]);

			await this.components.prompt([
				{
					message: "Confirm validator keystore decryption password.",
					name: "passwordConfirmation",
					type: "password",
					validate: (value) => (value !== response.password ? "Confirm password does not match." : true),
				},
			]);

			if (!response.password) {
				throw new Error("The password has to be a string.");
			}

			password = response.password;
		}

		if (!(await Keystore.parse(validators.keystore).verifyPassword(password as string))) {
			throw new Error("Invalid keystore password");
		}

		return {
			"@mainsail/validator": {
				validatorKeystorePassword: password,
			},
		};
	}
}
