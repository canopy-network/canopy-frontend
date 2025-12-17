"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { TableCard, TableColumn } from "./table-card";
import { canopyIconSvg, getCanopyAccent } from "@/lib/utils/brand";
import { useMemo } from "react";
import { useRouter } from "next/navigation";

interface Validator {
  name: string;
  address: string;
  stake?: string;
  stakedCnp?: string; // Formatted stake in CNPY (e.g., "1,000")
  stakedAmount?: string; // Raw stake amount in micro units
  apr?: string;
  apy?: number;
  votingPower?: number;
  uptime: number;
  uptimeTrend?: number[]; // Array of uptime values for sparkline (7 or 30 data points)
  healthScore?: number; // Performance score 0-100
  status?: "healthy" | "warning" | "at_risk"; // Health status
  statusMessage?: string; // Tooltip message
  chains?: string[]; // Array of chain names the validator is staking for
  originalStatus?: string; // Backend status (active/inactive/unstaking/paused)
}

interface TopValidatorsProps {
  validators: Validator[];
}

type AggregatedValidator = Validator & {
  chainCount: number;
  totalVotingPower: number;
  totalApy: number;
  totalStake: number; // Total stake in micro units
  entries: number;
  votingPowerAvg: number;
  apyAvg: number;
  totalUptime: number;
  uptimeAvg: number;
  rawStatus?: string;
};

// Simple trend arrow component
function UptimeTrend({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length === 0) return null;

  // Determine trend direction
  const firstValue = data[0];
  const lastValue = data[data.length - 1];
  const isUpward = lastValue > firstValue;

  return (
    <div className={color}>
      {isUpward ? (
        <TrendingUp className="w-3 h-3" />
      ) : (
        <TrendingDown className="w-3 h-3" />
      )}
    </div>
  );
}

export function TopValidators({ validators }: TopValidatorsProps) {
  const router = useRouter();

  // Determine uptime color based on percentage
  const getUptimeColor = (uptime: number) => {
    if (uptime >= 99)
      return "bg-[#00a63d]/10 text-[#00a63d] border border-[#00a63d]/50";
    if (uptime >= 97) return "bg-yellow-500/10 text-yellow-500";
    return "bg-red-500/10 text-red-500";
  };

  // Get text color for sparkline
  const getUptimeTextColor = (uptime: number) => {
    if (uptime >= 99) return "text-[#00a63d]";
    if (uptime >= 97) return "text-yellow-500";
    return "text-red-500";
  };

  const formatApy = (apy?: number) => {
    if (apy === undefined || apy === null || Number.isNaN(apy) || apy === 0) return "0%";
    // Format with commas for large numbers, always 3 decimal places
    return `${apy.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}%`;
  };

  const formatStake = (stakeInMicroUnits: number): string => {
    // Convert from micro units to CNPY (divide by 1,000,000)
    const cnpyAmount = stakeInMicroUnits / 1_000_000;

    if (cnpyAmount >= 1_000_000) {
      return `${(cnpyAmount / 1_000_000).toFixed(1)}M CNPY`;
    }
    if (cnpyAmount >= 1_000) {
      return `${(cnpyAmount / 1_000).toFixed(1)}K CNPY`;
    }
    return `${cnpyAmount.toFixed(1)} CNPY`;
  };

  const mergeStatus = (
    current?: string,
    next?: string
  ) => {
    if (!current) return next;
    if (!next) return current;

    // Higher score wins
    const priority: Record<string, number> = {
      inactive: 0,
      paused: 1,
      unstaking: 2,
      active: 3,
      healthy: 3, // fallback
      warning: 2,
      at_risk: 1,
    };

    const currentScore = priority[current.toLowerCase()] ?? 0;
    const nextScore = priority[next.toLowerCase()] ?? 0;

    return nextScore > currentScore ? next : current;
  };

  const aggregatedValidators = useMemo(() => {
    const byAddress = new Map<string, AggregatedValidator>();

    validators.forEach((validator) => {
      const chains =
        validator.chains && validator.chains.length > 0
          ? validator.chains
          : [validator.name];
      const votingPower = Number(validator.votingPower ?? 0);
      const apy = Number(validator.apy ?? 0);
      const uptimeValue = Number(validator.uptime ?? 0);
      const statusValue = validator.originalStatus || validator.status;
      // Parse stake amount (remove commas if present, then parse)
      const stakeAmount = validator.stakedAmount
        ? parseFloat(validator.stakedAmount.replace(/,/g, ''))
        : 0;
      const existing = byAddress.get(validator.address);

      if (existing) {
        const mergedChains = Array.from(
          new Set([...(existing.chains || []), ...chains])
        );

        existing.chains = mergedChains;
        existing.chainCount = mergedChains.length;
        existing.totalVotingPower += votingPower;
        existing.totalApy += apy;
        existing.totalStake += stakeAmount;
        existing.entries += 1;
        existing.totalUptime += uptimeValue;
        existing.rawStatus = mergeStatus(existing.rawStatus, statusValue);
      } else {
        byAddress.set(validator.address, {
          ...validator,
          chains,
          chainCount: chains.length,
          totalVotingPower: votingPower,
          totalApy: apy,
          totalStake: stakeAmount,
          entries: 1,
          votingPowerAvg: votingPower,
          apyAvg: apy,
          totalUptime: uptimeValue,
          uptimeAvg: uptimeValue,
          rawStatus: statusValue,
        });
      }
    });

    // Calculate averages and sort by voting power
    const sorted = Array.from(byAddress.values())
      .map((validator) => ({
        ...validator,
        votingPowerAvg:
          validator.entries > 0
            ? validator.totalVotingPower / validator.entries
            : 0,
        apyAvg:
          validator.entries > 0 ? validator.totalApy / validator.entries : 0,
        uptimeAvg:
          validator.entries > 0 ? validator.totalUptime / validator.entries : 0,
        uptime:
          validator.entries > 0 ? validator.totalUptime / validator.entries : 0,
      }))
      .sort((a, b) => {
        // Sort by total stake (descending), then by voting power (descending) as tiebreaker
        if (b.totalStake !== a.totalStake) {
          return b.totalStake - a.totalStake;
        }
        if (b.votingPowerAvg !== a.votingPowerAvg) {
          return b.votingPowerAvg - a.votingPowerAvg;
        }
        return (b.apyAvg || 0) - (a.apyAvg || 0);
      });

    // Return top 8 validators
    return sorted.slice(0, 8);
  }, [validators]);

  const getChainAvatars = (
    chains: string[] | undefined,
    fallback: string,
    limit = 2
  ) => {
    if (!chains || chains.length === 0) return [fallback];
    return chains.slice(0, limit);
  };


  const columns: TableColumn[] = [
    { label: "Rank", width: "w-16" },
    { label: "Validator", width: "w-[140px]" },
    { label: "Chains", width: "w-32" },
    { label: "Stake", width: "w-32" },
    { label: "APY", width: "w-32" },
    { label: "Uptime", width: "w-32" },
  ];

  // Handle row click to navigate to validator detail
  const handleRowClick = (rowIndex: number) => {
    const validator = aggregatedValidators[rowIndex];
    if (validator?.address) {
      router.push(`/validators/${validator.address}`);
    }
  };

  const rows = aggregatedValidators.map((validator, index) => {
    const chainAvatars = getChainAvatars(validator.chains, validator.address);

    return [
      // Rank
      <div
        key="rank"
        className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 font-medium text-white text-sm"
      >
        {index + 1}
      </div>,
      // Validator
      <div key="validator" className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          dangerouslySetInnerHTML={{
            __html: canopyIconSvg(getCanopyAccent(validator.name)),
          }}
        />
        <div className="flex flex-col">
          <span className="font-medium text-white text-sm">{validator.name}</span>
          <span className="text-xs text-muted-foreground font-mono truncate max-w-[130px]">
            {validator.address}
          </span>
        </div>
      </div>,
      // Chains
      <div key="chains" className="flex items-center gap-2">
        <div className="bg-white/10 rounded-full p-2 flex items-center gap-1">
          <div className="flex -space-x-2">
            {chainAvatars.map((chain, chainIndex) => (
              <span
                key={`${validator.address}-${chain}-${chainIndex}`}
                className="w-6 h-6 inline-flex items-center justify-center border border-background rounded-full bg-white/10"
                dangerouslySetInnerHTML={{
                  __html: canopyIconSvg(
                    getCanopyAccent(`${chain}-${chainIndex}`)
                  ),
                }}
              />
            ))}
          </div>
          <span className="text-gray-400 font-medium text-sm">
            +{validator.chainCount}
          </span>
        </div>
      </div>,
      // Stake
      <span key="stake" className="text-white font-medium text-sm">
        {formatStake(validator.totalStake || 0)}
      </span>,
      // APY
      <span key="apy" className="text-white font-medium text-sm">
        {formatApy(validator.apyAvg)}
      </span>,
      // Uptime
      <span
        key="uptime"
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md font-medium text-sm ${getUptimeColor(
          validator.uptime
        )}`}
      >
        {validator.uptime.toFixed(1)}%
        {validator.uptimeTrend && (
          <UptimeTrend
            data={validator.uptimeTrend}
            color={getUptimeTextColor(validator.uptime)}
          />
        )}
      </span>,
    ];
  });

  return (
    <TableCard
      id="top-validators"
      title="Top Validators"
      live={true}
      columns={columns}
      rows={rows}
      viewAllPath="/validators"
      loading={aggregatedValidators.length === 0}
      updatedTime="44 secs ago"
      compactFooter={true}
      spacing={3}
      className="gap-2 lg:gap-6"
      viewAllText="Validators"
      onRowClick={handleRowClick}
    />
  );
}
