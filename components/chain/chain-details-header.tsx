"use client";

import { Button } from "@/components/ui/button";
import { Star, Upload, Users, TrendingUp, Zap } from "lucide-react";
import { HexagonIcon } from "@/components/icons/hexagon-icon";
import { formatDistanceToNow } from "date-fns";
import { ChainExtended } from "@/types/chains";
import { useChainFavorite } from "@/lib/hooks/use-chain-favorite";
import { cn } from "@/lib/utils";

interface ChainDetailsHeaderProps {
  chain: ChainExtended;
}

export function ChainDetailsHeader({ chain }: ChainDetailsHeaderProps) {
  const { isFavorited, isLoading, toggleFavorite, isAuthenticated } =
    useChainFavorite(chain.id);

  const shareProject = () => {
    if (navigator.share) {
      navigator.share({
        title: chain.chain_name,
        text: `Check out ${chain.chain_name} on Canopy`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // Get first letter of chain name for avatar
  const firstLetter = chain.chain_name.charAt(0).toUpperCase();

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow p-4">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          {/* Avatar */}
          {chain.branding ? (
            <img
              src={chain.branding}
              alt={`logo - ${chain.chain_name}`}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "rgb(59, 130, 246)" }}
            >
              <span className="text-sm font-bold text-black">
                {firstLetter}
              </span>
            </div>
          )}

          {/* Title and Badges */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-medium">{chain.chain_name}</h2>

              {/* Hexagon Badges */}
              <div className="flex items-center gap-1">
                <HexagonIcon tooltip="Community">
                  <Users className="w-2.5 h-2.5" />
                </HexagonIcon>
                <HexagonIcon tooltip="Trending">
                  <TrendingUp className="w-2.5 h-2.5" />
                </HexagonIcon>
                <HexagonIcon tooltip="Active">
                  <Users className="w-2.5 h-2.5" />
                </HexagonIcon>
                <HexagonIcon tooltip="Fast Growing">
                  <Zap className="w-2.5 h-2.5" />
                </HexagonIcon>
                <HexagonIcon tooltip="Top Performer">
                  <TrendingUp className="w-2.5 h-2.5" />
                </HexagonIcon>
                <HexagonIcon tooltip="Popular">
                  <Users className="w-2.5 h-2.5" />
                </HexagonIcon>
                <div className="relative w-5 h-5 flex items-center justify-center cursor-help">
                  <svg
                    viewBox="0 0 100 100"
                    className="absolute inset-0 w-full h-full"
                  >
                    <polygon
                      points="50 0, 93.3 25, 93.3 75, 50 100, 6.7 75, 6.7 25"
                      className="fill-primary/20 stroke-primary"
                      strokeWidth="4"
                    />
                  </svg>
                  <span className="text-[8px] font-bold relative z-10 text-primary">
                    +4
                  </span>
                </div>
              </div>
            </div>

            {/* Subtitle */}
            <p className="text-xs text-gray-400">
              ${chain.token_symbol} on {chain.chain_name} • Created&nbsp;
              {formatDistanceToNow(new Date(chain.created_at), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFavorite}
            disabled={!isAuthenticated || isLoading}
            className={cn(
              "size-9 h-[30px] w-[30px] rounded-lg transition-all",
              isFavorited && "bg-yellow-500/10 border-yellow-500/50"
            )}
            title={
              !isAuthenticated
                ? "Login to favorite"
                : isFavorited
                ? "Remove from favorites"
                : "Add to favorites"
            }
          >
            <Star
              className={cn(
                "w-4 h-4 transition-all",
                isFavorited && "fill-yellow-500 text-yellow-500"
              )}
            />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={shareProject}
            className="size-9 h-[30px] w-[30px] rounded-lg"
            title="Share project"
          >
            <Upload className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
