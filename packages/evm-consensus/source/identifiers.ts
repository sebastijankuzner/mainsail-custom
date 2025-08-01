export const Identifiers = {
	Contracts: {
		Addresses: {
			Consensus: Symbol.for("Evm.Consensus<Contracts.Addresses.Consensus>"),
			MultiPayment: Symbol.for("Evm.Consensus<Contracts.Addresses.MultiPayment>"),
			Usernames: Symbol.for("Evm.Consensus<Contracts.Addresses.Usernames>"),
		},
	},
	Internal: {
		Addresses: {
			Deployer: Symbol.for("Evm.Consensus<Internal.Addresses.Deployer>"),
		},
		Deployer: Symbol.for("Evm.Consensus<Internal.Deployer>"),
		GenesisInfo: Symbol.for("Evm.Consensus<Internal.GenesisInfo>"),
	},
};
