import * as SignatureBls12 from "@mainsail/crypto-signature-bls12-381";
import * as SignatureSchnorr from "@mainsail/crypto-signature-schnorr";
import * as KeyPairBls12 from "@mainsail/crypto-key-pair-bls12-381";
import * as KeyPairSchnorr from "@mainsail/crypto-key-pair-schnorr";
import { fixtures } from "../fixtures";

for (const [scheme, pair] of Object.entries({
    ["bls12-381"]: {
        signer: new SignatureBls12.Signature(), keyPair: new KeyPairBls12.KeyPairFactory()
    },
    ["schnorr"]: { signer: new SignatureSchnorr.Signature(), keyPair: new KeyPairSchnorr.KeyPairFactory() },
})) {
    exports[`sign-${scheme}`] = async () => {
        const { message, privateKey } = fixtures[scheme];
        const { signer } = pair;
        await signer.sign(message, privateKey);
    };

    exports[`verify-${scheme}`] = async () => {
        const { message, signature, publicKey } = fixtures[scheme];
        const { signer } = pair;

        const ok = await signer.verify(signature, message, publicKey);
        if (!ok) {
            throw new Error("bad input");
        }
    };
}
