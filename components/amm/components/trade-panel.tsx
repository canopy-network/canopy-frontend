"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowDownUp, Settings, ChevronDown } from "lucide-react";

enum TradeTab {
  Swap = "swap",
  Limit = "limit",
  Buy = "buy",
  Sell = "sell",
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
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [price, setPrice] = useState(currentPrice);
  const [isReversed, setIsReversed] = useState(false);

  const handleSwapDirection = () => {
    setIsReversed(!isReversed);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const fromToken = isReversed ? quoteTokenSymbol : baseTokenSymbol;
  const toToken = isReversed ? baseTokenSymbol : quoteTokenSymbol;

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    if (value && !isNaN(parseFloat(value))) {
      const calculated = (parseFloat(value) * parseFloat(currentPrice)).toFixed(6);
      setToAmount(calculated);
    } else {
      setToAmount("");
    }
  };

  return (
    <div className="space-y-4">
      <Button size="lg" className="w-full" asChild>
        <Link href={`/amm/pool/${poolId}/add-liquidity`}>Add Liquidity</Link>
      </Button>

      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <CardHeader>
            <div className="flex items-center justify-between pb-4">
              <TabsList>
                {Object.values(TradeTab).map((tab) => (
                  <TabsTrigger key={tab} value={tab} className="capitalize">
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <TabsContent value={TradeTab.Swap} className="mt-0 space-y-2">
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
                    value={fromAmount}
                    onChange={(e) => handleFromAmountChange(e.target.value)}
                    className="border-0 bg-transparent text-2xl font-semibold p-0 h-auto focus-visible:ring-0"
                  />
                  <Button variant="secondary" className="gap-2">
                    {fromToken}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-center -my-2 relative z-10">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  onClick={handleSwapDirection}
                >
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
                    value={toAmount}
                    readOnly
                    className="border-0 bg-transparent text-2xl font-semibold p-0 h-auto focus-visible:ring-0"
                  />
                  <Button variant="secondary" className="gap-2">
                    {toToken}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Rate</span>
                  <span className="font-medium">
                    1 {fromToken} = {currentPrice} {toToken}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Slippage</span>
                  <span className="font-medium">0.5%</span>
                </div>
              </div>

              <Button size="lg" className="w-full mt-4">
                Swap
              </Button>
            </TabsContent>

            <TabsContent value={TradeTab.Limit} className="mt-0 space-y-2">
              <div className="space-y-2">
                <Label htmlFor="limit-price">Price</Label>
                <div className="relative">
                  <Input
                    id="limit-price"
                    type="number"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {quoteTokenSymbol}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="limit-amount">Amount</Label>
                <div className="relative">
                  <Input
                    id="limit-amount"
                    type="number"
                    placeholder="0.00"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {baseTokenSymbol}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Total</Label>
                <div className="rounded-md border p-3 bg-muted/50">
                  <span className="text-sm font-medium">
                    {fromAmount && price
                      ? (parseFloat(fromAmount) * parseFloat(price)).toFixed(6)
                      : "0.00"}{" "}
                    {quoteTokenSymbol}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 text-green-500">
                  Buy {baseTokenSymbol}
                </Button>
                <Button variant="outline" className="flex-1 text-red-500">
                  Sell {baseTokenSymbol}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value={TradeTab.Buy} className="mt-0 space-y-2">
              <div className="space-y-2">
                <Label htmlFor="buy-amount">Amount</Label>
                <div className="relative">
                  <Input
                    id="buy-amount"
                    type="number"
                    placeholder="0.00"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {baseTokenSymbol}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Price</Label>
                <div className="rounded-md border p-3 bg-muted/50">
                  <span className="text-sm font-medium">
                    {currentPrice} {quoteTokenSymbol}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Total</Label>
                <div className="rounded-md border p-3 bg-muted/50">
                  <span className="text-sm font-medium">
                    {fromAmount
                      ? (parseFloat(fromAmount) * parseFloat(currentPrice)).toFixed(
                          6,
                        )
                      : "0.00"}{" "}
                    {quoteTokenSymbol}
                  </span>
                </div>
              </div>

              <Button className="w-full" size="lg">
                Buy {baseTokenSymbol}
              </Button>
            </TabsContent>

            <TabsContent value={TradeTab.Sell} className="mt-0 space-y-2">
              <div className="space-y-2">
                <Label htmlFor="sell-amount">Amount</Label>
                <div className="relative">
                  <Input
                    id="sell-amount"
                    type="number"
                    placeholder="0.00"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {baseTokenSymbol}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Price</Label>
                <div className="rounded-md border p-3 bg-muted/50">
                  <span className="text-sm font-medium">
                    {currentPrice} {quoteTokenSymbol}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Total</Label>
                <div className="rounded-md border p-3 bg-muted/50">
                  <span className="text-sm font-medium">
                    {fromAmount
                      ? (parseFloat(fromAmount) * parseFloat(currentPrice)).toFixed(
                          6,
                        )
                      : "0.00"}{" "}
                    {quoteTokenSymbol}
                  </span>
                </div>
              </div>

              <Button className="w-full" size="lg" variant="destructive">
                Sell {baseTokenSymbol}
              </Button>
            </TabsContent>

            <div className="pt-2 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Available Balance</span>
                <span className="font-medium">0.00 {baseTokenSymbol}</span>
              </div>
            </div>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
