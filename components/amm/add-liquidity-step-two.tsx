"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ExpandableDetail } from "./components/expandable-detail";
import { mockPools } from "./mock/pool-data";

interface AddLiquidityStepTwoProps {
  poolId: string;
  selectedTokenSymbol: string;
}

export function AddLiquidityStepTwo({
  selectedTokenSymbol,
}: AddLiquidityStepTwoProps) {
  const [tokenAmount, setTokenAmount] = useState("");
  const [cnpyAmount, setCnpyAmount] = useState("");
  const [lastEditedField, setLastEditedField] = useState<
    "token" | "cnpy" | null
  >(null);
  // Find the pool that contains the selected token paired with CNPY
  const pool = useMemo(() => {
    return mockPools.find(
      (p) =>
        (p.baseToken.symbol === selectedTokenSymbol &&
          p.quoteToken.symbol === "CNPY") ||
        (p.quoteToken.symbol === selectedTokenSymbol &&
          p.baseToken.symbol === "CNPY"),
    );
  }, [selectedTokenSymbol]);

  const selectedToken = useMemo(() => {
    if (!pool) return null;
    if (pool.baseToken.symbol === selectedTokenSymbol) {
      return pool.baseToken;
    }
    if (pool.quoteToken.symbol === selectedTokenSymbol) {
      return pool.quoteToken;
    }
    return null;
  }, [pool, selectedTokenSymbol]);

  const cnpyToken = useMemo(() => {
    const pool = mockPools.find((p) => p.quoteToken.symbol === "CNPY");
    return pool?.quoteToken || { symbol: "CNPY", icon: "/cnpy-icon.png" };
  }, []);

  // Mock balances - TODO: Replace with actual balance data from wallet
  const tokenBalance = "1,234.56";
  const cnpyBalance = "5,678.90";

  // Parse balances for comparison
  const tokenBalanceNum = parseFloat(tokenBalance.replace(/,/g, ""));
  const cnpyBalanceNum = parseFloat(cnpyBalance.replace(/,/g, ""));

  // Check for insufficient balance
  const tokenInsufficient =
    tokenAmount && parseFloat(tokenAmount) > tokenBalanceNum;
  const cnpyInsufficient =
    cnpyAmount && parseFloat(cnpyAmount) > cnpyBalanceNum;
  const hasInsufficientBalance = tokenInsufficient || cnpyInsufficient;

  // Calculate corresponding amount based on pool price
  useEffect(() => {
    if (!pool || !lastEditedField) return;

    const currentPrice = parseFloat(pool.currentPrice);

    if (lastEditedField === "token" && tokenAmount) {
      const amount = parseFloat(tokenAmount);
      if (!isNaN(amount)) {
        const calculatedCnpy = (amount * currentPrice).toFixed(6);
        setCnpyAmount(calculatedCnpy);
      }
    } else if (lastEditedField === "cnpy" && cnpyAmount) {
      const amount = parseFloat(cnpyAmount);
      if (!isNaN(amount)) {
        const calculatedToken = (amount / currentPrice).toFixed(6);
        setTokenAmount(calculatedToken);
      }
    }
  }, [tokenAmount, cnpyAmount, lastEditedField, pool]);

  const handleTokenAmountChange = (value: string) => {
    setTokenAmount(value);
    setLastEditedField("token");
  };

  const handleCnpyAmountChange = (value: string) => {
    setCnpyAmount(value);
    setLastEditedField("cnpy");
  };

  if (!pool || !selectedToken) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Pool or token not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set Price Range and Deposit Amounts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-sm font-medium mb-3">Selected Pair</h3>
          <div className="flex items-center gap-3 p-4 border rounded-lg">
            <Avatar className="h-8 w-8">
              <AvatarImage src={selectedToken.icon} />
              <AvatarFallback>{selectedToken.symbol[0]}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{selectedToken.symbol}</span>
            <span className="text-muted-foreground">/</span>
            <Avatar className="h-8 w-8">
              <AvatarImage src={cnpyToken.icon} />
              <AvatarFallback>{cnpyToken.symbol[0]}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{cnpyToken.symbol}</span>
          </div>
        </div>
      </CardContent>

      <CardContent className="pt-0 space-y-4">
        <h3 className="text-sm font-medium">Deposit tokens</h3>
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Token amount input */}
            <div className="space-y-2">
              <div
                className={`flex items-center justify-between border-2 rounded-lg ${
                  tokenInsufficient ? "border-red-500" : "border-border"
                }`}
              >
                <Input
                  type="number"
                  placeholder="0.00"
                  value={tokenAmount}
                  onChange={(e) => handleTokenAmountChange(e.target.value)}
                  className="border-0 bg-transparent text-2xl font-semibold px-4 py-6 h-auto focus-visible:ring-0 flex-1"
                />
                <div className="flex items-center gap-3 px-4">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={selectedToken.icon} />
                    <AvatarFallback>{selectedToken.symbol[0]}</AvatarFallback>
                  </Avatar>
                  <span className="font-semibold text-lg">
                    {selectedToken.symbol}
                  </span>
                </div>
              </div>
              <p
                className={`text-sm ${tokenInsufficient ? "text-red-500" : "text-muted-foreground"}`}
              >
                Balance: {tokenBalance} {selectedToken.symbol}
              </p>
            </div>

            {/* CNPY amount input */}
            <div className="space-y-2">
              <div
                className={`flex items-center justify-between border-2 rounded-lg ${
                  cnpyInsufficient ? "border-red-500" : "border-border"
                }`}
              >
                <Input
                  type="number"
                  placeholder="0.00"
                  value={cnpyAmount}
                  onChange={(e) => handleCnpyAmountChange(e.target.value)}
                  className="border-0 bg-transparent text-2xl font-semibold px-4 py-6 h-auto focus-visible:ring-0 flex-1"
                />
                <div className="flex items-center gap-3 px-4">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={cnpyToken.icon} />
                    <AvatarFallback>{cnpyToken.symbol[0]}</AvatarFallback>
                  </Avatar>
                  <span className="font-semibold text-lg">
                    {cnpyToken.symbol}
                  </span>
                </div>
              </div>
              <p
                className={`text-sm ${cnpyInsufficient ? "text-red-500" : "text-muted-foreground"}`}
              >
                Balance: {cnpyBalance} {cnpyToken.symbol}
              </p>
            </div>

            {/* Expandable details section */}
            <ExpandableDetail title="Estimated Slippage" value="0.50%">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Your pool share</span>
                <span className="font-medium">0.00%</span>
              </div>
            </ExpandableDetail>

            {/* Submit button */}
            <Button
              className="w-full"
              size="lg"
              disabled={!tokenAmount || !cnpyAmount || !!hasInsufficientBalance}
              variant={hasInsufficientBalance ? "destructive" : "default"}
            >
              {hasInsufficientBalance
                ? "Insufficient Balance"
                : !tokenAmount || !cnpyAmount
                  ? "Enter an Amount"
                  : "Add Liquidity"}
            </Button>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
