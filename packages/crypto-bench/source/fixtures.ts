import { BigNumber } from "@mainsail/utils";
import { toBuffer } from "./helpers";

const blocks = {
    withoutTransactions: {
        generatorPublicKey: "e012f0a7cac12a74bdc17d844cbc9f637177b470019c32a53cef94c7a56e2ea9",
        height: 2,
        id: "e6ece29ff55b818dd22f1c2b2c420b374d8b9ce4a9e602816cab6d08ee754ca7",
        numberOfTransactions: 0,
        payloadHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        payloadLength: 0,
        previousBlock: "0000000000000000000000000000000000000000000000000000000000000000",
        reward: BigNumber.ZERO,
        timestamp: 0,
        totalAmount: BigNumber.ZERO,
        totalFee: BigNumber.ZERO,
        transactions: [],
        version: 1,
    },
    withTransactions: {
        generatorPublicKey: "e012f0a7cac12a74bdc17d844cbc9f637177b470019c32a53cef94c7a56e2ea9",
        height: 2,
        id: "d1c09a297ea886d281377c5240bca65bbbaebabd78556f1cfad6d37e07fa39a8",
        numberOfTransactions: 2,
        payloadHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        payloadLength: 0,
        previousBlock: "0000000000000000000000000000000000000000000000000000000000000000",
        reward: BigNumber.make(3),
        timestamp: 0,
        totalAmount: BigNumber.make(3),
        totalFee: BigNumber.ZERO,
        transactions: [
            {
                amount: BigNumber.ONE,
                expiration: 0,
                fee: BigNumber.ONE,
                id: "69d2e1503ca29bad075dbb5b9eb703ce83eb2def1ae69d798f3ea6020628a774",
                nonce: BigNumber.ZERO,
                recipientId: "ark19palawayc7yp5pgfw9l8rv6tv0e3usqzrseplzdwqnuyhekk4smskdkz3s",
                senderPublicKey: "287bfebba4c7881a0509717e71b34b63f31e40021c321f89ae04f84be6d6ac37",
                signature:
                    "ef4c4e285824ee65dee3f0652282fee31b02849cb221b6de18f28c648a7c5dcba2a97a1d210974cd4129cc925657993e12cdfe0b36a487cc4d2f886a09e33a5c",
                timestamp: 0,
                type: 0,
                typeGroup: 1,
                version: 1,
            },
            {
                amount: BigNumber.ONE,
                expiration: 0,
                fee: BigNumber.ONE,
                id: "db752428baf39c66bd509769df2fc97c741ad205191f6029c109c7a832c8ab5b",
                nonce: BigNumber.ZERO,
                recipientId: "ark19palawayc7yp5pgfw9l8rv6tv0e3usqzrseplzdwqnuyhekk4smskdkz3s",
                senderPublicKey: "287bfebba4c7881a0509717e71b34b63f31e40021c321f89ae04f84be6d6ac37",
                signature:
                    "ff8e1b3862ebde59bc77394ea7c0e4afe20b1129faa3afa86fc936c8d172a3bff17034515e5b286dac0f27475b69808aff39ce6a0683a8768db088609a0bffd8",
                timestamp: 0,
                type: 0,
                typeGroup: 1,
                version: 1,
            },
        ],
        version: 1,
    },
    withoutTransactionsJson: {
        generatorPublicKey: "e012f0a7cac12a74bdc17d844cbc9f637177b470019c32a53cef94c7a56e2ea9",
        height: 2,
        id: "e6ece29ff55b818dd22f1c2b2c420b374d8b9ce4a9e602816cab6d08ee754ca7",
        numberOfTransactions: 0,
        payloadHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        payloadLength: 0,
        previousBlock: "0000000000000000000000000000000000000000000000000000000000000000",
        reward: "0",
        timestamp: 0,
        totalAmount: "0",
        totalFee: "0",
        transactions: [],
        version: 1,
    },
    withTransactionsJson:
    {
        generatorPublicKey: "e012f0a7cac12a74bdc17d844cbc9f637177b470019c32a53cef94c7a56e2ea9",
        height: 2,
        id: "d1c09a297ea886d281377c5240bca65bbbaebabd78556f1cfad6d37e07fa39a8",
        numberOfTransactions: 2,
        payloadHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        payloadLength: 0,
        previousBlock: "0000000000000000000000000000000000000000000000000000000000000000",
        reward: "3",
        timestamp: 0,
        totalAmount: "3",
        totalFee: "0",
        transactions: [
            {
                amount: "1",
                expiration: 0,
                fee: "1",
                id: "69d2e1503ca29bad075dbb5b9eb703ce83eb2def1ae69d798f3ea6020628a774",
                nonce: "0",
                recipientId: "ark19palawayc7yp5pgfw9l8rv6tv0e3usqzrseplzdwqnuyhekk4smskdkz3s",
                senderPublicKey: "287bfebba4c7881a0509717e71b34b63f31e40021c321f89ae04f84be6d6ac37",
                signature:
                    "ef4c4e285824ee65dee3f0652282fee31b02849cb221b6de18f28c648a7c5dcba2a97a1d210974cd4129cc925657993e12cdfe0b36a487cc4d2f886a09e33a5c",
                timestamp: 0,
                type: 0,
                typeGroup: 1,
                version: 1,
            },
            {
                amount: "1",
                expiration: 0,
                fee: "1",
                id: "db752428baf39c66bd509769df2fc97c741ad205191f6029c109c7a832c8ab5b",
                nonce: "0",
                recipientId: "ark19palawayc7yp5pgfw9l8rv6tv0e3usqzrseplzdwqnuyhekk4smskdkz3s",
                senderPublicKey: "287bfebba4c7881a0509717e71b34b63f31e40021c321f89ae04f84be6d6ac37",
                signature:
                    "ff8e1b3862ebde59bc77394ea7c0e4afe20b1129faa3afa86fc936c8d172a3bff17034515e5b286dac0f27475b69808aff39ce6a0683a8768db088609a0bffd8",
                timestamp: 0,
                type: 0,
                typeGroup: 1,
                version: 1,
            },
        ],
        version: 1,
    },

    serialized:
        "01000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855e012f0a7cac12a74bdc17d844cbc9f637177b470019c32a53cef94c7a56e2ea9",
    serializedWithTransactions:
        "01000000000000000200000000000000000000000000000000000000000000000000000000000000000000000200000003000000000000000000000000000000030000000000000000000000e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855e012f0a7cac12a74bdc17d844cbc9f637177b470019c32a53cef94c7a56e2ea9ba000000ff011e0100000000000000000000000000287bfebba4c7881a0509717e71b34b63f31e40021c321f89ae04f84be6d6ac3701000000000000000001000000000000000000000005011d1f1d0e1d04181e0401140108090e051f07030c1a0b0c0f19111c100002031019011f020d0e00131c041719161615101b10ef4c4e285824ee65dee3f0652282fee31b02849cb221b6de18f28c648a7c5dcba2a97a1d210974cd4129cc925657993e12cdfe0b36a487cc4d2f886a09e33a5cba000000ff011e0100000000000000000000000000287bfebba4c7881a0509717e71b34b63f31e40021c321f89ae04f84be6d6ac3701000000000000000001000000000000000000000005011d1f1d0e1d04181e0401140108090e051f07030c1a0b0c0f19111c100002031019011f020d0e00131c041719161615101b10ff8e1b3862ebde59bc77394ea7c0e4afe20b1129faa3afa86fc936c8d172a3bff17034515e5b286dac0f27475b69808aff39ce6a0683a8768db088609a0bffd8",
}

const transactions = {
    data: {
        amount: BigNumber.ONE,
        expiration: 0,
        fee: BigNumber.ONE,
        id: "69d2e1503ca29bad075dbb5b9eb703ce83eb2def1ae69d798f3ea6020628a774",
        nonce: BigNumber.ZERO,
        recipientId: "ark19palawayc7yp5pgfw9l8rv6tv0e3usqzrseplzdwqnuyhekk4smskdkz3s",
        senderPublicKey: "287bfebba4c7881a0509717e71b34b63f31e40021c321f89ae04f84be6d6ac37",
        signature:
            "ef4c4e285824ee65dee3f0652282fee31b02849cb221b6de18f28c648a7c5dcba2a97a1d210974cd4129cc925657993e12cdfe0b36a487cc4d2f886a09e33a5c",
        timestamp: 0,
        type: 0,
        typeGroup: 1,
        version: 1,
    },
    json: {
        version: 1,
        network: 30,
        type: 0,
        nonce: "0",
        timestamp: 58126413,
        senderPublicKey: "287bfebba4c7881a0509717e71b34b63f31e40021c321f89ae04f84be6d6ac37",
        fee: "10000000",
        amount: "200000000",
        expiration: 0,
        recipientId: "ark19palawayc7yp5pgfw9l8rv6tv0e3usqzrseplzdwqnuyhekk4smskdkz3s",
        signature: "3045022100bac5b7699748a891b39ff5439e16ea1a694e93954b248be6b8082da01e5386310220129eb06a58b9f80d36ea3cdc903e6cc0240bbe1d371339ffe15c87742af1427d",
        vendorField: "Transaction 7",
        id: "00d2025f7914a8e794bdaea404a579840cf71402cef312d2080c7ecd86177e5f"
    },
    serialized: "ff011e0100000000000000000000000000287bfebba4c7881a0509717e71b34b63f31e40021c321f89ae04f84be6d6ac3780969800000000000d5472616e73616374696f6e203700c2eb0b000000000000000005011d1f1d0e1d04181e0401140108090e051f07030c1a0b0c0f19111c100002031019011f020d0e00131c041719161615101b103045022100bac5b7699748a891b39ff5439e16ea1a694e93954b248be6b8082da01e5386310220129eb06a58b9f80d36ea3cdc903e6cc0240bbe1d371339ffe1"
}

export const fixtures = {
    mnemonic: "endless deposit bright clip school doctor later surround strategy blouse damage drink diesel erase scrap inside over pledge talent blood bus luggage glad whale",

    ["bls12-381"]: {
        message: toBuffer("086cd977df0bf52d918f923758e63ecd86342090874841e55364e1cca43c7048"),
        signature: toBuffer("9212abebf075a5b0c688de0ec88330c13843919df10ba67308e5414ddde65178d104419950ac2707006e923a1b5534670569b688a20bd5747bc71904159e319613a55ef22f10b7b0a34d3f0be96aae39a566e710708b00076a65d9a78efe345e"),
        publicKey: toBuffer("a17c634621405b637424586119e423fe6d1e899faa4654cbc08457da3488e9b822a8e5229c4b059c5720ee5f70f555fe"),
        privateKey: toBuffer("086cd977df0bf52d918f923758e63ecd86342090874841e55364e1cca43c7048"),

    },
    ["schnorr"]: {
        message: toBuffer("086cd977df0bf52d918f923758e63ecd86342090874841e55364e1cca43c7048"),
        signature: toBuffer("91db1ab13db16ade381c61000502cdb5e97b1404ed10bde6cfa02196bcf2bbb3536dd3389c3ece80c117c637263a86f6f3d27814749bd169746eea126367e04e"),
        publicKey: toBuffer("2a453fefde568a298d26d4a3eaa66585ce6652d0dc59bd955be40746f7197a9d"),
        privateKey: toBuffer("409cbd9a42b9527e8697ca335a7378ba3f75907c3bf72f2b1019bb0a9cc42b44"),
    },

    blocks,
    transactions,
}