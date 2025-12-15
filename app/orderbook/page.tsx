"use client";

// Force SSR for this page
export const dynamic = "force-dynamic";

import { useEffect, useState, useMemo } from "react";
import TradingModule from "@/components/trading/trading-module";
import YourPositionCard from "@/components/trading/your-position-card";
import LiquidityWithdrawDialog from "@/components/trading/liquidity-withdraw-dialog";
import { Button } from "@/components/ui/button";
import { Share2, LayoutGrid } from "lucide-react";
import { useWalletStore } from "@/lib/stores/wallet-store";
import {
  useLiquidityPoolsStore,
  type LiquidityPool,
} from "@/lib/stores/liquidity-pools-store";
import type { UserLiquidityPosition, Token } from "@/types/trading";
import tokensData from "@/data/tokens.json";

export default function OrderBookPage() {
  const { wallets, currentWallet } = useWalletStore();
  const { available_pools } = useLiquidityPoolsStore();
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [selectedLiquidityPool, setSelectedLiquidityPool] =
    useState<LiquidityPool | null>(null);

  const isConnected = wallets.length > 0;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Get user's LP positions (mock for now - TODO: implement actual fetching)
  // This matches the pattern from LiquidityTab where positions are not yet implemented
  const selectedPoolPosition = useMemo<UserLiquidityPosition | null>(() => {
    // TODO: Implement actual LP position fetching using wallet addresses
    // For now, return null as positions are not yet implemented
    if (!isConnected || !selectedLiquidityPool) return null;
    return null; // Will be implemented when LP position API is available
  }, [isConnected, selectedLiquidityPool]);

  const handleWithdraw = () => {
    setShowWithdrawDialog(true);
  };

  const handleLiquidityPoolChange = (pool: LiquidityPool | null) => {
    setSelectedLiquidityPool(pool);
  };

  return (
    <>
      {/* Header Navigation - matches wireframe design */}
      <header className="border-b border-border sticky top-0 bg-background z-101 lg:relative">
        <div className="flex items-center justify-between h-14 px-6">
          <div className="flex items-center gap-3">
            <LayoutGrid className="w-5 h-5 text-muted-foreground" />
            <h1 className="text-base font-semibold">Trade</h1>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[480px] mx-auto px-8 py-8 space-y-4">
          <TradingModule
            variant="trade"
            defaultTab="swap"
          />

          {/* Selected Pool Position */}
          {isConnected &&
            selectedPoolPosition &&
            selectedLiquidityPool && (
              <YourPositionCard
                position={selectedPoolPosition}
                pool={selectedLiquidityPool}
                onWithdraw={handleWithdraw}
              />
            )}
        </div>
      </div>

      {/* Withdraw Dialog */}
      {showWithdrawDialog &&
        selectedPoolPosition &&
        selectedLiquidityPool && (
          <LiquidityWithdrawDialog
            open={showWithdrawDialog}
            onClose={() => setShowWithdrawDialog(false)}
            tokenA={
              (tokensData.find(
                (t) => t.symbol === selectedLiquidityPool.tokenA
              ) as Token | undefined) || {
                symbol: selectedLiquidityPool.tokenA,
                name: selectedLiquidityPool.tokenA,
              }
            }
            tokenB={
              (tokensData.find(
                (t) => t.symbol === selectedLiquidityPool.tokenB
              ) as Token | undefined) || {
                symbol: selectedLiquidityPool.tokenB,
                name: selectedLiquidityPool.tokenB,
              }
            }
            amountA={selectedPoolPosition.tokenAAmount.toString()}
            amountB={selectedPoolPosition.tokenBAmount.toString()}
            pool={selectedLiquidityPool}
          />
        )}
    </>
  );
}
