import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Bell, Share2, Globe, Heart } from "lucide-react";

interface ChainDetailsHeaderProps {
  chain: {
    chain_name: string;
    token_symbol: string;
    token_total_supply: number;
    branding?: string;
    banner?: string;
    creator?: {
      display_name?: string;
      avatar_url?: string;
      wallet_address?: string;
    };
    created_at?: string;
  };
}

export function ChainDetailsHeader({ chain }: ChainDetailsHeaderProps) {
  const [isPriceAlertSet, setIsPriceAlertSet] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

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

  const openWebsite = () => {
    // Add website URL logic here
    console.log("Open website for", chain.chain_name);
  };

  return (
    <div
      id="chain-details-header"
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-black p-4 sm:p-6"
    >
      {/* Left Information Section */}
      <div
        id="chain-details-metadata"
        className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1"
      >
        {chain.branding ? (
          <img
            src={chain.branding}
            alt={`${chain.chain_name} logo`}
            className="w-10 h-10 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-green-300 to-green-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">
              {chain.chain_name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Title and Subtitle */}
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <h1 className="text-base sm:text-base font-medium text-white truncate">
            {chain.chain_name}
          </h1>

          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-white/50 flex-wrap">
            <span className="whitespace-nowrap">${chain.token_symbol} by</span>
            {/* Inline Secondary Icon */}
            {chain.creator && (
              <Link
                className="flex items-center gap-1 whitespace-nowrap min-w-0"
                href={`/creator/${chain.creator.wallet_address || "unknown"}`}
              >
                {chain.creator.avatar_url ? (
                  <img
                    src={chain.creator.avatar_url}
                    alt={chain.creator.display_name || "Creator"}
                    className="w-4 h-4 sm:w-4 sm:h-4 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-4 h-4 sm:w-4 sm:h-4 rounded-full bg-gradient-to-r from-green-200 to-green-400 flex-shrink-0" />
                )}
                <span className="whitespace-nowrap truncate max-w-[100px] sm:max-w-none">
                  {chain.creator.display_name ||
                    (chain.creator.wallet_address
                      ? `${chain.creator.wallet_address.slice(
                          0,
                          6
                        )}...${chain.creator.wallet_address.slice(-4)}`
                      : "Unknown")}
                </span>
              </Link>
            )}
            {chain.created_at && (
              <>
                <span className="hidden sm:inline">•</span>
                <span className="whitespace-nowrap hidden sm:inline">
                  created {new Date(chain.created_at).toLocaleDateString()}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Action Button Section */}
      <div
        className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0"
        id="chain-details-actions"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsPriceAlertSet(!isPriceAlertSet)}
          className={`w-9 h-9 sm:w-10 sm:h-10 p-0 ${
            isPriceAlertSet
              ? "bg-purple-500 text-white border-purple-500"
              : "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
          }`}
        >
          <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>

        <div className="flex items-center gap-1.5 sm:gap-2 dark:border-input border rounded-md">
          <Button
            variant="clear"
            size="sm"
            onClick={shareProject}
            className="w-9 h-9 sm:w-10 sm:h-10 p-0 bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
          >
            <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
          <Button
            variant="clear"
            size="sm"
            onClick={openWebsite}
            className="w-9 h-9 sm:w-10 sm:h-10 p-0 bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
          >
            <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsLiked(!isLiked)}
          className={`w-9 h-9 sm:w-10 sm:h-10 p-0 ${
            isLiked
              ? "bg-red-500 text-white border-red-500"
              : "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
          }`}
        >
          <Heart
            className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
              isLiked ? "fill-current" : ""
            }`}
          />
        </Button>
      </div>
    </div>
  );
}
