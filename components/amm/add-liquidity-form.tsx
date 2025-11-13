"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown } from "lucide-react";
import { mockPools } from "./mock/pool-data";
import { PoolToken } from "./types/amm/pool";
import { TokenSelectorModal } from "./components/token-selector-modal";

interface AddLiquidityFormProps {
  poolId: string;
}

export function AddLiquidityForm({ poolId }: AddLiquidityFormProps) {
  // Find the pool and get its non-CNPY token
  const pool = useMemo(() => {
    return mockPools.find((p) => p.id === poolId);
  }, [poolId]);

  const defaultToken = useMemo(() => {
    if (!pool) return "";
    // Return the token that is not CNPY
    if (pool.baseToken.symbol !== "CNPY") {
      return pool.baseToken.symbol;
    }
    if (pool.quoteToken.symbol !== "CNPY") {
      return pool.quoteToken.symbol;
    }
    return "";
  }, [pool]);

  const [selectedToken, setSelectedToken] = useState<string>(defaultToken);
  const [amount, setAmount] = useState<string>("");
  const [fee, setFee] = useState<string>("");
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);

  // Mock balances - TODO: Replace with actual balance data from wallet
  const tokenBalance = "1,234.56"; // Balance for the selected token
  const cnpyBalance = "5,678.90"; // Balance for CNPY

  // Get all unique tokens from all pools, excluding CNPY
  const availableTokens = useMemo(() => {
    const tokensMap = new Map<string, PoolToken>();

    mockPools.forEach((pool) => {
      // Add base token if it's not CNPY
      if (pool.baseToken.symbol !== "CNPY") {
        tokensMap.set(pool.baseToken.symbol, pool.baseToken);
      }
      // Add quote token if it's not CNPY
      if (pool.quoteToken.symbol !== "CNPY") {
        tokensMap.set(pool.quoteToken.symbol, pool.quoteToken);
      }
    });

    return Array.from(tokensMap.values());
  }, []);

  // CNPY token (fixed)
  const cnpyToken = useMemo(() => {
    const pool = mockPools.find((p) => p.quoteToken.symbol === "CNPY");
    return pool?.quoteToken || { symbol: "CNPY", icon: "/cnpy-icon.png" };
  }, []);

  // Get the selected token object
  const selectedTokenObj = useMemo(() => {
    return availableTokens.find((t) => t.symbol === selectedToken);
  }, [availableTokens, selectedToken]);

  // Update selected token when default token changes
  useEffect(() => {
    if (defaultToken) {
      setSelectedToken(defaultToken);
    }
  }, [defaultToken]);

  if (!pool) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Pool not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Pair</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Token selector */}
          <div className="space-y-2">
            <Label>Token</Label>
            <button
              onClick={() => setIsTokenModalOpen(true)}
              className="flex items-center justify-between w-full h-10 px-3 py-2 border rounded-md hover:bg-muted transition-colors"
            >
              {selectedTokenObj ? (
                <div className="flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={selectedTokenObj.icon} />
                    <AvatarFallback>{selectedTokenObj.symbol[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{selectedTokenObj.symbol}</span>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">Select a token</span>
              )}
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
            <p className="text-xs text-muted-foreground">
              Balance: {tokenBalance} {selectedToken}
            </p>
          </div>

          {/* CNPY fixed */}
          <div className="space-y-2">
            <Label>Paired with</Label>
            <div className="flex items-center gap-2 h-10 px-3 py-2 border rounded-md bg-muted">
              <Avatar className="h-5 w-5">
                <AvatarImage src={cnpyToken.icon} />
                <AvatarFallback>{cnpyToken.symbol[0]}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{cnpyToken.symbol}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Balance: {cnpyBalance} {cnpyToken.symbol}
            </p>
          </div>
        </div>

        {selectedToken && (
          <>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fee">Fee (Optional)</Label>
              <Input
                id="fee"
                type="number"
                placeholder="0"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Network transaction fee
              </p>
            </div>
          </>
        )}

        <div className="pt-4">
          <Button
            className="w-full"
            disabled={!selectedToken || !amount}
          >
            Add Liquidity
          </Button>
        </div>
      </CardContent>

      <TokenSelectorModal
        open={isTokenModalOpen}
        onOpenChange={setIsTokenModalOpen}
        tokens={availableTokens}
        selectedToken={selectedToken}
        onSelectToken={setSelectedToken}
      />
    </Card>
  );
}
