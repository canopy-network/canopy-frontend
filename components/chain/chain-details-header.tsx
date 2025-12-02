"use client";

import { Button } from "@/components/ui/button";
import {
  Star,
  Upload,
  Users,
  TrendingUp,
  Zap,
  Target,
  ArrowLeft,
} from "lucide-react";
import { HexagonIcon } from "@/components/icons/hexagon-icon";
import { formatDistanceToNow } from "date-fns";
import { ChainExtended, Accolade } from "@/types/chains";
import { useChainFavorite } from "@/lib/hooks/use-chain-favorite";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ChainDetailsHeaderProps {
  chain: ChainExtended;
  accolades?: Accolade[];
}

export function ChainDetailsHeader({
  chain,
  accolades = [],
}: ChainDetailsHeaderProps) {
  const router = useRouter();
  const { isFavorited, isLoading, toggleFavorite, isAuthenticated } =
    useChainFavorite(chain.id);

  // Map accolade categories to icons
  const getAccoladeIcon = (category: string) => {
    switch (category) {
      case "holder":
        return <Users className="w-2.5 h-2.5" />;
      case "market_cap":
        return <TrendingUp className="w-2.5 h-2.5" />;
      case "transaction":
        return <Target className="w-2.5 h-2.5" />;
      default:
        return <Zap className="w-2.5 h-2.5" />;
    }
  };

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

  // Combined function to get creator display name and link ID
  const getCreatorInfo = () => {
    if (!chain.creator) {
      return {
        displayName: "Unknown",
        linkId: null,
      };
    }
    const truncateWalletAddress = (address: string): string => {
      if (address.length <= 16) return address;
      return `${address.slice(0, 4)}...${address.slice(-3)}`;
    };
    const displayName =
      chain.creator.display_name?.trim() ||
      truncateWalletAddress(chain.creator.wallet_address);
    const linkId = chain.creator.username || chain.creator.wallet_address;
    return {
      displayName,
      linkId,
    };
  };

  const rightActions = (
    <>
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
    </>
  );
  return (
    <>
      <div className="flex items-center justify-between lg:hidden mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="size-9 h-[30px] w-[30px] rounded-lg"
          title="Go back"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-3">{rightActions}</div>
      </div>
      <div className="rounded-xl border bg-card text-card-foreground shadow p-4">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center gap-3">
            {/* Avatar */}
            {chain.branding ? (
              <img
                src={chain.branding}
                alt={`logo - ${chain.chain_name}`}
                className="w-8 h-8 rounded-full border border-white/10 bg-white/[0.05]"
                style={{ backgroundColor: chain.brand_color }}
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
                <h2 className="text-base font-medium">
                  {chain.token_name || chain.chain_name}
                </h2>

                {/* Hexagon Badges - Display Accolades */}
                {accolades.length > 0 && (
                  <div className="flex items-center gap-1">
                    {accolades.map((accolade, index) => (
                      <HexagonIcon
                        key={accolade.name}
                        tooltip={accolade.display_name}
                      >
                        {getAccoladeIcon(accolade.category)}
                      </HexagonIcon>
                    ))}
                  </div>
                )}
              </div>

              {/* Subtitle */}
              <p className="text-xs text-gray-400 ">
                ${chain.token_symbol} on {chain.chain_name}{" "}
                <span className="lg:inline-block hidden">
                  {" "}
                  • Created&nbsp;
                  {formatDistanceToNow(new Date(chain.created_at), {
                    addSuffix: true,
                  })}
                  {chain.creator && getCreatorInfo().linkId && (
                    <>
                      {" • "}
                      <span>Created by: </span>
                      <Link
                        href={`/creator/${getCreatorInfo().linkId}`}
                        className="text-primary hover:underline"
                      >
                        {getCreatorInfo().displayName}
                      </Link>
                    </>
                  )}
                </span>
              </p>
              <p className="text-xs text-gray-400 lg:hidden">
                Created&nbsp;
                {formatDistanceToNow(new Date(chain.created_at), {
                  addSuffix: true,
                })}
                {chain.creator && getCreatorInfo().linkId && (
                  <>
                    {" • "}
                    <span>Created by: </span>
                    <Link
                      href={`/creator/${getCreatorInfo().linkId}`}
                      className="text-primary hover:underline"
                    >
                      {getCreatorInfo().displayName}
                    </Link>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="lg:flex hidden items-center gap-3">
            {rightActions}
          </div>
        </div>
      </div>
    </>
  );
}
