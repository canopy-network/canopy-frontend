"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { mockPools } from "./mock/pool-data";

interface AddLiquidityStepTwoProps {
  poolId: string;
  selectedTokenSymbol: string;
}

export function AddLiquidityStepTwo({ poolId, selectedTokenSymbol }: AddLiquidityStepTwoProps) {
  const pool = useMemo(() => {
    return mockPools.find((p) => p.id === poolId);
  }, [poolId]);

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

        {/* TODO: Add price range and deposit amount fields */}
      </CardContent>
    </Card>
  );
}
