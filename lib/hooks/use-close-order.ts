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
 * 6. Also send Canopy transaction to /send-raw for indexing
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

export function useCloseOrder({ order }: UseCloseOrderParams): UseCloseOrderReturn {
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
          // Build CloseOrder JSON for memo (same as Ethereum transaction)
          const closeOrderData = {
            orderId: order.id,
            chain_id: order.committee,
            closeOrder: true,
          };

          // Fetch current Canopy block height
          const CANOPY_CHAIN_ID = 1;
          const heightResponse = await chainsApi.getChainHeight(String(CANOPY_CHAIN_ID));
          const currentHeight = heightResponse.data.height;

          // Get seller's address (remove 0x prefix if present)
          const sellerAddress = order.sellerReceiveAddress.startsWith("0x")
            ? order.sellerReceiveAddress.slice(2)
            : order.sellerReceiveAddress;

          // Create send message - send to seller with the requested amount
          const msg = createSendMessage(
            currentWallet.address,
            sellerAddress,
            parseInt(order.requestedAmount) // Actual USDC amount in micro units
          );

          // Fetch fee params - close order requires fee >= sendFee * 2
          const feeParams = await fetchFeeParams();
          const closeOrderFee = feeParams.sendFee * 2; // Default multiplier is 2

          // Build transaction with CloseOrder JSON in memo
          const txParams = {
            type: "send",
            msg,
            fee: closeOrderFee,
            memo: JSON.stringify(closeOrderData), // CloseOrder JSON in memo
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
          // console.log("✅ Close order indexed on Canopy:", response.transaction_hash);
          console.log("✅ Close order indexed on Canopy (skipped sendRawTransaction):", signedTx);
        } catch (err) {
          console.error("Failed to send Canopy indexing transaction:", err);
          // Don't throw - Ethereum transaction is the important one
        }
      };

      sendCanopyIndexingTx();
    }
  }, [isSuccess, txHash, order, currentWallet, fetchFeeParams]);

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

    // Only use Ethereum mainnet (chain ID 1) for USDC
    if (chainId !== 1) {
      setError(new Error("USDC is only supported on Ethereum Mainnet. Please switch to Ethereum Mainnet."));
      return;
    }
    const usdcAddress = USDC_ADDRESS;

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

      const callData = createCloseOrderCallData(sellerEthAddress as `0x${string}`, usdcAmount, closeOrderData);

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
    canopyTxSentRef.current = null;
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
