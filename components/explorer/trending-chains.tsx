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

export interface VolumeHistoryEntry {
  date: string;
  volume: number;
  volume_fmt?: string;
}

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
  volume_history?: VolumeHistoryEntry[]; // 7-day volume history
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

// Mini chart component for Last 7 days
function MiniVolumeChart({ volumeHistory }: { volumeHistory?: VolumeHistoryEntry[] }) {
  if (!volumeHistory || volumeHistory.length === 0) {
    return (
      <div className="w-20 h-8 flex items-center justify-center">
        <span className="text-xs text-muted-foreground">No data</span>
      </div>
    );
  }

  // Extract volumes and normalize for chart
  const volumes = volumeHistory.map((entry) => entry.volume || 0);
  const maxVolume = Math.max(...volumes, 1); // Avoid division by zero
  const minVolume = Math.min(...volumes);
  const range = maxVolume - minVolume || 1; // Avoid division by zero

  // Calculate if trend is positive or negative
  const firstVolume = volumes[0] || 0;
  const lastVolume = volumes[volumes.length - 1] || 0;
  const isPositive = lastVolume >= firstVolume;
  const color = isPositive ? "#00a63d" : "#ef4444"; // Green for positive, red for negative

  // Normalize values to 0-1 range for chart height
  const normalizedValues = volumes.map((vol) =>
    range > 0 ? (vol - minVolume) / range : 0.5
  );

  const width = 80;
  const height = 32;
  const padding = 2;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const pointSpacing = chartWidth / (normalizedValues.length - 1 || 1);

  // Generate path for line
  const pathPoints = normalizedValues.map((value, index) => {
    const x = padding + index * pointSpacing;
    const y = padding + chartHeight - (value * chartHeight);
    return `${index === 0 ? "M" : "L"} ${x} ${y}`;
  }).join(" ");

  return (
    <div className="w-20 h-8">
      <svg width={width} height={height} className="overflow-visible">
        <path
          d={pathPoints}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
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
    { label: "Volume 24H", width: "w-36" },
    { label: "Validators", width: "w-24" },
    { label: "Holders", width: "w-32" },
    { label: "Last 7 days", width: "w-24" },
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
      // Volume 24H
      <div key="volume-24h" className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-white font-medium text-sm">{chain.volume_24h}</span>
          {chain.change_24h !== undefined && chain.change_24h !== null && (
            <span
              className={`text-xs font-semibold px-1.5 py-0.5 rounded ${chain.change_24h >= 0
                  ? "text-[#00a63d] bg-[#00a63d]/10"
                  : "text-[#ef4444] bg-[#ef4444]/10"
                }`}
            >
              {chain.change_24h >= 0 ? "↑" : "↓"}
              {Math.abs(chain.change_24h).toFixed(1)}%
            </span>
          )}
        </div>
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
      // Last 7 days chart
      <div key="last-7-days" className="flex justify-center">
        <MiniVolumeChart volumeHistory={chain.volume_history} />
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
