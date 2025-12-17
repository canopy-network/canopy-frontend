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
 */

"use client";

import { useState, useCallback } from "react";
import { useAccount, useChainId, useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { encodeFunctionData, toHex } from "viem";
import { USDC_ADDRESSES, ERC20_TRANSFER_ABI } from "@/lib/web3/config";
import { chainsApi } from "@/lib/api";
import type { LockOrderData, OrderBookApiOrder } from "@/types/orderbook";

// Deadline offset: ~6.7 minutes at 10s blocks = 40 blocks
const DEADLINE_BLOCK_OFFSET = 40;

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

export function useLockOrder({
  order,
  buyerCanopyAddress,
}: UseLockOrderParams): UseLockOrderReturn {
  const { address: buyerEthAddress } = useAccount();
  const chainId = useChainId();
  const [error, setError] = useState<Error | null>(null);

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

    const usdcAddress = USDC_ADDRESSES[chainId];
    if (!usdcAddress) {
      setError(new Error(`USDC not supported on chain ${chainId}`));
      return;
    }

    setError(null);

    try {
      // Fetch current Canopy block height to calculate deadline
      const CANOPY_CHAIN_ID = 1;
      const heightResponse = await chainsApi.getChainHeight(String(CANOPY_CHAIN_ID));
      const currentHeight = heightResponse.data.height;
      const deadline = currentHeight + DEADLINE_BLOCK_OFFSET;

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
      const callData = createLockOrderCallData(
        buyerEthAddress,
        amount,
        lockOrderData
      );

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
