"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { TableCard, TableColumn } from "@/components/explorer/table-card";
import { useValidators, useValidator } from "@/lib/api/validators";
import { canopyIconSvg, getCanopyAccent } from "@/lib/utils/brand";
import { chainsApi } from "@/lib/api/chains";

const ROWS_PER_PAGE = 12;

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
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [chainNames, setChainNames] = useState<Record<number, string>>({});

  // Get chain_id from URL search params or chainContext
  const chainIdFromUrl = searchParams.get("chain");
  const effectiveChainId = useMemo(() => {
    // Priority: URL param > chainContext
    if (chainIdFromUrl) {
      const chainIdNum = parseInt(chainIdFromUrl, 10);
      return chainIdNum > 0 ? chainIdNum : undefined;
    }
    return chainContext?.id ? parseInt(chainContext.id, 10) : undefined;
  }, [chainIdFromUrl, chainContext?.id]);

  // Calculate offset for pagination
  const offset = useMemo(() => {
    return (currentPage - 1) * ROWS_PER_PAGE;
  }, [currentPage]);

  // Fetch validators using React Query with pagination
  const {
    data: validatorsResponse,
    isLoading: isLoadingValidators,
  } = useValidators(
    {
      ...(effectiveChainId && { chain_id: effectiveChainId }),
      limit: ROWS_PER_PAGE,
      offset: offset,
    },
    {
      staleTime: 10000, // 10 seconds
    }
  );

  const totalCount = validatorsResponse?.metadata?.total || 0;

  const formatStakeUSD = (stake: number): string => {
    if (stake >= 1000000) {
      return `${(stake / 1000000).toFixed(1)}M CNPY`;
    } else if (stake >= 1000) {
      return `${(stake / 1000).toFixed(1)}K CNPY`;
    }
    return `${stake.toFixed(0)} CNPY`;
  };

  const aggregatedValidators = useMemo<AggregatedValidator[]>(() => {
    const validators = validatorsResponse?.validators || [];
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
  }, [validatorsResponse?.validators]);

  // Filter validators by search query (client-side filtering on current page)
  const filteredValidators = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return aggregatedValidators;

    return aggregatedValidators.filter((validator) => {
      return [validator.validatorName, validator.address, validator.status]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [searchQuery, aggregatedValidators]);

  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(totalCount / ROWS_PER_PAGE));

  // Reset to page 1 when chain changes
  useEffect(() => {
    setCurrentPage(1);
  }, [effectiveChainId]);

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

  // Handle row expansion
  const handleRowExpand = (rowIndex: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowIndex)) {
      newExpanded.delete(rowIndex);
    } else {
      newExpanded.add(rowIndex);
    }
    setExpandedRows(newExpanded);
  };

  // Fetch chain names for cross-chain display
  useEffect(() => {
    const fetchChainNames = async () => {
      const names: Record<number, string> = {};
      const chainIds = new Set<number>();

      // Collect all unique chain IDs from expanded validators
      filteredValidators.forEach((validator, idx) => {
        if (expandedRows.has(idx)) {
          validator.chains.forEach((chainId) => chainIds.add(chainId));
        }
      });

      await Promise.all(
        Array.from(chainIds).map(async (chainId) => {
          try {
            const response = await chainsApi.getChain(chainId.toString()).catch(() => null);
            if (response?.data) {
              names[chainId] = response.data.chain_name || `Chain ${chainId}`;
            } else {
              names[chainId] = `Chain ${chainId}`;
            }
          } catch (error) {
            names[chainId] = `Chain ${chainId}`;
          }
        })
      );

      setChainNames((prev) => ({ ...prev, ...names }));
    };

    if (expandedRows.size > 0) {
      fetchChainNames();
    }
  }, [expandedRows, filteredValidators]);

  // Component for expanded content (needs to be separate to use hooks)
  const ExpandedValidatorContent = ({ validatorAddress }: { validatorAddress: string }) => {
    const { data: validatorDetail, isLoading } = useValidator(validatorAddress);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="text-sm text-muted-foreground">Loading validator details...</div>
        </div>
      );
    }

    if (!validatorDetail?.cross_chain || validatorDetail.cross_chain.length === 0) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="text-sm text-muted-foreground">No cross-chain data available</div>
        </div>
      );
    }

    // Calculate total staked for voting power calculation
    const totalStaked = validatorDetail.cross_chain.reduce((total, c) => {
      return total + parseFloat(c.staked_cnpy?.replace(/,/g, "") || "0");
    }, 0);

    return (
      <div className="w-full">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Chain</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Voting Power</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Value</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Current Rewards</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Rewards (30d)</th>
            </tr>
          </thead>
          <tbody>
            {validatorDetail.cross_chain.map((chain) => {
              const chainName = chainNames[chain.chain_id] || `Chain ${chain.chain_id}`;
              const chainColor = getCanopyAccent(chain.chain_id.toString());
              const stakedUSD = parseFloat(chain.staked_usd?.replace(/,/g, "") || "0");
              const currentRewards = parseFloat(chain.rewards_cnpy?.replace(/,/g, "") || "0");
              const rewards30d = currentRewards * 30;
              // Calculate voting power percentage
              const chainStaked = parseFloat(chain.staked_cnpy?.replace(/,/g, "") || "0");
              const votingPowerPercent = totalStaked > 0
                ? ((chainStaked / totalStaked) * 100).toFixed(1)
                : "0.0";

              return (
                <tr key={chain.chain_id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                        dangerouslySetInnerHTML={{
                          __html: canopyIconSvg(chainColor),
                        }}
                      />
                      <span className="text-sm text-white font-medium">{chainName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-white">{votingPowerPercent}%</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-white">{formatStakeUSD(stakedUSD)}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm font-medium text-[#00a63d]">
                      {currentRewards.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      CNPY
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm font-medium text-[#00a63d]">
                      {rewards30d.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      CNPY
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // Render expanded content for a row
  const renderExpandedContent = (rowIndex: number) => {
    const validator = filteredValidators[rowIndex];
    if (!validator) return null;

    return <ExpandedValidatorContent validatorAddress={validator.address} />;
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
    { label: "", width: "w-10" },
  ];

  const rows = filteredValidators.map((validator: AggregatedValidator, idx: number) => {
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
            {validator.chains.slice(0, 2).map((chainId: number) => (
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

      </span>,
      <div key={`expanded-${validator.address}`}>
        {expandedRows.has(filteredValidators.indexOf(validator)) ? (
          <ChevronUp className="w-5 h-5 text-white/40" />
        ) : (
          <ChevronDown className="w-5 h-5 text-white/40" />
        )
        }
      </div>
    ];
  });

  return (
    <div className="max-w-7xl mx-auto py-6">
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
        totalCount={totalCount}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        showCSVButton={true}
        spacing={3}
        className="gap-2 lg:gap-6"
        expandableRows={true}
        expandedRows={expandedRows}
        onRowExpand={handleRowExpand}
        renderExpandedContent={renderExpandedContent}
      />
    </div>
  );
}
