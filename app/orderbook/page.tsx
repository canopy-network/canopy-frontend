"use client";

// Force SSR for this page
export const dynamic = "force-dynamic";

import { OrderBookDashboard } from "@/components/orderbook/orderbook-dashboard";

export default function OrderBookPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">On/Off Ramp</h1>
          <p className="text-muted-foreground">
            Large trade settlement with cross-chain atomic swaps
          </p>
        </div>
      </div>

      <OrderBookDashboard />
    </div>
  );
}
