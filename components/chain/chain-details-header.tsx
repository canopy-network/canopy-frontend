import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, Share2, Globe, Heart } from "lucide-react";

interface ChainDetailsHeaderProps {
  chain: {
    chain_name: string;
    token_symbol: string;
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
      className="flex items-center justify-between bg-black p-6"
    >
      {/* Left Information Section */}
      <div id="chain-details-metadata" className="flex items-center gap-4">
        <img
          src=""
          alt="Chain Icon"
          className="w-8 h-8 rounded-full bg-gradient-to-r from-green-300 to-green-500"
        />

        {/* Title and Subtitle */}
        <div className="flex flex-col gap-1">
          <h1 className="text-base font-medium text-white">
            {chain.chain_name}
          </h1>

          <div className="flex items-center gap-2 text-sm text-white/50">
            <span>${chain.token_symbol} on</span>
            {/* Inline Secondary Icon */}
            <div className="flex items-center gap-1 whitespace-nowrap">
              <img
                src=""
                alt="Chain Symbol"
                className="w-4 h-4 rounded-full bg-gradient-to-r from-green-200 to-green-400"
              />
              <span className="whitespace-nowrap">{chain.chain_name}</span>
            </div>
            <span>•</span>
            <span>created 13m ago</span>
          </div>
        </div>
      </div>

      {/* Right Action Button Section */}
      <div className="flex items-center gap-2" id="chain-details-actions">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsPriceAlertSet(!isPriceAlertSet)}
          className={`w-10 h-10 p-0 ${
            isPriceAlertSet
              ? "bg-purple-500 text-white border-purple-500"
              : "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
          }`}
        >
          <Bell className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2 dark:border-input border rounded-md">
          <Button
            variant="clear"
            size="sm"
            onClick={shareProject}
            className="w-10 h-10 p-0 bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            variant="clear"
            size="sm"
            onClick={openWebsite}
            className="w-10 h-10 p-0 bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
          >
            <Globe className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsLiked(!isLiked)}
          className={`w-10 h-10 p-0 ${
            isLiked
              ? "bg-red-500 text-white border-red-500"
              : "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
          }`}
        >
          <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
        </Button>
      </div>
    </div>
  );
}
