/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import * as $protobuf from "protobufjs/minimal";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const types = $root.types = (() => {

    /**
     * Namespace types.
     * @exports types
     * @namespace
     */
    const types = {};

    types.Transaction = (function() {

        /**
         * Properties of a Transaction.
         * @memberof types
         * @interface ITransaction
         * @property {string|null} [messageType] Transaction messageType
         * @property {google.protobuf.IAny|null} [msg] Transaction msg
         * @property {types.ISignature|null} [signature] Transaction signature
         * @property {number|Long|null} [createdHeight] Transaction createdHeight
         * @property {number|Long|null} [time] Transaction time
         * @property {number|Long|null} [fee] Transaction fee
         * @property {string|null} [memo] Transaction memo
         * @property {number|Long|null} [networkId] Transaction networkId
         * @property {number|Long|null} [chainId] Transaction chainId
         */

        /**
         * Constructs a new Transaction.
         * @memberof types
         * @classdesc Represents a Transaction.
         * @implements ITransaction
         * @constructor
         * @param {types.ITransaction=} [properties] Properties to set
         */
        function Transaction(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Transaction messageType.
         * @member {string} messageType
         * @memberof types.Transaction
         * @instance
         */
        Transaction.prototype.messageType = "";

        /**
         * Transaction msg.
         * @member {google.protobuf.IAny|null|undefined} msg
         * @memberof types.Transaction
         * @instance
         */
        Transaction.prototype.msg = null;

        /**
         * Transaction signature.
         * @member {types.ISignature|null|undefined} signature
         * @memberof types.Transaction
         * @instance
         */
        Transaction.prototype.signature = null;

        /**
         * Transaction createdHeight.
         * @member {number|Long} createdHeight
         * @memberof types.Transaction
         * @instance
         */
        Transaction.prototype.createdHeight = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Transaction time.
         * @member {number|Long} time
         * @memberof types.Transaction
         * @instance
         */
        Transaction.prototype.time = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Transaction fee.
         * @member {number|Long} fee
         * @memberof types.Transaction
         * @instance
         */
        Transaction.prototype.fee = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Transaction memo.
         * @member {string} memo
         * @memberof types.Transaction
         * @instance
         */
        Transaction.prototype.memo = "";

        /**
         * Transaction networkId.
         * @member {number|Long} networkId
         * @memberof types.Transaction
         * @instance
         */
        Transaction.prototype.networkId = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Transaction chainId.
         * @member {number|Long} chainId
         * @memberof types.Transaction
         * @instance
         */
        Transaction.prototype.chainId = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Creates a new Transaction instance using the specified properties.
         * @function create
         * @memberof types.Transaction
         * @static
         * @param {types.ITransaction=} [properties] Properties to set
         * @returns {types.Transaction} Transaction instance
         */
        Transaction.create = function create(properties) {
            return new Transaction(properties);
        };

        /**
         * Encodes the specified Transaction message. Does not implicitly {@link types.Transaction.verify|verify} messages.
         * @function encode
         * @memberof types.Transaction
         * @static
         * @param {types.ITransaction} message Transaction message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Transaction.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.messageType != null && Object.hasOwnProperty.call(message, "messageType"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.messageType);
            if (message.msg != null && Object.hasOwnProperty.call(message, "msg"))
                $root.google.protobuf.Any.encode(message.msg, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.signature != null && Object.hasOwnProperty.call(message, "signature"))
                $root.types.Signature.encode(message.signature, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            if (message.createdHeight != null && Object.hasOwnProperty.call(message, "createdHeight"))
                writer.uint32(/* id 4, wireType 0 =*/32).uint64(message.createdHeight);
            if (message.time != null && Object.hasOwnProperty.call(message, "time"))
                writer.uint32(/* id 5, wireType 0 =*/40).uint64(message.time);
            if (message.fee != null && Object.hasOwnProperty.call(message, "fee"))
                writer.uint32(/* id 6, wireType 0 =*/48).uint64(message.fee);
            if (message.memo != null && Object.hasOwnProperty.call(message, "memo"))
                writer.uint32(/* id 7, wireType 2 =*/58).string(message.memo);
            if (message.networkId != null && Object.hasOwnProperty.call(message, "networkId"))
                writer.uint32(/* id 8, wireType 0 =*/64).uint64(message.networkId);
            if (message.chainId != null && Object.hasOwnProperty.call(message, "chainId"))
                writer.uint32(/* id 9, wireType 0 =*/72).uint64(message.chainId);
            return writer;
        };

        /**
         * Encodes the specified Transaction message, length delimited. Does not implicitly {@link types.Transaction.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.Transaction
         * @static
         * @param {types.ITransaction} message Transaction message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Transaction.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Transaction message from the specified reader or buffer.
         * @function decode
         * @memberof types.Transaction
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.Transaction} Transaction
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Transaction.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.Transaction();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.messageType = reader.string();
                        break;
                    }
                case 2: {
                        message.msg = $root.google.protobuf.Any.decode(reader, reader.uint32());
                        break;
                    }
                case 3: {
                        message.signature = $root.types.Signature.decode(reader, reader.uint32());
                        break;
                    }
                case 4: {
                        message.createdHeight = reader.uint64();
                        break;
                    }
                case 5: {
                        message.time = reader.uint64();
                        break;
                    }
                case 6: {
                        message.fee = reader.uint64();
                        break;
                    }
                case 7: {
                        message.memo = reader.string();
                        break;
                    }
                case 8: {
                        message.networkId = reader.uint64();
                        break;
                    }
                case 9: {
                        message.chainId = reader.uint64();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Transaction message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.Transaction
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.Transaction} Transaction
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Transaction.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Transaction message.
         * @function verify
         * @memberof types.Transaction
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Transaction.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.messageType != null && message.hasOwnProperty("messageType"))
                if (!$util.isString(message.messageType))
                    return "messageType: string expected";
            if (message.msg != null && message.hasOwnProperty("msg")) {
                let error = $root.google.protobuf.Any.verify(message.msg);
                if (error)
                    return "msg." + error;
            }
            if (message.signature != null && message.hasOwnProperty("signature")) {
                let error = $root.types.Signature.verify(message.signature);
                if (error)
                    return "signature." + error;
            }
            if (message.createdHeight != null && message.hasOwnProperty("createdHeight"))
                if (!$util.isInteger(message.createdHeight) && !(message.createdHeight && $util.isInteger(message.createdHeight.low) && $util.isInteger(message.createdHeight.high)))
                    return "createdHeight: integer|Long expected";
            if (message.time != null && message.hasOwnProperty("time"))
                if (!$util.isInteger(message.time) && !(message.time && $util.isInteger(message.time.low) && $util.isInteger(message.time.high)))
                    return "time: integer|Long expected";
            if (message.fee != null && message.hasOwnProperty("fee"))
                if (!$util.isInteger(message.fee) && !(message.fee && $util.isInteger(message.fee.low) && $util.isInteger(message.fee.high)))
                    return "fee: integer|Long expected";
            if (message.memo != null && message.hasOwnProperty("memo"))
                if (!$util.isString(message.memo))
                    return "memo: string expected";
            if (message.networkId != null && message.hasOwnProperty("networkId"))
                if (!$util.isInteger(message.networkId) && !(message.networkId && $util.isInteger(message.networkId.low) && $util.isInteger(message.networkId.high)))
                    return "networkId: integer|Long expected";
            if (message.chainId != null && message.hasOwnProperty("chainId"))
                if (!$util.isInteger(message.chainId) && !(message.chainId && $util.isInteger(message.chainId.low) && $util.isInteger(message.chainId.high)))
                    return "chainId: integer|Long expected";
            return null;
        };

        /**
         * Creates a Transaction message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.Transaction
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.Transaction} Transaction
         */
        Transaction.fromObject = function fromObject(object) {
            if (object instanceof $root.types.Transaction)
                return object;
            let message = new $root.types.Transaction();
            if (object.messageType != null)
                message.messageType = String(object.messageType);
            if (object.msg != null) {
                if (typeof object.msg !== "object")
                    throw TypeError(".types.Transaction.msg: object expected");
                message.msg = $root.google.protobuf.Any.fromObject(object.msg);
            }
            if (object.signature != null) {
                if (typeof object.signature !== "object")
                    throw TypeError(".types.Transaction.signature: object expected");
                message.signature = $root.types.Signature.fromObject(object.signature);
            }
            if (object.createdHeight != null)
                if ($util.Long)
                    (message.createdHeight = $util.Long.fromValue(object.createdHeight)).unsigned = true;
                else if (typeof object.createdHeight === "string")
                    message.createdHeight = parseInt(object.createdHeight, 10);
                else if (typeof object.createdHeight === "number")
                    message.createdHeight = object.createdHeight;
                else if (typeof object.createdHeight === "object")
                    message.createdHeight = new $util.LongBits(object.createdHeight.low >>> 0, object.createdHeight.high >>> 0).toNumber(true);
            if (object.time != null)
                if ($util.Long)
                    (message.time = $util.Long.fromValue(object.time)).unsigned = true;
                else if (typeof object.time === "string")
                    message.time = parseInt(object.time, 10);
                else if (typeof object.time === "number")
                    message.time = object.time;
                else if (typeof object.time === "object")
                    message.time = new $util.LongBits(object.time.low >>> 0, object.time.high >>> 0).toNumber(true);
            if (object.fee != null)
                if ($util.Long)
                    (message.fee = $util.Long.fromValue(object.fee)).unsigned = true;
                else if (typeof object.fee === "string")
                    message.fee = parseInt(object.fee, 10);
                else if (typeof object.fee === "number")
                    message.fee = object.fee;
                else if (typeof object.fee === "object")
                    message.fee = new $util.LongBits(object.fee.low >>> 0, object.fee.high >>> 0).toNumber(true);
            if (object.memo != null)
                message.memo = String(object.memo);
            if (object.networkId != null)
                if ($util.Long)
                    (message.networkId = $util.Long.fromValue(object.networkId)).unsigned = true;
                else if (typeof object.networkId === "string")
                    message.networkId = parseInt(object.networkId, 10);
                else if (typeof object.networkId === "number")
                    message.networkId = object.networkId;
                else if (typeof object.networkId === "object")
                    message.networkId = new $util.LongBits(object.networkId.low >>> 0, object.networkId.high >>> 0).toNumber(true);
            if (object.chainId != null)
                if ($util.Long)
                    (message.chainId = $util.Long.fromValue(object.chainId)).unsigned = true;
                else if (typeof object.chainId === "string")
                    message.chainId = parseInt(object.chainId, 10);
                else if (typeof object.chainId === "number")
                    message.chainId = object.chainId;
                else if (typeof object.chainId === "object")
                    message.chainId = new $util.LongBits(object.chainId.low >>> 0, object.chainId.high >>> 0).toNumber(true);
            return message;
        };

        /**
         * Creates a plain object from a Transaction message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.Transaction
         * @static
         * @param {types.Transaction} message Transaction
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Transaction.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.messageType = "";
                object.msg = null;
                object.signature = null;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.createdHeight = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.createdHeight = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.time = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.time = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.fee = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.fee = options.longs === String ? "0" : 0;
                object.memo = "";
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.networkId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.networkId = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.chainId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.chainId = options.longs === String ? "0" : 0;
            }
            if (message.messageType != null && message.hasOwnProperty("messageType"))
                object.messageType = message.messageType;
            if (message.msg != null && message.hasOwnProperty("msg"))
                object.msg = $root.google.protobuf.Any.toObject(message.msg, options);
            if (message.signature != null && message.hasOwnProperty("signature"))
                object.signature = $root.types.Signature.toObject(message.signature, options);
            if (message.createdHeight != null && message.hasOwnProperty("createdHeight"))
                if (typeof message.createdHeight === "number")
                    object.createdHeight = options.longs === String ? String(message.createdHeight) : message.createdHeight;
                else
                    object.createdHeight = options.longs === String ? $util.Long.prototype.toString.call(message.createdHeight) : options.longs === Number ? new $util.LongBits(message.createdHeight.low >>> 0, message.createdHeight.high >>> 0).toNumber(true) : message.createdHeight;
            if (message.time != null && message.hasOwnProperty("time"))
                if (typeof message.time === "number")
                    object.time = options.longs === String ? String(message.time) : message.time;
                else
                    object.time = options.longs === String ? $util.Long.prototype.toString.call(message.time) : options.longs === Number ? new $util.LongBits(message.time.low >>> 0, message.time.high >>> 0).toNumber(true) : message.time;
            if (message.fee != null && message.hasOwnProperty("fee"))
                if (typeof message.fee === "number")
                    object.fee = options.longs === String ? String(message.fee) : message.fee;
                else
                    object.fee = options.longs === String ? $util.Long.prototype.toString.call(message.fee) : options.longs === Number ? new $util.LongBits(message.fee.low >>> 0, message.fee.high >>> 0).toNumber(true) : message.fee;
            if (message.memo != null && message.hasOwnProperty("memo"))
                object.memo = message.memo;
            if (message.networkId != null && message.hasOwnProperty("networkId"))
                if (typeof message.networkId === "number")
                    object.networkId = options.longs === String ? String(message.networkId) : message.networkId;
                else
                    object.networkId = options.longs === String ? $util.Long.prototype.toString.call(message.networkId) : options.longs === Number ? new $util.LongBits(message.networkId.low >>> 0, message.networkId.high >>> 0).toNumber(true) : message.networkId;
            if (message.chainId != null && message.hasOwnProperty("chainId"))
                if (typeof message.chainId === "number")
                    object.chainId = options.longs === String ? String(message.chainId) : message.chainId;
                else
                    object.chainId = options.longs === String ? $util.Long.prototype.toString.call(message.chainId) : options.longs === Number ? new $util.LongBits(message.chainId.low >>> 0, message.chainId.high >>> 0).toNumber(true) : message.chainId;
            return object;
        };

        /**
         * Converts this Transaction to JSON.
         * @function toJSON
         * @memberof types.Transaction
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Transaction.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Transaction
         * @function getTypeUrl
         * @memberof types.Transaction
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Transaction.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.Transaction";
        };

        return Transaction;
    })();

    types.Signature = (function() {

        /**
         * Properties of a Signature.
         * @memberof types
         * @interface ISignature
         * @property {Uint8Array|null} [publicKey] Signature publicKey
         * @property {Uint8Array|null} [signature] Signature signature
         */

        /**
         * Constructs a new Signature.
         * @memberof types
         * @classdesc Represents a Signature.
         * @implements ISignature
         * @constructor
         * @param {types.ISignature=} [properties] Properties to set
         */
        function Signature(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Signature publicKey.
         * @member {Uint8Array} publicKey
         * @memberof types.Signature
         * @instance
         */
        Signature.prototype.publicKey = $util.newBuffer([]);

        /**
         * Signature signature.
         * @member {Uint8Array} signature
         * @memberof types.Signature
         * @instance
         */
        Signature.prototype.signature = $util.newBuffer([]);

        /**
         * Creates a new Signature instance using the specified properties.
         * @function create
         * @memberof types.Signature
         * @static
         * @param {types.ISignature=} [properties] Properties to set
         * @returns {types.Signature} Signature instance
         */
        Signature.create = function create(properties) {
            return new Signature(properties);
        };

        /**
         * Encodes the specified Signature message. Does not implicitly {@link types.Signature.verify|verify} messages.
         * @function encode
         * @memberof types.Signature
         * @static
         * @param {types.ISignature} message Signature message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Signature.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.publicKey != null && Object.hasOwnProperty.call(message, "publicKey"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.publicKey);
            if (message.signature != null && Object.hasOwnProperty.call(message, "signature"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.signature);
            return writer;
        };

        /**
         * Encodes the specified Signature message, length delimited. Does not implicitly {@link types.Signature.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.Signature
         * @static
         * @param {types.ISignature} message Signature message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Signature.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Signature message from the specified reader or buffer.
         * @function decode
         * @memberof types.Signature
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.Signature} Signature
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Signature.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.Signature();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.publicKey = reader.bytes();
                        break;
                    }
                case 2: {
                        message.signature = reader.bytes();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Signature message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.Signature
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.Signature} Signature
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Signature.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Signature message.
         * @function verify
         * @memberof types.Signature
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Signature.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.publicKey != null && message.hasOwnProperty("publicKey"))
                if (!(message.publicKey && typeof message.publicKey.length === "number" || $util.isString(message.publicKey)))
                    return "publicKey: buffer expected";
            if (message.signature != null && message.hasOwnProperty("signature"))
                if (!(message.signature && typeof message.signature.length === "number" || $util.isString(message.signature)))
                    return "signature: buffer expected";
            return null;
        };

        /**
         * Creates a Signature message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.Signature
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.Signature} Signature
         */
        Signature.fromObject = function fromObject(object) {
            if (object instanceof $root.types.Signature)
                return object;
            let message = new $root.types.Signature();
            if (object.publicKey != null)
                if (typeof object.publicKey === "string")
                    $util.base64.decode(object.publicKey, message.publicKey = $util.newBuffer($util.base64.length(object.publicKey)), 0);
                else if (object.publicKey.length >= 0)
                    message.publicKey = object.publicKey;
            if (object.signature != null)
                if (typeof object.signature === "string")
                    $util.base64.decode(object.signature, message.signature = $util.newBuffer($util.base64.length(object.signature)), 0);
                else if (object.signature.length >= 0)
                    message.signature = object.signature;
            return message;
        };

        /**
         * Creates a plain object from a Signature message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.Signature
         * @static
         * @param {types.Signature} message Signature
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Signature.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                if (options.bytes === String)
                    object.publicKey = "";
                else {
                    object.publicKey = [];
                    if (options.bytes !== Array)
                        object.publicKey = $util.newBuffer(object.publicKey);
                }
                if (options.bytes === String)
                    object.signature = "";
                else {
                    object.signature = [];
                    if (options.bytes !== Array)
                        object.signature = $util.newBuffer(object.signature);
                }
            }
            if (message.publicKey != null && message.hasOwnProperty("publicKey"))
                object.publicKey = options.bytes === String ? $util.base64.encode(message.publicKey, 0, message.publicKey.length) : options.bytes === Array ? Array.prototype.slice.call(message.publicKey) : message.publicKey;
            if (message.signature != null && message.hasOwnProperty("signature"))
                object.signature = options.bytes === String ? $util.base64.encode(message.signature, 0, message.signature.length) : options.bytes === Array ? Array.prototype.slice.call(message.signature) : message.signature;
            return object;
        };

        /**
         * Converts this Signature to JSON.
         * @function toJSON
         * @memberof types.Signature
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Signature.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Signature
         * @function getTypeUrl
         * @memberof types.Signature
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Signature.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.Signature";
        };

        return Signature;
    })();

    types.MessageSend = (function() {

        /**
         * Properties of a MessageSend.
         * @memberof types
         * @interface IMessageSend
         * @property {Uint8Array|null} [fromAddress] MessageSend fromAddress
         * @property {Uint8Array|null} [toAddress] MessageSend toAddress
         * @property {number|Long|null} [amount] MessageSend amount
         */

        /**
         * Constructs a new MessageSend.
         * @memberof types
         * @classdesc Represents a MessageSend.
         * @implements IMessageSend
         * @constructor
         * @param {types.IMessageSend=} [properties] Properties to set
         */
        function MessageSend(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * MessageSend fromAddress.
         * @member {Uint8Array} fromAddress
         * @memberof types.MessageSend
         * @instance
         */
        MessageSend.prototype.fromAddress = $util.newBuffer([]);

        /**
         * MessageSend toAddress.
         * @member {Uint8Array} toAddress
         * @memberof types.MessageSend
         * @instance
         */
        MessageSend.prototype.toAddress = $util.newBuffer([]);

        /**
         * MessageSend amount.
         * @member {number|Long} amount
         * @memberof types.MessageSend
         * @instance
         */
        MessageSend.prototype.amount = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Creates a new MessageSend instance using the specified properties.
         * @function create
         * @memberof types.MessageSend
         * @static
         * @param {types.IMessageSend=} [properties] Properties to set
         * @returns {types.MessageSend} MessageSend instance
         */
        MessageSend.create = function create(properties) {
            return new MessageSend(properties);
        };

        /**
         * Encodes the specified MessageSend message. Does not implicitly {@link types.MessageSend.verify|verify} messages.
         * @function encode
         * @memberof types.MessageSend
         * @static
         * @param {types.IMessageSend} message MessageSend message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MessageSend.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.fromAddress != null && Object.hasOwnProperty.call(message, "fromAddress"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.fromAddress);
            if (message.toAddress != null && Object.hasOwnProperty.call(message, "toAddress"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.toAddress);
            if (message.amount != null && Object.hasOwnProperty.call(message, "amount"))
                writer.uint32(/* id 3, wireType 0 =*/24).uint64(message.amount);
            return writer;
        };

        /**
         * Encodes the specified MessageSend message, length delimited. Does not implicitly {@link types.MessageSend.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.MessageSend
         * @static
         * @param {types.IMessageSend} message MessageSend message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MessageSend.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a MessageSend message from the specified reader or buffer.
         * @function decode
         * @memberof types.MessageSend
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.MessageSend} MessageSend
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MessageSend.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.MessageSend();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.fromAddress = reader.bytes();
                        break;
                    }
                case 2: {
                        message.toAddress = reader.bytes();
                        break;
                    }
                case 3: {
                        message.amount = reader.uint64();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a MessageSend message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.MessageSend
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.MessageSend} MessageSend
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MessageSend.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a MessageSend message.
         * @function verify
         * @memberof types.MessageSend
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        MessageSend.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.fromAddress != null && message.hasOwnProperty("fromAddress"))
                if (!(message.fromAddress && typeof message.fromAddress.length === "number" || $util.isString(message.fromAddress)))
                    return "fromAddress: buffer expected";
            if (message.toAddress != null && message.hasOwnProperty("toAddress"))
                if (!(message.toAddress && typeof message.toAddress.length === "number" || $util.isString(message.toAddress)))
                    return "toAddress: buffer expected";
            if (message.amount != null && message.hasOwnProperty("amount"))
                if (!$util.isInteger(message.amount) && !(message.amount && $util.isInteger(message.amount.low) && $util.isInteger(message.amount.high)))
                    return "amount: integer|Long expected";
            return null;
        };

        /**
         * Creates a MessageSend message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.MessageSend
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.MessageSend} MessageSend
         */
        MessageSend.fromObject = function fromObject(object) {
            if (object instanceof $root.types.MessageSend)
                return object;
            let message = new $root.types.MessageSend();
            if (object.fromAddress != null)
                if (typeof object.fromAddress === "string")
                    $util.base64.decode(object.fromAddress, message.fromAddress = $util.newBuffer($util.base64.length(object.fromAddress)), 0);
                else if (object.fromAddress.length >= 0)
                    message.fromAddress = object.fromAddress;
            if (object.toAddress != null)
                if (typeof object.toAddress === "string")
                    $util.base64.decode(object.toAddress, message.toAddress = $util.newBuffer($util.base64.length(object.toAddress)), 0);
                else if (object.toAddress.length >= 0)
                    message.toAddress = object.toAddress;
            if (object.amount != null)
                if ($util.Long)
                    (message.amount = $util.Long.fromValue(object.amount)).unsigned = true;
                else if (typeof object.amount === "string")
                    message.amount = parseInt(object.amount, 10);
                else if (typeof object.amount === "number")
                    message.amount = object.amount;
                else if (typeof object.amount === "object")
                    message.amount = new $util.LongBits(object.amount.low >>> 0, object.amount.high >>> 0).toNumber(true);
            return message;
        };

        /**
         * Creates a plain object from a MessageSend message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.MessageSend
         * @static
         * @param {types.MessageSend} message MessageSend
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        MessageSend.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                if (options.bytes === String)
                    object.fromAddress = "";
                else {
                    object.fromAddress = [];
                    if (options.bytes !== Array)
                        object.fromAddress = $util.newBuffer(object.fromAddress);
                }
                if (options.bytes === String)
                    object.toAddress = "";
                else {
                    object.toAddress = [];
                    if (options.bytes !== Array)
                        object.toAddress = $util.newBuffer(object.toAddress);
                }
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.amount = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.amount = options.longs === String ? "0" : 0;
            }
            if (message.fromAddress != null && message.hasOwnProperty("fromAddress"))
                object.fromAddress = options.bytes === String ? $util.base64.encode(message.fromAddress, 0, message.fromAddress.length) : options.bytes === Array ? Array.prototype.slice.call(message.fromAddress) : message.fromAddress;
            if (message.toAddress != null && message.hasOwnProperty("toAddress"))
                object.toAddress = options.bytes === String ? $util.base64.encode(message.toAddress, 0, message.toAddress.length) : options.bytes === Array ? Array.prototype.slice.call(message.toAddress) : message.toAddress;
            if (message.amount != null && message.hasOwnProperty("amount"))
                if (typeof message.amount === "number")
                    object.amount = options.longs === String ? String(message.amount) : message.amount;
                else
                    object.amount = options.longs === String ? $util.Long.prototype.toString.call(message.amount) : options.longs === Number ? new $util.LongBits(message.amount.low >>> 0, message.amount.high >>> 0).toNumber(true) : message.amount;
            return object;
        };

        /**
         * Converts this MessageSend to JSON.
         * @function toJSON
         * @memberof types.MessageSend
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        MessageSend.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for MessageSend
         * @function getTypeUrl
         * @memberof types.MessageSend
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        MessageSend.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/types.MessageSend";
        };

        return MessageSend;
    })();

    return types;
})();

export const google = $root.google = (() => {

    /**
     * Namespace google.
     * @exports google
     * @namespace
     */
    const google = {};

    google.protobuf = (function() {

        /**
         * Namespace protobuf.
         * @memberof google
         * @namespace
         */
        const protobuf = {};

        protobuf.Any = (function() {

            /**
             * Properties of an Any.
             * @memberof google.protobuf
             * @interface IAny
             * @property {string|null} [type_url] Any type_url
             * @property {Uint8Array|null} [value] Any value
             */

            /**
             * Constructs a new Any.
             * @memberof google.protobuf
             * @classdesc Represents an Any.
             * @implements IAny
             * @constructor
             * @param {google.protobuf.IAny=} [properties] Properties to set
             */
            function Any(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Any type_url.
             * @member {string} type_url
             * @memberof google.protobuf.Any
             * @instance
             */
            Any.prototype.type_url = "";

            /**
             * Any value.
             * @member {Uint8Array} value
             * @memberof google.protobuf.Any
             * @instance
             */
            Any.prototype.value = $util.newBuffer([]);

            /**
             * Creates a new Any instance using the specified properties.
             * @function create
             * @memberof google.protobuf.Any
             * @static
             * @param {google.protobuf.IAny=} [properties] Properties to set
             * @returns {google.protobuf.Any} Any instance
             */
            Any.create = function create(properties) {
                return new Any(properties);
            };

            /**
             * Encodes the specified Any message. Does not implicitly {@link google.protobuf.Any.verify|verify} messages.
             * @function encode
             * @memberof google.protobuf.Any
             * @static
             * @param {google.protobuf.IAny} message Any message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Any.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.type_url != null && Object.hasOwnProperty.call(message, "type_url"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.type_url);
                if (message.value != null && Object.hasOwnProperty.call(message, "value"))
                    writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.value);
                return writer;
            };

            /**
             * Encodes the specified Any message, length delimited. Does not implicitly {@link google.protobuf.Any.verify|verify} messages.
             * @function encodeDelimited
             * @memberof google.protobuf.Any
             * @static
             * @param {google.protobuf.IAny} message Any message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Any.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an Any message from the specified reader or buffer.
             * @function decode
             * @memberof google.protobuf.Any
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {google.protobuf.Any} Any
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Any.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.google.protobuf.Any();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.type_url = reader.string();
                            break;
                        }
                    case 2: {
                            message.value = reader.bytes();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an Any message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof google.protobuf.Any
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {google.protobuf.Any} Any
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Any.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an Any message.
             * @function verify
             * @memberof google.protobuf.Any
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Any.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.type_url != null && message.hasOwnProperty("type_url"))
                    if (!$util.isString(message.type_url))
                        return "type_url: string expected";
                if (message.value != null && message.hasOwnProperty("value"))
                    if (!(message.value && typeof message.value.length === "number" || $util.isString(message.value)))
                        return "value: buffer expected";
                return null;
            };

            /**
             * Creates an Any message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof google.protobuf.Any
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {google.protobuf.Any} Any
             */
            Any.fromObject = function fromObject(object) {
                if (object instanceof $root.google.protobuf.Any)
                    return object;
                let message = new $root.google.protobuf.Any();
                if (object.type_url != null)
                    message.type_url = String(object.type_url);
                if (object.value != null)
                    if (typeof object.value === "string")
                        $util.base64.decode(object.value, message.value = $util.newBuffer($util.base64.length(object.value)), 0);
                    else if (object.value.length >= 0)
                        message.value = object.value;
                return message;
            };

            /**
             * Creates a plain object from an Any message. Also converts values to other types if specified.
             * @function toObject
             * @memberof google.protobuf.Any
             * @static
             * @param {google.protobuf.Any} message Any
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Any.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    object.type_url = "";
                    if (options.bytes === String)
                        object.value = "";
                    else {
                        object.value = [];
                        if (options.bytes !== Array)
                            object.value = $util.newBuffer(object.value);
                    }
                }
                if (message.type_url != null && message.hasOwnProperty("type_url"))
                    object.type_url = message.type_url;
                if (message.value != null && message.hasOwnProperty("value"))
                    object.value = options.bytes === String ? $util.base64.encode(message.value, 0, message.value.length) : options.bytes === Array ? Array.prototype.slice.call(message.value) : message.value;
                return object;
            };

            /**
             * Converts this Any to JSON.
             * @function toJSON
             * @memberof google.protobuf.Any
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Any.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Any
             * @function getTypeUrl
             * @memberof google.protobuf.Any
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Any.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/google.protobuf.Any";
            };

            return Any;
        })();

        return protobuf;
    })();

    return google;
})();

export { $root as default };
