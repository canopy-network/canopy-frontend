"use client";

import { useState } from "react";
import { ChevronDown, Coins } from "lucide-react";
import { formatTokenAmount } from "@/lib/utils/denomination";
import type { TokenBalance } from "@/types/wallet";
import { cn } from "@/lib/utils";

interface AssetItemProps {
  token: TokenBalance;
}

export function AssetItem({ token }: AssetItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Only show collapse if there's staked or delegated balance
  const hasDistribution = token.distribution && (
    parseFloat(token.distribution.staked) > 0 ||
    parseFloat(token.distribution.delegated) > 0
  );



  const handleToggle = () => {
    if (hasDistribution) {
      console.log('Toggling expansion from', isExpanded, 'to', !isExpanded);
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Main Asset Row */}
      <div
        className={cn(
          "flex items-center justify-between p-3 sm:p-4 hover:bg-muted/50 transition-colors",
          hasDistribution && "cursor-pointer"
        )}
        onClick={handleToggle}
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Coins className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium text-sm sm:text-base truncate">{token.symbol}</p>
              {token.chainId && (
                <span className="text-xs text-muted-foreground shrink-0">
                  Chain {token.chainId}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              {token.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="text-right">
            <p className="font-medium text-sm sm:text-base">{formatTokenAmount(token.balance)}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {token.usdValue || "$0.00"}
            </p>
          </div>
          {hasDistribution && (
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform shrink-0",
                isExpanded && "transform rotate-180"
              )}
            />
          )}
        </div>
      </div>

      {/* Distribution Details (Collapsed) */}
      {isExpanded && hasDistribution && token.distribution && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-2 bg-muted/20 space-y-2 sm:space-y-3 border-t animate-in slide-in-from-top-2 duration-200">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Balance Distribution
          </p>

          {/* Liquid Balance - Always show */}
          <div className="flex items-center justify-between pl-2 sm:pl-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
              <span className="text-xs sm:text-sm">Liquid (Available)</span>
            </div>
            <span className="text-xs sm:text-sm font-medium">
              {formatTokenAmount(token.distribution.liquid)}
            </span>
          </div>

          {/* Staked Balance - Only show if > 0 */}
          {parseFloat(token.distribution.staked) > 0 && (
            <div className="flex items-center justify-between pl-2 sm:pl-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                <span className="text-xs sm:text-sm">Staked</span>
              </div>
              <span className="text-xs sm:text-sm font-medium">
                {formatTokenAmount(token.distribution.staked)}
              </span>
            </div>
          )}

          {/* Delegated Balance - Only show if > 0 */}
          {parseFloat(token.distribution.delegated) > 0 && (
            <div className="flex items-center justify-between pl-2 sm:pl-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                <span className="text-xs sm:text-sm">Delegated</span>
              </div>
              <span className="text-xs sm:text-sm font-medium">
                {formatTokenAmount(token.distribution.delegated)}
              </span>
            </div>
          )}

          {/* Show message if no staked or delegated */}
          {parseFloat(token.distribution.staked) === 0 &&
            parseFloat(token.distribution.delegated) === 0 && (
              <p className="text-xs text-muted-foreground italic pl-2 sm:pl-4">
                All balance is available (not staked or delegated)
              </p>
            )}
        </div>
      )}
    </div>
  );
}
