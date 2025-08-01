import { inject, tagged } from "@mainsail/container";
import { Contracts, Identifiers } from "@mainsail/contracts";
import { assert, BigNumber } from "@mainsail/utils";

import secrets from "../internal/passphrases.json" with { type: "json" };
import { getWalletNonce } from "./generic.js";

const defaultPassphrase: string = secrets[0];

interface IPassphrasePair {
	passphrase: string;
}

// @TODO replace this by the use of real factories
export class TransactionFactory {
	@inject(Identifiers.Cryptography.Configuration)
	private readonly configuration!: Contracts.Crypto.Configuration;

	// @inject(Identifiers.Cryptography.Identity.Address.Factory)
	// private readonly addressFactory!: Contracts.Crypto.AddressFactory;

	@inject(Identifiers.Cryptography.Identity.PublicKey.Factory)
	@tagged("type", "wallet")
	private readonly publicKeyFactory!: Contracts.Crypto.PublicKeyFactory;

	protected builder: any;
	protected app: Contracts.Kernel.Application;

	#networkConfig: Contracts.Crypto.NetworkConfig | undefined;
	#nonce: BigNumber | undefined;
	#fee: BigNumber | undefined;
	#passphrase: string = defaultPassphrase;
	#passphraseList: string[] | undefined;
	#passphrasePairs: IPassphrasePair[] | undefined;
	#version: number | undefined;
	#senderPublicKey: string | undefined;
	#expiration: number | undefined;

	protected constructor(app?: Contracts.Kernel.Application) {
		// @ts-ignore - this is only needed because of the "getNonce"
		// method so we don't care if it is undefined in certain scenarios
		this.app = app;
	}

	public static initialize(app?: Contracts.Kernel.Application): TransactionFactory {
		return new TransactionFactory(app);
	}

	// public async transfer(
	// 	recipientId?: string,
	// 	amount: BigNumber = BigNumber.WEI.times(2),
	// ): Promise<TransactionFactory> {
	// 	const builder = new TransferBuilder()
	// 		.amount(amount.toFixed())
	// 		.recipientId(recipientId || (await this.addressFactory.fromMnemonic(defaultPassphrase)));

	// 	this.builder = builder;

	// 	return this;
	// }

	// public validatorRegistration(): TransactionFactory {
	// 	const builder = new ValidatorRegistrationBuilder();

	// 	this.builder = builder;

	// 	return this;
	// }

	// public validatorResignation(): TransactionFactory {
	// 	this.builder = new ValidatorResignationBuilder();

	// 	return this;
	// }

	// public vote(publicKey: string): TransactionFactory {
	// 	this.builder = new VoteBuilder().votesAsset([publicKey]);

	// 	return this;
	// }

	// public unvote(publicKey: string): TransactionFactory {
	// 	this.builder = new VoteBuilder().unvotesAsset([publicKey]);

	// 	return this;
	// }

	// public async multiSignature(participants?: string[], min?: number): Promise<TransactionFactory> {
	// 	let passphrases: string[] | undefined;
	// 	if (!participants) {
	// 		passphrases = [secrets[0], secrets[1], secrets[2]];
	// 	}

	// 	participants = participants || [
	// 		await this.publicKeyFactory.fromMnemonic(secrets[0]),
	// 		await this.publicKeyFactory.fromMnemonic(secrets[1]),
	// 		await this.publicKeyFactory.fromMnemonic(secrets[2]),
	// 	];

	// 	this.builder = new MultiSignatureBuilder().multiSignatureAsset({
	// 		min: min || participants.length,
	// 		publicKeys: participants,
	// 	});

	// 	if (passphrases) {
	// 		this.withPassphraseList(passphrases);
	// 	}

	// 	this.withSenderPublicKey(participants[0]);

	// 	return this;
	// }

	public withFee(fee: number): TransactionFactory {
		this.#fee = BigNumber.make(fee);

		return this;
	}

	public withNetworkConfig(networkConfig: Contracts.Crypto.NetworkConfig): TransactionFactory {
		this.#networkConfig = networkConfig;

		return this;
	}

	public withHeight(height: number): TransactionFactory {
		this.configuration.setHeight(height);

		return this;
	}

	public withSenderPublicKey(sender: string): TransactionFactory {
		this.#senderPublicKey = sender;

		return this;
	}

	public withNonce(nonce: BigNumber): TransactionFactory {
		this.#nonce = nonce;

		return this;
	}

	public withExpiration(expiration: number): TransactionFactory {
		this.#expiration = expiration;

		return this;
	}

	public withVersion(version: number): TransactionFactory {
		this.#version = version;

		return this;
	}

	public withPassphrase(passphrase: string): TransactionFactory {
		this.#passphrase = passphrase;

		return this;
	}

	public withPassphraseList(passphrases: string[]): TransactionFactory {
		this.#passphraseList = passphrases;

		return this;
	}

	public withPassphrasePair(passphrases: IPassphrasePair): TransactionFactory {
		this.#passphrase = passphrases.passphrase;

		return this;
	}

	public withPassphrasePairs(passphrases: IPassphrasePair[]): TransactionFactory {
		this.#passphrasePairs = passphrases;

		return this;
	}

	public async create(quantity = 1): Promise<Contracts.Crypto.TransactionData[]> {
		return this.#make<Contracts.Crypto.TransactionData>(quantity, "getStruct");
	}

	public async createOne(): Promise<Contracts.Crypto.TransactionData> {
		return (await this.create(1))[0];
	}

	public async build(quantity = 1): Promise<Contracts.Crypto.Transaction[]> {
		return this.#make<Contracts.Crypto.Transaction>(quantity, "build");
	}

	public async getNonce(): Promise<BigNumber> {
		if (this.#nonce) {
			return this.#nonce;
		}

		assert.string(this.#senderPublicKey);

		return getWalletNonce(this.app, this.#senderPublicKey);
	}

	async #make<T>(quantity = 1, method: string): Promise<T[]> {
		if (this.#passphrasePairs && this.#passphrasePairs.length > 0) {
			return this.#passphrasePairs.map(
				(passphrasePair: IPassphrasePair) =>
					this.withPassphrase(passphrasePair.passphrase).#sign<T>(quantity, method)[0],
			);
		}

		return this.#sign<T>(quantity, method);
	}

	async #sign<T>(quantity: number, method: string): Promise<T[]> {
		assert.defined(this.#networkConfig);
		this.configuration.setConfig(this.#networkConfig);

		if (!this.#senderPublicKey) {
			this.#senderPublicKey = await this.publicKeyFactory.fromMnemonic(this.#passphrase);
		}

		const transactions: T[] = [];
		let nonce = await this.getNonce();

		for (let index = 0; index < quantity; index++) {
			// if (
			// 	this.builder.constructor.name === "ValidatorRegistrationBuilder" && // @FIXME: when we use any of the "withPassphrase*" methods the builder will
			// 	// always remember the previous username instead generating a new one on each iteration
			// 	!this.builder.data.asset.validator.username
			// ) {
			// 	// this.builder = new ValidatorRegistrationBuilder();
			// }

			if (this.#version) {
				this.builder.version(this.#version);
			}

			if (this.builder.data.version > 1) {
				nonce = nonce.plus(1);
				this.builder.nonce(nonce);
			}

			if (this.#fee) {
				this.builder.fee(this.#fee.toFixed());
			}

			if (this.#expiration) {
				this.builder.expiration(this.#expiration);
			}

			this.builder.senderPublicKey(this.#senderPublicKey);

			let sign = true;

			if (this.#passphraseList && this.#passphraseList.length > 0) {
				for (let index = 0; index < this.#passphraseList.length; index++) {
					this.builder.multiSign(this.#passphraseList[index], index);
				}

				sign = this.builder.constructor.name === "MultiSignatureBuilder";
			}

			if (sign) {
				this.builder.sign(this.#passphrase);
			}

			transactions.push(this.builder[method]());
		}

		return transactions;
	}
}
