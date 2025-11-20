import * as $protobuf from "protobufjs";
import Long = require("long");
/** Namespace types. */
export namespace types {

    /** Properties of a Transaction. */
    interface ITransaction {

        /** Transaction messageType */
        messageType?: (string|null);

        /** Transaction msg */
        msg?: (google.protobuf.IAny|null);

        /** Transaction signature */
        signature?: (types.ISignature|null);

        /** Transaction createdHeight */
        createdHeight?: (number|Long|null);

        /** Transaction time */
        time?: (number|Long|null);

        /** Transaction fee */
        fee?: (number|Long|null);

        /** Transaction memo */
        memo?: (string|null);

        /** Transaction networkId */
        networkId?: (number|Long|null);

        /** Transaction chainId */
        chainId?: (number|Long|null);
    }

    /** Represents a Transaction. */
    class Transaction implements ITransaction {

        /**
         * Constructs a new Transaction.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.ITransaction);

        /** Transaction messageType. */
        public messageType: string;

        /** Transaction msg. */
        public msg?: (google.protobuf.IAny|null);

        /** Transaction signature. */
        public signature?: (types.ISignature|null);

        /** Transaction createdHeight. */
        public createdHeight: (number|Long);

        /** Transaction time. */
        public time: (number|Long);

        /** Transaction fee. */
        public fee: (number|Long);

        /** Transaction memo. */
        public memo: string;

        /** Transaction networkId. */
        public networkId: (number|Long);

        /** Transaction chainId. */
        public chainId: (number|Long);

        /**
         * Creates a new Transaction instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Transaction instance
         */
        public static create(properties?: types.ITransaction): types.Transaction;

        /**
         * Encodes the specified Transaction message. Does not implicitly {@link types.Transaction.verify|verify} messages.
         * @param message Transaction message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: types.ITransaction, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Transaction message, length delimited. Does not implicitly {@link types.Transaction.verify|verify} messages.
         * @param message Transaction message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: types.ITransaction, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Transaction message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Transaction
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.Transaction;

        /**
         * Decodes a Transaction message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Transaction
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.Transaction;

        /**
         * Verifies a Transaction message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Transaction message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Transaction
         */
        public static fromObject(object: { [k: string]: any }): types.Transaction;

        /**
         * Creates a plain object from a Transaction message. Also converts values to other types if specified.
         * @param message Transaction
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: types.Transaction, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Transaction to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Transaction
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a Signature. */
    interface ISignature {

        /** Signature publicKey */
        publicKey?: (Uint8Array|null);

        /** Signature signature */
        signature?: (Uint8Array|null);
    }

    /** Represents a Signature. */
    class Signature implements ISignature {

        /**
         * Constructs a new Signature.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.ISignature);

        /** Signature publicKey. */
        public publicKey: Uint8Array;

        /** Signature signature. */
        public signature: Uint8Array;

        /**
         * Creates a new Signature instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Signature instance
         */
        public static create(properties?: types.ISignature): types.Signature;

        /**
         * Encodes the specified Signature message. Does not implicitly {@link types.Signature.verify|verify} messages.
         * @param message Signature message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: types.ISignature, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Signature message, length delimited. Does not implicitly {@link types.Signature.verify|verify} messages.
         * @param message Signature message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: types.ISignature, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Signature message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Signature
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.Signature;

        /**
         * Decodes a Signature message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Signature
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.Signature;

        /**
         * Verifies a Signature message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Signature message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Signature
         */
        public static fromObject(object: { [k: string]: any }): types.Signature;

        /**
         * Creates a plain object from a Signature message. Also converts values to other types if specified.
         * @param message Signature
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: types.Signature, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Signature to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Signature
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a MessageSend. */
    interface IMessageSend {

        /** MessageSend fromAddress */
        fromAddress?: (Uint8Array|null);

        /** MessageSend toAddress */
        toAddress?: (Uint8Array|null);

        /** MessageSend amount */
        amount?: (number|Long|null);
    }

    /** Represents a MessageSend. */
    class MessageSend implements IMessageSend {

        /**
         * Constructs a new MessageSend.
         * @param [properties] Properties to set
         */
        constructor(properties?: types.IMessageSend);

        /** MessageSend fromAddress. */
        public fromAddress: Uint8Array;

        /** MessageSend toAddress. */
        public toAddress: Uint8Array;

        /** MessageSend amount. */
        public amount: (number|Long);

        /**
         * Creates a new MessageSend instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MessageSend instance
         */
        public static create(properties?: types.IMessageSend): types.MessageSend;

        /**
         * Encodes the specified MessageSend message. Does not implicitly {@link types.MessageSend.verify|verify} messages.
         * @param message MessageSend message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: types.IMessageSend, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified MessageSend message, length delimited. Does not implicitly {@link types.MessageSend.verify|verify} messages.
         * @param message MessageSend message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: types.IMessageSend, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a MessageSend message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns MessageSend
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.MessageSend;

        /**
         * Decodes a MessageSend message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns MessageSend
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.MessageSend;

        /**
         * Verifies a MessageSend message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a MessageSend message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns MessageSend
         */
        public static fromObject(object: { [k: string]: any }): types.MessageSend;

        /**
         * Creates a plain object from a MessageSend message. Also converts values to other types if specified.
         * @param message MessageSend
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: types.MessageSend, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this MessageSend to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for MessageSend
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }
}

/** Namespace google. */
export namespace google {

    /** Namespace protobuf. */
    namespace protobuf {

        /** Properties of an Any. */
        interface IAny {

            /** Any type_url */
            type_url?: (string|null);

            /** Any value */
            value?: (Uint8Array|null);
        }

        /** Represents an Any. */
        class Any implements IAny {

            /**
             * Constructs a new Any.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IAny);

            /** Any type_url. */
            public type_url: string;

            /** Any value. */
            public value: Uint8Array;

            /**
             * Creates a new Any instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Any instance
             */
            public static create(properties?: google.protobuf.IAny): google.protobuf.Any;

            /**
             * Encodes the specified Any message. Does not implicitly {@link google.protobuf.Any.verify|verify} messages.
             * @param message Any message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IAny, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Any message, length delimited. Does not implicitly {@link google.protobuf.Any.verify|verify} messages.
             * @param message Any message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IAny, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an Any message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Any
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.Any;

            /**
             * Decodes an Any message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Any
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.Any;

            /**
             * Verifies an Any message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an Any message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Any
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.Any;

            /**
             * Creates a plain object from an Any message. Also converts values to other types if specified.
             * @param message Any
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.Any, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Any to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Any
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }
}
