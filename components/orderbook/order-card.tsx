"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, X, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import type { Wallet } from "@/lib/stores/wallet-store";
import type { SellOrder, OrderStatus } from "./orders-tab";

interface OrderCardProps {
  order: SellOrder;
  showPlaceholders: boolean;
  isCancelling: boolean;
  walletLoading: boolean;
  currentWallet: Wallet | null;
  isEthConnected: boolean;
  usdcAddress: string | undefined;
  closeOrder: {
    isPending: boolean;
    isConfirming: boolean;
  };
  lockOrder: {
    isPending: boolean;
    isConfirming: boolean;
  };
  currentLockingOrderId: string | null;
  isOrderReadyForClose: (orderId: string) => boolean;
  isOrderOwner: (order: SellOrder) => boolean;
  isOrderBuyer: (order: SellOrder) => boolean;
  normalizeAddress: (address: string) => string;
  handleEdit: (order: SellOrder) => void;
  setOrderToCancel: (order: SellOrder | null) => void;
  handleCloseOrder: (order: SellOrder) => void;
  handleLockOrder: (order: SellOrder) => void;
}

function getStatusIcon(status: OrderStatus) {
  switch (status) {
    case "active":
      return <Clock className="w-4 h-4 text-yellow-500" />;
    case "filled":
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case "cancelled":
      return <XCircle className="w-4 h-4 text-red-500" />;
    default:
      return <Clock className="w-4 h-4 text-muted-foreground" />;
  }
}

function getStatusColor(status: OrderStatus) {
  switch (status) {
    case "active":
      return "text-yellow-500 bg-yellow-500/10";
    case "filled":
      return "text-green-500 bg-green-500/10";
    case "cancelled":
      return "text-red-500 bg-red-500/10";
    default:
      return "text-muted-foreground bg-muted";
  }
}

export function OrderCard({
  order,
  showPlaceholders,
  isCancelling,
  walletLoading,
  currentWallet,
  isEthConnected,
  usdcAddress,
  closeOrder,
  lockOrder,
  currentLockingOrderId,
  isOrderReadyForClose,
  isOrderOwner,
  isOrderBuyer,
  normalizeAddress,
  handleEdit,
  setOrderToCancel,
  handleCloseOrder,
  handleLockOrder,
}: OrderCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          {/* Header */}
          <div className="flex items-center gap-3">
            {getStatusIcon(order.status)}
            <div>
              <div className="flex items-center gap-2">
                {order.isSellingUsdcForCnpy ? (
                  <>
                    <span className="text-base font-semibold">
                      ${order.amountSelling?.toFixed(2) || "0.00"} USDC
                    </span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-base font-medium">{order.expectedReceive.toLocaleString()} CNPY</span>
                  </>
                ) : (
                  <>
                    <span className="text-base font-semibold">{order.cnpyAmount.toLocaleString()} CNPY</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-base font-medium">
                      ${order.expectedReceive.toFixed(2)} {order.destinationToken}
                    </span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                <span>Price: ${order.pricePerCnpy.toFixed(3)}/CNPY</span>
                <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                <span className="capitalize">{order.destinationChain}</span>
                <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                <span>
                  {new Date(order.createdAt).toLocaleDateString()}{" "}
                  {new Date(order.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {isOrderReadyForClose(order.id) && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                    <span className="text-yellow-500 font-medium">Locked - Awaiting payment</span>
                  </>
                )}
              </div>
            </div>
            <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </div>

          {/* Details */}
          <div className="grid grid-cols-3 gap-4 pt-2 border-t border-border text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Fee</p>
              <p className="font-medium">
                ${order.feeAmount.toFixed(2)} ({(order.fee * 100).toFixed(1)}%)
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Expected Receive</p>
              <p className="font-medium">${order.expectedReceive.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Order ID</p>
              <p className="font-mono text-xs">{order.id.slice(-8)}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        {order.status === "active" && (
          <div className="flex items-center gap-2 ml-4">
            {isOrderOwner(order) ? (
              // Owner actions: Edit and Cancel
              <>
                <Button variant="outline" size="sm" onClick={() => handleEdit(order)} disabled={showPlaceholders}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                  onClick={() => setOrderToCancel(order)}
                  disabled={
                    showPlaceholders ||
                    isCancelling ||
                    walletLoading ||
                    !currentWallet ||
                    normalizeAddress(currentWallet?.address || "") !== normalizeAddress(order.sellerAddress)
                  }
                >
                  {isCancelling || walletLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </>
                  )}
                </Button>
              </>
            ) : isOrderReadyForClose(order.id) && isOrderBuyer(order) ? (
              // Buyer actions: Close Order (send payment)
              <Button
                variant="default"
                size="sm"
                className="bg-blue-500 hover:bg-blue-600"
                onClick={() => handleCloseOrder(order)}
                disabled={
                  !currentWallet ||
                  !currentWallet.isUnlocked ||
                  !isEthConnected ||
                  !usdcAddress ||
                  !isOrderReadyForClose(order.id) ||
                  !isOrderBuyer(order) ||
                  closeOrder.isPending ||
                  closeOrder.isConfirming
                }
              >
                {closeOrder.isPending || closeOrder.isConfirming ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Closing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Close Order
                  </>
                )}
              </Button>
            ) : (
              // Non-owner actions: Lock Order (Buy)
              <Button
                variant="default"
                size="sm"
                className="bg-green-500 hover:bg-green-600"
                onClick={() => handleLockOrder(order)}
                disabled={
                  !currentWallet ||
                  !currentWallet.isUnlocked ||
                  !isEthConnected ||
                  !usdcAddress ||
                  isOrderOwner(order) ||
                  isOrderReadyForClose(order.id) ||
                  lockOrder.isPending ||
                  lockOrder.isConfirming ||
                  currentLockingOrderId !== null
                }
              >
                {(lockOrder.isPending || lockOrder.isConfirming) && currentLockingOrderId === order.id ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Locking...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Lock Order
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

