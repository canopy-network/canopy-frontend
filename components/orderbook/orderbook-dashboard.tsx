"use client";

import { WalletHeader } from "@/components/wallet/wallet-header";
import { Container } from "@/components/layout/container";
import OrderBookTab from "@/components/orderbook/orders-tab";
import TradingModule from "@/components/trading/trading-module";

export function OrderBookDashboard() {
  return (
    <Container type="boxed" className="flex flex-row gap-6">
      <div className="flex flex-col gap-6 w-full">
        <WalletHeader />
        <OrderBookTab />
      </div>

      <div>
        <TradingModule />
      </div>
    </Container>
  );
}
