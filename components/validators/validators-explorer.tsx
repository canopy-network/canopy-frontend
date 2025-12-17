"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { TableCard, TableColumn } from "@/components/explorer/table-card";
import { validatorsApi, type ValidatorData } from "@/lib/api/validators";
import { canopyIconSvg, getCanopyAccent } from "@/lib/utils/brand";

const ROWS_PER_PAGE = 8;

interface ValidatorsExplorerProps {
  chainContext?: {
    id: string;
    name: string;
  };
}

type AggregatedValidator = {
  address: string;
  validatorName: string;
  stakeUSD: number;
  stakeFormatted: string;
  chains: number[];
  chainCount: number;
  blocks: number;
  uptime: number;
  apy: number;
  stakingUSD: number; // Staking in USD
  rewards30dCNPY: number; // Rewards 30d in CNPY
  status: "Online" | "Offline" | "Jailed";
};

export function ValidatorsExplorer({ chainContext }: ValidatorsExplorerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [validators, setValidators] = useState<ValidatorData[]>([]);
  const [isLoadingValidators, setIsLoadingValidators] = useState(true);
  const [chainFilterId, setChainFilterId] = useState<string | null>(null);

  const chainContextId = chainContext?.id ?? null;

  useEffect(() => {
    setChainFilterId(chainContextId);
  }, [chainContextId]);

  useEffect(() => {
    async function fetchValidators() {
      try {
        setIsLoadingValidators(true);
        const response = await validatorsApi.getValidators({
          chain_id: chainContextId ? parseInt(chainContextId) : undefined,
          limit: 1000,
        });
        setValidators(response.validators);
        setIsLoadingValidators(false);
      } catch (err) {
        console.error("Failed to fetch validators:", err);
        setIsLoadingValidators(false);
      }
    }
    fetchValidators();
  }, [chainContextId]);

  const formatStakeUSD = (stake: number): string => {
    if (stake >= 1000000) {
      return `$${(stake / 1000000).toFixed(1)}M`;
    } else if (stake >= 1000) {
      return `$${(stake / 1000).toFixed(1)}K`;
    }
    return `$${stake.toFixed(0)}`;
  };

  const aggregatedValidators = useMemo<AggregatedValidator[]>(() => {
    const byAddress = new Map<string, AggregatedValidator>();

    validators.forEach((validator) => {
      const stakeUSD = parseFloat(validator.staked_usd?.replace(/,/g, "") || "0");
      const stakeCNPY = parseFloat(validator.staked_cnpy.replace(/,/g, ""));
      const apy = validator.apy ?? 0;
      const uptime = Number(validator.uptime ?? 0);
      const committees = validator.committees || [validator.chain_id];

      let statusDisplay: "Online" | "Offline" | "Jailed" = "Online";
      if (validator.status === "unstaking") {
        statusDisplay = "Offline";
      } else if (validator.status === "paused") {
        statusDisplay = "Jailed";
      }

      const existing = byAddress.get(validator.address);

      if (existing) {
        existing.stakeUSD += stakeUSD;
        existing.chains = Array.from(new Set([...existing.chains, ...committees]));
        existing.chainCount = existing.chains.length;
        existing.blocks += validator.reward_count || 0;
        existing.apy = (existing.apy + apy) / 2;
        existing.uptime = (existing.uptime + uptime) / 2;
      } else {
        const shortAddr = validator.address.slice(0, 6);
        const validatorName = `Val-${shortAddr.slice(-2)}`;
        const rewards30dCNPY = stakeCNPY * (apy / 100) * (30 / 365);

        byAddress.set(validator.address, {
          address: validator.address,
          validatorName,
          stakeUSD,
          stakeFormatted: formatStakeUSD(stakeUSD),
          chains: committees,
          chainCount: committees.length,
          blocks: validator.reward_count || 0,
          uptime,
          apy,
          stakingUSD: stakeUSD,
          rewards30dCNPY,
          status: statusDisplay,
        });
      }
    });

    byAddress.forEach((validator) => {
      validator.stakeFormatted = formatStakeUSD(validator.stakeUSD);
      const totalStakeCNPY = validators
        .filter((v) => v.address === validator.address)
        .reduce((sum, v) => sum + parseFloat(v.staked_cnpy.replace(/,/g, "")), 0);
      validator.rewards30dCNPY = totalStakeCNPY * (validator.apy / 100) * (30 / 365);
    });

    return Array.from(byAddress.values()).sort((a, b) => b.stakeUSD - a.stakeUSD);
  }, [validators]);

  const filteredValidators = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return aggregatedValidators.filter((validator) => {
      const matchesQuery = query
        ? [validator.validatorName, validator.address, validator.status]
          .join(" ")
          .toLowerCase()
          .includes(query)
        : true;
      const matchesChain = chainFilterId
        ? validator.chains.includes(parseInt(chainFilterId))
        : true;
      return matchesQuery && matchesChain;
    });
  }, [searchQuery, chainFilterId, aggregatedValidators]);

  const totalEntries = filteredValidators.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / ROWS_PER_PAGE));

  const paginatedValidators = useMemo(() => {
    const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
    return filteredValidators.slice(startIndex, startIndex + ROWS_PER_PAGE);
  }, [filteredValidators, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, chainFilterId]);

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const formatAddress = (address: string) => {
    if (!address || address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  const formatApy = (apy: number) => {
    if (apy === undefined || apy === null || Number.isNaN(apy) || apy === 0) return "0.0%";
    return `${apy.toLocaleString(undefined, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })}%`;
  };

  const columns: TableColumn[] = [
    { label: "Validator Name", width: "w-[200px]" },
    { label: "Stake", width: "w-32" },
    { label: "Chains", width: "w-32" },
    { label: "Blocks", width: "w-32" },
    { label: "Uptime", width: "w-32" },
    { label: "APY", width: "w-32" },
    { label: "Staking", width: "w-40" },
    { label: "Rewards (30d)", width: "w-40" },
    { label: "Status", width: "w-32" },
  ];

  const rows = paginatedValidators.map((validator) => {
    const getUptimeColor = (uptime: number) => {
      if (uptime >= 99) return "bg-[#00a63d]/10 text-[#00a63d] border border-[#00a63d]/50";
      if (uptime >= 97) return "bg-yellow-500/10 text-yellow-500 border border-yellow-500/50";
      return "bg-red-500/10 text-red-500 border border-red-500/50";
    };

    const getStatusColor = (status: string) => {
      if (status === "Online") return "bg-[#00a63d] text-white";
      if (status === "Offline") return "bg-gray-500/10 text-gray-300 border border-gray-500/50";
      return "bg-red-500/10 text-red-300 border border-red-500/50";
    };

    return [
      // Validator Name
      <div key="validator" className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          dangerouslySetInnerHTML={{
            __html: canopyIconSvg(getCanopyAccent(validator.address)),
          }}
        />
        <div className="flex flex-col">
          <Link
            href={`/validators/${validator.address}`}
            className="text-sm font-medium text-white hover:opacity-80 transition-opacity hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {validator.validatorName}
          </Link>
          <span className="text-xs text-muted-foreground">
            {formatAddress(validator.address)}
          </span>
        </div>
      </div>,
      // Stake
      <span key="stake" className="text-sm text-white font-medium">
        {validator.stakeFormatted}
      </span>,
      // Chains
      <div key="chains" className="flex items-center gap-2">
        <div className="bg-white/10 rounded-full p-2 flex items-center gap-1">
          <div className="flex -space-x-2">
            {validator.chains.slice(0, 2).map((chainId) => (
              <div
                key={chainId}
                className="w-6 h-6 rounded-full border border-background bg-white/10 flex items-center justify-center"
                dangerouslySetInnerHTML={{
                  __html: canopyIconSvg(getCanopyAccent(chainId.toString())),
                }}
              />
            ))}
          </div>
          {validator.chainCount > 2 && (
            <span className="text-xs text-muted-foreground">+{validator.chainCount - 2}</span>
          )}
        </div>
      </div>,
      // Blocks
      <span key="blocks" className="text-sm text-white font-medium">
        {validator.blocks.toLocaleString()}
      </span>,
      // Uptime
      <span
        key="uptime"
        className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getUptimeColor(validator.uptime)}`}
      >
        {validator.uptime.toFixed(1)}%
      </span>,
      // APY
      <span key="apy" className="text-sm text-white font-medium">
        {formatApy(validator.apy)}
      </span>,
      // Staking (USD)
      <span key="staking" className="text-sm text-white font-medium">
        {formatStakeUSD(validator.stakingUSD)}
      </span>,
      // Rewards (30d) - CNPY in green
      <span key="rewards-30d" className="text-sm font-medium text-[#00a63d]">
        {validator.rewards30dCNPY.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}{" "}
        CNPY
      </span>,
      // Status
      <span
        key="status"
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(validator.status)}`}
      >
        {validator.status}
        <ChevronDown className="w-3 h-3" />
      </span>,
    ];
  });

  return (
    <div className="px-4 lg:p-6">
      <TableCard
        id="validators-table"
        title="Validators"
        searchPlaceholder="Search by validator name"
        onSearch={setSearchQuery}
        searchValue={searchQuery}
        live={false}
        columns={columns}
        rows={rows}
        loading={isLoadingValidators}
        paginate={true}
        pageSize={ROWS_PER_PAGE}
        currentEntriesPerPage={ROWS_PER_PAGE}
        totalCount={totalEntries}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        spacing={3}
        className="gap-2 lg:gap-6"
      />
    </div>
  );
}
