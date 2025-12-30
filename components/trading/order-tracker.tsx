"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, Check, AlertCircle, ChevronDown, RefreshCw } from "lucide-react";
import { useLockOrdersStore } from "@/lib/stores/lock-orders-store";
import { isOrderLocked } from "@/types/orderbook";
import type { OrderBookApiOrder, CloseOrderData } from "@/types/orderbook";
import { useAccount, useSendTransaction } from "wagmi";
import { useWalletStore } from "@/lib/stores/wallet-store";
import { USDC_ADDRESS, ERC20_TRANSFER_ABI } from "@/lib/web3/config";
import { encodeFunctionData, toHex } from "viem";

const DECIMALS = 1_000_000;

// Helper to create close order call data
function createCloseOrderCallData(
  toAddress: `0x${string}`,
  amount: bigint,
  closeOrderData: CloseOrderData
): `0x${string}` {
  const transferData = encodeFunctionData({
    abi: ERC20_TRANSFER_ABI,
    functionName: "transfer",
    args: [toAddress, amount],
  });
  const jsonString = JSON.stringify(closeOrderData);
  const jsonHex = toHex(new TextEncoder().encode(jsonString)).slice(2);
  return `${transferData}${jsonHex}` as `0x${string}`;
}

interface OrderTrackerProps {
  onCloseOrder?: (order: OrderBookApiOrder) => void;
  rejectedOrders?: Set<string>;
  onClearRejected?: (orderId: string) => void;
}

export function OrderTracker({ onCloseOrder, rejectedOrders = new Set(), onClearRejected }: OrderTrackerProps) {
  const { address: buyerEthAddress } = useAccount();
  const { currentWallet } = useWalletStore();
  const { sendTransaction } = useSendTransaction();
  const usdcAddress = USDC_ADDRESS;

  const { getPendingOrders, getLockingOrders, getLockedOrders, updateOrderStatus, removeOrder } = useLockOrdersStore();

  const [isRetrying, setIsRetrying] = useState<string | null>(null);

  const allPendingOrders = getPendingOrders();
  const lockingOrders = getLockingOrders();
  const lockedOrders = getLockedOrders();

  // Filter out closed orders - they should be auto-removed
  const closedOrders = allPendingOrders.filter((o) => o.status === "closed");
  const pendingOrders = allPendingOrders.filter((o) => o.status !== "closed");

  // Auto-remove closed orders after a short delay
  useEffect(() => {
    if (closedOrders.length > 0) {
      const timeoutId = setTimeout(() => {
        closedOrders.forEach((order) => {
          removeOrder(order.orderId);
        });
      }, 2000); // Remove after 2 seconds

      return () => clearTimeout(timeoutId);
    }
  }, [closedOrders, removeOrder]);

  // Don't show tracker if no active orders
  if (pendingOrders.length === 0) {
    return null;
  }

  const closingOrders = pendingOrders.filter((o) => o.status === "closing");
  const errorOrders = pendingOrders.filter((o) => o.status === "error");
  const rejectedCount = pendingOrders.filter((o) => rejectedOrders.has(o.orderId)).length;

  const handleRetryClose = async (orderId: string, orderData: OrderBookApiOrder) => {
    if (!buyerEthAddress || !currentWallet?.isUnlocked) return;

    setIsRetrying(orderId);
    onClearRejected?.(orderId);

    try {
      if (onCloseOrder) {
        onCloseOrder(orderData);
      } else {
        // Fallback: send close transaction directly
        const closeOrderData: CloseOrderData = {
          orderId: orderData.id,
          closeOrder: true,
          chain_id: orderData.committee,
        };

        const usdcAmount = BigInt(orderData.requestedAmount);
        const sellerEthAddress = orderData.sellerReceiveAddress.startsWith("0x")
          ? orderData.sellerReceiveAddress
          : `0x${orderData.sellerReceiveAddress}`;

        const callData = createCloseOrderCallData(sellerEthAddress as `0x${string}`, usdcAmount, closeOrderData);

        updateOrderStatus(orderId, "closing");

        sendTransaction({
          to: usdcAddress,
          data: callData,
        });
      }
    } catch (err) {
      console.error("Failed to retry close:", err);
      updateOrderStatus(orderId, "error", err instanceof Error ? err.message : "Failed to retry");
    } finally {
      setIsRetrying(null);
    }
  };

  const getStatusColor = (status: string, isRejected: boolean) => {
    if (isRejected) return "bg-red-500/20 text-red-500";
    switch (status) {
      case "locking":
        return "bg-blue-500/20 text-blue-500";
      case "locked":
        return "bg-green-500/20 text-green-500";
      case "closing":
        return "bg-yellow-500/20 text-yellow-500";
      case "closed":
        return "bg-green-500/20 text-green-500";
      case "error":
        return "bg-red-500/20 text-red-500";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string, isRejected: boolean) => {
    if (isRejected) return <AlertCircle className="w-3 h-3" />;
    switch (status) {
      case "locking":
      case "closing":
        return <Loader2 className="w-3 h-3 animate-spin" />;
      case "locked":
        return <Check className="w-3 h-3" />;
      case "closed":
        return <Check className="w-3 h-3" />;
      case "error":
        return <AlertCircle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  // Determine badge color based on overall status
  const hasErrors = errorOrders.length > 0 || rejectedCount > 0;
  const isProcessing = lockingOrders.length > 0 || closingOrders.length > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`gap-2 ${
            hasErrors
              ? "border-red-500/50 text-red-500 hover:bg-red-500/10"
              : isProcessing
              ? "border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10"
              : "border-green-500/50 text-green-500 hover:bg-green-500/10"
          }`}
        >
          {isProcessing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : hasErrors ? (
            <AlertCircle className="w-3.5 h-3.5" />
          ) : (
            <Check className="w-3.5 h-3.5" />
          )}
          <span className="text-xs font-medium">
            {pendingOrders.length} Order{pendingOrders.length !== 1 ? "s" : ""}
          </span>
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[320px]">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Order Tracker</span>
          <div className="flex items-center gap-2 text-xs font-normal">
            {lockingOrders.length > 0 && <span className="text-blue-500">{lockingOrders.length} locking</span>}
            {closingOrders.length > 0 && <span className="text-yellow-500">{closingOrders.length} closing</span>}
            {lockedOrders.length > 0 && <span className="text-green-500">{lockedOrders.length} ready</span>}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="max-h-[300px] overflow-y-auto">
          {pendingOrders.map((lockedOrder) => {
            const order = lockedOrder.orderData;
            const status = lockedOrder.status;
            const isRejected = rejectedOrders.has(lockedOrder.orderId);
            const hasError = status === "error";
            const canRetry = (isRejected || hasError || status === "locked") && isOrderLocked(order);
            const canClose = status === "locked" && !isRejected && isOrderLocked(order);

            return (
              <div key={lockedOrder.orderId} className="px-2 py-2 hover:bg-muted/50 rounded-md mx-1 my-0.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium truncate max-w-[120px]">
                    {lockedOrder.orderId.slice(0, 10)}...
                  </span>
                  <div className="flex items-center gap-1.5">
                    {(isRejected || hasError) && (
                      <span className="text-xs bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded">
                        {hasError ? "Failed" : "Rejected"}
                      </span>
                    )}
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded flex items-center gap-1 ${getStatusColor(
                        status,
                        isRejected
                      )}`}
                    >
                      {getStatusIcon(status, isRejected)}
                      {status}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground mb-2">
                  {(order.amountForSale / DECIMALS).toLocaleString()} CNPY → $
                  {(order.requestedAmount / DECIMALS).toFixed(2)}
                </div>

                <div className="flex items-center gap-1.5">
                  {canClose && !canRetry && (
                    <Button
                      size="sm"
                      variant="default"
                      className="h-6 text-xs flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleRetryClose(lockedOrder.orderId, order)}
                      disabled={isRetrying === lockedOrder.orderId}
                    >
                      {isRetrying === lockedOrder.orderId ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <>
                          <Check className="w-3 h-3 mr-1" />
                          Close Order
                        </>
                      )}
                    </Button>
                  )}

                  {canRetry && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-xs flex-1 border-blue-500/50 text-blue-500 hover:bg-blue-500/10"
                      onClick={() => handleRetryClose(lockedOrder.orderId, order)}
                      disabled={isRetrying === lockedOrder.orderId}
                    >
                      {isRetrying === lockedOrder.orderId ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <>
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Retry Close
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {(errorOrders.length > 0 || rejectedCount > 0) && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                size="sm"
                className="w-full h-8 text-xs bg-blue-500 hover:bg-blue-600"
                onClick={() => {
                  // Retry all failed orders
                  pendingOrders.forEach((lockedOrder) => {
                    const isRejected = rejectedOrders.has(lockedOrder.orderId);
                    const hasError = lockedOrder.status === "error";
                    if ((isRejected || hasError) && isOrderLocked(lockedOrder.orderData)) {
                      handleRetryClose(lockedOrder.orderId, lockedOrder.orderData);
                    }
                  });
                }}
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Retry All Failed ({errorOrders.length + rejectedCount})
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
