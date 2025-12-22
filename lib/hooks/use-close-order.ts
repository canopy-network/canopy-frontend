/**
 * useCloseOrder Hook
 *
 * React hook for sending CloseOrder transactions on Ethereum.
 * This sends the actual USDC payment to the seller to complete the swap.
 *
 * Flow:
 * 1. Order must already be locked (has buyerReceiveAddress)
 * 2. Encode CloseOrder data as JSON
 * 3. Create ERC20 transfer with actual USDC amount
 * 4. Send to seller's Ethereum address
 * 5. Committee witnesses payment and releases CNPY to buyer
 */

"use client";

import { useState, useCallback } from "react";
import { useAccount, useChainId, useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { encodeFunctionData, toHex } from "viem";
import { USDC_ADDRESSES, ERC20_TRANSFER_ABI } from "@/lib/web3/config";
import type { CloseOrderData, OrderBookApiOrder } from "@/types/orderbook";

const USDC_DECIMALS = 6;

interface UseCloseOrderParams {
  order: OrderBookApiOrder | null;
}

interface UseCloseOrderReturn {
  sendCloseOrder: () => Promise<void>;
  isPending: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
  txHash: `0x${string}` | undefined;
  reset: () => void;
}

/**
 * Creates ERC20 transfer call data with CloseOrder JSON appended
 */
function createCloseOrderCallData(
  toAddress: `0x${string}`,
  amount: bigint,
  closeOrderData: CloseOrderData
): `0x${string}` {
  // Encode the standard ERC20 transfer function call
  const transferData = encodeFunctionData({
    abi: ERC20_TRANSFER_ABI,
    functionName: "transfer",
    args: [toAddress, amount],
  });

  // Convert CloseOrder data to JSON string, then to hex
  const jsonString = JSON.stringify(closeOrderData);
  const jsonHex = toHex(new TextEncoder().encode(jsonString)).slice(2); // Remove 0x

  // Append CloseOrder hex to transfer data
  return `${transferData}${jsonHex}` as `0x${string}`;
}

export function useCloseOrder({
  order,
}: UseCloseOrderParams): UseCloseOrderReturn {
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

  const sendCloseOrder = useCallback(async () => {
    if (!order) {
      setError(new Error("No order selected"));
      return;
    }

    if (!order.buyerReceiveAddress) {
      setError(new Error("Order is not locked yet. Send LockOrder first."));
      return;
    }

    if (!buyerEthAddress) {
      setError(new Error("Ethereum wallet not connected"));
      return;
    }

    if (!order.sellerReceiveAddress) {
      setError(new Error("Order missing seller's Ethereum address"));
      return;
    }

    const usdcAddress = USDC_ADDRESSES[chainId];
    if (!usdcAddress) {
      setError(new Error(`USDC not supported on chain ${chainId}`));
      return;
    }

    setError(null);

    try {
      // Build CloseOrder data payload
      const closeOrderData: CloseOrderData = {
        orderId: order.id,
        closeOrder: true,
        chain_id: order.committee,
      };

      // Calculate USDC amount from requestedAmount
      // requestedAmount is in micro units (6 decimals), same as USDC
      const usdcAmount = BigInt(order.requestedAmount);

      // Seller's Ethereum address (add 0x prefix if missing)
      const sellerEthAddress = order.sellerReceiveAddress.startsWith("0x")
        ? order.sellerReceiveAddress
        : `0x${order.sellerReceiveAddress}`;

      const callData = createCloseOrderCallData(
        sellerEthAddress as `0x${string}`,
        usdcAmount,
        closeOrderData
      );

      // Send transaction to USDC contract
      sendTransaction({
        to: usdcAddress,
        data: callData,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to send close order"));
    }
  }, [order, buyerEthAddress, chainId, sendTransaction]);

  const reset = useCallback(() => {
    setError(null);
    resetSend();
  }, [resetSend]);

  return {
    sendCloseOrder,
    isPending,
    isConfirming,
    isSuccess,
    isError: isSendError || isReceiptError || !!error,
    error: error || sendError || receiptError || null,
    txHash,
    reset,
  };
}
