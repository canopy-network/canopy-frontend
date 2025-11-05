/**
 * Transaction signing and submission module for Canopy blockchain
 *
 * Provides functionality to create, sign, and submit transactions to Canopy nodes.
 *
 * Transaction flow:
 * 1. Create message payload (Send, Stake, LimitOrder, etc.)
 * 2. Build transaction with metadata (height, fee, chainId, networkId)
 * 3. Sign transaction with BLS12-381 private key
 * 4. Serialize to JSON
 * 5. Submit to Canopy node RPC endpoint
 */

import { bls12_381 } from '@noble/curves/bls12-381';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';

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
 * Fee parameters from blockchain
 */
export interface FeeParams {
  sendFee: bigint;
  dexLimitOrderFee: bigint;
  stakeFee: bigint;
  unstakeFee: bigint;
  editStakeFee: bigint;
}

/**
 * Transaction submission response
 */
export interface TxResponse {
  txHash: string;           // Transaction hash
  height?: bigint;          // Block height (if included)
  status: 'pending' | 'success' | 'failed';
}

/**
 * Creates the canonical sign bytes for a transaction (excluding signature)
 */
function getSignBytes(tx: Transaction): Uint8Array {
  // Create transaction without signature for signing
  const unsignedTx = {
    messageType: tx.messageType,
    msg: tx.msg,
    signature: null,
    time: tx.time,
    createdHeight: tx.createdHeight,
    fee: tx.fee,
    memo: tx.memo,
    networkId: tx.networkId,
    chainId: tx.chainId,
  };

  // Serialize to canonical JSON form
  const jsonBytes = new TextEncoder().encode(JSON.stringify(unsignedTx));
  return jsonBytes;
}

/**
 * Computes the transaction hash (SHA256 of serialized transaction)
 */
export function computeTxHash(tx: Transaction): string {
  // Serialize to JSON and compute hash
  const txBytes = new TextEncoder().encode(JSON.stringify(tx));
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
    // Convert hex private key to bytes
    const privateKeyBytes = hexToBytes(privateKeyHex);

    // Derive public key
    const publicKeyBytes = bls12_381.getPublicKey(privateKeyBytes);

    // Get canonical sign bytes
    const signBytes = getSignBytes(tx);

    // Sign with BLS12-381
    const signatureBytes = bls12_381.sign(signBytes, privateKeyBytes);

    // Populate signature field
    tx.signature = {
      publicKey: publicKeyBytes,
      signature: signatureBytes,
    };
  } catch (error) {
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
  fee: bigint = 0n,
  memo: string = ''
): Transaction {
  const privateKeyBytes = hexToBytes(from);
  const publicKeyBytes = bls12_381.getPublicKey(privateKeyBytes);
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
  fee: bigint = 0n,
  data: string = '',
  memo: string = ''
): Transaction {
  const privateKeyBytes = hexToBytes(from);
  const publicKeyBytes = bls12_381.getPublicKey(privateKeyBytes);
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
  fee: bigint = 0n,
  delegate: boolean = true,
  compound: boolean = true,
  netAddress: string = '',
  memo: string = ''
): Transaction {
  const privateKeyBytes = hexToBytes(from);
  const publicKeyBytes = bls12_381.getPublicKey(privateKeyBytes);

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

  if (tx.createdHeight === 0n) {
    throw new Error('Created height must be greater than 0');
  }

  if (tx.time === 0n) {
    throw new Error('Transaction time must be greater than 0');
  }

  if (tx.memo.length > 200) {
    throw new Error('Memo must be 200 characters or less');
  }

  if (tx.networkId === 0n) {
    throw new Error('Network ID is required');
  }

  if (tx.chainId === 0n) {
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
 * Serializes message payload based on type
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
 * Submits a transaction to a Canopy node via HTTP RPC
 *
 * @param tx - Signed transaction
 * @param rpcUrl - Canopy node RPC URL (e.g., "http://localhost:42069")
 * @returns Transaction response with hash
 */
export async function submitTransaction(
  tx: Transaction,
  rpcUrl: string
): Promise<TxResponse> {
  try {
    // Validate before submission
    validateTransaction(tx);

    if (!tx.signature) {
      throw new Error('Transaction must be signed before submission');
    }

    // Serialize transaction
    const txJson = serializeTransactionJSON(tx);

    // Submit to node
    const response = await fetch(`${rpcUrl}/v1/client/rawtx`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: txJson,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Transaction submission failed: ${response.status} ${errorText}`);
    }

    const result = await response.json();

    return {
      txHash: result.hash || result.txHash || computeTxHash(tx),
      height: result.height ? BigInt(result.height) : undefined,
      status: 'pending',
    };
  } catch (error) {
    throw new Error(`Failed to submit transaction: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Fetches current network parameters from a Canopy node
 *
 * @param rpcUrl - Canopy node RPC URL
 * @returns Network parameters for transaction creation
 */
export async function getNetworkParams(rpcUrl: string): Promise<NetworkParams> {
  try {
    const response = await fetch(`${rpcUrl}/v1/query/height`);
    if (!response.ok) {
      throw new Error(`Failed to fetch height: ${response.status}`);
    }
    const data = await response.json();

    // In production, also fetch networkId and chainId from node config
    // For now, use placeholder values that should be configured
    return {
      height: BigInt(data.height),
      networkId: 1n, // TODO: Fetch from node
      chainId: 1n,   // TODO: Fetch from node
    };
  } catch (error) {
    throw new Error(`Failed to get network params: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Fetches fee parameters from a Canopy node
 *
 * @param rpcUrl - Canopy node RPC URL
 * @param height - Block height (0 for latest)
 * @returns Fee parameters
 */
export async function getFeeParams(rpcUrl: string, height: bigint = 0n): Promise<FeeParams> {
  try {
    const heightParam = height > 0n ? `?height=${height}` : '';
    const response = await fetch(`${rpcUrl}/v1/query/params${heightParam}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch fee params: ${response.status}`);
    }

    const data = await response.json();

    return {
      sendFee: BigInt(data.sendFee || '1000'),
      dexLimitOrderFee: BigInt(data.dexLimitOrderFee || '5000'),
      stakeFee: BigInt(data.stakeFee || '1000'),
      unstakeFee: BigInt(data.unstakeFee || '1000'),
      editStakeFee: BigInt(data.editStakeFee || '1000'),
    };
  } catch (error) {
    throw new Error(`Failed to get fee params: ${error instanceof Error ? error.message : String(error)}`);
  }
}
