"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChevronDown, ChevronRight, Clock, CheckCircle, XCircle, Edit2, X, Loader2 } from "lucide-react";
import { useWalletStore } from "@/lib/stores/wallet-store";
import { toast } from "sonner";

type OrderStatus = "active" | "filled" | "cancelled";

export interface UserOrder {
  id: string;
  cnpyAmount: number;
  expectedReceive: number;
  destinationToken: string;
  pricePerCnpy: number;
  status: OrderStatus;
  createdAt: string;
  sellerAddress: string;
  committeeId: number;
}

interface UserOrdersProps {
  orders: UserOrder[];
  isLoading?: boolean;
  onOrderCancelled?: () => void;
}

// Helper to normalize addresses for comparison
function normalizeAddress(address: string): string {
  if (!address) return "";
  return address.replace(/^0x/i, "").toLowerCase();
}

export default function UserOrders({ orders, isLoading = false, onOrderCancelled }: UserOrdersProps) {
  const [showOrders, setShowOrders] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<UserOrder | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const { currentWallet, deleteOrder, isLoading: walletLoading } = useWalletStore();

  const getStatusIcon = (status: OrderStatus) => {
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
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "active":
        return "text-green-500";
      case "filled":
        return "text-green-500";
      case "cancelled":
        return "text-red-500";
      default:
        return "text-muted-foreground";
    }
  };

  const handleEdit = (order: UserOrder) => {
    // TODO: Implement edit functionality - navigate to convert tab with pre-filled values
    console.log("Edit order", order);
    toast.info("Edit functionality coming soon");
  };

  const handleCancel = async (order: UserOrder) => {
    if (!currentWallet) {
      toast.error("Please connect a wallet to cancel orders");
      return;
    }

    if (!currentWallet.isUnlocked) {
      toast.error("Please unlock your wallet to cancel orders");
      return;
    }

    // Verify ownership: only the order owner can cancel
    const normalizedWalletAddress = normalizeAddress(currentWallet.address);
    const normalizedOrderSellerAddress = normalizeAddress(order.sellerAddress);

    if (normalizedWalletAddress !== normalizedOrderSellerAddress) {
      toast.error("You can only cancel your own orders");
      return;
    }

    setIsCancelling(true);
    try {
      // Call deleteOrder to send the transaction on Canopy chain
      const txHash = await deleteOrder(order.id, order.committeeId);

      toast.success(`Order cancelled! TX: ${txHash.slice(0, 16)}...`);

      // Refresh orders after a delay to allow blockchain to process
      setTimeout(() => {
        onOrderCancelled?.();
      }, 3000);
    } catch (e) {
      console.error("Failed to cancel order", e);
      const errorMessage = e instanceof Error ? e.message : "Failed to cancel order";
      toast.error(errorMessage);
    } finally {
      setIsCancelling(false);
      setOrderToCancel(null);
    }
  };

  if (orders.length === 0 && !isLoading) {
    return null;
  }

  return (
    <>
      <div className="px-4">
        <Card className="bg-muted/30 p-4">
          <button onClick={() => setShowOrders(!showOrders)} className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground transition-transform ${showOrders ? "" : "-rotate-90"}`}
              />
              <span className="text-sm font-semibold">Your Orders</span>
              <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{orders.length}</span>
            </div>
            <a
              href="/orderbook"
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              View all
              <ChevronRight className="w-3 h-3" />
            </a>
          </button>

          {showOrders && (
            <div className="mt-4 space-y-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading orders...</span>
                </div>
              ) : (
                <>
                  {orders.slice(0, 3).map((order) => (
                    <div
                      key={order.id}
                      className="flex items-start justify-between p-4 rounded-lg bg-background/50 border border-border"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {getStatusIcon(order.status)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-semibold">{order.cnpyAmount.toLocaleString()} CNPY</span>
                            <span className="text-muted-foreground">→</span>
                            <span className="text-base font-medium">
                              ${order.expectedReceive.toFixed(2)} {order.destinationToken}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span>Price: ${order.pricePerCnpy.toFixed(3)}/CNPY</span>
                            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                            <span className={`capitalize ${getStatusColor(order.status)}`}>{order.status}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions - Only show for active orders */}
                      {order.status === "active" && (
                        <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(order)} className="h-8 w-8 p-0">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                            onClick={() => setOrderToCancel(order)}
                            disabled={isCancelling || walletLoading || !currentWallet}
                          >
                            {isCancelling && orderToCancel?.id === order.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                  {orders.length > 3 && (
                    <div className="text-center text-xs text-muted-foreground pt-2">
                      +{orders.length - 3} more orders
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={!!orderToCancel} onOpenChange={(open) => !open && setOrderToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this order for {orderToCancel?.cnpyAmount.toLocaleString()} CNPY? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Order</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (orderToCancel) {
                  handleCancel(orderToCancel);
                }
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Cancel Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
