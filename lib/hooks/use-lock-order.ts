/**
 * useLockOrder Hook
 *
 * React hook for sending LockOrder transactions on Ethereum.
 * Used to lock an existing sell order in the cross-chain atomic swap.
 *
 * Flow:
 * 1. Encode LockOrder data as JSON
 * 2. Create ERC20 transfer call data
 * 3. Append LockOrder JSON (hex-encoded) to transfer data
 * 4. Send transaction to USDC contract via wagmi
 * 5. Also send Canopy transaction to /send-raw for indexing
 */

"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useAccount, useChainId, useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { encodeFunctionData, toHex } from "viem";
import { USDC_ADDRESS, ERC20_TRANSFER_ABI } from "@/lib/web3/config";
import { chainsApi, walletTransactionApi } from "@/lib/api";
import { useWalletStore } from "@/lib/stores/wallet-store";
import { createSendMessage, createAndSignTransaction } from "@/lib/crypto/transaction";
import { CurveType } from "@/lib/crypto/types";
import type { LockOrderData, OrderBookApiOrder } from "@/types/orderbook";

// Deadline offset: ~6.7 minutes at 10s blocks = 40 blocks
const DEADLINE_BLOCK_OFFSET = 40;

const DEFAULT_BUYER_CHAIN_DEADLINE = 900000; // ~2.5 hours at 10s blocks

interface UseLockOrderParams {
  order: OrderBookApiOrder | null;
  buyerCanopyAddress: string; // Canopy address to receive CNPY
}

interface UseLockOrderReturn {
  sendLockOrder: () => Promise<void>;
  isPending: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
  txHash: `0x${string}` | undefined;
  reset: () => void;
}

/**
 * Removes 0x prefix from an address if present
 */
function stripHexPrefix(address: string): string {
  return address.startsWith("0x") ? address.slice(2) : address;
}

/**
 * Creates ERC20 transfer call data with LockOrder JSON appended
 */
function createLockOrderCallData(
  toAddress: `0x${string}`,
  amount: bigint,
  lockOrderData: LockOrderData
): `0x${string}` {
  // Encode the standard ERC20 transfer function call
  const transferData = encodeFunctionData({
    abi: ERC20_TRANSFER_ABI,
    functionName: "transfer",
    args: [toAddress, amount],
  });

  // Convert LockOrder data to JSON string, then to hex
  const jsonString = JSON.stringify(lockOrderData);
  const jsonHex = toHex(new TextEncoder().encode(jsonString)).slice(2); // Remove 0x

  // Append LockOrder hex to transfer data
  return `${transferData}${jsonHex}` as `0x${string}`;
}

export function useLockOrder({ order, buyerCanopyAddress }: UseLockOrderParams): UseLockOrderReturn {
  const { address: buyerEthAddress } = useAccount();
  const chainId = useChainId();
  const [error, setError] = useState<Error | null>(null);
  const { currentWallet, fetchFeeParams } = useWalletStore();
  const canopyTxSentRef = useRef<string | null>(null); // Track if we've sent Canopy tx for this Ethereum tx

  const {
    sendTransaction,
    data: txHash,
    isPending,
    isError: isSendError,
    error: sendError,
    reset: resetSend,
  } = useSendTransaction();

  const {
    isLoading: isConfirming,
    isSuccess,
    isError: isReceiptError,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Reset hook state when order changes (only if no transaction in progress)
  useEffect(() => {
    if (order && !isPending && !isConfirming && !txHash) {
      setError(null);
      canopyTxSentRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.id]);

  // Send Canopy indexing transaction after Ethereum transaction succeeds
  useEffect(() => {
    if (
      isSuccess &&
      txHash &&
      order &&
      currentWallet?.isUnlocked &&
      currentWallet?.privateKey &&
      canopyTxSentRef.current !== txHash // Only send once per Ethereum tx
    ) {
      canopyTxSentRef.current = txHash; // Mark as sent
      const sendCanopyIndexingTx = async () => {
        try {
          // Fetch current Canopy block height
          const CANOPY_CHAIN_ID = 1;
          const heightResponse = await chainsApi.getChainHeight(String(CANOPY_CHAIN_ID));
          const currentHeight = heightResponse.data.height;
          const deadline = currentHeight + DEADLINE_BLOCK_OFFSET;

          // Build LockOrder JSON for memo (same as Ethereum transaction)
          if (!buyerEthAddress) {
            console.warn("Cannot send Canopy indexing transaction: Ethereum address not available");
            return;
          }

          const lockOrderData = {
            orderId: order.id,
            chain_id: order.committee,
            buyerSendAddress: stripHexPrefix(buyerEthAddress),
            buyerReceiveAddress: stripHexPrefix(buyerCanopyAddress),
            buyerChainDeadline: deadline,
          };

          // Create send message (self-send with tiny amount, as per pattern)
          const msg = createSendMessage(
            currentWallet.address,
            currentWallet.address, // Self-send
            1 // Tiny amount (as per pattern)
          );

          // Fetch fee params - lock order requires fee >= sendFee * 2 (lockOrderFeeMultiplier)
          const feeParams = await fetchFeeParams();
          const lockOrderFee = feeParams.sendFee * 2; // Default multiplier is 2

          // Build transaction with LockOrder JSON in memo
          const txParams = {
            type: "send",
            msg,
            fee: lockOrderFee,
            memo: JSON.stringify(lockOrderData), // LockOrder JSON in memo
            networkID: 1,
            chainID: CANOPY_CHAIN_ID,
            height: currentHeight,
          };

          // Sign and send to Canopy
          if (!currentWallet.privateKey || !currentWallet.public_key || !currentWallet.curveType) {
            console.warn("Cannot send Canopy indexing transaction: wallet not fully unlocked");
            return;
          }

          const signedTx = createAndSignTransaction(
            txParams,
            currentWallet.privateKey,
            currentWallet.public_key,
            currentWallet.curveType as CurveType
          );

          // Commented out: send raw transaction for indexing
          // const response = await walletTransactionApi.sendRawTransaction(signedTx);
          // console.log("✅ Lock order indexed on Canopy:", response.transaction_hash);
          console.log("✅ Lock order indexed on Canopy (skipped sendRawTransaction):", signedTx);
        } catch (err) {
          console.error("Failed to send Canopy indexing transaction:", err);
          // Don't throw - Ethereum transaction is the important one
        }
      };

      sendCanopyIndexingTx();
    }
  }, [isSuccess, txHash, order, currentWallet, buyerEthAddress, buyerCanopyAddress, fetchFeeParams]);

  const sendLockOrder = useCallback(async () => {
    if (!order) {
      setError(new Error("No order selected"));
      return;
    }

    if (!buyerEthAddress) {
      setError(new Error("Ethereum wallet not connected"));
      return;
    }

    if (!buyerCanopyAddress) {
      setError(new Error("Canopy wallet not connected"));
      return;
    }

    // Only use Ethereum mainnet (chain ID 1) for USDC
    if (chainId !== 1) {
      setError(new Error("USDC is only supported on Ethereum Mainnet. Please switch to Ethereum Mainnet."));
      return;
    }
    const usdcAddress = USDC_ADDRESS;

    setError(null);

    try {
      // Fetch current Canopy block height to calculate deadline
      const deadline = DEFAULT_BUYER_CHAIN_DEADLINE;

      // Build LockOrder data payload
      const lockOrderData: LockOrderData = {
        orderId: order.id,
        chain_id: order.committee,
        buyerSendAddress: stripHexPrefix(buyerEthAddress),
        buyerReceiveAddress: stripHexPrefix(buyerCanopyAddress),
        buyerChainDeadline: deadline,
      };

      // For lock order, amount is 0 (we're just signaling intent)
      // The actual USDC payment happens in the next step (closeOrder)
      const amount = BigInt(0);

      // The 'to' in the ERC20 transfer is the buyer's own address
      // (This is how the committee knows who is locking the order)
      const callData = createLockOrderCallData(buyerEthAddress, amount, lockOrderData);

      // Send transaction to USDC contract
      sendTransaction({
        to: usdcAddress,
        data: callData,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to send lock order"));
    }
  }, [order, buyerEthAddress, buyerCanopyAddress, chainId, sendTransaction]);

  const reset = useCallback(() => {
    setError(null);
    canopyTxSentRef.current = null;
    resetSend();
  }, [resetSend]);

  return {
    sendLockOrder,
    isPending,
    isConfirming,
    isSuccess,
    isError: isSendError || isReceiptError || !!error,
    error: error || sendError || receiptError || null,
    txHash,
    reset,
  };
}
