"use client";

import { useState } from "react";
import { TableCard, TableColumn } from "./table-card";
import { canopyIconSvg, getCanopyAccent } from "@/lib/utils/brand";
import { ChainDetailModal } from "./chain-detail-modal";
import { chainsApi } from "@/lib/api/chains";
import type { Chain } from "@/types/chains";

// Format CNPY value - just format the number with commas (values come from API already in correct units)
const formatCNPYValue = (value?: number | null) => {
  if (value === undefined || value === null || value === 0) return "0";
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  });
};

export interface ChainSummary {
  id: string;
  chainId?: number;
  name: string;
  ticker?: string;
  rank?: number;
  market_cap: string;
  marketCapRaw?: number; // Raw market cap value in USD for CNPY conversion
  tvl: string;
  tvlRaw?: number; // Raw TVL value in USD for CNPY conversion
  liquidity: string;
  liquidityRaw?: number; // Raw liquidity value in USD for CNPY conversion
  volume_24h: string;
  volume24hRaw?: number; // Raw volume value in USD for CNPY conversion
  change_24h: number;
  validators: number;
  holders: number;
  chartData?: number[]; // 24 data points for the chart
  // Graduation data (optional, fetched when needed)
  graduation?: {
    threshold_cnpy: number;
    current_cnpy_reserve: number;
    cnpy_remaining: number;
    completion_percentage: number;
  };
  is_graduated?: boolean;
  graduation_time?: string | null;
}

interface TrendingChainsProps {
  chains: ChainSummary[];
}

// Graduation Status component - compact version for table
function GraduationStatus({
  graduation,
  isGraduated,
  graduationTime
}: {
  graduation?: ChainSummary['graduation'];
  isGraduated?: boolean;
  graduationTime?: string | null;
}) {
  if (isGraduated && graduationTime) {
    const date = new Date(graduationTime);
    const formattedDate = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">Graduated</span>
          <span className="text-xs font-semibold text-[#00a63d]">Yes</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div className="bg-[#00a63d] h-2 rounded-full" style={{ width: "100%" }} />
        </div>
        <span className="text-xs text-muted-foreground">{formattedDate}</span>
      </div>
    );
  }

  if (!graduation) {
    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">Progress</span>
          <span className="text-xs font-semibold text-[#00a63d]">0%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div className="bg-[#00a63d] h-2 rounded-full" style={{ width: "0%" }} />
        </div>
      </div>
    );
  }

  const percentage = Math.min(Math.max(graduation.completion_percentage, 0), 100);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">Progress</span>
        <span className="text-xs font-semibold text-[#00a63d]">{percentage}%</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-2">
        <div
          className="bg-[#00a63d] h-2 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-xs text-muted-foreground">
        {formatCNPYValue(graduation.current_cnpy_reserve)} / {formatCNPYValue(graduation.threshold_cnpy)} CNPY
      </div>
    </div>
  );
}

export function TrendingChains({ chains }: TrendingChainsProps) {
  const [selectedChain, setSelectedChain] = useState<Chain | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRowClick = async (rowIndex: number) => {
    const chain = chains[rowIndex];
    if (!chain) return;

    setIsModalOpen(true);

    try {
      // Fetch full chain data using chainId or id
      const chainId = chain.chainId?.toString() || chain.id;
      const response = await chainsApi.getChain(chainId, {
        include:
          "creator,template,assets,holders,graduation,repository,social_links,graduated_pool,virtual_pool,accolades",
      });

      if (response.data) {
        setSelectedChain(response.data);
      } else {
        console.error("No chain data returned");
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error fetching chain details:", error);
      setIsModalOpen(false);
    }
  };

  const columns: TableColumn[] = [
    { label: "Rank", width: "w-16" },
    { label: "Chain Name", width: "w-[180px]" },
    { label: "Market Cap", width: "w-32" },
    { label: "TVL", width: "w-36" },
    { label: "Liquidity", width: "w-36" },
    { label: "Validators", width: "w-24" },
    { label: "Holders", width: "w-32" },
    { label: "Graduation Status", width: "w-36" },
  ];

  const rows = chains.map((chain, index) => {
    return [
      // Rank
      <div
        key="rank"
        className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 font-medium text-white text-sm"
      >
        {chain.rank ?? index + 1}
      </div>,
      // Chain Name
      <div key="chain-name" className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          dangerouslySetInnerHTML={{
            __html: canopyIconSvg(getCanopyAccent(chain.id)),
          }}
        />
        <div

          className="flex flex-col hover:text-primary transition-colors"
        >
          <span className="font-medium text-white text-sm">{chain.name}</span>
          {chain.ticker && (
            <span className="text-xs text-muted-foreground">
              {chain.ticker}
            </span>
          )}
        </div>
      </div>,
      // Market Cap
      <div key="market-cap" className="flex flex-col">
        <span className="text-white font-medium text-sm">{chain.market_cap}</span>
        {chain.marketCapRaw && (
          <span className="text-xs text-muted-foreground">
            {formatCNPYValue(chain.marketCapRaw)} CNPY
          </span>
        )}
      </div>,
      // TVL
      <div key="tvl" className="flex flex-col">
        <span className="text-white font-medium text-sm">{chain.tvl}</span>
        {chain.tvlRaw && (
          <span className="text-xs text-muted-foreground">
            {formatCNPYValue(chain.tvlRaw)} CNPY
          </span>
        )}
      </div>,
      // Liquidity
      <div key="liquidity" className="flex flex-col">
        <span className="text-white font-medium text-sm">{chain.liquidity}</span>
        {chain.liquidityRaw && (
          <span className="text-xs text-muted-foreground">
            {formatCNPYValue(chain.liquidityRaw)} CNPY
          </span>
        )}
      </div>,
      // Validators
      <span key="validators" className="text-white font-medium text-sm">
        {chain.validators.toLocaleString()}
      </span>,
      // Holders
      <div key="holders" className="flex items-center gap-2">
        <div className="bg-white/10 rounded-full p-2 flex items-center gap-1">
          <div className="flex -space-x-2">
            <span
              className="w-6 h-6 inline-flex items-center justify-center border border-background rounded-full bg-white/10"
              dangerouslySetInnerHTML={{
                __html: canopyIconSvg(getCanopyAccent(chain.id)),
              }}
            />
            <span
              className="w-6 h-6 inline-flex items-center justify-center border border-background rounded-full bg-white/10"
              dangerouslySetInnerHTML={{
                __html: canopyIconSvg(getCanopyAccent(`${chain.id}-b`)),
              }}
            />
          </div>
          <span className="text-gray-400 font-medium text-sm">
            +{chain.holders.toLocaleString()}
          </span>
        </div>
      </div>,
      // Graduation Status
      <div key="graduation" className="flex justify-start">
        <GraduationStatus
          graduation={chain.graduation}
          isGraduated={chain.is_graduated}
          graduationTime={chain.graduation_time}
        />
      </div>,
    ];
  });

  return (
    <>
      <TableCard
        id="trending-chains"
        title="Trending Chains"
        live={true}
        columns={columns}
        rows={rows}
        viewAllPath="/chains"
        loading={chains.length === 0}
        updatedTime="10m ago"
        compactFooter={true}
        spacing={2}
        className="gap-2 lg:gap-6"
        onRowClick={handleRowClick}
      />

      {selectedChain && (
        <ChainDetailModal
          chain={selectedChain}
          open={isModalOpen}
          onOpenChange={(open) => {
            setIsModalOpen(open);
            if (!open) {
              setSelectedChain(null);
            }
          }}
        />
      )}
    </>
  );
}
