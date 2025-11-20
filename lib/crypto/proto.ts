/**
 * Protobuf serialization module for Canopy transactions
 *
 * This module handles the protobuf encoding/decoding of transactions
 * to match the exact byte format expected by the Canopy blockchain.
 */

import { types } from './proto-compiled';
import { Transaction } from './transaction';

/**
 * Serializes a transaction message to protobuf format
 * This must match exactly how Canopy's GetSignBytes() works
 */
export function getProtoSignBytes(tx: Transaction): Uint8Array {
    // Serialize the message payload first
    let msgPayload: Uint8Array;
    switch (tx.messageType) {
        case 'send':
            const sendMsg = types.MessageSend.create({
                fromAddress: tx.msg.fromAddress,
                to_address: tx.msg.toAddress,
                amount: Number(tx.msg.amount)
            });
            msgPayload = types.MessageSend.encode(sendMsg).finish();
            break;
        default:
            throw new Error(`Unsupported message type: ${tx.messageType}`);
    }

    // Create the unsigned transaction (without signature)
    // This matches Canopy's GetSignBytes() which creates a Transaction with signature = nil
    const unsignedTx = types.Transaction.create({
        messageType: tx.messageType,
        msg: {
            type_url: `type.googleapis.com/types.MessageSend`,
            value: msgPayload
        },
        signature: null,
        createdHeight: Number(tx.createdHeight),
        time: Number(tx.time),
        fee: Number(tx.fee),
        memo: tx.memo,
        networkId: Number(tx.networkId),
        chainId: Number(tx.chainId)
    });

    // Encode to protobuf bytes
    const buffer = types.Transaction.encode(unsignedTx).finish();

    return new Uint8Array(buffer);
}

/**
 * Serializes a complete signed transaction to protobuf for JSON transmission
 */
export function serializeTransactionToProto(tx: Transaction): any {
    // Serialize the message payload
    let msgPayload: Uint8Array;
    switch (tx.messageType) {
        case 'send':
            const sendMsg = types.MessageSend.create({
                fromAddress: tx.msg.fromAddress,
                toAddress: tx.msg.toAddress,
                amount: Number(tx.msg.amount)
            });
            msgPayload = types.MessageSend.encode(sendMsg).finish();
            break;
        default:
            throw new Error(`Unsupported message type: ${tx.messageType}`);
    }

    // Create the signature
    const signature = tx.signature ? {
        public_key: tx.signature.publicKey,
        signature: tx.signature.signature
    } : null;

    // Create the complete transaction
    const fullTx = {
        message_type: tx.messageType,
        msg: {
            type_url: `type.googleapis.com/types.MessageSend`,
            value: msgPayload
        },
        signature: signature,
        created_height: Number(tx.createdHeight),
        time: Number(tx.time),
        fee: Number(tx.fee),
        memo: tx.memo,
        network_id: Number(tx.networkId),
        chain_id: Number(tx.chainId)
    };

    return fullTx;
}
