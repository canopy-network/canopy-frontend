"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowDownUp,
  ChevronDown,
  RefreshCw,
  FlaskRound,
  ArrowUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SwapTab } from "./trade-panel/swap-tab";

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
  poolId,
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
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Add {baseTokenSymbol}
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="border-0 bg-transparent text-2xl font-semibold p-0 h-auto focus-visible:ring-0"
                  />
                  <Button variant="secondary" className="gap-2">
                    {baseTokenSymbol}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Add {quoteTokenSymbol}
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="border-0 bg-transparent text-2xl font-semibold p-0 h-auto focus-visible:ring-0"
                  />
                  <Button variant="secondary" className="gap-2">
                    {quoteTokenSymbol}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Share of Pool</span>
                  <span className="font-medium">0%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Current Rate</span>
                  <span className="font-medium">
                    1 {baseTokenSymbol} = {currentPrice} {quoteTokenSymbol}
                  </span>
                </div>
              </div>

              <Button size="lg" className="w-full">
                Add Liquidity
              </Button>
            </div>
          )}

          {activeTab === TradeTab.Convert && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">From</Label>
                  <span className="text-xs text-muted-foreground">
                    Balance: 0.00
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="border-0 bg-transparent text-2xl font-semibold p-0 h-auto focus-visible:ring-0"
                  />
                  <Button variant="secondary" className="gap-2">
                    CNPY
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-center -my-2 relative z-10">
                <Button variant="outline" size="icon" className="rounded-full">
                  <ArrowDownUp className="h-4 w-4" />
                </Button>
              </div>

              <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">To</Label>
                  <span className="text-xs text-muted-foreground">
                    Balance: 0.00
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="0.00"
                    readOnly
                    className="border-0 bg-transparent text-2xl font-semibold p-0 h-auto focus-visible:ring-0"
                  />
                  <Button variant="secondary" className="gap-2">
                    USD
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Conversion Rate</span>
                  <span className="font-medium">1 CNPY = 0.70 USD</span>
                </div>
              </div>

              <Button size="lg" className="w-full">
                Convert
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
