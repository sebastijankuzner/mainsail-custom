import * as $protobuf from "protobufjs";
import Long = require("long");
/** Namespace getBlocks. */
export namespace getBlocks {

    /** Properties of a GetBlocksRequest. */
    interface IGetBlocksRequest {

        /** GetBlocksRequest lastBlockHeight */
        lastBlockHeight?: (number|null);

        /** GetBlocksRequest blockLimit */
        blockLimit?: (number|null);

        /** GetBlocksRequest headersOnly */
        headersOnly?: (boolean|null);

        /** GetBlocksRequest serialized */
        serialized?: (boolean|null);

        /** GetBlocksRequest headers */
        headers?: (shared.IHeaders|null);
    }

    /** Represents a GetBlocksRequest. */
    class GetBlocksRequest implements IGetBlocksRequest {

        /**
         * Constructs a new GetBlocksRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: getBlocks.IGetBlocksRequest);

        /** GetBlocksRequest lastBlockHeight. */
        public lastBlockHeight: number;

        /** GetBlocksRequest blockLimit. */
        public blockLimit: number;

        /** GetBlocksRequest headersOnly. */
        public headersOnly: boolean;

        /** GetBlocksRequest serialized. */
        public serialized: boolean;

        /** GetBlocksRequest headers. */
        public headers?: (shared.IHeaders|null);

        /**
         * Creates a new GetBlocksRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns GetBlocksRequest instance
         */
        public static create(properties?: getBlocks.IGetBlocksRequest): getBlocks.GetBlocksRequest;

        /**
         * Encodes the specified GetBlocksRequest message. Does not implicitly {@link getBlocks.GetBlocksRequest.verify|verify} messages.
         * @param message GetBlocksRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: getBlocks.IGetBlocksRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified GetBlocksRequest message, length delimited. Does not implicitly {@link getBlocks.GetBlocksRequest.verify|verify} messages.
         * @param message GetBlocksRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: getBlocks.IGetBlocksRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a GetBlocksRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns GetBlocksRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): getBlocks.GetBlocksRequest;

        /**
         * Decodes a GetBlocksRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns GetBlocksRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): getBlocks.GetBlocksRequest;

        /**
         * Verifies a GetBlocksRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a GetBlocksRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns GetBlocksRequest
         */
        public static fromObject(object: { [k: string]: any }): getBlocks.GetBlocksRequest;

        /**
         * Creates a plain object from a GetBlocksRequest message. Also converts values to other types if specified.
         * @param message GetBlocksRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: getBlocks.GetBlocksRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this GetBlocksRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for GetBlocksRequest
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a GetBlocksResponse. */
    interface IGetBlocksResponse {

        /** GetBlocksResponse blocks */
        blocks?: (Uint8Array|null);
    }

    /** Represents a GetBlocksResponse. */
    class GetBlocksResponse implements IGetBlocksResponse {

        /**
         * Constructs a new GetBlocksResponse.
         * @param [properties] Properties to set
         */
        constructor(properties?: getBlocks.IGetBlocksResponse);

        /** GetBlocksResponse blocks. */
        public blocks: Uint8Array;

        /**
         * Creates a new GetBlocksResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns GetBlocksResponse instance
         */
        public static create(properties?: getBlocks.IGetBlocksResponse): getBlocks.GetBlocksResponse;

        /**
         * Encodes the specified GetBlocksResponse message. Does not implicitly {@link getBlocks.GetBlocksResponse.verify|verify} messages.
         * @param message GetBlocksResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: getBlocks.IGetBlocksResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified GetBlocksResponse message, length delimited. Does not implicitly {@link getBlocks.GetBlocksResponse.verify|verify} messages.
         * @param message GetBlocksResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: getBlocks.IGetBlocksResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a GetBlocksResponse message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns GetBlocksResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): getBlocks.GetBlocksResponse;

        /**
         * Decodes a GetBlocksResponse message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns GetBlocksResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): getBlocks.GetBlocksResponse;

        /**
         * Verifies a GetBlocksResponse message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a GetBlocksResponse message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns GetBlocksResponse
         */
        public static fromObject(object: { [k: string]: any }): getBlocks.GetBlocksResponse;

        /**
         * Creates a plain object from a GetBlocksResponse message. Also converts values to other types if specified.
         * @param message GetBlocksResponse
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: getBlocks.GetBlocksResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this GetBlocksResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for GetBlocksResponse
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    namespace GetBlocksResponse {

        /** Properties of a BlockHeader. */
        interface IBlockHeader {

            /** BlockHeader id */
            id?: (string|null);

            /** BlockHeader version */
            version?: (number|null);

            /** BlockHeader timestamp */
            timestamp?: (number|null);

            /** BlockHeader previousBlock */
            previousBlock?: (string|null);

            /** BlockHeader height */
            height?: (number|null);

            /** BlockHeader numberOfTransactions */
            numberOfTransactions?: (number|null);

            /** BlockHeader totalAmount */
            totalAmount?: (string|null);

            /** BlockHeader totalFee */
            totalFee?: (string|null);

            /** BlockHeader reward */
            reward?: (string|null);

            /** BlockHeader payloadLength */
            payloadLength?: (number|null);

            /** BlockHeader payloadHash */
            payloadHash?: (string|null);

            /** BlockHeader generatorPublicKey */
            generatorPublicKey?: (string|null);

            /** BlockHeader blockSignature */
            blockSignature?: (string|null);

            /** BlockHeader transactions */
            transactions?: (Uint8Array|null);
        }

        /** Represents a BlockHeader. */
        class BlockHeader implements IBlockHeader {

            /**
             * Constructs a new BlockHeader.
             * @param [properties] Properties to set
             */
            constructor(properties?: getBlocks.GetBlocksResponse.IBlockHeader);

            /** BlockHeader id. */
            public id: string;

            /** BlockHeader version. */
            public version: number;

            /** BlockHeader timestamp. */
            public timestamp: number;

            /** BlockHeader previousBlock. */
            public previousBlock: string;

            /** BlockHeader height. */
            public height: number;

            /** BlockHeader numberOfTransactions. */
            public numberOfTransactions: number;

            /** BlockHeader totalAmount. */
            public totalAmount: string;

            /** BlockHeader totalFee. */
            public totalFee: string;

            /** BlockHeader reward. */
            public reward: string;

            /** BlockHeader payloadLength. */
            public payloadLength: number;

            /** BlockHeader payloadHash. */
            public payloadHash: string;

            /** BlockHeader generatorPublicKey. */
            public generatorPublicKey: string;

            /** BlockHeader blockSignature. */
            public blockSignature: string;

            /** BlockHeader transactions. */
            public transactions: Uint8Array;

            /**
             * Creates a new BlockHeader instance using the specified properties.
             * @param [properties] Properties to set
             * @returns BlockHeader instance
             */
            public static create(properties?: getBlocks.GetBlocksResponse.IBlockHeader): getBlocks.GetBlocksResponse.BlockHeader;

            /**
             * Encodes the specified BlockHeader message. Does not implicitly {@link getBlocks.GetBlocksResponse.BlockHeader.verify|verify} messages.
             * @param message BlockHeader message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: getBlocks.GetBlocksResponse.IBlockHeader, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified BlockHeader message, length delimited. Does not implicitly {@link getBlocks.GetBlocksResponse.BlockHeader.verify|verify} messages.
             * @param message BlockHeader message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: getBlocks.GetBlocksResponse.IBlockHeader, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a BlockHeader message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns BlockHeader
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): getBlocks.GetBlocksResponse.BlockHeader;

            /**
             * Decodes a BlockHeader message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns BlockHeader
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): getBlocks.GetBlocksResponse.BlockHeader;

            /**
             * Verifies a BlockHeader message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a BlockHeader message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns BlockHeader
             */
            public static fromObject(object: { [k: string]: any }): getBlocks.GetBlocksResponse.BlockHeader;

            /**
             * Creates a plain object from a BlockHeader message. Also converts values to other types if specified.
             * @param message BlockHeader
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: getBlocks.GetBlocksResponse.BlockHeader, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this BlockHeader to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for BlockHeader
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }
}

/** Namespace getCommonBlocks. */
export namespace getCommonBlocks {

    /** Properties of a GetCommonBlocksRequest. */
    interface IGetCommonBlocksRequest {

        /** GetCommonBlocksRequest ids */
        ids?: (string[]|null);

        /** GetCommonBlocksRequest headers */
        headers?: (shared.IHeaders|null);
    }

    /** Represents a GetCommonBlocksRequest. */
    class GetCommonBlocksRequest implements IGetCommonBlocksRequest {

        /**
         * Constructs a new GetCommonBlocksRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: getCommonBlocks.IGetCommonBlocksRequest);

        /** GetCommonBlocksRequest ids. */
        public ids: string[];

        /** GetCommonBlocksRequest headers. */
        public headers?: (shared.IHeaders|null);

        /**
         * Creates a new GetCommonBlocksRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns GetCommonBlocksRequest instance
         */
        public static create(properties?: getCommonBlocks.IGetCommonBlocksRequest): getCommonBlocks.GetCommonBlocksRequest;

        /**
         * Encodes the specified GetCommonBlocksRequest message. Does not implicitly {@link getCommonBlocks.GetCommonBlocksRequest.verify|verify} messages.
         * @param message GetCommonBlocksRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: getCommonBlocks.IGetCommonBlocksRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified GetCommonBlocksRequest message, length delimited. Does not implicitly {@link getCommonBlocks.GetCommonBlocksRequest.verify|verify} messages.
         * @param message GetCommonBlocksRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: getCommonBlocks.IGetCommonBlocksRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a GetCommonBlocksRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns GetCommonBlocksRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): getCommonBlocks.GetCommonBlocksRequest;

        /**
         * Decodes a GetCommonBlocksRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns GetCommonBlocksRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): getCommonBlocks.GetCommonBlocksRequest;

        /**
         * Verifies a GetCommonBlocksRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a GetCommonBlocksRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns GetCommonBlocksRequest
         */
        public static fromObject(object: { [k: string]: any }): getCommonBlocks.GetCommonBlocksRequest;

        /**
         * Creates a plain object from a GetCommonBlocksRequest message. Also converts values to other types if specified.
         * @param message GetCommonBlocksRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: getCommonBlocks.GetCommonBlocksRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this GetCommonBlocksRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for GetCommonBlocksRequest
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a GetCommonBlocksResponse. */
    interface IGetCommonBlocksResponse {

        /** GetCommonBlocksResponse common */
        common?: (getCommonBlocks.GetCommonBlocksResponse.ICommon|null);
    }

    /** Represents a GetCommonBlocksResponse. */
    class GetCommonBlocksResponse implements IGetCommonBlocksResponse {

        /**
         * Constructs a new GetCommonBlocksResponse.
         * @param [properties] Properties to set
         */
        constructor(properties?: getCommonBlocks.IGetCommonBlocksResponse);

        /** GetCommonBlocksResponse common. */
        public common?: (getCommonBlocks.GetCommonBlocksResponse.ICommon|null);

        /**
         * Creates a new GetCommonBlocksResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns GetCommonBlocksResponse instance
         */
        public static create(properties?: getCommonBlocks.IGetCommonBlocksResponse): getCommonBlocks.GetCommonBlocksResponse;

        /**
         * Encodes the specified GetCommonBlocksResponse message. Does not implicitly {@link getCommonBlocks.GetCommonBlocksResponse.verify|verify} messages.
         * @param message GetCommonBlocksResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: getCommonBlocks.IGetCommonBlocksResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified GetCommonBlocksResponse message, length delimited. Does not implicitly {@link getCommonBlocks.GetCommonBlocksResponse.verify|verify} messages.
         * @param message GetCommonBlocksResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: getCommonBlocks.IGetCommonBlocksResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a GetCommonBlocksResponse message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns GetCommonBlocksResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): getCommonBlocks.GetCommonBlocksResponse;

        /**
         * Decodes a GetCommonBlocksResponse message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns GetCommonBlocksResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): getCommonBlocks.GetCommonBlocksResponse;

        /**
         * Verifies a GetCommonBlocksResponse message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a GetCommonBlocksResponse message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns GetCommonBlocksResponse
         */
        public static fromObject(object: { [k: string]: any }): getCommonBlocks.GetCommonBlocksResponse;

        /**
         * Creates a plain object from a GetCommonBlocksResponse message. Also converts values to other types if specified.
         * @param message GetCommonBlocksResponse
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: getCommonBlocks.GetCommonBlocksResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this GetCommonBlocksResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for GetCommonBlocksResponse
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    namespace GetCommonBlocksResponse {

        /** Properties of a Common. */
        interface ICommon {

            /** Common height */
            height?: (number|null);

            /** Common id */
            id?: (string|null);
        }

        /** Represents a Common. */
        class Common implements ICommon {

            /**
             * Constructs a new Common.
             * @param [properties] Properties to set
             */
            constructor(properties?: getCommonBlocks.GetCommonBlocksResponse.ICommon);

            /** Common height. */
            public height: number;

            /** Common id. */
            public id: string;

            /**
             * Creates a new Common instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Common instance
             */
            public static create(properties?: getCommonBlocks.GetCommonBlocksResponse.ICommon): getCommonBlocks.GetCommonBlocksResponse.Common;

            /**
             * Encodes the specified Common message. Does not implicitly {@link getCommonBlocks.GetCommonBlocksResponse.Common.verify|verify} messages.
             * @param message Common message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: getCommonBlocks.GetCommonBlocksResponse.ICommon, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Common message, length delimited. Does not implicitly {@link getCommonBlocks.GetCommonBlocksResponse.Common.verify|verify} messages.
             * @param message Common message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: getCommonBlocks.GetCommonBlocksResponse.ICommon, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Common message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Common
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): getCommonBlocks.GetCommonBlocksResponse.Common;

            /**
             * Decodes a Common message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Common
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): getCommonBlocks.GetCommonBlocksResponse.Common;

            /**
             * Verifies a Common message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Common message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Common
             */
            public static fromObject(object: { [k: string]: any }): getCommonBlocks.GetCommonBlocksResponse.Common;

            /**
             * Creates a plain object from a Common message. Also converts values to other types if specified.
             * @param message Common
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: getCommonBlocks.GetCommonBlocksResponse.Common, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Common to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Common
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }
}

/** Namespace getMessages. */
export namespace getMessages {

    /** Properties of a GetMessagesRequest. */
    interface IGetMessagesRequest {

        /** GetMessagesRequest headers */
        headers?: (shared.IHeaders|null);
    }

    /** Represents a GetMessagesRequest. */
    class GetMessagesRequest implements IGetMessagesRequest {

        /**
         * Constructs a new GetMessagesRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: getMessages.IGetMessagesRequest);

        /** GetMessagesRequest headers. */
        public headers?: (shared.IHeaders|null);

        /**
         * Creates a new GetMessagesRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns GetMessagesRequest instance
         */
        public static create(properties?: getMessages.IGetMessagesRequest): getMessages.GetMessagesRequest;

        /**
         * Encodes the specified GetMessagesRequest message. Does not implicitly {@link getMessages.GetMessagesRequest.verify|verify} messages.
         * @param message GetMessagesRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: getMessages.IGetMessagesRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified GetMessagesRequest message, length delimited. Does not implicitly {@link getMessages.GetMessagesRequest.verify|verify} messages.
         * @param message GetMessagesRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: getMessages.IGetMessagesRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a GetMessagesRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns GetMessagesRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): getMessages.GetMessagesRequest;

        /**
         * Decodes a GetMessagesRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns GetMessagesRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): getMessages.GetMessagesRequest;

        /**
         * Verifies a GetMessagesRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a GetMessagesRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns GetMessagesRequest
         */
        public static fromObject(object: { [k: string]: any }): getMessages.GetMessagesRequest;

        /**
         * Creates a plain object from a GetMessagesRequest message. Also converts values to other types if specified.
         * @param message GetMessagesRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: getMessages.GetMessagesRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this GetMessagesRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for GetMessagesRequest
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a GetMessagesResponse. */
    interface IGetMessagesResponse {

        /** GetMessagesResponse prevotes */
        prevotes?: (string[]|null);

        /** GetMessagesResponse precommits */
        precommits?: (string[]|null);
    }

    /** Represents a GetMessagesResponse. */
    class GetMessagesResponse implements IGetMessagesResponse {

        /**
         * Constructs a new GetMessagesResponse.
         * @param [properties] Properties to set
         */
        constructor(properties?: getMessages.IGetMessagesResponse);

        /** GetMessagesResponse prevotes. */
        public prevotes: string[];

        /** GetMessagesResponse precommits. */
        public precommits: string[];

        /**
         * Creates a new GetMessagesResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns GetMessagesResponse instance
         */
        public static create(properties?: getMessages.IGetMessagesResponse): getMessages.GetMessagesResponse;

        /**
         * Encodes the specified GetMessagesResponse message. Does not implicitly {@link getMessages.GetMessagesResponse.verify|verify} messages.
         * @param message GetMessagesResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: getMessages.IGetMessagesResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified GetMessagesResponse message, length delimited. Does not implicitly {@link getMessages.GetMessagesResponse.verify|verify} messages.
         * @param message GetMessagesResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: getMessages.IGetMessagesResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a GetMessagesResponse message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns GetMessagesResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): getMessages.GetMessagesResponse;

        /**
         * Decodes a GetMessagesResponse message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns GetMessagesResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): getMessages.GetMessagesResponse;

        /**
         * Verifies a GetMessagesResponse message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a GetMessagesResponse message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns GetMessagesResponse
         */
        public static fromObject(object: { [k: string]: any }): getMessages.GetMessagesResponse;

        /**
         * Creates a plain object from a GetMessagesResponse message. Also converts values to other types if specified.
         * @param message GetMessagesResponse
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: getMessages.GetMessagesResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this GetMessagesResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for GetMessagesResponse
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }
}

/** Namespace getPeers. */
export namespace getPeers {

    /** Properties of a GetPeersRequest. */
    interface IGetPeersRequest {

        /** GetPeersRequest headers */
        headers?: (shared.IHeaders|null);
    }

    /** Represents a GetPeersRequest. */
    class GetPeersRequest implements IGetPeersRequest {

        /**
         * Constructs a new GetPeersRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: getPeers.IGetPeersRequest);

        /** GetPeersRequest headers. */
        public headers?: (shared.IHeaders|null);

        /**
         * Creates a new GetPeersRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns GetPeersRequest instance
         */
        public static create(properties?: getPeers.IGetPeersRequest): getPeers.GetPeersRequest;

        /**
         * Encodes the specified GetPeersRequest message. Does not implicitly {@link getPeers.GetPeersRequest.verify|verify} messages.
         * @param message GetPeersRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: getPeers.IGetPeersRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified GetPeersRequest message, length delimited. Does not implicitly {@link getPeers.GetPeersRequest.verify|verify} messages.
         * @param message GetPeersRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: getPeers.IGetPeersRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a GetPeersRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns GetPeersRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): getPeers.GetPeersRequest;

        /**
         * Decodes a GetPeersRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns GetPeersRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): getPeers.GetPeersRequest;

        /**
         * Verifies a GetPeersRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a GetPeersRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns GetPeersRequest
         */
        public static fromObject(object: { [k: string]: any }): getPeers.GetPeersRequest;

        /**
         * Creates a plain object from a GetPeersRequest message. Also converts values to other types if specified.
         * @param message GetPeersRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: getPeers.GetPeersRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this GetPeersRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for GetPeersRequest
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a GetPeersResponse. */
    interface IGetPeersResponse {

        /** GetPeersResponse peers */
        peers?: (getPeers.GetPeersResponse.IPeer[]|null);
    }

    /** Represents a GetPeersResponse. */
    class GetPeersResponse implements IGetPeersResponse {

        /**
         * Constructs a new GetPeersResponse.
         * @param [properties] Properties to set
         */
        constructor(properties?: getPeers.IGetPeersResponse);

        /** GetPeersResponse peers. */
        public peers: getPeers.GetPeersResponse.IPeer[];

        /**
         * Creates a new GetPeersResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns GetPeersResponse instance
         */
        public static create(properties?: getPeers.IGetPeersResponse): getPeers.GetPeersResponse;

        /**
         * Encodes the specified GetPeersResponse message. Does not implicitly {@link getPeers.GetPeersResponse.verify|verify} messages.
         * @param message GetPeersResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: getPeers.IGetPeersResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified GetPeersResponse message, length delimited. Does not implicitly {@link getPeers.GetPeersResponse.verify|verify} messages.
         * @param message GetPeersResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: getPeers.IGetPeersResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a GetPeersResponse message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns GetPeersResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): getPeers.GetPeersResponse;

        /**
         * Decodes a GetPeersResponse message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns GetPeersResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): getPeers.GetPeersResponse;

        /**
         * Verifies a GetPeersResponse message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a GetPeersResponse message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns GetPeersResponse
         */
        public static fromObject(object: { [k: string]: any }): getPeers.GetPeersResponse;

        /**
         * Creates a plain object from a GetPeersResponse message. Also converts values to other types if specified.
         * @param message GetPeersResponse
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: getPeers.GetPeersResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this GetPeersResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for GetPeersResponse
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    namespace GetPeersResponse {

        /** Properties of a Peer. */
        interface IPeer {

            /** Peer ip */
            ip?: (string|null);

            /** Peer port */
            port?: (number|null);
        }

        /** Represents a Peer. */
        class Peer implements IPeer {

            /**
             * Constructs a new Peer.
             * @param [properties] Properties to set
             */
            constructor(properties?: getPeers.GetPeersResponse.IPeer);

            /** Peer ip. */
            public ip: string;

            /** Peer port. */
            public port: number;

            /**
             * Creates a new Peer instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Peer instance
             */
            public static create(properties?: getPeers.GetPeersResponse.IPeer): getPeers.GetPeersResponse.Peer;

            /**
             * Encodes the specified Peer message. Does not implicitly {@link getPeers.GetPeersResponse.Peer.verify|verify} messages.
             * @param message Peer message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: getPeers.GetPeersResponse.IPeer, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Peer message, length delimited. Does not implicitly {@link getPeers.GetPeersResponse.Peer.verify|verify} messages.
             * @param message Peer message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: getPeers.GetPeersResponse.IPeer, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Peer message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Peer
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): getPeers.GetPeersResponse.Peer;

            /**
             * Decodes a Peer message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Peer
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): getPeers.GetPeersResponse.Peer;

            /**
             * Verifies a Peer message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Peer message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Peer
             */
            public static fromObject(object: { [k: string]: any }): getPeers.GetPeersResponse.Peer;

            /**
             * Creates a plain object from a Peer message. Also converts values to other types if specified.
             * @param message Peer
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: getPeers.GetPeersResponse.Peer, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Peer to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Peer
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }
}

/** Namespace getStatus. */
export namespace getStatus {

    /** Properties of a GetStatusRequest. */
    interface IGetStatusRequest {

        /** GetStatusRequest headers */
        headers?: (shared.IHeaders|null);
    }

    /** Represents a GetStatusRequest. */
    class GetStatusRequest implements IGetStatusRequest {

        /**
         * Constructs a new GetStatusRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: getStatus.IGetStatusRequest);

        /** GetStatusRequest headers. */
        public headers?: (shared.IHeaders|null);

        /**
         * Creates a new GetStatusRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns GetStatusRequest instance
         */
        public static create(properties?: getStatus.IGetStatusRequest): getStatus.GetStatusRequest;

        /**
         * Encodes the specified GetStatusRequest message. Does not implicitly {@link getStatus.GetStatusRequest.verify|verify} messages.
         * @param message GetStatusRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: getStatus.IGetStatusRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified GetStatusRequest message, length delimited. Does not implicitly {@link getStatus.GetStatusRequest.verify|verify} messages.
         * @param message GetStatusRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: getStatus.IGetStatusRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a GetStatusRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns GetStatusRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): getStatus.GetStatusRequest;

        /**
         * Decodes a GetStatusRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns GetStatusRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): getStatus.GetStatusRequest;

        /**
         * Verifies a GetStatusRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a GetStatusRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns GetStatusRequest
         */
        public static fromObject(object: { [k: string]: any }): getStatus.GetStatusRequest;

        /**
         * Creates a plain object from a GetStatusRequest message. Also converts values to other types if specified.
         * @param message GetStatusRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: getStatus.GetStatusRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this GetStatusRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for GetStatusRequest
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a GetStatusResponse. */
    interface IGetStatusResponse {

        /** GetStatusResponse state */
        state?: (getStatus.GetStatusResponse.IState|null);

        /** GetStatusResponse config */
        config?: (getStatus.GetStatusResponse.IConfig|null);
    }

    /** Represents a GetStatusResponse. */
    class GetStatusResponse implements IGetStatusResponse {

        /**
         * Constructs a new GetStatusResponse.
         * @param [properties] Properties to set
         */
        constructor(properties?: getStatus.IGetStatusResponse);

        /** GetStatusResponse state. */
        public state?: (getStatus.GetStatusResponse.IState|null);

        /** GetStatusResponse config. */
        public config?: (getStatus.GetStatusResponse.IConfig|null);

        /**
         * Creates a new GetStatusResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns GetStatusResponse instance
         */
        public static create(properties?: getStatus.IGetStatusResponse): getStatus.GetStatusResponse;

        /**
         * Encodes the specified GetStatusResponse message. Does not implicitly {@link getStatus.GetStatusResponse.verify|verify} messages.
         * @param message GetStatusResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: getStatus.IGetStatusResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified GetStatusResponse message, length delimited. Does not implicitly {@link getStatus.GetStatusResponse.verify|verify} messages.
         * @param message GetStatusResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: getStatus.IGetStatusResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a GetStatusResponse message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns GetStatusResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): getStatus.GetStatusResponse;

        /**
         * Decodes a GetStatusResponse message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns GetStatusResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): getStatus.GetStatusResponse;

        /**
         * Verifies a GetStatusResponse message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a GetStatusResponse message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns GetStatusResponse
         */
        public static fromObject(object: { [k: string]: any }): getStatus.GetStatusResponse;

        /**
         * Creates a plain object from a GetStatusResponse message. Also converts values to other types if specified.
         * @param message GetStatusResponse
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: getStatus.GetStatusResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this GetStatusResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for GetStatusResponse
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    namespace GetStatusResponse {

        /** Properties of a State. */
        interface IState {

            /** State height */
            height?: (number|null);

            /** State forgingAllowed */
            forgingAllowed?: (boolean|null);

            /** State currentSlot */
            currentSlot?: (number|null);

            /** State header */
            header?: (getStatus.GetStatusResponse.State.IBlockHeader|null);
        }

        /** Represents a State. */
        class State implements IState {

            /**
             * Constructs a new State.
             * @param [properties] Properties to set
             */
            constructor(properties?: getStatus.GetStatusResponse.IState);

            /** State height. */
            public height: number;

            /** State forgingAllowed. */
            public forgingAllowed: boolean;

            /** State currentSlot. */
            public currentSlot: number;

            /** State header. */
            public header?: (getStatus.GetStatusResponse.State.IBlockHeader|null);

            /**
             * Creates a new State instance using the specified properties.
             * @param [properties] Properties to set
             * @returns State instance
             */
            public static create(properties?: getStatus.GetStatusResponse.IState): getStatus.GetStatusResponse.State;

            /**
             * Encodes the specified State message. Does not implicitly {@link getStatus.GetStatusResponse.State.verify|verify} messages.
             * @param message State message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: getStatus.GetStatusResponse.IState, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified State message, length delimited. Does not implicitly {@link getStatus.GetStatusResponse.State.verify|verify} messages.
             * @param message State message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: getStatus.GetStatusResponse.IState, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a State message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns State
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): getStatus.GetStatusResponse.State;

            /**
             * Decodes a State message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns State
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): getStatus.GetStatusResponse.State;

            /**
             * Verifies a State message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a State message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns State
             */
            public static fromObject(object: { [k: string]: any }): getStatus.GetStatusResponse.State;

            /**
             * Creates a plain object from a State message. Also converts values to other types if specified.
             * @param message State
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: getStatus.GetStatusResponse.State, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this State to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for State
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        namespace State {

            /** Properties of a BlockHeader. */
            interface IBlockHeader {

                /** BlockHeader id */
                id?: (string|null);

                /** BlockHeader version */
                version?: (number|null);

                /** BlockHeader timestamp */
                timestamp?: (number|null);

                /** BlockHeader previousBlock */
                previousBlock?: (string|null);

                /** BlockHeader height */
                height?: (number|null);

                /** BlockHeader numberOfTransactions */
                numberOfTransactions?: (number|null);

                /** BlockHeader totalAmount */
                totalAmount?: (string|null);

                /** BlockHeader totalFee */
                totalFee?: (string|null);

                /** BlockHeader reward */
                reward?: (string|null);

                /** BlockHeader payloadLength */
                payloadLength?: (number|null);

                /** BlockHeader payloadHash */
                payloadHash?: (string|null);

                /** BlockHeader generatorPublicKey */
                generatorPublicKey?: (string|null);

                /** BlockHeader blockSignature */
                blockSignature?: (string|null);
            }

            /** Represents a BlockHeader. */
            class BlockHeader implements IBlockHeader {

                /**
                 * Constructs a new BlockHeader.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: getStatus.GetStatusResponse.State.IBlockHeader);

                /** BlockHeader id. */
                public id: string;

                /** BlockHeader version. */
                public version: number;

                /** BlockHeader timestamp. */
                public timestamp: number;

                /** BlockHeader previousBlock. */
                public previousBlock: string;

                /** BlockHeader height. */
                public height: number;

                /** BlockHeader numberOfTransactions. */
                public numberOfTransactions: number;

                /** BlockHeader totalAmount. */
                public totalAmount: string;

                /** BlockHeader totalFee. */
                public totalFee: string;

                /** BlockHeader reward. */
                public reward: string;

                /** BlockHeader payloadLength. */
                public payloadLength: number;

                /** BlockHeader payloadHash. */
                public payloadHash: string;

                /** BlockHeader generatorPublicKey. */
                public generatorPublicKey: string;

                /** BlockHeader blockSignature. */
                public blockSignature: string;

                /**
                 * Creates a new BlockHeader instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns BlockHeader instance
                 */
                public static create(properties?: getStatus.GetStatusResponse.State.IBlockHeader): getStatus.GetStatusResponse.State.BlockHeader;

                /**
                 * Encodes the specified BlockHeader message. Does not implicitly {@link getStatus.GetStatusResponse.State.BlockHeader.verify|verify} messages.
                 * @param message BlockHeader message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: getStatus.GetStatusResponse.State.IBlockHeader, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified BlockHeader message, length delimited. Does not implicitly {@link getStatus.GetStatusResponse.State.BlockHeader.verify|verify} messages.
                 * @param message BlockHeader message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: getStatus.GetStatusResponse.State.IBlockHeader, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a BlockHeader message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns BlockHeader
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): getStatus.GetStatusResponse.State.BlockHeader;

                /**
                 * Decodes a BlockHeader message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns BlockHeader
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): getStatus.GetStatusResponse.State.BlockHeader;

                /**
                 * Verifies a BlockHeader message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a BlockHeader message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns BlockHeader
                 */
                public static fromObject(object: { [k: string]: any }): getStatus.GetStatusResponse.State.BlockHeader;

                /**
                 * Creates a plain object from a BlockHeader message. Also converts values to other types if specified.
                 * @param message BlockHeader
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: getStatus.GetStatusResponse.State.BlockHeader, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this BlockHeader to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for BlockHeader
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }
        }

        /** Properties of a Config. */
        interface IConfig {

            /** Config version */
            version?: (string|null);

            /** Config network */
            network?: (getStatus.GetStatusResponse.Config.INetwork|null);

            /** Config plugins */
            plugins?: ({ [k: string]: getStatus.GetStatusResponse.Config.IPlugin }|null);
        }

        /** Represents a Config. */
        class Config implements IConfig {

            /**
             * Constructs a new Config.
             * @param [properties] Properties to set
             */
            constructor(properties?: getStatus.GetStatusResponse.IConfig);

            /** Config version. */
            public version: string;

            /** Config network. */
            public network?: (getStatus.GetStatusResponse.Config.INetwork|null);

            /** Config plugins. */
            public plugins: { [k: string]: getStatus.GetStatusResponse.Config.IPlugin };

            /**
             * Creates a new Config instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Config instance
             */
            public static create(properties?: getStatus.GetStatusResponse.IConfig): getStatus.GetStatusResponse.Config;

            /**
             * Encodes the specified Config message. Does not implicitly {@link getStatus.GetStatusResponse.Config.verify|verify} messages.
             * @param message Config message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: getStatus.GetStatusResponse.IConfig, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Config message, length delimited. Does not implicitly {@link getStatus.GetStatusResponse.Config.verify|verify} messages.
             * @param message Config message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: getStatus.GetStatusResponse.IConfig, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Config message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Config
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): getStatus.GetStatusResponse.Config;

            /**
             * Decodes a Config message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Config
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): getStatus.GetStatusResponse.Config;

            /**
             * Verifies a Config message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Config message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Config
             */
            public static fromObject(object: { [k: string]: any }): getStatus.GetStatusResponse.Config;

            /**
             * Creates a plain object from a Config message. Also converts values to other types if specified.
             * @param message Config
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: getStatus.GetStatusResponse.Config, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Config to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Config
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        namespace Config {

            /** Properties of a Network. */
            interface INetwork {

                /** Network name */
                name?: (string|null);

                /** Network nethash */
                nethash?: (string|null);

                /** Network explorer */
                explorer?: (string|null);

                /** Network token */
                token?: (getStatus.GetStatusResponse.Config.Network.IToken|null);

                /** Network version */
                version?: (number|null);
            }

            /** Represents a Network. */
            class Network implements INetwork {

                /**
                 * Constructs a new Network.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: getStatus.GetStatusResponse.Config.INetwork);

                /** Network name. */
                public name: string;

                /** Network nethash. */
                public nethash: string;

                /** Network explorer. */
                public explorer: string;

                /** Network token. */
                public token?: (getStatus.GetStatusResponse.Config.Network.IToken|null);

                /** Network version. */
                public version: number;

                /**
                 * Creates a new Network instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns Network instance
                 */
                public static create(properties?: getStatus.GetStatusResponse.Config.INetwork): getStatus.GetStatusResponse.Config.Network;

                /**
                 * Encodes the specified Network message. Does not implicitly {@link getStatus.GetStatusResponse.Config.Network.verify|verify} messages.
                 * @param message Network message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: getStatus.GetStatusResponse.Config.INetwork, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified Network message, length delimited. Does not implicitly {@link getStatus.GetStatusResponse.Config.Network.verify|verify} messages.
                 * @param message Network message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: getStatus.GetStatusResponse.Config.INetwork, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a Network message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns Network
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): getStatus.GetStatusResponse.Config.Network;

                /**
                 * Decodes a Network message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns Network
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): getStatus.GetStatusResponse.Config.Network;

                /**
                 * Verifies a Network message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a Network message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns Network
                 */
                public static fromObject(object: { [k: string]: any }): getStatus.GetStatusResponse.Config.Network;

                /**
                 * Creates a plain object from a Network message. Also converts values to other types if specified.
                 * @param message Network
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: getStatus.GetStatusResponse.Config.Network, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Network to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for Network
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            namespace Network {

                /** Properties of a Token. */
                interface IToken {

                    /** Token name */
                    name?: (string|null);

                    /** Token symbol */
                    symbol?: (string|null);
                }

                /** Represents a Token. */
                class Token implements IToken {

                    /**
                     * Constructs a new Token.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: getStatus.GetStatusResponse.Config.Network.IToken);

                    /** Token name. */
                    public name: string;

                    /** Token symbol. */
                    public symbol: string;

                    /**
                     * Creates a new Token instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns Token instance
                     */
                    public static create(properties?: getStatus.GetStatusResponse.Config.Network.IToken): getStatus.GetStatusResponse.Config.Network.Token;

                    /**
                     * Encodes the specified Token message. Does not implicitly {@link getStatus.GetStatusResponse.Config.Network.Token.verify|verify} messages.
                     * @param message Token message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: getStatus.GetStatusResponse.Config.Network.IToken, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified Token message, length delimited. Does not implicitly {@link getStatus.GetStatusResponse.Config.Network.Token.verify|verify} messages.
                     * @param message Token message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: getStatus.GetStatusResponse.Config.Network.IToken, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a Token message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns Token
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): getStatus.GetStatusResponse.Config.Network.Token;

                    /**
                     * Decodes a Token message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns Token
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): getStatus.GetStatusResponse.Config.Network.Token;

                    /**
                     * Verifies a Token message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a Token message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns Token
                     */
                    public static fromObject(object: { [k: string]: any }): getStatus.GetStatusResponse.Config.Network.Token;

                    /**
                     * Creates a plain object from a Token message. Also converts values to other types if specified.
                     * @param message Token
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: getStatus.GetStatusResponse.Config.Network.Token, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this Token to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for Token
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }
            }

            /** Properties of a Plugin. */
            interface IPlugin {

                /** Plugin port */
                port?: (number|null);

                /** Plugin enabled */
                enabled?: (boolean|null);

                /** Plugin estimateTotalCount */
                estimateTotalCount?: (boolean|null);
            }

            /** Represents a Plugin. */
            class Plugin implements IPlugin {

                /**
                 * Constructs a new Plugin.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: getStatus.GetStatusResponse.Config.IPlugin);

                /** Plugin port. */
                public port: number;

                /** Plugin enabled. */
                public enabled: boolean;

                /** Plugin estimateTotalCount. */
                public estimateTotalCount: boolean;

                /**
                 * Creates a new Plugin instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns Plugin instance
                 */
                public static create(properties?: getStatus.GetStatusResponse.Config.IPlugin): getStatus.GetStatusResponse.Config.Plugin;

                /**
                 * Encodes the specified Plugin message. Does not implicitly {@link getStatus.GetStatusResponse.Config.Plugin.verify|verify} messages.
                 * @param message Plugin message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: getStatus.GetStatusResponse.Config.IPlugin, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified Plugin message, length delimited. Does not implicitly {@link getStatus.GetStatusResponse.Config.Plugin.verify|verify} messages.
                 * @param message Plugin message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: getStatus.GetStatusResponse.Config.IPlugin, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a Plugin message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns Plugin
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): getStatus.GetStatusResponse.Config.Plugin;

                /**
                 * Decodes a Plugin message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns Plugin
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): getStatus.GetStatusResponse.Config.Plugin;

                /**
                 * Verifies a Plugin message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a Plugin message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns Plugin
                 */
                public static fromObject(object: { [k: string]: any }): getStatus.GetStatusResponse.Config.Plugin;

                /**
                 * Creates a plain object from a Plugin message. Also converts values to other types if specified.
                 * @param message Plugin
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: getStatus.GetStatusResponse.Config.Plugin, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Plugin to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for Plugin
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }
        }
    }
}

/** Namespace postBlock. */
export namespace postBlock {

    /** Properties of a PostBlockRequest. */
    interface IPostBlockRequest {

        /** PostBlockRequest block */
        block?: (Uint8Array|null);

        /** PostBlockRequest headers */
        headers?: (shared.IHeaders|null);
    }

    /** Represents a PostBlockRequest. */
    class PostBlockRequest implements IPostBlockRequest {

        /**
         * Constructs a new PostBlockRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: postBlock.IPostBlockRequest);

        /** PostBlockRequest block. */
        public block: Uint8Array;

        /** PostBlockRequest headers. */
        public headers?: (shared.IHeaders|null);

        /**
         * Creates a new PostBlockRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns PostBlockRequest instance
         */
        public static create(properties?: postBlock.IPostBlockRequest): postBlock.PostBlockRequest;

        /**
         * Encodes the specified PostBlockRequest message. Does not implicitly {@link postBlock.PostBlockRequest.verify|verify} messages.
         * @param message PostBlockRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: postBlock.IPostBlockRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified PostBlockRequest message, length delimited. Does not implicitly {@link postBlock.PostBlockRequest.verify|verify} messages.
         * @param message PostBlockRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: postBlock.IPostBlockRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a PostBlockRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns PostBlockRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): postBlock.PostBlockRequest;

        /**
         * Decodes a PostBlockRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns PostBlockRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): postBlock.PostBlockRequest;

        /**
         * Verifies a PostBlockRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a PostBlockRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns PostBlockRequest
         */
        public static fromObject(object: { [k: string]: any }): postBlock.PostBlockRequest;

        /**
         * Creates a plain object from a PostBlockRequest message. Also converts values to other types if specified.
         * @param message PostBlockRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: postBlock.PostBlockRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this PostBlockRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for PostBlockRequest
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a PostBlockResponse. */
    interface IPostBlockResponse {

        /** PostBlockResponse status */
        status?: (boolean|null);

        /** PostBlockResponse height */
        height?: (number|null);
    }

    /** Represents a PostBlockResponse. */
    class PostBlockResponse implements IPostBlockResponse {

        /**
         * Constructs a new PostBlockResponse.
         * @param [properties] Properties to set
         */
        constructor(properties?: postBlock.IPostBlockResponse);

        /** PostBlockResponse status. */
        public status: boolean;

        /** PostBlockResponse height. */
        public height: number;

        /**
         * Creates a new PostBlockResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns PostBlockResponse instance
         */
        public static create(properties?: postBlock.IPostBlockResponse): postBlock.PostBlockResponse;

        /**
         * Encodes the specified PostBlockResponse message. Does not implicitly {@link postBlock.PostBlockResponse.verify|verify} messages.
         * @param message PostBlockResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: postBlock.IPostBlockResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified PostBlockResponse message, length delimited. Does not implicitly {@link postBlock.PostBlockResponse.verify|verify} messages.
         * @param message PostBlockResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: postBlock.IPostBlockResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a PostBlockResponse message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns PostBlockResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): postBlock.PostBlockResponse;

        /**
         * Decodes a PostBlockResponse message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns PostBlockResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): postBlock.PostBlockResponse;

        /**
         * Verifies a PostBlockResponse message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a PostBlockResponse message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns PostBlockResponse
         */
        public static fromObject(object: { [k: string]: any }): postBlock.PostBlockResponse;

        /**
         * Creates a plain object from a PostBlockResponse message. Also converts values to other types if specified.
         * @param message PostBlockResponse
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: postBlock.PostBlockResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this PostBlockResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for PostBlockResponse
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }
}

/** Namespace postPrecommit. */
export namespace postPrecommit {

    /** Properties of a PostPrecommitRequest. */
    interface IPostPrecommitRequest {

        /** PostPrecommitRequest precommit */
        precommit?: (Uint8Array|null);

        /** PostPrecommitRequest headers */
        headers?: (shared.IHeaders|null);
    }

    /** Represents a PostPrecommitRequest. */
    class PostPrecommitRequest implements IPostPrecommitRequest {

        /**
         * Constructs a new PostPrecommitRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: postPrecommit.IPostPrecommitRequest);

        /** PostPrecommitRequest precommit. */
        public precommit: Uint8Array;

        /** PostPrecommitRequest headers. */
        public headers?: (shared.IHeaders|null);

        /**
         * Creates a new PostPrecommitRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns PostPrecommitRequest instance
         */
        public static create(properties?: postPrecommit.IPostPrecommitRequest): postPrecommit.PostPrecommitRequest;

        /**
         * Encodes the specified PostPrecommitRequest message. Does not implicitly {@link postPrecommit.PostPrecommitRequest.verify|verify} messages.
         * @param message PostPrecommitRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: postPrecommit.IPostPrecommitRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified PostPrecommitRequest message, length delimited. Does not implicitly {@link postPrecommit.PostPrecommitRequest.verify|verify} messages.
         * @param message PostPrecommitRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: postPrecommit.IPostPrecommitRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a PostPrecommitRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns PostPrecommitRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): postPrecommit.PostPrecommitRequest;

        /**
         * Decodes a PostPrecommitRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns PostPrecommitRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): postPrecommit.PostPrecommitRequest;

        /**
         * Verifies a PostPrecommitRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a PostPrecommitRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns PostPrecommitRequest
         */
        public static fromObject(object: { [k: string]: any }): postPrecommit.PostPrecommitRequest;

        /**
         * Creates a plain object from a PostPrecommitRequest message. Also converts values to other types if specified.
         * @param message PostPrecommitRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: postPrecommit.PostPrecommitRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this PostPrecommitRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for PostPrecommitRequest
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a PostPrecommitResponse. */
    interface IPostPrecommitResponse {
    }

    /** Represents a PostPrecommitResponse. */
    class PostPrecommitResponse implements IPostPrecommitResponse {

        /**
         * Constructs a new PostPrecommitResponse.
         * @param [properties] Properties to set
         */
        constructor(properties?: postPrecommit.IPostPrecommitResponse);

        /**
         * Creates a new PostPrecommitResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns PostPrecommitResponse instance
         */
        public static create(properties?: postPrecommit.IPostPrecommitResponse): postPrecommit.PostPrecommitResponse;

        /**
         * Encodes the specified PostPrecommitResponse message. Does not implicitly {@link postPrecommit.PostPrecommitResponse.verify|verify} messages.
         * @param message PostPrecommitResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: postPrecommit.IPostPrecommitResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified PostPrecommitResponse message, length delimited. Does not implicitly {@link postPrecommit.PostPrecommitResponse.verify|verify} messages.
         * @param message PostPrecommitResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: postPrecommit.IPostPrecommitResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a PostPrecommitResponse message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns PostPrecommitResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): postPrecommit.PostPrecommitResponse;

        /**
         * Decodes a PostPrecommitResponse message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns PostPrecommitResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): postPrecommit.PostPrecommitResponse;

        /**
         * Verifies a PostPrecommitResponse message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a PostPrecommitResponse message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns PostPrecommitResponse
         */
        public static fromObject(object: { [k: string]: any }): postPrecommit.PostPrecommitResponse;

        /**
         * Creates a plain object from a PostPrecommitResponse message. Also converts values to other types if specified.
         * @param message PostPrecommitResponse
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: postPrecommit.PostPrecommitResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this PostPrecommitResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for PostPrecommitResponse
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }
}

/** Namespace postPrevote. */
export namespace postPrevote {

    /** Properties of a PostPrevoteRequest. */
    interface IPostPrevoteRequest {

        /** PostPrevoteRequest prevote */
        prevote?: (Uint8Array|null);

        /** PostPrevoteRequest headers */
        headers?: (shared.IHeaders|null);
    }

    /** Represents a PostPrevoteRequest. */
    class PostPrevoteRequest implements IPostPrevoteRequest {

        /**
         * Constructs a new PostPrevoteRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: postPrevote.IPostPrevoteRequest);

        /** PostPrevoteRequest prevote. */
        public prevote: Uint8Array;

        /** PostPrevoteRequest headers. */
        public headers?: (shared.IHeaders|null);

        /**
         * Creates a new PostPrevoteRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns PostPrevoteRequest instance
         */
        public static create(properties?: postPrevote.IPostPrevoteRequest): postPrevote.PostPrevoteRequest;

        /**
         * Encodes the specified PostPrevoteRequest message. Does not implicitly {@link postPrevote.PostPrevoteRequest.verify|verify} messages.
         * @param message PostPrevoteRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: postPrevote.IPostPrevoteRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified PostPrevoteRequest message, length delimited. Does not implicitly {@link postPrevote.PostPrevoteRequest.verify|verify} messages.
         * @param message PostPrevoteRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: postPrevote.IPostPrevoteRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a PostPrevoteRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns PostPrevoteRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): postPrevote.PostPrevoteRequest;

        /**
         * Decodes a PostPrevoteRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns PostPrevoteRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): postPrevote.PostPrevoteRequest;

        /**
         * Verifies a PostPrevoteRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a PostPrevoteRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns PostPrevoteRequest
         */
        public static fromObject(object: { [k: string]: any }): postPrevote.PostPrevoteRequest;

        /**
         * Creates a plain object from a PostPrevoteRequest message. Also converts values to other types if specified.
         * @param message PostPrevoteRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: postPrevote.PostPrevoteRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this PostPrevoteRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for PostPrevoteRequest
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a PostPrevoteResponse. */
    interface IPostPrevoteResponse {
    }

    /** Represents a PostPrevoteResponse. */
    class PostPrevoteResponse implements IPostPrevoteResponse {

        /**
         * Constructs a new PostPrevoteResponse.
         * @param [properties] Properties to set
         */
        constructor(properties?: postPrevote.IPostPrevoteResponse);

        /**
         * Creates a new PostPrevoteResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns PostPrevoteResponse instance
         */
        public static create(properties?: postPrevote.IPostPrevoteResponse): postPrevote.PostPrevoteResponse;

        /**
         * Encodes the specified PostPrevoteResponse message. Does not implicitly {@link postPrevote.PostPrevoteResponse.verify|verify} messages.
         * @param message PostPrevoteResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: postPrevote.IPostPrevoteResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified PostPrevoteResponse message, length delimited. Does not implicitly {@link postPrevote.PostPrevoteResponse.verify|verify} messages.
         * @param message PostPrevoteResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: postPrevote.IPostPrevoteResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a PostPrevoteResponse message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns PostPrevoteResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): postPrevote.PostPrevoteResponse;

        /**
         * Decodes a PostPrevoteResponse message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns PostPrevoteResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): postPrevote.PostPrevoteResponse;

        /**
         * Verifies a PostPrevoteResponse message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a PostPrevoteResponse message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns PostPrevoteResponse
         */
        public static fromObject(object: { [k: string]: any }): postPrevote.PostPrevoteResponse;

        /**
         * Creates a plain object from a PostPrevoteResponse message. Also converts values to other types if specified.
         * @param message PostPrevoteResponse
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: postPrevote.PostPrevoteResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this PostPrevoteResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for PostPrevoteResponse
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }
}

/** Namespace postProposal. */
export namespace postProposal {

    /** Properties of a PostProposalRequest. */
    interface IPostProposalRequest {

        /** PostProposalRequest proposal */
        proposal?: (Uint8Array|null);

        /** PostProposalRequest headers */
        headers?: (shared.IHeaders|null);
    }

    /** Represents a PostProposalRequest. */
    class PostProposalRequest implements IPostProposalRequest {

        /**
         * Constructs a new PostProposalRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: postProposal.IPostProposalRequest);

        /** PostProposalRequest proposal. */
        public proposal: Uint8Array;

        /** PostProposalRequest headers. */
        public headers?: (shared.IHeaders|null);

        /**
         * Creates a new PostProposalRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns PostProposalRequest instance
         */
        public static create(properties?: postProposal.IPostProposalRequest): postProposal.PostProposalRequest;

        /**
         * Encodes the specified PostProposalRequest message. Does not implicitly {@link postProposal.PostProposalRequest.verify|verify} messages.
         * @param message PostProposalRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: postProposal.IPostProposalRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified PostProposalRequest message, length delimited. Does not implicitly {@link postProposal.PostProposalRequest.verify|verify} messages.
         * @param message PostProposalRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: postProposal.IPostProposalRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a PostProposalRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns PostProposalRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): postProposal.PostProposalRequest;

        /**
         * Decodes a PostProposalRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns PostProposalRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): postProposal.PostProposalRequest;

        /**
         * Verifies a PostProposalRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a PostProposalRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns PostProposalRequest
         */
        public static fromObject(object: { [k: string]: any }): postProposal.PostProposalRequest;

        /**
         * Creates a plain object from a PostProposalRequest message. Also converts values to other types if specified.
         * @param message PostProposalRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: postProposal.PostProposalRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this PostProposalRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for PostProposalRequest
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a PostProposalResponse. */
    interface IPostProposalResponse {
    }

    /** Represents a PostProposalResponse. */
    class PostProposalResponse implements IPostProposalResponse {

        /**
         * Constructs a new PostProposalResponse.
         * @param [properties] Properties to set
         */
        constructor(properties?: postProposal.IPostProposalResponse);

        /**
         * Creates a new PostProposalResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns PostProposalResponse instance
         */
        public static create(properties?: postProposal.IPostProposalResponse): postProposal.PostProposalResponse;

        /**
         * Encodes the specified PostProposalResponse message. Does not implicitly {@link postProposal.PostProposalResponse.verify|verify} messages.
         * @param message PostProposalResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: postProposal.IPostProposalResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified PostProposalResponse message, length delimited. Does not implicitly {@link postProposal.PostProposalResponse.verify|verify} messages.
         * @param message PostProposalResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: postProposal.IPostProposalResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a PostProposalResponse message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns PostProposalResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): postProposal.PostProposalResponse;

        /**
         * Decodes a PostProposalResponse message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns PostProposalResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): postProposal.PostProposalResponse;

        /**
         * Verifies a PostProposalResponse message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a PostProposalResponse message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns PostProposalResponse
         */
        public static fromObject(object: { [k: string]: any }): postProposal.PostProposalResponse;

        /**
         * Creates a plain object from a PostProposalResponse message. Also converts values to other types if specified.
         * @param message PostProposalResponse
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: postProposal.PostProposalResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this PostProposalResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for PostProposalResponse
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }
}

/** Namespace postTransactions. */
export namespace postTransactions {

    /** Properties of a PostTransactionsRequest. */
    interface IPostTransactionsRequest {

        /** PostTransactionsRequest transactions */
        transactions?: (Uint8Array|null);

        /** PostTransactionsRequest headers */
        headers?: (shared.IHeaders|null);
    }

    /** Represents a PostTransactionsRequest. */
    class PostTransactionsRequest implements IPostTransactionsRequest {

        /**
         * Constructs a new PostTransactionsRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: postTransactions.IPostTransactionsRequest);

        /** PostTransactionsRequest transactions. */
        public transactions: Uint8Array;

        /** PostTransactionsRequest headers. */
        public headers?: (shared.IHeaders|null);

        /**
         * Creates a new PostTransactionsRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns PostTransactionsRequest instance
         */
        public static create(properties?: postTransactions.IPostTransactionsRequest): postTransactions.PostTransactionsRequest;

        /**
         * Encodes the specified PostTransactionsRequest message. Does not implicitly {@link postTransactions.PostTransactionsRequest.verify|verify} messages.
         * @param message PostTransactionsRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: postTransactions.IPostTransactionsRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified PostTransactionsRequest message, length delimited. Does not implicitly {@link postTransactions.PostTransactionsRequest.verify|verify} messages.
         * @param message PostTransactionsRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: postTransactions.IPostTransactionsRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a PostTransactionsRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns PostTransactionsRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): postTransactions.PostTransactionsRequest;

        /**
         * Decodes a PostTransactionsRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns PostTransactionsRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): postTransactions.PostTransactionsRequest;

        /**
         * Verifies a PostTransactionsRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a PostTransactionsRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns PostTransactionsRequest
         */
        public static fromObject(object: { [k: string]: any }): postTransactions.PostTransactionsRequest;

        /**
         * Creates a plain object from a PostTransactionsRequest message. Also converts values to other types if specified.
         * @param message PostTransactionsRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: postTransactions.PostTransactionsRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this PostTransactionsRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for PostTransactionsRequest
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a PostTransactionsResponse. */
    interface IPostTransactionsResponse {

        /** PostTransactionsResponse accept */
        accept?: (string[]|null);
    }

    /** Represents a PostTransactionsResponse. */
    class PostTransactionsResponse implements IPostTransactionsResponse {

        /**
         * Constructs a new PostTransactionsResponse.
         * @param [properties] Properties to set
         */
        constructor(properties?: postTransactions.IPostTransactionsResponse);

        /** PostTransactionsResponse accept. */
        public accept: string[];

        /**
         * Creates a new PostTransactionsResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns PostTransactionsResponse instance
         */
        public static create(properties?: postTransactions.IPostTransactionsResponse): postTransactions.PostTransactionsResponse;

        /**
         * Encodes the specified PostTransactionsResponse message. Does not implicitly {@link postTransactions.PostTransactionsResponse.verify|verify} messages.
         * @param message PostTransactionsResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: postTransactions.IPostTransactionsResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified PostTransactionsResponse message, length delimited. Does not implicitly {@link postTransactions.PostTransactionsResponse.verify|verify} messages.
         * @param message PostTransactionsResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: postTransactions.IPostTransactionsResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a PostTransactionsResponse message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns PostTransactionsResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): postTransactions.PostTransactionsResponse;

        /**
         * Decodes a PostTransactionsResponse message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns PostTransactionsResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): postTransactions.PostTransactionsResponse;

        /**
         * Verifies a PostTransactionsResponse message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a PostTransactionsResponse message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns PostTransactionsResponse
         */
        public static fromObject(object: { [k: string]: any }): postTransactions.PostTransactionsResponse;

        /**
         * Creates a plain object from a PostTransactionsResponse message. Also converts values to other types if specified.
         * @param message PostTransactionsResponse
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: postTransactions.PostTransactionsResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this PostTransactionsResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for PostTransactionsResponse
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }
}

/** Namespace shared. */
export namespace shared {

    /** Properties of a Headers. */
    interface IHeaders {

        /** Headers version */
        version?: (string|null);

        /** Headers height */
        height?: (number|null);

        /** Headers round */
        round?: (number|null);

        /** Headers step */
        step?: (number|null);

        /** Headers validatorsSignedPrevote */
        validatorsSignedPrevote?: (boolean[]|null);

        /** Headers validatorsSignedPrecommit */
        validatorsSignedPrecommit?: (boolean[]|null);
    }

    /** Represents a Headers. */
    class Headers implements IHeaders {

        /**
         * Constructs a new Headers.
         * @param [properties] Properties to set
         */
        constructor(properties?: shared.IHeaders);

        /** Headers version. */
        public version: string;

        /** Headers height. */
        public height: number;

        /** Headers round. */
        public round: number;

        /** Headers step. */
        public step: number;

        /** Headers validatorsSignedPrevote. */
        public validatorsSignedPrevote: boolean[];

        /** Headers validatorsSignedPrecommit. */
        public validatorsSignedPrecommit: boolean[];

        /**
         * Creates a new Headers instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Headers instance
         */
        public static create(properties?: shared.IHeaders): shared.Headers;

        /**
         * Encodes the specified Headers message. Does not implicitly {@link shared.Headers.verify|verify} messages.
         * @param message Headers message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: shared.IHeaders, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Headers message, length delimited. Does not implicitly {@link shared.Headers.verify|verify} messages.
         * @param message Headers message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: shared.IHeaders, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Headers message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Headers
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): shared.Headers;

        /**
         * Decodes a Headers message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Headers
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): shared.Headers;

        /**
         * Verifies a Headers message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Headers message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Headers
         */
        public static fromObject(object: { [k: string]: any }): shared.Headers;

        /**
         * Creates a plain object from a Headers message. Also converts values to other types if specified.
         * @param message Headers
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: shared.Headers, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Headers to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Headers
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }
}
