"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RefreshCw, FlaskRound, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SwapTab } from "./trade-panel/swap-tab";
import { LiquidityTab, LiquidityAction } from "./trade-panel/liquidity-tab";
import { ConvertTab } from "./trade-panel/convert-tab";
import { OrderBook } from "./order-book/order-book";
import { LiquidityConfirmationPanel } from "./trade-panel/liquidity-confirmation-panel";
import { PoolToken } from "../../types/amm/pool";

enum TradeTab {
  Swap = "swap",
  Liquidity = "liquidity",
  Convert = "convert",
}

interface TradePanelProps {
  poolId: string;
  baseToken: PoolToken;
  quoteToken: PoolToken;
  currentPrice: string;
  availableTokens?: PoolToken[];
}

export function TradePanel({
  baseToken,
  quoteToken,
  currentPrice,
  availableTokens = [],
}: TradePanelProps) {
  const [activeTab, setActiveTab] = useState<string>(TradeTab.Swap);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<LiquidityAction>(
    LiquidityAction.Deposit,
  );
  const [selectedBaseToken, setSelectedBaseToken] =
    useState<PoolToken>(baseToken);

  const handleOpenConfirm = (action: LiquidityAction) => {
    setConfirmAction(action);
    setIsConfirmOpen(true);
  };

  const handleTokenSelect = (token: PoolToken) => {
    setSelectedBaseToken(token);
  };

  const getTabIcon = (tab: TradeTab) => {
    switch (tab) {
      case TradeTab.Swap:
        return <RefreshCw className="h-4 w-4" />;
      case TradeTab.Liquidity:
        return <FlaskRound className="h-4 w-4" />;
      case TradeTab.Convert:
        return <ArrowUpDown className="h-4 w-4" />;
    }
  };

  // Mock values - replace with actual data
  const baseTokenPrice = "$1.23";
  const cnpyPrice = "$0.45";
  const amountUsd = "$250.00";

  return (
    <div className="space-y-4">
      <Card className="relative overflow-hidden">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2 w-full bg-[#1C1C1C] p-1 rounded-lg">
              {Object.values(TradeTab).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg capitalize font-medium transition-colors",
                    activeTab === tab
                      ? "bg-[#1B2D1C] text-[#8CEC8D]"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {tab}
                  {getTabIcon(tab)}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {activeTab === TradeTab.Swap && (
            <SwapTab
              baseTokenSymbol={baseToken.symbol}
              quoteTokenSymbol={quoteToken.symbol}
              currentPrice={currentPrice}
            />
          )}

          {activeTab === TradeTab.Liquidity && (
            <LiquidityTab
              baseToken={selectedBaseToken}
              quoteToken={quoteToken}
              availableTokens={availableTokens}
              onOpenConfirm={handleOpenConfirm}
              onTokenSelect={handleTokenSelect}
            />
          )}

          {activeTab === TradeTab.Convert && (
            <ConvertTab
              baseTokenSymbol={baseToken.symbol}
              quoteTokenSymbol={quoteToken.symbol}
              currentPrice={currentPrice}
            />
          )}
        </CardContent>

        {activeTab === TradeTab.Liquidity && (
          <LiquidityConfirmationPanel
            isOpen={isConfirmOpen}
            action={confirmAction}
            baseToken={selectedBaseToken}
            quoteToken={quoteToken}
            amountUsd={amountUsd}
            baseTokenPrice={baseTokenPrice}
            cnpyPrice={cnpyPrice}
            onClose={() => setIsConfirmOpen(false)}
            onConfirm={() => {
              setIsConfirmOpen(false);
            }}
          />
        )}
      </Card>

      {activeTab === TradeTab.Convert && (
        <OrderBook
          baseTokenSymbol={baseToken.symbol}
          quoteTokenSymbol={quoteToken.symbol}
        />
      )}
    </div>
  );
}
