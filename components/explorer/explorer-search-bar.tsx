"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useChainsStore } from "@/lib/stores/chains-store";
import { CommandSearchTrigger } from "@/components/command-search-trigger";

interface SearchBarChain {
  id: string;
  name: string;
}

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  chains: SearchBarChain[];
  className?: string;
}

export function SearchBar({
  searchQuery,
  setSearchQuery,
  chains,
  className,
}: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedChain, setSelectedChain] = useState<{
    id: string;
    chain_name: string;
  } | null>(null);
  const getChainById = useChainsStore((state) => state.getChainById);

  // Initialize selected chain from URL
  useEffect(() => {
    const chainId = searchParams.get("chain");
    if (chainId) {
      // Try to find the chain in the store
      const chain = getChainById(chainId);
      if (chain) {
        setSelectedChain({ id: chain.id, chain_name: chain.chain_name });
      } else {
        // If not found in store, try to find in the chains prop
        const chainFromProp = chains.find((c) => c.id === chainId);
        if (chainFromProp) {
          setSelectedChain({
            id: chainFromProp.id,
            chain_name: chainFromProp.name,
          });
        } else {
          setSelectedChain(null);
        }
      }
    } else {
      setSelectedChain(null);
    }
  }, [searchParams, chains, getChainById]);

  const handleChainSelect = (chain: { id: string; chain_name: string }) => {
    setSelectedChain(chain);
    const params = new URLSearchParams(searchParams.toString());
    params.set("chain", chain.id);
    router.push(`${pathname}?${params.toString()}`);
  };

  // Default chain name is "canopy" if no chain is selected
  const displayChainName = selectedChain ? selectedChain.chain_name : "canopy";

  return (
    <div className={cn("relative pr-0", className)}>
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      <Input
        type="text"
        placeholder="Search by address, tx hash, block..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-12 pr-[140px] py-6 bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-gray-400 rounded-xl"
      />

      <CommandSearchTrigger
        className="absolute right-1 mr-[-4px] top-1/2 transform -translate-y-1/2"
        explorerMode
        displayChainName={displayChainName}
        onChainSelect={handleChainSelect}
      />
    </div>
  );
}
