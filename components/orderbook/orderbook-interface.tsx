"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, TrendingUp, Loader2 } from "lucide-react";
import { orderbookApi } from "@/lib/api";
import { BuyOrderDialog } from "./buy-order-dialog";
import ConvertTab from "@/components/trading/convert-tab";
import type { OrderBookApiOrder, DisplayOrder } from "@/types/orderbook";
import type { BridgeToken } from "@/types/trading";

// Chain IDs for cross-chain swaps:
// Chain 1: Root chain (CNPY)
// Chain 2: USDT
// Chain 3: USDC (oracle)
// Pools: 1 <-> 2 (CNPY/USDT), 1 <-> 3 (CNPY/USDC)

const DECIMALS = 1_000_000; // 6 decimals
const ORDER_COMMITTEE_ID = 3; // Committee responsible for counter-asset swaps

function transformOrder(order: OrderBookApiOrder): DisplayOrder {
  const amount = order.amountForSale / DECIMALS;
  const total = order.requestedAmount / DECIMALS;
  const price = order.requestedAmount / order.amountForSale;
  return {
    id: order.id,
    price,
    amount,
    total,
  };
}

export function OrderBookInterface() {
  // API state
  const [sellOrders, setSellOrders] = useState<DisplayOrder[]>([]);
  const [rawOrders, setRawOrders] = useState<OrderBookApiOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buy order dialog state
  const [selectedOrder, setSelectedOrder] = useState<OrderBookApiOrder | null>(
    null
  );
  const [isBuyDialogOpen, setIsBuyDialogOpen] = useState(false);

  // ConvertTab state (for Buy CNPY) - tracked for potential future use
  const [, setConvertAmount] = useState(0);
  const [, setConvertSourceToken] = useState<BridgeToken | null>(null);

  const fetchOrderBook = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await orderbookApi.getOrderBook({
        chainId: ORDER_COMMITTEE_ID,
      });
      // response.data is an array of ChainOrderBook
      const orderBooks = response.data || [];
      // Flatten all raw orders from all chains
      const allRawOrders = orderBooks.flatMap((book) => book.orders || []);
      // Sort by price descending (highest price first for sell orders)
      allRawOrders.sort((a, b) => {
        const priceA = a.requestedAmount / a.amountForSale;
        const priceB = b.requestedAmount / b.amountForSale;
        return priceB - priceA;
      });
      setRawOrders(allRawOrders);
      // Transform for display
      setSellOrders(allRawOrders.map(transformOrder));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch order book"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrderBook();
  }, [fetchOrderBook]);

  // Handle clicking on a sell order to buy
  const handleOrderClick = (orderId: string) => {
    const order = rawOrders.find((o) => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
      setIsBuyDialogOpen(true);
    }
  };

  // Handle successful buy order
  const handleBuySuccess = () => {
    setIsBuyDialogOpen(false);
    setSelectedOrder(null);
    // Refresh order book
    setTimeout(() => fetchOrderBook(), 2000);
  };

  // Calculate current price from best sell order, or use placeholder
  const currentPrice =
    sellOrders.length > 0 ? sellOrders[sellOrders.length - 1].price : 0;
  const priceChange = 0;
  const priceChangePercent = 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Order Book */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Order Book - CNPY/USDC</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold">
                {currentPrice > 0 ? `$${currentPrice.toFixed(4)}` : "--"}
              </div>
              {currentPrice > 0 && (
                <Badge
                  variant="default"
                  className="bg-green-500/10 text-green-500"
                >
                  <TrendingUp className="w-3 h-3 mr-1" />+
                  {priceChange.toFixed(4)} ({priceChangePercent}%)
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">
                Loading order book...
              </span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12 text-red-500">
              {error}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Sell Orders */}
              <div>
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Price (USDC)</span>
                  <span>Amount (CNPY)</span>
                  <span>Total (USDC)</span>
                </div>
                <div className="space-y-1">
                  {sellOrders.length > 0 ? (
                    sellOrders.map((order) => (
                      <button
                        key={order.id}
                        onClick={() => handleOrderClick(order.id)}
                        className="w-full flex justify-between items-center p-2 rounded hover:bg-red-500/10 border-l-2 border-red-500/20 cursor-pointer transition-colors text-left"
                      >
                        <span className="text-red-500 font-mono">
                          {order.price.toFixed(4)}
                        </span>
                        <span className="font-mono">
                          {order.amount.toLocaleString()}
                        </span>
                        <span className="font-mono">
                          ${order.total.toLocaleString()}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No sell orders available
                    </div>
                  )}
                </div>
              </div>

              {/* Current Price */}
              <div className="flex items-center justify-center py-2 border-y">
                <div className="flex items-center space-x-2">
                  <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                  <span className="text-lg font-bold">
                    {currentPrice > 0 ? `$${currentPrice.toFixed(4)}` : "--"}
                  </span>
                  <span className="text-sm text-green-500">Last Price</span>
                </div>
              </div>

              {/* Buy Orders */}
              <div>
                <div className="space-y-1">
                  <div className="text-center py-4 text-muted-foreground">
                    No buy orders available
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trading Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Place Order</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ConvertTab
            isPreview={false}
            onAmountChange={setConvertAmount}
            onSourceTokenChange={setConvertSourceToken}
          />
        </CardContent>
      </Card>

      {/* Buy Order Dialog */}
      <BuyOrderDialog
        order={selectedOrder}
        open={isBuyDialogOpen}
        onOpenChange={setIsBuyDialogOpen}
        onSuccess={handleBuySuccess}
      />
    </div>
  );
}
