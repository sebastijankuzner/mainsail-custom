export const Identifiers = {
	ApiSync: {
		Listener: Symbol("ApiSync<Listener>"),
		Service: Symbol("ApiSync<Service>"),
	},
	Application: {
		Environment: Symbol("Application<Environment>"),
		Instance: Symbol("Application<Instance>"),
		Name: Symbol("Application<Name>"),
		Thread: Symbol("Application<Thread>"),
		Version: Symbol("Application<Version>"),
	},
	BlockchainUtils: {
		FeeCalculator: Symbol("BlockchainUtils<FeeCalculator>"),
		ProposerCalculator: Symbol("BlockchainUtils<ProposerCalculator>"),
		RoundCalculator: Symbol("BlockchainUtils<RoundCalculator>"),
		TimestampCalculator: Symbol("BlockchainUtils<TimestampCalculator>"),
	},
	Config: {
		Flags: Symbol("Config<Flags>"),
		Plugins: Symbol("Config<Plugins>"),
		Repository: Symbol("Config<Repository>"),
	},
	Consensus: {
		Aggregator: Symbol("Consensus<Aggregator>"),
		Bootstrapper: Symbol("Consensus<Bootstrapper>"),
		CommitLock: Symbol("Consensus<CommitLock>"),
		CommitState: {
			Factory: Symbol("Consensus<CommitState.Factory>"),
		},
		Processor: {
			Commit: Symbol("Consensus<Processor.Commit>"),
			PreCommit: Symbol("Consensus<Processor.PreCommit>"),
			PreVote: Symbol("Consensus<Processor.PreVote>"),
			Proposal: Symbol("Consensus<Processor.Proposal>"),
		},
		RoundStateRepository: Symbol("Consensus<RoundStateRepository>"),
		Scheduler: Symbol("Consensus<Scheduler>"),
		Service: Symbol("Consensus<Service>"),
	},
	ConsensusStorage: {
		Root: Symbol("ConsensusStorage<Root>"),
		Service: Symbol("ConsensusStorage<Service>"),

		Storage: {
			ConsensusState: Symbol("ConsensusStorage<Storage.ConsensusState>"),
			PreCommit: Symbol("ConsensusStorage<Storage.PreCommit>"),
			PreVote: Symbol("ConsensusStorage<Storage.PreVote>"),
			Proposal: Symbol("ConsensusStorage<Storage.Proposal>"),
		},
	},
	CryptoWorker: {
		Worker: {
			Factory: Symbol("CryptoWorker<Worker.Factory>"),
			Instance: Symbol("CryptoWorker<Worker.Instance>"),
		},
		WorkerPool: Symbol("CryptoWorker<WorkerPool>"),
		WorkerSubprocess: {
			Factory: Symbol("CryptoWorker<WorkerSubprocess.Factory>"),
		},
	},
	Cryptography: {
		Block: {
			Deserializer: Symbol("Crypto<Block.Deserializer>"),
			Factory: Symbol("Crypto<Block.Factory>"),
			HashFactory: Symbol("Crypto<Block.HashFactory>"),
			HeaderSize: Symbol("Crypto<Block.HeaderSize>"),
			Serializer: Symbol("Crypto<Block.Serializer>"),
		},
		Commit: {
			Deserializer: Symbol("Crypto<Commit.Deserializer>"),
			Factory: Symbol("Crypto<Commit.Factory>"),
			ProofSize: Symbol("Crypto<Commit.ProofSize>"),
			Serializer: Symbol("Crypto<Commit.Serializer>"),
		},
		Configuration: Symbol("Crypto<Configuration>"),
		Hash: {
			Factory: Symbol("Crypto<Hash.Factory>"),
			Size: {
				HASH256: Symbol("Crypto<Hash.Size.HASH256>"),
				RIPEMD160: Symbol("Crypto<Hash.Size.RIPEMD160>"),
				SHA256: Symbol("Crypto<Hash.Size.SHA256>"),
			},
		},
		Identity: {
			Address: {
				Factory: Symbol("Crypto<Identity.Address.Factory>"),
				Serializer: Symbol("Crypto<Identity.Address.Serializer>"),
				Size: Symbol("Crypto<Identity.Address.Size>"),
			},
			KeyPair: {
				Factory: Symbol("Crypto<Identity.KeyPair.Factory>"),
			},
			PrivateKey: {
				Factory: Symbol("Crypto<Identity.PrivateKey.Factory>"),
			},
			PublicKey: {
				Factory: Symbol("Crypto<Identity.PublicKey.Factory>"),
				Serializer: Symbol("Crypto<Identity.PublicKey.Serializer>"),
				Size: Symbol("Crypto<Identity.PublicKey.Size>"),
			},
			Wif: {
				Factory: Symbol("Crypto<Identity.Wif.Factory>"),
			},
		},
		Legacy: {
			Identity: {
				AddressFactory: Symbol("Crypto<Legacy.Identity.Address.Factory>"),
				AddressSerializer: Symbol("Crypto<Legacy.Identity.Address.Serializer>"),
				AddressSize: Symbol("Crypto<Legacy.Identity.Address.Size>"),
			},
		},
		Message: {
			Deserializer: Symbol("Crypto<Message.Deserializer>"),
			Factory: Symbol("Crypto<Message.Factory>"),
			Serializer: Symbol("Crypto<Message.Serializer>"),
		},
		Serializer: Symbol("Crypto<Serializer>"),
		Signature: {
			Instance: Symbol("Crypto<Signature.Instance>"),
			Size: Symbol("Crypto<Signature.Size>"),
		},
		Size: {
			Signature: Symbol("Crypto<Size.Signature>"),
		},
		Transaction: {
			Deserializer: Symbol("Crypto<Transaction.Deserializer>"),
			Factory: Symbol("Crypto<Transaction.Factory>"),
			Registry: Symbol("Crypto<Transaction.Registry>"),
			Serializer: Symbol("Crypto<Transaction.Serializer>"),
			Signer: Symbol("Crypto<Transaction.Signer>"),
			TypeFactory: Symbol("Crypto<Transaction.TypeFactory>"),
			Utils: Symbol("Crypto<Transaction.Utils>"),
			Verifier: Symbol("Crypto<Transaction.Verifier>"),
		},

		Validator: Symbol("Crypto<Validator>"),
	},
	Database: {
		Instance: {
			Consensus: Symbol("Database<Instance.Consensus>"),
		},
		Root: Symbol("Database<Root>"),
		Service: Symbol("Database<Service>"),
		Storage: {
			Block: Symbol("Database<Storage.Block>"),
			BlockId: Symbol("Database<Storage.BlockId>"),
			Commit: Symbol("Database<Storage.Commit>"),
			State: Symbol("Database<Storage.State>"),
			Transaction: Symbol("Database<Storage.Transaction>"),
			TransactionId: Symbol("Database<Storage.TransactionId>"),
		},
	},
	Evm: {
		API: {
			HTTP: Symbol.for("Evm<API.HTTP>"),
			HTTPS: Symbol.for("Evm<API.HTTPS>"),
		},
		ContractService: {
			Consensus: Symbol("Evm<ContractService.Consensus>"),
		},
		Instance: Symbol("Evm<Instance>"),
		State: Symbol("Evm<State>"),
		Worker: Symbol("Evm<Worker>"),
		WorkerSubprocess: {
			Factory: Symbol("Evm<WorkerSubprocess.Factory>"),
		},
	},
	P2P: {
		ApiNode: {
			Discoverer: Symbol("P2P<ApiNode.Discoverer>"),
			Factory: Symbol("P2P<ApiNode.Factory>"),
			Processor: Symbol("P2P<ApiNode.Processor>"),
			Repository: Symbol("P2P<ApiNode.Repository>"),
			Verifier: Symbol("P2P<ApiNode.Verifier>"),
		},
		Broadcaster: Symbol("P2P<Broadcaster>"),
		Downloader: {
			Block: Symbol("P2P<Downloader.Block>"),
			Message: Symbol("P2P<Downloader.Message>"),
			Proposal: Symbol("P2P<Downloader.Proposal>"),
		},
		Header: {
			Factory: Symbol("P2P<Header.Factory>"),
			Service: Symbol("P2P<Header.Service>"),
		},
		Logger: Symbol("P2P<Logger>"),
		Peer: {
			Communicator: Symbol("P2P<Peer.Communicator>"),
			Connector: Symbol("P2P<Peer.Connector>"),
			Discoverer: Symbol("P2P<Peer.Discoverer>"),
			Disposer: Symbol("P2P<Peer.Disposer>"),
			Factory: Symbol("P2P<Peer.Factory>"),
			Processor: Symbol("P2P<Peer.Processor>"),
			Repository: Symbol("P2P<Peer.Repository>"),
			Verifier: Symbol("P2P<Peer.Verifier>"),
		},
		Server: Symbol("P2P<Server>"),
		Service: Symbol("P2P<Service>"),
		State: Symbol("P2P<State>"),
		Throttle: {
			Factory: Symbol("P2P<Throttle.Factory>"),
		},
		TxPoolNode: {
			Factory: Symbol("P2P<TxPoolNode.Factory>"),
			Verifier: Symbol("P2P<TxPoolNode.Verifier>"),
		},
	},
	Processor: {
		BlockProcessor: Symbol("Processor<Block.Processor>"),
		BlockVerifier: Symbol("Processor<Block.Verifier>"),
		BlockVerifierHandlers: Symbol("Processor<Block.Verifier.Handlers>"),
		TransactionProcessor: Symbol("Processor<Transaction.Processor>"),
	},
	ServiceProvider: {
		Configuration: Symbol("ServiceProvider<Configuration>"),
		Repository: Symbol("ServiceProvider<Repository>"),
	},
	Services: {
		Cache: {
			Factory: Symbol("Kernel<Cache.Factory>"),
			Manager: Symbol("Kernel<Cache.Manager>"),
		},
		Config: {
			Manager: Symbol("Kernel<Config.Manager>"),
		},
		EventDispatcher: {
			Manager: Symbol("Kernel<EventDispatcher.Manager>"),
			Service: Symbol("Kernel<EventDispatcher.Service>"),
		},
		Filesystem: {
			Manager: Symbol("Kernel<Filesystem.Manager>"),
			Service: Symbol("Kernel<Filesystem.Service>"),
		},
		Log: {
			Manager: Symbol("Kernel<Log.Manager>"),
			Service: Symbol("Kernel<Log.Service>"),
		},
		Pipeline: {
			Factory: Symbol("Kernel<Pipeline.Factory>"),
		},
		Queue: {
			Factory: Symbol("Kernel<Queue.Factory>"),
			Manager: Symbol("Kernel<Queue.Manager>"),
		},
		Schedule: {
			Service: Symbol("Kernel<Schedule.Service>"),
		},
		Trigger: {
			Service: Symbol("Kernel<Trigger.Service>"),
		},
		Validation: {
			Manager: Symbol("Kernel<Validation.Manager>"),
			Service: Symbol("Kernel<Validation.Service>"),
		},
	},
	Snapshot: {
		Legacy: {
			Importer: Symbol("Snapshot<Legacy.Importer>"),
		},
	},
	State: {
		State: Symbol("State<State>"),
		Store: Symbol("State<Store>"),
	},
	Transaction: {
		Handler: {
			Constructors: Symbol("Transaction<Handler.Constructors>"),
			Instances: Symbol("Transaction<Handler.Instances>"),
			Provider: Symbol("Transaction<Handler.Provider>"),
			Registry: Symbol("Transaction<Handler.Registry>"),
		},
		Validator: {
			Factory: Symbol("Transaction<Validator.Factory>"),
			Instance: Symbol("Transaction<Validator.Instance>"),
		},
	},
	TransactionPool: {
		API: {
			HTTP: Symbol.for("TransactionPool<API.HTTP>"),
			HTTPS: Symbol.for("TransactionPool<API.HTTPS>"),
		},
		Broadcaster: Symbol("TransactionPoolBroadcaster<Broadcaster>"),
		Mempool: Symbol("TransactionPool<Mempool>"),
		Peer: {
			Communicator: Symbol("TransactionPoolBroadcaster<Peer.Communicator>"),
			Factory: Symbol("TransactionPoolBroadcaster<Peer.Factory>"),
			Repository: Symbol("TransactionPoolBroadcaster<Peer.Repository>"),
		},
		Processor: Symbol("TransactionPool<Processor>"),
		ProcessorExtension: Symbol("TransactionPool<ProcessorExtension>"),
		Query: Symbol("TransactionPool<Query>"),
		SenderMempool: {
			Factory: Symbol("TransactionPool<SenderMempool.Factory>"),
		},
		SenderState: Symbol("TransactionPool<SenderState>"),
		Service: Symbol("TransactionPool<Service>"),
		Storage: Symbol("TransactionPool<Storage>"),
		Worker: Symbol("TransactionPool<Worker>"),
		WorkerSubprocess: {
			Factory: Symbol("TransactionPool<WorkerSubprocess.Factory>"),
		},
	},
	Validator: {
		Repository: Symbol("Validator<Repository>"),
	},
	ValidatorSet: {
		Service: Symbol("ValidatorSet<Service>"),
	},
	Webhooks: {
		Broadcaster: Symbol.for("Webhooks<Broadcaster>"),
		Database: Symbol.for("Webhooks<Database>"),
		Listener: Symbol.for("Webhooks<Listener>"),
		Server: Symbol.for("Webhooks<Server>"),
	},
};
