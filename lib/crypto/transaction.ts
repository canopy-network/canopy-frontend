/**
 * Transaction building and signing
 *
 * Mirrors Go implementation in canopy/fsm/transaction.go
 * Handles multi-curve signing for Canopy blockchain transactions
 */

import { signMessage } from "./signing";
import { CurveType } from "./types";
import { getSignBytesProtobuf } from "./protobuf";
import type { TransactionParams, RawTransaction, TransactionMessage, TransactionSignature } from "./types";
import type { SendRawTransactionRequest } from "@/types/wallet";

/**
 * Creates and signs a transaction
 *
 * Mirrors fsm.NewTransaction() from canopy/fsm/transaction.go:424-441
 *
 * IMPORTANT: The frontend signs PROTOBUF-encoded transaction bytes.
 * The backend (Launchpad) will:
 * 1. Receive JSON from frontend
 * 2. Convert JSON → Proto (lib.Transaction)
 * 3. Call tx.GetSignBytes() to get protobuf-encoded bytes (WITHOUT signature)
 * 4. Verify signature against those PROTOBUF bytes
 *
 * This means we MUST sign PROTOBUF bytes, not JSON bytes!
 *
 * @param params - Transaction parameters
 * @param privateKeyHex - Hex-encoded private key
 * @param publicKeyHex - Hex-encoded public key
 * @param curveType - Curve type for signing
 * @returns SendRawTransactionRequest ready to submit to Launchpad
 */
export function createAndSignTransaction(
  params: TransactionParams,
  privateKeyHex: string,
  publicKeyHex: string,
  curveType: CurveType
): SendRawTransactionRequest {
  // Build unsigned transaction
  // Mirrors lib.Transaction structure from canopy/lib/tx.go
  const unsignedTx: Omit<RawTransaction, "signature"> = {
    type: params.type,
    msg: params.msg,
    time: Date.now() * 1000, // Unix microseconds (Go uses time.Now().UnixMicro())
    createdHeight: params.height,
    fee: params.fee,
    memo: params.memo,
    networkID: params.networkID,
    chainID: params.chainID,
  };

  const signBytes = getSignBytesProtobuf(unsignedTx);

  const signatureHex = signMessage(signBytes, privateKeyHex, curveType);

  // Create signature structure
  const signature: TransactionSignature = {
    publicKey: publicKeyHex,
    signature: signatureHex,
  };

  // Build complete signed transaction
  const signedTx: RawTransaction = {
    ...unsignedTx,
    signature,
  };

  return {
    raw_transaction: signedTx,
  };
}

/**
 * DEPRECATED: Old JSON-based signing (DOES NOT WORK)
 *
 * This function is kept for reference only. It does NOT produce compatible signatures.
 * The backend verifies against PROTOBUF bytes, not JSON bytes.
 *
 * Use getSignBytesProtobuf() from protobuf.ts instead.
 */
// function getSignBytesJSON(tx: Omit<RawTransaction, 'signature'>): Uint8Array {
//   const signTx = {
//     type: tx.type,
//     msg: tx.msg,
//     signature: null,
//     time: tx.time,
//     createdHeight: tx.createdHeight,
//     fee: tx.fee,
//     memo: tx.memo,
//     networkID: tx.networkID,
//     chainID: tx.chainID,
//   };
//   const jsonString = JSON.stringify(signTx);
//   return new TextEncoder().encode(jsonString);
// }

/**
 * Creates a Send transaction message
 *
 * Mirrors fsm.NewSendTransaction() from canopy/fsm/transaction.go:260-266
 *
 * @param fromAddress - Sender address (hex, no 0x prefix)
 * @param toAddress - Recipient address (hex, no 0x prefix)
 * @param amount - Amount in micro units (uCNPY)
 * @returns MessageSend payload
 */
export function createSendMessage(fromAddress: string, toAddress: string, amount: number): TransactionMessage {
  // Mirrors MessageSend structure from canopy/fsm/message.pb.go
  return {
    fromAddress,
    toAddress,
    amount,
  };
}

/**
 * Creates a Stake transaction message
 *
 * Mirrors fsm.NewStakeTx() from canopy/fsm/transaction.go:269-279
 *
 * @param publicKey - Validator public key (hex)
 * @param amount - Amount to stake (micro units)
 * @param committees - Committee IDs to join
 * @param netAddress - Network address for validator (empty string for delegation)
 * @param outputAddress - Address to receive rewards
 * @param delegate - Whether this is a delegation
 * @param compound - Whether to compound rewards (earlyWithdrawal = !compound)
 * @param signer - Optional signer address (can be empty, backend auto-populates)
 * @returns MessageStake payload
 */
export function createStakeMessage(
  publicKey: string,
  amount: number,
  committees: number[],
  netAddress: string,
  outputAddress: string,
  delegate: boolean,
  compound: boolean
): TransactionMessage {
  return {
    publickey: publicKey, // WORKAROUND: Backend expects lowercase "publickey" not "publicKey"
    amount,
    committees,
    netAddress,
    outputAddress,
    delegate,
    compound,
  };
}

/**
 * Creates an Unstake transaction message
 *
 * Mirrors fsm.NewUnstakeTx() from canopy/fsm/transaction.go:294-296
 *
 * @param address - Address to unstake
 * @returns MessageUnstake payload
 */
export function createUnstakeMessage(address: string): TransactionMessage {
  return {
    address,
  };
}

/**
 * Creates an EditStake transaction message
 *
 * Mirrors fsm.NewEditStakeTx() from canopy/fsm/transaction.go:282-291
 *
 * @param address - Validator address
 * @param amount - New stake amount
 * @param committees - New committee IDs
 * @param netAddress - New network address
 * @param outputAddress - New output address
 * @param compound - Whether to compound rewards
 * @returns MessageEditStake payload
 */
export function createEditStakeMessage(
  address: string,
  amount: number,
  committees: number[],
  netAddress: string,
  outputAddress: string,
  compound: boolean
): TransactionMessage {
  return {
    address,
    amount,
    committees,
    netAddress,
    outputAddress,
    signer: "", // Will be populated by backend
    compound,
  };
}

/**
 * Creates a CreateOrder transaction message (cross-chain atomic swaps)
 *
 * NOTE: This is for cross-chain atomic swap orders, NOT for DEX v2 limit orders.
 * For DEX v2 limit orders, use createDexLimitOrderMessage() instead.
 *
 * Mirrors fsm.NewCreateOrderTx() from canopy/fsm/transaction.go:366-375
 *
 * @param committeeId - Committee ID responsible for the counter-asset swap
 * @param data - Additional order data (hex string, can be empty)
 * @param amountForSale - Amount selling (in micro units)
 * @param requestedAmount - Amount requesting (in micro units)
 * @param sellerReceiveAddress - Address to receive payment (hex)
 * @param sellersSendAddress - Address sending tokens (hex)
 * @returns MessageCreateOrder payload
 */
export function createOrderMessage(
  chainId: number,
  data: string,
  amountForSale: number,
  requestedAmount: number,
  sellerReceiveAddress: string,
  sellersSendAddress: string
): TransactionMessage {
  // NOTE: Do NOT include orderId - it's auto-populated by the backend
  // from the first 20 bytes of the transaction hash
  return {
    chainId,
    data,
    amountForSale,
    requestedAmount,
    sellerReceiveAddress,
    sellersSendAddress,
  };
}

/**
 * Creates a DeleteOrder transaction message (cross-chain atomic swaps)
 *
 * Deletes an unclaimed token swap sell order.
 *
 * Mirrors fsm.NewDeleteOrderTx() from canopy/fsm/transaction.go:399-402
 *
 * @param orderId - Order ID to delete (hex string)
 * @param chainId - Committee chain ID
 * @returns MessageDeleteOrder payload
 */
export function createDeleteOrderMessage(orderId: string, chainId: number): TransactionMessage {
  return {
    orderId,
    chainId,
  };
}

/**
 * Validates transaction parameters before signing
 *
 * @param params - Transaction parameters
 * @throws Error if validation fails
 */
export function validateTransactionParams(params: TransactionParams): void {
  // Validate message type
  if (!params.type || typeof params.type !== "string") {
    throw new Error("Invalid message type: must be a non-empty string");
  }

  // Validate message payload
  if (!params.msg || typeof params.msg !== "object") {
    throw new Error("Invalid message: must be an object");
  }

  // Validate fee
  if (typeof params.fee !== "number" || params.fee < 0) {
    throw new Error("Invalid fee: must be a non-negative number");
  }

  // Validate network ID
  if (typeof params.networkID !== "number" || params.networkID <= 0) {
    throw new Error("Invalid network ID: must be a positive number");
  }

  // Validate chain ID
  if (typeof params.chainID !== "number" || params.chainID <= 0) {
    throw new Error("Invalid chain ID: must be a positive number");
  }

  // Validate height
  if (typeof params.height !== "number" || params.height < 0) {
    throw new Error("Invalid height: must be a non-negative number");
  }

  // Validate memo length
  if (params.memo && params.memo.length > 200) {
    throw new Error("Invalid memo: must be 200 characters or less");
  }
}

/**
 * Estimates the size of a transaction in bytes
 *
 * Useful for fee estimation and validation
 *
 * @param tx - Transaction to estimate
 * @returns Estimated size in bytes
 */
export function estimateTransactionSize(tx: RawTransaction): number {
  const jsonString = JSON.stringify(tx);
  return new TextEncoder().encode(jsonString).length;
}

/**
 * Gets the transaction hash (for tracking before submission)
 *
 * NOTE: This is a client-side hash. The authoritative hash
 * is computed by the backend and returned in the response.
 *
 * @param tx - Signed transaction
 * @returns Hex-encoded hash
 */
export async function getTransactionHash(tx: RawTransaction): Promise<string> {
  const jsonString = JSON.stringify(tx);
  const bytes = new TextEncoder().encode(jsonString);

  // Use browser's SubtleCrypto for SHA-256
  const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  return hashHex;
}

/**
 * Creates a DexLiquidityDeposit transaction message (DEX v2)
 *
 * Deposits tokens to the liquidity pool in exchange for liquidity points.
 *
 * @param chainId - Committee chain ID
 * @param amount - Deposit amount in micro units
 * @param address - Hex-encoded depositor address
 * @returns MessageDexLiquidityDeposit payload
 */
export function createDexLiquidityDepositMessage(chainId: number, amount: number, address: string): TransactionMessage {
  return {
    chainId,
    amount,
    address,
  };
}

/**
 * Creates a DexLimitOrder transaction message (DEX v2)
 *
 * Creates a limit order to swap tokens on the DEX.
 *
 * @param chainId - Committee chain ID (the chain you're RECEIVING tokens from)
 *                  Example: Selling CNPY (chain 1) for DEFI (chain 2) => chainId = 2
 *                  Example: Selling DEFI (chain 2) for CNPY (chain 1) => chainId = 1
 * @param amountForSale - Amount selling in micro units (from current chain)
 * @param requestedAmount - Minimum amount to receive in micro units (from target chain)
 * @param address - Hex-encoded seller address
 * @returns MessageDexLimitOrder payload
 */
export function createDexLimitOrderMessage(
  chainId: number,
  amountForSale: number,
  requestedAmount: number,
  address: string
): TransactionMessage {
  return {
    chainId,
    amountForSale,
    requestedAmount,
    sellerReceiveAddress: address,
  };
}
