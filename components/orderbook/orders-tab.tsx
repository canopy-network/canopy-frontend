"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
import { toast } from "sonner";
import { Edit2, X, Clock, CheckCircle, XCircle, Filter, Loader2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { orderbookApi } from "@/lib/api";
import { useWalletStore } from "@/lib/stores/wallet-store";
import type { OrderBookApiOrder } from "@/types/orderbook";
import { isOrderLocked } from "@/types/orderbook";
import { useLockOrder } from "@/lib/hooks/use-lock-order";
import { useCloseOrder } from "@/lib/hooks/use-close-order";
import { useAccount, useChainId } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { USDC_ADDRESS } from "@/lib/web3/config";
import { OrderCard } from "./order-card";

export type OrderStatus = "active" | "filled" | "cancelled";

export interface SellOrder {
  id: string;
  cnpyAmount: number;
  expectedReceive: number;
  destinationToken: string;
  pricePerCnpy: number;
  destinationChain: string;
  createdAt: string;
  status: OrderStatus;
  feeAmount: number;
  fee: number; // Decimal, e.g., 0.01 for 1%
  // Always false - all orders are CNPY → USDC
  isSellingUsdcForCnpy?: boolean;
  // Amount being sold (always CNPY)
  amountSelling?: number;
  // Committee ID for the order (needed for deletion)
  committeeId: number;
  // Seller's Canopy address (sellersSendAddress) - used to verify ownership
  sellerAddress: string;
}

type FilterType = "all" | OrderStatus;
type SortDirection = "desc" | "asc"; // desc = newest first, asc = oldest first

const DECIMALS = 1_000_000; // 6 decimals
const ORDER_COMMITTEE_ID = 3; // Committee responsible for counter-asset swaps

// USDC address on Ethereum Mainnet (normalized for comparison)
const USDC_ETHEREUM_ADDRESS = "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";

// Helper to normalize addresses for comparison
function normalizeAddress(address: string): string {
  if (!address) return "";
  // Remove 0x prefix if present and convert to lowercase
  return address.replace(/^0x/i, "").toLowerCase();
}

// Transform API order to SellOrder format
function transformApiOrderToSellOrder(order: OrderBookApiOrder): SellOrder {
  // All orders are CNPY → USDC
  // amountForSale = CNPY amount (what the seller is selling)
  // requestedAmount = USDC amount (what the seller wants to receive)
  const cnpyAmount = order.amountForSale / DECIMALS;
  const totalUsdc = order.requestedAmount / DECIMALS;

  const expectedReceive = totalUsdc; // User receives USDC
  const pricePerCnpy = order.requestedAmount / order.amountForSale; // USDC per CNPY
  const destinationToken = "USDC";
  const amountSelling = cnpyAmount; // CNPY being sold

  // Determine status based on close order state
  // If order is locked (has buyerReceiveAddress), it means a buyer has locked it
  // The order is considered "filled" when it has been closed (payment sent)
  // Locked orders remain "active" until payment is sent, so the Close Order button can appear
  // In a real implementation, you'd check if the close order transaction has been confirmed
  const orderIsLocked = isOrderLocked(order);
  // Keep all orders as "active" for now - locked orders need to show Close Order button
  // An order should only be "filled" after the close order transaction is confirmed
  // TODO: Add logic to detect when close order transaction is confirmed and mark as "filled"
  const status: OrderStatus = "active";

  // Hardcode fee (2% for now)
  const feePercent = 0.02;
  const feeAmount = expectedReceive * feePercent;

  // Hardcode date (using current time for now)
  const createdAt = new Date().toISOString();

  // Map committee ID to chain name
  // Committee 3 is typically USDC on Ethereum
  const destinationChain = order.committee === 3 ? "ethereum" : `chain-${order.committee}`;

  return {
    id: order.id,
    cnpyAmount,
    expectedReceive,
    destinationToken,
    pricePerCnpy,
    destinationChain,
    createdAt,
    status,
    feeAmount,
    fee: feePercent,
    isSellingUsdcForCnpy: false, // All orders are CNPY → USDC
    amountSelling,
    committeeId: order.committee,
    sellerAddress: order.sellersSendAddress, // Store seller address for ownership verification
  };
}

// Placeholder orders for demonstration
const PLACEHOLDER_ORDERS: SellOrder[] = [
  {
    id: "order-placeholder-1",
    cnpyAmount: 1000,
    expectedReceive: 980.0,
    destinationToken: "USDC",
    pricePerCnpy: 0.98,
    destinationChain: "ethereum",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    status: "active",
    feeAmount: 20.0,
    fee: 0.02,
    isSellingUsdcForCnpy: false,
    amountSelling: 1000,
    committeeId: 3,
    sellerAddress: "", // Placeholder - will be set when wallet is connected
  },
  {
    id: "order-placeholder-2",
    cnpyAmount: 2500,
    expectedReceive: 2425.0,
    destinationToken: "USDC",
    pricePerCnpy: 0.97,
    destinationChain: "polygon",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    status: "active",
    feeAmount: 75.0,
    fee: 0.03,
    isSellingUsdcForCnpy: false,
    amountSelling: 2500,
    committeeId: 3,
    sellerAddress: "", // Placeholder - will be set when wallet is connected
  },
  {
    id: "order-placeholder-3",
    cnpyAmount: 500,
    expectedReceive: 490.0,
    destinationToken: "USDT",
    pricePerCnpy: 0.98,
    destinationChain: "ethereum",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    status: "filled",
    feeAmount: 10.0,
    fee: 0.02,
    isSellingUsdcForCnpy: false,
    amountSelling: 500,
    committeeId: 3,
    sellerAddress: "", // Placeholder - will be set when wallet is connected
  },
  {
    id: "order-placeholder-4",
    cnpyAmount: 750,
    expectedReceive: 735.0,
    destinationToken: "USDC",
    pricePerCnpy: 0.98,
    destinationChain: "base",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    status: "cancelled",
    feeAmount: 15.0,
    fee: 0.02,
    isSellingUsdcForCnpy: false,
    amountSelling: 750,
    committeeId: 3,
    sellerAddress: "", // Placeholder - will be set when wallet is connected
  },
];

export default function OrdersTab() {
  const [orders, setOrders] = useState<SellOrder[]>([]);
  const [rawOrders, setRawOrders] = useState<OrderBookApiOrder[]>([]); // Store raw orders for close order tracking
  const [filter, setFilter] = useState<FilterType>("all");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [orderToCancel, setOrderToCancel] = useState<SellOrder | null>(null);
  const [orderToLock, setOrderToLock] = useState<OrderBookApiOrder | null>(null);
  const [orderToClose, setOrderToClose] = useState<OrderBookApiOrder | null>(null);
  const [showPlaceholders, setShowPlaceholders] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const { currentWallet, deleteOrder, isLoading: walletLoading } = useWalletStore();

  // Ethereum wallet (wagmi)
  const { address: ethAddress, isConnected: isEthConnected } = useAccount();
  const chainId = useChainId();
  const { openConnectModal } = useConnectModal();
  // Only use Ethereum mainnet (chain ID 1) for USDC
  const usdcAddress = USDC_ADDRESS;

  // Lock order hook for non-owned orders
  // Only create hook when we have an order to lock
  const [currentLockingOrderId, setCurrentLockingOrderId] = useState<string | null>(null);
  const isLockingRef = useRef(false); // Prevent multiple simultaneous lock attempts
  const hasSentLockRef = useRef<string | null>(null); // Track which order we've already sent lock for

  const lockOrder = useLockOrder({
    order: orderToLock, // Only set when user clicks lock
    buyerCanopyAddress: currentWallet?.address || "",
  });

  // Close order hook for locked orders
  const closeOrder = useCloseOrder({
    order: orderToClose, // Only set when user clicks close
  });

  // Ref to track if the request is still valid (not cancelled)
  const requestIdRef = useRef(0);

  // Fetch all orders from API (both owned and non-owned)
  const fetchUserOrders = useCallback(async () => {
    // Only run on client side
    if (typeof window === "undefined") {
      return;
    }

    // Increment request ID to cancel previous request handling
    const currentRequestId = ++requestIdRef.current;

    setIsLoading(true);
    setError(null);

    try {
      const response = await orderbookApi.getOrderBook({
        chainId: ORDER_COMMITTEE_ID,
      });

      // Check if this request was superseded by a newer one
      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      // response.data is an array of ChainOrderBook
      const orderBooks = response.data || [];
      // Flatten all raw orders from all chains
      const allRawOrders = orderBooks.flatMap((book) => book.orders || []);

      // Store all raw orders for close order tracking and ownership checks
      setRawOrders(allRawOrders);

      // Transform all API orders to SellOrder format
      const transformedOrders = allRawOrders.map(transformApiOrderToSellOrder);

      // Load cancelled orders from localStorage and merge (for user's orders)
      if (currentWallet?.address) {
        // Load cancelled orders from localStorage and merge
        try {
          if (typeof window !== "undefined") {
            const stored = localStorage.getItem("userSellOrders");
            if (stored) {
              const storedOrders = JSON.parse(stored) as SellOrder[];
              const cancelledOrders = storedOrders.filter((o) => o.status === "cancelled");

              // Merge cancelled orders that aren't in the API response
              const cancelledIds = new Set(transformedOrders.map((o) => o.id));
              const additionalCancelled = cancelledOrders.filter((o) => !cancelledIds.has(o.id));

              setOrders([...transformedOrders, ...additionalCancelled]);
            } else {
              setOrders(transformedOrders);
            }
          } else {
            setOrders(transformedOrders);
          }
        } catch (e) {
          console.error("Failed to load cancelled orders from localStorage", e);
          setOrders(transformedOrders);
        }

        setShowPlaceholders(false);
      } else {
        // No wallet connected, show all orders
        if (transformedOrders.length > 0) {
          setOrders(transformedOrders);
          setShowPlaceholders(false);
        } else {
          setOrders(PLACEHOLDER_ORDERS);
          setShowPlaceholders(true);
        }
      }
    } catch (err) {
      // Check if this request was superseded by a newer one
      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      console.error("Failed to fetch orders from API", err);
      setError(err instanceof Error ? err.message : "Failed to fetch orders");

      // Fallback to localStorage if API fails
      try {
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("userSellOrders");
          const storedOrders = stored ? (JSON.parse(stored) as SellOrder[]) : [];

          if (storedOrders.length > 0) {
            setOrders(storedOrders);
            setShowPlaceholders(false);
          } else {
            setOrders(PLACEHOLDER_ORDERS);
            setShowPlaceholders(true);
          }
        } else {
          setOrders(PLACEHOLDER_ORDERS);
          setShowPlaceholders(true);
        }
      } catch (e) {
        console.error("Failed to load orders from localStorage", e);
        setOrders(PLACEHOLDER_ORDERS);
        setShowPlaceholders(true);
      }
    } finally {
      // Only update loading state if this request is still current
      if (currentRequestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [currentWallet?.address]);

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") {
      return;
    }

    fetchUserOrders();

    return () => {
      // Invalidate any pending request by incrementing the request ID
      // This ensures state updates from cancelled requests are ignored
      const currentId = requestIdRef.current;
      requestIdRef.current = currentId + 1;
    };
  }, [fetchUserOrders]);

  const filteredOrders = orders
    .filter((order) => {
      // Always exclude canceled orders from the UI
      if (order.status === "cancelled") {
        return false;
      }

      // Apply the selected filter
      if (filter === "all") return true;
      return order.status === filter;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortDirection === "desc" ? dateB - dateA : dateA - dateB;
    });

  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  // Helper to get raw order data for close order tracking
  const getRawOrder = (orderId: string): OrderBookApiOrder | undefined => {
    return rawOrders.find((o) => o.id === orderId);
  };

  // Helper to check if order is locked (ready for close order)
  const isOrderReadyForClose = (orderId: string): boolean => {
    const rawOrder = getRawOrder(orderId);
    return rawOrder ? isOrderLocked(rawOrder) : false;
  };

  // Helper to check if current user is the buyer who locked this order
  const isOrderBuyer = (order: SellOrder): boolean => {
    if (!currentWallet?.address || !ethAddress) return false;
    const rawOrder = getRawOrder(order.id);
    if (!rawOrder || !rawOrder.buyerReceiveAddress) return false;

    // Check if the buyer's Canopy address matches current wallet
    const normalizedWalletAddress = normalizeAddress(currentWallet.address);
    const normalizedBuyerAddress = normalizeAddress(rawOrder.buyerReceiveAddress);
    return normalizedWalletAddress === normalizedBuyerAddress;
  };

  // Helper to check if current user is the owner of an order
  const isOrderOwner = (order: SellOrder): boolean => {
    if (!currentWallet?.address) return false;
    const normalizedWalletAddress = normalizeAddress(currentWallet.address);
    const normalizedOrderSellerAddress = normalizeAddress(order.sellerAddress);
    return normalizedWalletAddress === normalizedOrderSellerAddress;
  };

  // Handle lock order for non-owned orders
  const handleLockOrder = async (order: SellOrder) => {
    // Prevent multiple simultaneous lock attempts using ref
    if (isLockingRef.current || currentLockingOrderId || lockOrder.isPending || lockOrder.isConfirming) {
      return;
    }

    if (!currentWallet) {
      toast.error("Please connect a Canopy wallet to lock orders");
      return;
    }

    if (!currentWallet.isUnlocked) {
      toast.error("Please unlock your Canopy wallet to lock orders");
      return;
    }

    if (!isEthConnected || !ethAddress) {
      toast.error("Please connect your Ethereum wallet to lock orders");
      openConnectModal?.();
      return;
    }

    if (!usdcAddress) {
      toast.error("USDC not supported on this network. Please switch to Ethereum Mainnet.");
      return;
    }

    // Get the raw order data
    const rawOrder = getRawOrder(order.id);
    if (!rawOrder) {
      toast.error("Order not found");
      return;
    }

    // Check if this is the user's own order - cannot lock your own orders
    if (isOrderOwner(order)) {
      toast.error("You cannot lock your own orders");
      return;
    }

    // Check if order is already locked
    if (isOrderLocked(rawOrder)) {
      toast.error("This order is already locked");
      return;
    }

    // Set the ref to prevent multiple calls
    isLockingRef.current = true;

    // Mark as currently locking this specific order
    setCurrentLockingOrderId(order.id);

    // Set the order to lock - this will update the hook
    setOrderToLock(rawOrder);
  };

  // Trigger lock order when orderToLock is set (only for the specific order)
  useEffect(() => {
    // Only proceed if we have an order to lock, we're not already locking, and we haven't sent this order yet
    if (
      orderToLock &&
      currentLockingOrderId &&
      orderToLock.id === currentLockingOrderId &&
      isLockingRef.current &&
      hasSentLockRef.current !== orderToLock.id &&
      !lockOrder.isPending &&
      !lockOrder.isConfirming &&
      !lockOrder.isSuccess &&
      !lockOrder.isError
    ) {
      // Mark that we've sent the lock for this order
      hasSentLockRef.current = orderToLock.id;

      // Send the lock order
      lockOrder.sendLockOrder().catch((err) => {
        console.error("Failed to send lock order", err);
        isLockingRef.current = false;
        hasSentLockRef.current = null;
        setCurrentLockingOrderId(null);
        setOrderToLock(null);
      });
    }
    // We intentionally only depend on specific properties to prevent infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    orderToLock?.id,
    currentLockingOrderId,
    lockOrder.isPending,
    lockOrder.isConfirming,
    lockOrder.isSuccess,
    lockOrder.isError,
    lockOrder.sendLockOrder,
  ]);

  // Handle lock order success
  useEffect(() => {
    if (lockOrder.isSuccess && orderToLock && currentLockingOrderId && orderToLock.id === currentLockingOrderId) {
      toast.success(`Order locked! TX: ${lockOrder.txHash?.slice(0, 16)}...`);
      isLockingRef.current = false;
      hasSentLockRef.current = null;
      setOrderToLock(null);
      setCurrentLockingOrderId(null);
      lockOrder.reset();
      // Refresh orders after a delay to allow blockchain to process
      setTimeout(() => fetchUserOrders(), 3000);
    }
    // We intentionally only depend on specific properties to prevent infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lockOrder.isSuccess, lockOrder.txHash, orderToLock?.id, currentLockingOrderId, fetchUserOrders]);

  // Handle lock order error
  useEffect(() => {
    if (
      lockOrder.isError &&
      lockOrder.error &&
      orderToLock &&
      currentLockingOrderId &&
      orderToLock.id === currentLockingOrderId
    ) {
      toast.error(lockOrder.error.message || "Failed to lock order");
      isLockingRef.current = false;
      hasSentLockRef.current = null;
      setOrderToLock(null);
      setCurrentLockingOrderId(null);
      lockOrder.reset();
    }
    // We intentionally only depend on specific properties to prevent infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lockOrder.isError, lockOrder.error?.message, orderToLock?.id, currentLockingOrderId]);

  // Handle close order for locked orders
  const handleCloseOrder = async (order: SellOrder) => {
    if (!currentWallet) {
      toast.error("Please connect a Canopy wallet to close orders");
      return;
    }

    if (!currentWallet.isUnlocked) {
      toast.error("Please unlock your Canopy wallet to close orders");
      return;
    }

    if (!isEthConnected || !ethAddress) {
      toast.error("Please connect your Ethereum wallet to close orders");
      openConnectModal?.();
      return;
    }

    if (!usdcAddress) {
      toast.error("USDC not supported on this network. Please switch to Ethereum Mainnet.");
      return;
    }

    // Get the raw order data
    const rawOrder = getRawOrder(order.id);
    if (!rawOrder) {
      toast.error("Order not found");
      return;
    }

    // Check if order is locked
    if (!isOrderLocked(rawOrder)) {
      toast.error("This order is not locked yet. Please lock it first.");
      return;
    }

    // Verify the current user is the buyer who locked this order
    if (!isOrderBuyer(order)) {
      toast.error("You can only close orders that you have locked");
      return;
    }

    // Set the order to close
    setOrderToClose(rawOrder);
  };

  // Trigger close order when orderToClose is set
  useEffect(() => {
    if (orderToClose && !closeOrder.isPending && !closeOrder.isConfirming) {
      closeOrder.sendCloseOrder().catch((err) => {
        console.error("Failed to send close order", err);
        setOrderToClose(null);
      });
    }
    // We intentionally only depend on specific properties to prevent infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderToClose?.id, closeOrder.isPending, closeOrder.isConfirming]);

  // Handle close order success
  useEffect(() => {
    if (closeOrder.isSuccess && orderToClose) {
      toast.success(`Order closed! Payment sent. TX: ${closeOrder.txHash?.slice(0, 16)}...`);
      setOrderToClose(null);
      closeOrder.reset();
      // Refresh orders after a delay to allow blockchain to process
      setTimeout(() => fetchUserOrders(), 3000);
    }
    // We intentionally only depend on specific properties to prevent infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closeOrder.isSuccess, closeOrder.txHash, orderToClose?.id, fetchUserOrders]);

  // Handle close order error
  useEffect(() => {
    if (closeOrder.isError && closeOrder.error && orderToClose) {
      toast.error(closeOrder.error.message || "Failed to close order");
      setOrderToClose(null);
      closeOrder.reset();
    }
    // We intentionally only depend on specific properties to prevent infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closeOrder.isError, closeOrder.error?.message, orderToClose?.id]);

  const handleCancel = async (order: SellOrder) => {
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

      // Update local state
      const updatedOrders = orders.map((o) => (o.id === order.id ? { ...o, status: "cancelled" as OrderStatus } : o));
      setOrders(updatedOrders);

      // Save to localStorage
      if (typeof window !== "undefined" && !showPlaceholders) {
        localStorage.setItem("userSellOrders", JSON.stringify(updatedOrders));
      }

      // Refresh orders after a delay to allow blockchain to process
      setTimeout(() => fetchUserOrders(), 3000);
    } catch (e) {
      console.error("Failed to cancel order", e);
      const errorMessage = e instanceof Error ? e.message : "Failed to cancel order";
      toast.error(errorMessage);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleEdit = (order: SellOrder) => {
    // TODO: Implement edit functionality - navigate to convert tab with pre-filled values
    console.log("Edit order", order);
    toast.info("Edit functionality coming soon");
  };

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
            <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Loading orders...</h3>
            <p className="text-sm text-muted-foreground">Fetching your orders from the orderbook</p>
          </div>
        </div>
      </Card>
    );
  }

  if (error && orders.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Failed to load orders</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchUserOrders} variant="outline">
              Retry
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
            <p className="text-sm text-muted-foreground">
              {!currentWallet
                ? "Connect a wallet to see your orders"
                : "Create a sell order in the Convert tab to see it here"}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {showPlaceholders && (
        <Card className="p-4 bg-muted/50 border-dashed">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>
              {!currentWallet
                ? "Connect a wallet to see your orders"
                : "Showing placeholder data. Create your first order to see real data here."}
            </span>
          </div>
        </Card>
      )}

      {error && orders.length > 0 && (
        <Card className="p-4 bg-yellow-500/10 border-yellow-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-yellow-600">
              <Clock className="w-4 h-4" />
              <span>Some orders may not be up to date. {error}</span>
            </div>
            <Button onClick={fetchUserOrders} variant="outline" size="sm">
              Refresh
            </Button>
          </div>
        </Card>
      )}

      {/* Filter and Sort Buttons */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <div className="flex gap-2">
          {(["all", "active", "filled"] as FilterType[]).map((status) => (
            <Button
              key={status}
              variant={filter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(status)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={toggleSortDirection} className="flex items-center gap-1">
          {sortDirection === "desc" ? <ArrowDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />}
          {sortDirection === "desc" ? "Newest" : "Oldest"}
        </Button>
        <div className="ml-auto text-sm text-muted-foreground">
          {filteredOrders.length} {filteredOrders.length === 1 ? "order" : "orders"}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            showPlaceholders={showPlaceholders}
            isCancelling={isCancelling}
            walletLoading={walletLoading}
            currentWallet={currentWallet}
            isEthConnected={isEthConnected}
            usdcAddress={usdcAddress}
            closeOrder={closeOrder}
            lockOrder={lockOrder}
            currentLockingOrderId={currentLockingOrderId}
            isOrderReadyForClose={isOrderReadyForClose}
            isOrderOwner={isOrderOwner}
            isOrderBuyer={isOrderBuyer}
            normalizeAddress={normalizeAddress}
            handleEdit={handleEdit}
            setOrderToCancel={setOrderToCancel}
            handleCloseOrder={handleCloseOrder}
            handleLockOrder={handleLockOrder}
          />
        ))}
      </div>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={!!orderToCancel} onOpenChange={(open) => !open && setOrderToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this order for{" "}
              {orderToCancel?.isSellingUsdcForCnpy
                ? `$${orderToCancel.amountSelling?.toFixed(2) || "0.00"} USDC`
                : `${orderToCancel?.cnpyAmount.toLocaleString()} CNPY`}
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Order</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (orderToCancel) {
                  handleCancel(orderToCancel);
                  setOrderToCancel(null);
                }
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Cancel Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
