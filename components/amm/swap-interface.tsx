"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowUpDown, Settings, Info, Zap } from "lucide-react";

interface Token {
  symbol: string;
  name: string;
  balance: string;
  price: number;
  icon: string;
}

const tokens: Token[] = [
  {
    symbol: "CNPY",
    name: "Canopy",
    balance: "1,234.56",
    price: 0.42,
    icon: "🌳",
  },
  {
    symbol: "DEFI",
    name: "DeFi Chain Alpha",
    balance: "567.89",
    price: 1.25,
    icon: "🔷",
  },
  {
    symbol: "GAME",
    name: "GameFi Universe",
    balance: "890.12",
    price: 0.85,
    icon: "🎮",
  },
  {
    symbol: "SUPPLY",
    name: "Supply Chain Pro",
    balance: "345.67",
    price: 2.1,
    icon: "📦",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    balance: "2.45",
    price: 2450.0,
    icon: "Ξ",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    balance: "5,678.90",
    price: 1.0,
    icon: "💵",
  },
];

/**
 * @typedef {Object} ButtonProps
 * @property {string} label
 * @property {boolean} disabled
 */

/**
 * Renders a button.
 * @param {ButtonProps} props
 * @returns {HTMLElement}
 */
export function SwapInterface() {
  const [fromToken, setFromToken] = useState(tokens[0]);
  const [toToken, setToToken] = useState(tokens[1]);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [slippage, setSlippage] = useState("0.5");

  const handleSwapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const calculateToAmount = (amount: string) => {
    if (!amount || isNaN(Number(amount))) return "";
    const fromValue = Number(amount) * fromToken.price;
    const toValue = fromValue / toToken.price;
    return (toValue * 0.997).toFixed(6); // 0.3% fee
  };

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    setToAmount(calculateToAmount(value));
  };

  const priceImpact = fromAmount
    ? ((Number(fromAmount) * fromToken.price) / 1000000) * 100
    : 0;
  const fee = fromAmount ? (Number(fromAmount) * 0.003).toFixed(6) : "0";

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Swap Interface */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpDown className="h-5 w-5" />
              Swap Tokens
            </CardTitle>
            <CardDescription>
              Trade tokens through CNPY hub pools with optimal routing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* From Token */}
            <div className="space-y-2">
              <Label>From</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="0.0"
                    value={fromAmount}
                    onChange={(e) => handleFromAmountChange(e.target.value)}
                    className="text-lg"
                  />
                </div>
                <Button
                  variant="outline"
                  className="min-w-32 gap-2 bg-transparent"
                >
                  <span className="text-lg">{fromToken.icon}</span>
                  {fromToken.symbol}
                </Button>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Balance: {fromToken.balance}</span>
                <span>${fromToken.price.toFixed(2)}</span>
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="icon"
                onClick={handleSwapTokens}
                className="rounded-full bg-transparent"
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>

            {/* To Token */}
            <div className="space-y-2">
              <Label>To</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="0.0"
                    value={toAmount}
                    readOnly
                    className="text-lg bg-muted"
                  />
                </div>
                <Button
                  variant="outline"
                  className="min-w-32 gap-2 bg-transparent"
                >
                  <span className="text-lg">{toToken.icon}</span>
                  {toToken.symbol}
                </Button>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Balance: {toToken.balance}</span>
                <span>${toToken.price.toFixed(2)}</span>
              </div>
            </div>

            <Separator />

            {/* Swap Details */}
            {fromAmount && (
              <div className="space-y-3 p-4 bg-muted rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Price Impact</span>
                  <span
                    className={
                      priceImpact > 3
                        ? "text-destructive"
                        : "text-muted-foreground"
                    }
                  >
                    {priceImpact.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Trading Fee</span>
                  <span className="text-muted-foreground">
                    {fee} {fromToken.symbol} (0.3%)
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Route</span>
                  <span className="text-muted-foreground">
                    {fromToken.symbol} → CNPY → {toToken.symbol}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Slippage Tolerance</span>
                  <span className="text-muted-foreground">{slippage}%</span>
                </div>
              </div>
            )}

            <Button
              className="w-full"
              size="lg"
              disabled={!fromAmount || Number(fromAmount) <= 0}
            >
              {!fromAmount ? "Enter Amount" : "Swap Tokens"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Swap Settings & Info */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings className="h-4 w-4" />
              Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Slippage Tolerance</Label>
              <div className="flex gap-2">
                {["0.1", "0.5", "1.0"].map((value) => (
                  <Button
                    key={value}
                    variant={slippage === value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSlippage(value)}
                  >
                    {value}%
                  </Button>
                ))}
              </div>
              <Input
                placeholder="Custom"
                value={slippage}
                onChange={(e) => setSlippage(e.target.value)}
                className="text-sm"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Info className="h-4 w-4" />
              CNPY Hub Model
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground space-y-2">
              <p>All tokens are paired with CNPY for universal liquidity.</p>
              <p>Trades are routed through CNPY pools for optimal pricing.</p>
              <p>83.3% of fees go to LPs, 16.7% to treasury.</p>
            </div>
            <Badge variant="outline" className="w-full justify-center">
              <Zap className="h-3 w-3 mr-1" />
              Powered by CNPY Hub
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Swaps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>DEFI → CNPY</span>
                <span className="text-muted-foreground">2m ago</span>
              </div>
              <div className="flex justify-between">
                <span>CNPY → USDC</span>
                <span className="text-muted-foreground">5m ago</span>
              </div>
              <div className="flex justify-between">
                <span>GAME → CNPY</span>
                <span className="text-muted-foreground">8m ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
