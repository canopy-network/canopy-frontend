"use client";

import { useState } from "react";
import { TableCard, TableColumn } from "./table-card";
import { Chain } from "@/types/chains";
import { canopyIconSvg, getCanopyAccent, EXPLORER_ICON_GLOW } from "@/lib/utils/brand";
import { ChainDetailModal } from "./chain-detail-modal";
import { chainsApi } from "@/lib/api/chains";

// Format CNPY value - just format the number with commas (values come from API already in correct units)
const formatCNPYValue = (value?: number | null) => {
  if (value === undefined || value === null || value === 0) return "0";
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  });
};

interface NewLaunchesProps {
  chains: Chain[];
}

// Graduation Status component - compact version for table
function GraduationStatus({
  graduation,
  isGraduated,
  graduationTime
}: {
  graduation?: Chain['graduation'];
  isGraduated?: boolean;
  graduationTime?: string | null;
}) {
  if (isGraduated && graduationTime) {
    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">Status</span>
          <span className="text-xs font-semibold text-[#00a63d]">Yes</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div className="bg-[#00a63d] h-2 rounded-full" style={{ width: "100%" }} />
        </div>
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

const formatValue = (value?: number | null) => {
  if (value === undefined || value === null) return "N/A";
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
};

export function NewLaunches({ chains }: NewLaunchesProps) {
  const [selectedChain, setSelectedChain] = useState<Chain | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRowClick = async (rowIndex: number) => {
    const chain = chains[rowIndex];
    if (!chain) return;

    setIsModalOpen(true);

    try {
      // Fetch full chain data with all includes
      const response = await chainsApi.getChain(chain.id, {
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
    { label: "Chain", width: "w-[140px]" },
    { label: "Market Cap", width: "w-32" },
    { label: "Holders", width: "w-32" },
    { label: "Graduation", width: "w-32" },
  ];

  const rows = chains.slice(0, 5).map((chain) => {
    const uniqueTraders =
      chain.virtual_pool?.unique_traders ??
      (chain as any)?.graduated_pool?.unique_traders ??
      0;

    return [
      // Chain
      <div key="chain" className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          dangerouslySetInnerHTML={{
            __html: canopyIconSvg(getCanopyAccent(chain.id)),
          }}
        />
        <div className="flex flex-col">
          <span className="font-medium text-white text-sm">{chain.chain_name}</span>
          <span className="text-xs text-muted-foreground">
            {chain.token_symbol}
          </span>
        </div>
      </div>,
      // Market Cap
      <span key="market-cap" className="text-white font-medium text-sm">
        {formatValue(chain.virtual_pool?.market_cap_usd)}
      </span>,
      // Unique Traders
      <div key="traders" className="flex items-center gap-2">
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
            +{uniqueTraders.toLocaleString()}
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
        id="new-launches"
        title="New Launches"
        live={true}
        columns={columns}
        rows={rows}
        viewAllPath="/chains"
        loading={chains.length === 0}
        updatedTime="44 secs ago"
        compactFooter={true}
        spacing={3}
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
