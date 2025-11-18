"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RefreshCw, FlaskRound, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SwapTab } from "./trade-panel/swap-tab";
import { LiquidityTab } from "./trade-panel/liquidity-tab";
import { ConvertTab } from "./trade-panel/convert-tab";

enum TradeTab {
  Swap = "swap",
  Liquidity = "liquidity",
  Convert = "convert",
}

interface TradePanelProps {
  poolId: string;
  baseTokenSymbol: string;
  quoteTokenSymbol: string;
  currentPrice: string;
}

export function TradePanel({
  baseTokenSymbol,
  quoteTokenSymbol,
  currentPrice,
}: TradePanelProps) {
  const [activeTab, setActiveTab] = useState<string>(TradeTab.Swap);

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

  return (
    <div className="space-y-4">
      <Card>
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
              baseTokenSymbol={baseTokenSymbol}
              quoteTokenSymbol={quoteTokenSymbol}
              currentPrice={currentPrice}
            />
          )}

          {activeTab === TradeTab.Liquidity && (
            <LiquidityTab
              baseTokenSymbol={baseTokenSymbol}
              quoteTokenSymbol={quoteTokenSymbol}
              currentPrice={currentPrice}
            />
          )}

          {activeTab === TradeTab.Convert && (
            <ConvertTab
              baseTokenSymbol={baseTokenSymbol}
              quoteTokenSymbol={quoteTokenSymbol}
              currentPrice={currentPrice}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
