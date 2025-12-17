"use client";

import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown } from "lucide-react";
import { useChainsStore } from "@/lib/stores/chains-store";
import { cn } from "@/lib/utils";

interface ChainSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export function ChainSelect({ value, onValueChange, className }: ChainSelectProps) {
  const chains = useChainsStore((state) => state.chains);
  
  // Prepare chain options - add "Canopy" as default option
  const chainOptions = useMemo(() => {
    const options = [
      { id: "0", chain_name: "Canopy" },
      ...chains.map((chain) => ({
        id: chain.id.toString(),
        chain_name: chain.chain_name,
      })),
    ];
    return options;
  }, [chains]);

  const selectedChain = chainOptions.find((chain) => chain.id === value) || chainOptions[0];

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        className={cn(
          "h-8 gap-0 px-3 py-2 bg-black border border-[#00a63d] rounded-md text-[#00a63d] hover:bg-black/80 focus:ring-[#00a63d] focus:ring-1 focus:ring-offset-0 shadow-[0_0_14px_rgba(0,166,61,0.4)] hover:shadow-[0_0_18px_rgba(0,166,61,0.55)] transition-all [&>svg]:hidden",
          className
        )}
      >
        <div className="flex items-center gap-2 w-full">
          {/* Leaf Icon */}
          <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
            <img
              src="/images/canopy-icon.svg"
              alt="Canopy"
              className="w-4 h-4 object-contain"
              style={{ filter: "drop-shadow(0 0 4px rgba(0,166,61,0.8))" }}
            />
          </div>
          
          {/* Chain Name */}
          <SelectValue className="text-sm font-medium text-[#00a63d]">
            {selectedChain.chain_name}
          </SelectValue>
          
          {/* Vertical Separator */}
          <div className="h-4 w-px bg-[#00a63d] mx-1 flex-shrink-0" />
          
          {/* Chevron Down */}
          <ChevronDown className="h-4 w-4 text-[#00a63d] flex-shrink-0" />
        </div>
      </SelectTrigger>
      <SelectContent className="bg-[#1a1a1a] border border-[#2a2a2a] text-white min-w-[200px]">
        {chainOptions.map((chain) => (
          <SelectItem
            key={chain.id}
            value={chain.id}
            className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <img
                src="/images/canopy-icon.svg"
                alt="Canopy"
                className="w-4 h-4 object-contain"
              />
              <span>{chain.chain_name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

