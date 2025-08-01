import { Contracts, Identifiers } from "@mainsail/contracts";
import { Bootstrap, Providers, Services } from "@mainsail/kernel";
import { Sandbox } from "@mainsail/test-framework";
import { resolve } from "path";
import { dirSync } from "tmp";

import { PoolWorker } from "./pool-worker.js";
import { Worker } from "./worker.js";
import { getLegacyColdWallets } from "./utilities.js";

type PluginOptions = Record<string, any>;

const setup = async () => {
	const sandbox = new Sandbox();

	sandbox.app.bind(Identifiers.Application.Name).toConstantValue("mainsail");
	sandbox.app.bind(Identifiers.Application.Version).toConstantValue("1.0");
	sandbox.app.bind(Identifiers.Config.Flags).toConstantValue({});
	sandbox.app.bind(Identifiers.Config.Plugins).toConstantValue({});
	sandbox.app
		.bind(Identifiers.Services.EventDispatcher.Service)
		.to(Services.Events.MemoryEventDispatcher)
		.inSingletonScope();

	sandbox.app.bind(Identifiers.ConsensusStorage.Service).toConstantValue(<Contracts.ConsensusStorage.Service>{
		clear: async () => {},
		getPrecommits: async () => [],
		getPrevotes: async () => [],
		getProposals: async () => [],
		getState: async () => {},
		savePrecommits: async () => {},
		savePrevotes: async () => {},
		saveProposals: async () => {},
		saveState: async () => {},
	});

	// TODO:
	sandbox.app.bind(Identifiers.P2P.Broadcaster).toConstantValue({
		broadcastPrecommit: async () => {},
		broadcastPrevote: async () => {},
		broadcastProposal: async () => {},
	});
	sandbox.app.bind(Identifiers.TransactionPool.Broadcaster).toConstantValue({
		broadcastTransactions: async () => {},
	});
	sandbox.app.bind(Identifiers.TransactionPool.Worker).to(PoolWorker).inSingletonScope();
	sandbox.app.bind(Identifiers.Evm.Worker).toConstantValue({
		onCommit: async () => {},
	});

	sandbox.app.bind(Identifiers.CryptoWorker.Worker.Instance).to(Worker).inSingletonScope();
	sandbox.app
		.bind(Identifiers.CryptoWorker.WorkerPool)
		.toConstantValue({ getWorker: () => sandbox.app.get<Worker>(Identifiers.CryptoWorker.Worker.Instance) });

	await sandbox.app.resolve<Contracts.Kernel.Bootstrapper>(Bootstrap.RegisterBaseServiceProviders).bootstrap();
	await sandbox.app.resolve<Contracts.Kernel.Bootstrapper>(Bootstrap.RegisterBaseConfiguration).bootstrap();

	// RegisterBaseBindings
	sandbox.app.bind("path.data").toConstantValue(dirSync({ unsafeCleanup: true }).name);
	//sandbox.app.bind("path.data").toConstantValue(resolve(import.meta.dirname, "../paths/data"));
	sandbox.app.bind("path.config").toConstantValue(resolve(import.meta.dirname, "../paths/config"));
	sandbox.app.bind("path.cache").toConstantValue("");
	sandbox.app.bind("path.log").toConstantValue("");
	sandbox.app.bind("path.temp").toConstantValue("");

	await sandbox.app.resolve<Contracts.Kernel.Bootstrapper>(Bootstrap.LoadEnvironmentVariables).bootstrap();
	await sandbox.app.resolve<Contracts.Kernel.Bootstrapper>(Bootstrap.LoadConfiguration).bootstrap();

	const options = {
		"@mainsail/state": {
			snapshots: {
				enabled: false,
			},
		},
		"@mainsail/transaction-pool-service": {
			// bech32m addresses require more bytes than the default which assumes base58.
			maxTransactionBytes: 50_000,

			storage: ":memory:",
		},
		"@mainsail/api-sync": {
			syncInterval: 250,
			maxSyncAttempts: 1,
			truncateDatabase: "1",
		},
	};

	const packages = [
		"@mainsail/validation",
		"@mainsail/crypto-config",
		"@mainsail/crypto-validation",
		"@mainsail/crypto-hash-bcrypto",
		"@mainsail/crypto-signature-ecdsa",
		"@mainsail/crypto-key-pair-ecdsa",
		"@mainsail/crypto-consensus-bls12-381",
		"@mainsail/crypto-address-base58",
		"@mainsail/crypto-address-keccak256",
		"@mainsail/crypto-wif",
		"@mainsail/serializer",
		"@mainsail/crypto-block",
		"@mainsail/evm-service",
		"@mainsail/database",
		"@mainsail/api-database",
		"@mainsail/api-sync",
		"@mainsail/blockchain-utils",
		"@mainsail/crypto-transaction",
		"@mainsail/crypto-transaction-evm-call",
		"@mainsail/state",
		"@mainsail/transactions",
		"@mainsail/transaction-pool-service",
		"@mainsail/crypto-messages",
		"@mainsail/crypto-commit",
		"@mainsail/processor",
		"@mainsail/evm-consensus",
		"@mainsail/validator",
		"@mainsail/consensus",
	];

	for (const packageId of packages) {
		await loadPlugin(sandbox, packageId, options);
	}

	for (const packageId of packages) {
		await bootPlugin(sandbox, packageId);
	}

	await bootstrap(sandbox);

	return sandbox;
};

const loadPlugin = async (sandbox: Sandbox, packageId: string, options: PluginOptions) => {
	const serviceProviderRepository = sandbox.app.get<Providers.ServiceProviderRepository>(
		Identifiers.ServiceProvider.Repository,
	);

	const { ServiceProvider } = await import(packageId);
	const pluginConfiguration = await getPluginConfiguration(sandbox, packageId, options);

	const manifest = sandbox.app.resolve(Providers.PluginManifest).discover(packageId, import.meta.url);

	const serviceProvider = sandbox.app.resolve<Providers.ServiceProvider>(ServiceProvider);
	serviceProvider.setManifest(manifest);
	if (pluginConfiguration) {
		serviceProvider.setConfig(pluginConfiguration);
	}

	serviceProviderRepository.set(packageId, serviceProvider);
	await serviceProviderRepository.register(packageId);
};

const bootPlugin = async (sandbox: Sandbox, packageId: string) => {
	const serviceProviderRepository = sandbox.app.get<Providers.ServiceProviderRepository>(
		Identifiers.ServiceProvider.Repository,
	);

	await serviceProviderRepository.boot(packageId);
};

const getPluginConfiguration = async (
	sandbox: Sandbox,
	packageId: string,
	options: PluginOptions,
): Promise<Providers.PluginConfiguration | undefined> => {
	let defaults = {};
	try {
		({ defaults } = await import(`${packageId}/distribution/defaults.js`));
	} catch {}

	return sandbox.app
		.resolve(Providers.PluginConfiguration)
		.from(packageId, defaults)
		.merge(options[packageId] || {});
};

const bootstrap = async (sandbox: Sandbox) => {
	const configuration = sandbox.app.get<Contracts.Crypto.Configuration>(Identifiers.Cryptography.Configuration);
	const commitFactory = sandbox.app.get<Contracts.Crypto.CommitFactory>(Identifiers.Cryptography.Commit.Factory);

	const genesisCommitJson = configuration.get("genesisBlock");
	const genesisCommit = await commitFactory.fromJson(genesisCommitJson);

	const store = sandbox.app.get<Contracts.State.Store>(Identifiers.State.Store);
	store.setGenesisCommit(genesisCommit);

	const commitState = sandbox.app.get<Contracts.Consensus.CommitStateFactory>(
		Identifiers.Consensus.CommitState.Factory,
	)(genesisCommit);

	const blockProcessor = sandbox.app.get<Contracts.Processor.BlockProcessor>(Identifiers.Processor.BlockProcessor);

	const evm = sandbox.app.getTagged<Contracts.Evm.Instance>(Identifiers.Evm.Instance, "instance", "evm");

	await evm.prepareNextCommit({
		commitKey: {
			blockNumber: BigInt(commitState.blockNumber),
			round: BigInt(commitState.round),
			blockHash: commitState.getBlock().header.hash,
		},
	});

	// Import some legacy cold wallets
	const legacyColdWallets = await getLegacyColdWallets(sandbox);
	await evm.importLegacyColdWallets(legacyColdWallets.map(({ legacyColdWallet }) => legacyColdWallet));
	//

	const result = await blockProcessor.process(commitState);
	if (!result) {
		throw new Error("Failed to process genesis block");
	}

	await blockProcessor.commit(commitState);

	const validatorSet = sandbox.app.get<Contracts.ValidatorSet.Service>(Identifiers.ValidatorSet.Service);
	validatorSet.restore();

	await sandbox.app.get<Contracts.ApiSync.Service>(Identifiers.ApiSync.Service).bootstrap();

	sandbox.app.get<Contracts.State.State>(Identifiers.State.State).setBootstrap(false);

	const consensus = sandbox.app.get<Contracts.Consensus.Service>(Identifiers.Consensus.Service);
	void consensus.run();
};

const shutdown = async (sandbox: Sandbox) => {
	const serviceProviders: Providers.ServiceProvider[] = sandbox.app
		.get<Providers.ServiceProviderRepository>(Identifiers.ServiceProvider.Repository)
		.allLoadedProviders();

	for (const serviceProvider of serviceProviders.reverse()) {
		try {
			await serviceProvider.dispose();
		} catch {
			/* */
		}
	}
};

export { setup, shutdown };
