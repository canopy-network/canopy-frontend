"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Maximize2, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockOrderBookEntries } from "@/components/amm/mock/order-book-data";

type SortOption = "price" | "volume";

interface OrderBookProps {
  baseTokenSymbol: string;
  quoteTokenSymbol: string;
}

export function OrderBook({
  baseTokenSymbol,
  quoteTokenSymbol,
}: OrderBookProps) {
  const [sortBy, setSortBy] = useState<SortOption>("price");
  const [expandModalOpen, setExpandModalOpen] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());

  const sortedOrders = [...mockOrderBookEntries].sort((a, b) => {
    if (sortBy === "price") {
      return parseFloat(b.price) - parseFloat(a.price);
    }
    return parseFloat(b.volume) - parseFloat(a.volume);
  });

  const displayedOrders = sortedOrders.slice(0, 10);

  const toggleOrderSelection = (orderId: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const handleBulkPurchase = () => {
    // TODO: Implement bulk purchase logic
    console.log("Purchasing orders:", Array.from(selectedOrders));
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Order Book</h3>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 text-sm",
                  sortBy === "price"
                    ? "bg-[#1B2D1C] text-[#8CEC8D]"
                    : "bg-[#2E2F30] hover:bg-[#2E2F30]/80",
                )}
                onClick={() => setSortBy("price")}
              >
                Best Price
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 text-sm",
                  sortBy === "volume"
                    ? "bg-[#1B2D1C] text-[#8CEC8D]"
                    : "bg-[#2E2F30] hover:bg-[#2E2F30]/80",
                )}
                onClick={() => setSortBy("volume")}
              >
                Best Volume
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {displayedOrders.map((order) => {
            const isSelected = selectedOrders.has(order.id);
            return (
              <div
                key={order.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors",
                  isSelected
                    ? "bg-[#1B2D1C] border-2 border-[#8CEC8D]"
                    : "bg-muted/50 hover:bg-muted/70",
                )}
                onClick={() => toggleOrderSelection(order.id)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                      isSelected
                        ? "bg-[#8CEC8D] border-[#8CEC8D]"
                        : "border-muted-foreground",
                    )}
                  >
                    {isSelected && (
                      <svg
                        className="w-3 h-3 text-black"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="font-semibold">
                      {order.amount} {baseTokenSymbol}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      1 {baseTokenSymbol} = {order.price} {quoteTokenSymbol}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {selectedOrders.size > 0 && (
            <Button
              size="lg"
              className="w-full mt-4 bg-[#30B724] hover:bg-[#30B724]/90 text-black font-semibold"
              onClick={handleBulkPurchase}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Buy Selected ({selectedOrders.size} orders)
            </Button>
          )}
          {sortedOrders.length > 10 && (
            <Button
              variant="outline"
              className="w-full mt-4 h-12 text-base font-semibold bg-[#1B2D1C] hover:bg-[#1B2D1C]/80 text-[#8CEC8D] border-[#8CEC8D]/30"
              onClick={() => setExpandModalOpen(true)}
            >
              <Maximize2 className="h-5 w-5 mr-2" />
              Expand ({sortedOrders.length} orders)
            </Button>
          )}
        </CardContent>
      </Card>

      <Dialog open={expandModalOpen} onOpenChange={setExpandModalOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] bg-[#171717]">
          <DialogHeader>
            <DialogTitle className="border-b border-dashed pb-3">
              Full Order Book
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 text-sm",
                  sortBy === "price"
                    ? "bg-[#1B2D1C] text-[#8CEC8D]"
                    : "bg-[#2E2F30] hover:bg-[#2E2F30]/80",
                )}
                onClick={() => setSortBy("price")}
              >
                Best Price
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 text-sm",
                  sortBy === "volume"
                    ? "bg-[#1B2D1C] text-[#8CEC8D]"
                    : "bg-[#2E2F30] hover:bg-[#2E2F30]/80",
                )}
                onClick={() => setSortBy("volume")}
              >
                Best Volume
              </Button>
            </div>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {sortedOrders.map((order) => {
                const isSelected = selectedOrders.has(order.id);
                return (
                  <div
                    key={order.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors",
                      isSelected
                        ? "bg-[#1B2D1C] border-2 border-[#8CEC8D]"
                        : "bg-muted/50 hover:bg-muted/70",
                    )}
                    onClick={() => toggleOrderSelection(order.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                          isSelected
                            ? "bg-[#8CEC8D] border-[#8CEC8D]"
                            : "border-muted-foreground",
                        )}
                      >
                        {isSelected && (
                          <svg
                            className="w-3 h-3 text-black"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="3"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="font-semibold">
                          {order.amount} {baseTokenSymbol}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          1 {baseTokenSymbol} = {order.price} {quoteTokenSymbol}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {selectedOrders.size > 0 && (
              <Button
                size="lg"
                className="w-full bg-[#30B724] hover:bg-[#30B724]/90 text-black font-semibold"
                onClick={handleBulkPurchase}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Buy Selected ({selectedOrders.size} orders)
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
