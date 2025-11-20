/**
 * Transaction signing module for Canopy blockchain
 *
 * Provides functionality to create and sign transactions locally.
 * This module DOES NOT make any network calls - it only builds and signs transactions.
 * Submission to the backend/blockchain is handled by the API layer.
 *
 * Transaction flow:
 * 1. Create message payload (Send, Stake, LimitOrder, etc.)
 * 2. Build transaction with metadata (height, fee, chainId, networkId)
 * 3. Sign transaction locally with BLS12-381 private key
 * 4. Convert to send-raw format for backend submission
 */

import { bls12_381 } from '@noble/curves/bls12-381.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils.js';

/**
 * Transaction structure for Canopy blockchain
 */
export interface Transaction {
    messageType: string;      // Type of message (send, stake, createOrder, etc.)
    msg: any;                 // Message payload
    signature?: Signature;    // Digital signature (added during signing)
    time: bigint;             // Microsecond timestamp for hash collision entropy
    createdHeight: bigint;    // Current blockchain height (for replay protection)
    fee: bigint;              // Transaction fee in uCNPY
    memo: string;             // Optional memo (max 200 chars)
    networkId: bigint;        // Network identifier
    chainId: bigint;          // Chain where transaction is submitted
}

/**
 * Signature structure with public key and signature bytes
 */
export interface Signature {
    publicKey: Uint8Array;    // BLS12-381 public key bytes
    signature: Uint8Array;    // BLS12-381 signature bytes
}

/**
 * Send message for transferring tokens
 */
export interface MessageSend {
    fromAddress: Uint8Array;  // Sender address (20 bytes)
    toAddress: Uint8Array;    // Recipient address (20 bytes)
    amount: bigint;           // Amount in uCNPY
}

/**
 * CreateOrder message for DEX limit orders
 */
export interface MessageCreateOrder {
    chainId: bigint;                  // Committee/chain ID for counter-asset
    data: Uint8Array;                 // Optional opcode data (max 100 bytes)
    amountForSale: bigint;            // Amount of asset being sold
    requestedAmount: bigint;          // Minimum amount of counter-asset requested
    sellerReceiveAddress: Uint8Array; // External address to receive counter-asset
    sellersSendAddress: Uint8Array;   // Canopy address sending the asset
    orderId?: Uint8Array;             // Auto-populated by protocol
}

/**
 * Stake message for validator staking
 */
export interface MessageStake {
    publicKey: Uint8Array;    // BLS12-381 public key for consensus
    amount: bigint;           // Stake amount in uCNPY
    committees: bigint[];     // List of chain IDs to validate
    netAddress: string;       // P2P network address (empty for delegates)
    outputAddress: Uint8Array;// Address to receive rewards
    delegate: boolean;        // True if delegating (not running validator)
    compound: boolean;        // True to auto-compound rewards
    signer?: Uint8Array;      // Auto-populated by protocol
}

/**
 * Network parameters for transaction creation
 */
export interface NetworkParams {
    height: bigint;           // Current blockchain height
    networkId: bigint;        // Network identifier (root chain ID)
    chainId: bigint;          // Chain to submit transaction to
}

/**
 * Helper function to convert BigInts to strings for JSON serialization
 */
function bigIntReplacer(key: string, value: any): any {
    if (typeof value === 'bigint') {
        return value.toString();
    }
    return value;
}

/**
 * Serializes message payload based on type
 * Converts Uint8Arrays to hex strings and BigInts to strings
 */
function serializeMessage(msg: any, messageType: string): any {
    switch (messageType) {
        case 'send':
            return {
                fromAddress: bytesToHex(msg.fromAddress),
                toAddress: bytesToHex(msg.toAddress),
                amount: msg.amount.toString(),
            };

        case 'createOrder':
            return {
                chainId: msg.chainId.toString(),
                data: bytesToHex(msg.data),
                amountForSale: msg.amountForSale.toString(),
                requestedAmount: msg.requestedAmount.toString(),
                sellerReceiveAddress: bytesToHex(msg.sellerReceiveAddress),
                sellersSendAddress: bytesToHex(msg.sellersSendAddress),
            };

        case 'stake':
            return {
                publickey: bytesToHex(msg.publicKey),
                amount: msg.amount.toString(),
                committees: msg.committees.map((c: bigint) => c.toString()),
                netAddress: msg.netAddress,
                outputAddress: bytesToHex(msg.outputAddress),
                delegate: msg.delegate,
                compound: msg.compound,
            };

        default:
            return msg;
    }
}

/**
 * Creates the canonical sign bytes for a transaction (excluding signature)
 */
function getSignBytes(tx: Transaction): Uint8Array {
    // Create transaction without signature for signing
    // Serialize message payload (converts Uint8Arrays to hex, BigInts to strings)
    const unsignedTx = {
        messageType: tx.messageType,
        msg: serializeMessage(tx.msg, tx.messageType),
        signature: null,
        time: tx.time.toString(),
        createdHeight: tx.createdHeight.toString(),
        fee: tx.fee.toString(),
        memo: tx.memo,
        networkId: tx.networkId.toString(),
        chainId: tx.chainId.toString(),
    };

    // Serialize to canonical JSON form
    const jsonBytes = new TextEncoder().encode(JSON.stringify(unsignedTx));
    return jsonBytes;
}

/**
 * Computes the transaction hash (SHA256 of serialized transaction)
 */
export function computeTxHash(tx: Transaction): string {
    // Serialize to JSON and compute hash, converting BigInts to strings
    const txBytes = new TextEncoder().encode(JSON.stringify(tx, bigIntReplacer));
    const hash = sha256(txBytes);
    return bytesToHex(hash);
}

/**
 * Signs a transaction with a BLS12-381 private key
 *
 * @param tx - Transaction to sign (signature field will be populated)
 * @param privateKeyHex - Hex-encoded BLS12-381 private key
 * @throws Error if signing fails
 */
export function signTransaction(tx: Transaction, privateKeyHex: string): void {
    try {
        console.log('🔐 Starting transaction signing...');

        // Convert hex private key to bytes
        const privateKeyBytes = hexToBytes(privateKeyHex);
        console.log('  Private key length:', privateKeyBytes.length);

        // Derive public key using shortSignatures API
        const publicKey = bls12_381.shortSignatures.getPublicKey(privateKeyBytes);
        const publicKeyBytes = publicKey.toBytes();
        console.log('  Public key length:', publicKeyBytes.length);

        // Get canonical sign bytes
        const signBytes = getSignBytes(tx);
        console.log('  Sign bytes length:', signBytes.length);
        console.log('  Sign bytes (first 50):', bytesToHex(signBytes.slice(0, 50)));

        // Hash the message using BLS12-381 hash function
        // According to @noble/curves docs, use the hash method
        const DST = 'BLS_SIG_BLS12381G1_XMD:SHA-256_SSWU_RO_NUL_';
        const messagePoint = bls12_381.G1.hashToCurve(signBytes, { DST });
        console.log('  Message hashed to curve');

        // Sign with BLS12-381 using shortSignatures API
        console.log('  Attempting to sign...');
        const signature = bls12_381.shortSignatures.sign(messagePoint, privateKeyBytes);
        const signatureBytes = signature.toBytes();
        console.log('✅ Signature created, length:', signatureBytes.length);

        // Populate signature field
        tx.signature = {
            publicKey: publicKeyBytes,
            signature: signatureBytes,
        };
    } catch (error) {
        console.error('❌ Signing error:', error);
        throw new Error(`Failed to sign transaction: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * Creates a Send transaction
 *
 * @param from - Sender private key (hex)
 * @param to - Recipient address (hex)
 * @param amount - Amount in uCNPY
 * @param params - Network parameters (height, networkId, chainId)
 * @param fee - Transaction fee (default: 0, will need to be set)
 * @param memo - Optional memo
 * @returns Signed transaction ready for submission
 */
export function createSendTransaction(
    from: string,
    to: string,
    amount: bigint,
    params: NetworkParams,
    fee: bigint = BigInt(0),
    memo: string = ''
): Transaction {
    const privateKeyBytes = hexToBytes(from);
    const publicKey = bls12_381.shortSignatures.getPublicKey(privateKeyBytes);
    const publicKeyBytes = publicKey.toBytes();
    const fromAddress = deriveAddress(publicKeyBytes);
    const toAddress = hexToBytes(to);

    const message: MessageSend = {
        fromAddress,
        toAddress,
        amount,
    };

    const tx: Transaction = {
        messageType: 'send',
        msg: message,
        time: BigInt(Date.now() * 1000), // Convert milliseconds to microseconds
        createdHeight: params.height,
        fee,
        memo,
        networkId: params.networkId,
        chainId: params.chainId,
    };

    signTransaction(tx, from);
    return tx;
}

/**
 * Creates a CreateOrder transaction (DEX limit order)
 *
 * @param from - Trader private key (hex)
 * @param amountForSale - Amount of asset being sold
 * @param requestedAmount - Minimum amount of counter-asset requested
 * @param committeeId - Chain ID for counter-asset
 * @param receiveAddress - External address to receive counter-asset (hex)
 * @param params - Network parameters
 * @param fee - Transaction fee
 * @param data - Optional opcode data (hex)
 * @param memo - Optional memo
 * @returns Signed transaction
 */
export function createLimitOrderTransaction(
    from: string,
    amountForSale: bigint,
    requestedAmount: bigint,
    committeeId: bigint,
    receiveAddress: string,
    params: NetworkParams,
    fee: bigint = BigInt(0),
    data: string = '',
    memo: string = ''
): Transaction {
    const privateKeyBytes = hexToBytes(from);
    const publicKey = bls12_381.shortSignatures.getPublicKey(privateKeyBytes);
    const publicKeyBytes = publicKey.toBytes();
    const senderAddress = deriveAddress(publicKeyBytes);

    const message: MessageCreateOrder = {
        chainId: committeeId,
        data: data ? hexToBytes(data) : new Uint8Array(0),
        amountForSale,
        requestedAmount,
        sellerReceiveAddress: hexToBytes(receiveAddress),
        sellersSendAddress: senderAddress,
    };

    const tx: Transaction = {
        messageType: 'createOrder',
        msg: message,
        time: BigInt(Date.now() * 1000),
        createdHeight: params.height,
        fee,
        memo,
        networkId: params.networkId,
        chainId: params.chainId,
    };

    signTransaction(tx, from);
    return tx;
}

/**
 * Creates a Stake transaction
 *
 * @param from - Staker private key (hex)
 * @param amount - Stake amount in uCNPY
 * @param committees - Array of chain IDs to validate
 * @param outputAddress - Address to receive rewards (hex)
 * @param params - Network parameters
 * @param fee - Transaction fee
 * @param delegate - True if delegating (not running validator node)
 * @param compound - True to auto-compound rewards
 * @param netAddress - P2P network address (required if not delegate)
 * @param memo - Optional memo
 * @returns Signed transaction
 */
export function createStakeTransaction(
    from: string,
    amount: bigint,
    committees: bigint[],
    outputAddress: string,
    params: NetworkParams,
    fee: bigint = BigInt(0),
    delegate: boolean = true,
    compound: boolean = true,
    netAddress: string = '',
    memo: string = ''
): Transaction {
    const privateKeyBytes = hexToBytes(from);
    const publicKey = bls12_381.shortSignatures.getPublicKey(privateKeyBytes);
    const publicKeyBytes = publicKey.toBytes();

    const message: MessageStake = {
        publicKey: publicKeyBytes,
        amount,
        committees,
        netAddress,
        outputAddress: hexToBytes(outputAddress),
        delegate,
        compound,
    };

    const tx: Transaction = {
        messageType: 'stake',
        msg: message,
        time: BigInt(Date.now() * 1000),
        createdHeight: params.height,
        fee,
        memo,
        networkId: params.networkId,
        chainId: params.chainId,
    };

    signTransaction(tx, from);
    return tx;
}

/**
 * Derives a Canopy blockchain address from a public key
 * Uses SHA256 hash and takes first 20 bytes
 */
function deriveAddress(publicKey: Uint8Array): Uint8Array {
    const hash = sha256(publicKey);
    return hash.slice(0, 20);
}

/**
 * Validates transaction structure before signing/submission
 *
 * @param tx - Transaction to validate
 * @returns true if valid
 * @throws Error if validation fails
 */
export function validateTransaction(tx: Transaction): boolean {
    if (!tx.messageType || tx.messageType === '') {
        throw new Error('Message type is required');
    }

    if (!tx.msg) {
        throw new Error('Message payload is required');
    }

    if (tx.createdHeight === BigInt(0)) {
        throw new Error('Created height must be greater than 0');
    }

    if (tx.time === BigInt(0)) {
        throw new Error('Transaction time must be greater than 0');
    }

    if (tx.memo.length > 200) {
        throw new Error('Memo must be 200 characters or less');
    }

    if (tx.networkId === BigInt(0)) {
        throw new Error('Network ID is required');
    }

    if (tx.chainId === BigInt(0)) {
        throw new Error('Chain ID is required');
    }

    if (tx.signature) {
        if (!tx.signature.publicKey || tx.signature.publicKey.length === 0) {
            throw new Error('Signature public key is required');
        }
        if (!tx.signature.signature || tx.signature.signature.length === 0) {
            throw new Error('Signature bytes are required');
        }
    }

    return true;
}

/**
 * Serializes transaction to JSON for HTTP submission
 *
 * @param tx - Transaction to serialize
 * @returns JSON string
 */
export function serializeTransactionJSON(tx: Transaction): string {
    // Convert Uint8Arrays and BigInts to hex strings for JSON
    const serializable = {
        type: tx.messageType,
        msg: serializeMessage(tx.msg, tx.messageType),
        signature: tx.signature ? {
            publicKey: bytesToHex(tx.signature.publicKey),
            signature: bytesToHex(tx.signature.signature),
        } : undefined,
        time: tx.time.toString(),
        createdHeight: tx.createdHeight.toString(),
        fee: tx.fee.toString(),
        memo: tx.memo,
        networkID: tx.networkId.toString(),
        chainID: tx.chainId.toString(),
    };

    return JSON.stringify(serializable);
}

/**
 * Converts a Transaction to the format expected by /api/v1/wallet/transactions/send-raw
 *
 * @param tx - Signed transaction
 * @returns Object ready to be sent to the send-raw endpoint
 */
export function toSendRawTransactionRequest(tx: Transaction): {
    raw_transaction: {
        type: string;
        message: Record<string, any>;
        signature: string
        public_key: string;
        time: string;
        createdHeight: string;
        fee: string;
        memo: string;
        networkID: string;
        chainID: string;
    };
} {
    if (!tx.signature) {
        throw new Error('Transaction must be signed before converting to raw transaction request');
    }

    return {
        raw_transaction: {
            type: tx.messageType,
            message: serializeMessage(tx.msg, tx.messageType),
            signature: bytesToHex(tx.signature.signature),
            public_key: bytesToHex(tx.signature.publicKey),
            time: tx.time.toString(),
            createdHeight: tx.createdHeight.toString(),
            fee: tx.fee.toString(),
            memo: tx.memo,
            networkID: tx.networkId.toString(),
            chainID: tx.chainId.toString(),
        },
    };
}