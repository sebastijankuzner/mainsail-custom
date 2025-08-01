import { inject, injectable } from "@mainsail/container";
import { Contracts } from "@mainsail/contracts";
import { stringify } from "envfile";
import { copyFileSync, writeFileSync } from "fs";
import { writeJSONSync } from "fs-extra/esm";
import path, { resolve } from "path";

import { EnvironmentData, Wallet } from "./contracts.js";
import { Identifiers } from "./identifiers.js";

@injectable()
export class ConfigurationWriter {
	@inject(Identifiers.ConfigurationPath)
	private configurationPath!: string;

	writeApp(appData: Contracts.Types.JsonObject): void {
		writeJSONSync(path.join(this.configurationPath, "app.json"), appData, {
			spaces: 4,
		});
	}

	writeEnvironment(environment: EnvironmentData): void {
		writeFileSync(path.join(this.configurationPath, ".env"), stringify(environment));
	}

	writePeers(peers: { port: number; ip: string }[]) {
		writeJSONSync(
			path.join(this.configurationPath, "peers.json"),
			{ list: peers },
			{
				spaces: 4,
			},
		);
	}

	writeGenesisWallet(wallet: Wallet): void {
		writeJSONSync(path.join(this.configurationPath, "genesis-wallet.json"), wallet, {
			spaces: 4,
		});
	}

	writeValidators(mnemonics: string[]): void {
		writeJSONSync(
			path.join(this.configurationPath, "validators.json"),
			{
				secrets: mnemonics,
			},
			{
				spaces: 4,
			},
		);
	}

	writeCrypto(
		genesisBlock: Contracts.Crypto.CommitData,
		milestones: Partial<Contracts.Crypto.Milestone>[],
		network: Contracts.Crypto.Network,
	): void {
		writeJSONSync(
			path.join(this.configurationPath, "crypto.json"),
			{
				genesisBlock,
				milestones,
				network,
			},
			{
				spaces: 4,
			},
		);
	}

	writeSnapshot(snapshotPath: string): void {
		snapshotPath = resolve(snapshotPath);
		copyFileSync(snapshotPath, path.join(this.configurationPath, "snapshot", path.basename(snapshotPath)));
	}
}
