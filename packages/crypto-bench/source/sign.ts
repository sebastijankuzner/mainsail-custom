import * as SignatureBls12 from "@mainsail/crypto-signature-bls12-381";
import * as SignatureSchnorr from "@mainsail/crypto-signature-schnorr";
import * as KeyPairBls12 from "@mainsail/crypto-key-pair-bls12-381";
import * as KeyPairSchnorr from "@mainsail/crypto-key-pair-schnorr";

const toBuffer = (str: string) => Buffer.from(str, "hex");

const fixtures = {
    mnemonic: "endless deposit bright clip school doctor later surround strategy blouse damage drink diesel erase scrap inside over pledge talent blood bus luggage glad whale",

    ["bls12-381"]: {
        message: toBuffer("086cd977df0bf52d918f923758e63ecd86342090874841e55364e1cca43c7048"),
        signature: toBuffer("b8ed3fe1ae308ded18f7edf23c1c95a547e501e95524f776f6eb66398e0c19fbdc1c85c6cd6f0dca19763f64e75f95dc1725fd92011a463a0739f8c40f84e6946ca662618a58c99ea00adb1f80aa909b10e860098a038b48d653f3da22203cd1"),
        publicKey: toBuffer("a17c634621405b637424586119e423fe6d1e899faa4654cbc08457da3488e9b822a8e5229c4b059c5720ee5f70f555fe"),
        privateKey: toBuffer("086cd977df0bf52d918f923758e63ecd86342090874841e55364e1cca43c7048"),

    },
    ["schnorr"]: {
        message: toBuffer("086cd977df0bf52d918f923758e63ecd86342090874841e55364e1cca43c7048"),
        signature: toBuffer("91db1ab13db16ade381c61000502cdb5e97b1404ed10bde6cfa02196bcf2bbb3536dd3389c3ece80c117c637263a86f6f3d27814749bd169746eea126367e04e"),
        publicKey: toBuffer("2a453fefde568a298d26d4a3eaa66585ce6652d0dc59bd955be40746f7197a9d"),
        privateKey: toBuffer("409cbd9a42b9527e8697ca335a7378ba3f75907c3bf72f2b1019bb0a9cc42b44"),
    }
}

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
