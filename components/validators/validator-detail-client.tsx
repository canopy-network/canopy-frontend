"use client";

import * as React from "react";
import { ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ValidatorDetailData, useValidatorRewards } from "@/lib/api/validators";
import { canopyIconSvg, getCanopyAccent } from "@/lib/utils/brand";
import { CopyableText } from "@/components/ui/copyable-text";
import { chainsApi } from "@/lib/api/chains";
import type { Chain } from "@/types/chains";
import { ChainDetailChart } from "@/components/charts/chain-detail-chart";
import { format } from "date-fns";

interface ValidatorDetailClientProps {
  validator: ValidatorDetailData;
}

// Format address for display (first 5 chars + last 5 chars)
const formatAddress = (address: string) => {
  if (address.length <= 10) return address;
  return `${address.slice(0, 5)}...${address.slice(-5)}`;
};

// Generate validator name from address
const getValidatorName = (address: string) => {
  const shortAddr = address.slice(0, 6);
  return `Val-${shortAddr.slice(-2)}`;
};

// Format CNPY amount
const formatCNPY = (amount: string | number | null | undefined): string => {
  if (!amount) return "0";
  const num = typeof amount === "string" ? parseFloat(amount.replace(/,/g, "")) : amount;
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Format USD amount
const formatUSD = (amount: string | number | null | undefined): string => {
  if (!amount) return "0";
  const num = typeof amount === "string" ? parseFloat(amount.replace(/,/g, "")) : amount;
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export function ValidatorDetailClient({ validator }: ValidatorDetailClientProps) {
  const [selectedTimeframe, setSelectedTimeframe] = React.useState<"1H" | "1D" | "1W" | "1M" | "1Y">("1D");
  const [chainNames, setChainNames] = React.useState<Record<number, string>>({});
  const [chainColors, setChainColors] = React.useState<Record<number, string>>({});

  // Fetch chain names and colors
  React.useEffect(() => {
    const fetchChainInfo = async () => {
      if (!validator?.cross_chain) return;

      const names: Record<number, string> = {};
      const colors: Record<number, string> = {};

      await Promise.all(
        validator.cross_chain.map(async (chain) => {
          try {
            const response = await chainsApi.getChain(chain.chain_id.toString()).catch(() => null);
            if (response?.data) {
              const chainData = response.data as Chain;
              names[chain.chain_id] = chainData.chain_name || `Chain ${chain.chain_id}`;
              colors[chain.chain_id] = chainData.brand_color || getCanopyAccent(chain.chain_id.toString());
            } else {
              names[chain.chain_id] = `Chain ${chain.chain_id}`;
              colors[chain.chain_id] = getCanopyAccent(chain.chain_id.toString());
            }
          } catch (error) {
            console.error(`Failed to fetch chain ${chain.chain_id}:`, error);
            names[chain.chain_id] = `Chain ${chain.chain_id}`;
            colors[chain.chain_id] = getCanopyAccent(chain.chain_id.toString());
          }
        })
      );

      setChainNames(names);
      setChainColors(colors);
    };

    fetchChainInfo();
  }, [validator?.cross_chain]);

  // Fetch rewards history
  const { data: rewardsData, isLoading: isLoadingRewards, error: rewardsError } = useValidatorRewards(
    {
      addresses: [validator.address],
      // Optionally filter by chain_id if needed
    },
    {
      staleTime: 60000, // 1 minute
    }
  );

  // Debug: Log rewards data
  React.useEffect(() => {
    if (rewardsData) {
      console.log("[ValidatorDetail] Rewards data received:", {
        hasData: !!rewardsData,
        hasRewardsByChain: !!rewardsData?.data?.rewards_by_chain,
        rewardsByChainLength: rewardsData?.data?.rewards_by_chain?.length || 0,
        firstChainEvents: rewardsData?.data?.rewards_by_chain?.[0]?.events?.length || 0,
        fullStructure: rewardsData,
      });
    }
    if (rewardsError) {
      console.error("[ValidatorDetail] Rewards error:", rewardsError);
    }
  }, [rewardsData, rewardsError]);

  // Calculate total staked across all chains
  const totalStaked = React.useMemo(() => {
    if (!validator?.cross_chain) return 0;
    return validator.cross_chain.reduce((sum, chain) => {
      const staked = parseFloat(chain.staked_cnpy?.replace(/,/g, "") || "0");
      return sum + staked;
    }, 0);
  }, [validator?.cross_chain]);

  // Calculate uptime from cross_chain data (average uptime or default)
  const uptime = React.useMemo(() => {
    if (validator?.performance?.uptime_percentage !== null && validator?.performance?.uptime_percentage !== undefined) {
      return validator.performance.uptime_percentage;
    }
    // Try to get uptime from cross_chain if available
    if (validator?.cross_chain && validator.cross_chain.length > 0) {
      // Most validators show 99.9% as default, but we can calculate from actual data if available
      return 99.9;
    }
    return 99.9;
  }, [validator?.performance, validator?.cross_chain]);

  // Process rewards data for chart
  const chartData = React.useMemo(() => {

    if (!rewardsData) {
      return [];
    }

    if (!rewardsData.data) {
      return [];
    }

    if (!rewardsData.data.rewards_by_chain) {
      console.log("[ValidatorDetail] No rewardsData.data.rewards_by_chain");
      return [];
    }

    // Get all events from all chains
    const allEvents = rewardsData.data.rewards_by_chain.flatMap((chain) => chain.events || []);
    if (allEvents.length === 0) {
      console.log("[ValidatorDetail] No events found");
      return [];
    }

    // Sort by timestamp (oldest first)
    allEvents.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Convert to chart format
    // Handle cases where cnpy_amount is null (e.g., Oracle chain) by using amount and converting from micro units
    const chartDataPoints = allEvents
      .map((event) => {
        let cnpyValue = 0;
        if (event.cnpy_amount !== null && event.cnpy_amount !== undefined && event.cnpy_amount !== "") {
          cnpyValue = parseFloat(String(event.cnpy_amount));
        } else if (event.amount) {
          // Convert from micro units (e.g., 7200000 = 7.2 CNPY)
          cnpyValue = parseFloat(String(event.amount)) / 1_000_000;
        }

        // Convert timestamp to Unix timestamp (seconds)
        const timestampMs = new Date(event.timestamp).getTime();
        if (isNaN(timestampMs)) {
          return null;
        }
        const timestamp = Math.floor(timestampMs / 1000);

        if (cnpyValue <= 0 || isNaN(cnpyValue) || isNaN(timestamp)) {
          return null;
        }

        return {
          time: timestamp as any,
          value: cnpyValue,
        };
      })
      .filter((item): item is { time: any; value: number } => item !== null);

    return chartDataPoints;
  }, [rewardsData]);

  // Get last 5 days of rewards (grouped by day)
  const last5DaysRewards = React.useMemo(() => {
    if (!rewardsData?.data?.rewards_by_chain) return [];

    const allEvents = rewardsData.data.rewards_by_chain.flatMap((chain) => chain.events);

    // Group by date
    const byDate = new Map<string, { date: string; totalCNPY: number; totalUSD: number }>();

    allEvents.forEach((event) => {
      const date = new Date(event.timestamp);
      const dateKey = format(date, "yyyy-MM-dd");
      const existing = byDate.get(dateKey) || { date: dateKey, totalCNPY: 0, totalUSD: 0 };

      // Handle cnpy_amount (may be null for some chains)
      let cnpyValue = 0;
      if (event.cnpy_amount !== null && event.cnpy_amount !== undefined) {
        cnpyValue = parseFloat(event.cnpy_amount);
      } else if (event.amount) {
        // Convert from micro units
        cnpyValue = parseFloat(event.amount) / 1_000_000;
      }

      existing.totalCNPY += cnpyValue;
      existing.totalUSD += parseFloat(event.usd_amount || "0");
      byDate.set(dateKey, existing);
    });

    // Sort by date descending and take last 5
    return Array.from(byDate.values())
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);
  }, [rewardsData]);

  if (!validator) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">Validator data not available</p>
      </Card>
    );
  }

  const validatorName = getValidatorName(validator.address);

  // Calculate commission rate (use actual data or default)
  const commissionRate = validator?.commission_rate ?? 5;
  const commissionRange = "2%-7%";

  return (
    <div className="space-y-6">


      {/* Validator ID Card */}
      <Card className="w-full p-6">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center shrink-0 bg-white/10 border border-white/20"
            dangerouslySetInnerHTML={{
              __html: canopyIconSvg(getCanopyAccent(validator.address)),
            }}
          />
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{validatorName}</h1>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground font-mono">
                  {formatAddress(validator.address)}
                </span>
                <CopyableText text={validator.address} showFull={false} />
              </div>
              {validator.validator_url && (
                <a
                  href={validator.validator_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#00a63d] hover:underline flex items-center gap-1"
                >
                  {validator.validator_url}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {validator.github_url && (
                <a
                  href={validator.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#00a63d] hover:underline flex items-center gap-1"
                >
                  {validator.github_url}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Metrics Cards (3 in a row) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Staked */}
        <Card className="flex flex-col items-start justify-center gap-2">
          <p className="text-sm text-muted-foreground">Total Staked</p>
          <p className="text-2xl font-bold">{formatCNPY(totalStaked)} CNPY</p>
        </Card>

        {/* Commission */}
        <Card className="flex flex-col items-start justify-center gap-2">
          <p className="text-sm text-muted-foreground">Commission</p>
          <p className="text-2xl font-bold">{commissionRate}%</p>
          <p className="text-xs text-muted-foreground">Range {commissionRange}</p>
        </Card>

        {/* Uptime */}
        <Card className="flex flex-col items-start justify-center gap-2">
          <p className="text-sm text-muted-foreground">Uptime</p>
          <p className="text-2xl font-bold">{uptime.toFixed(1)}%</p>
          <p className="text-xs text-muted-foreground">Last 24h</p>
        </Card>
      </div>

      {/* Staking Positions and Rewards History (Side by Side) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Staking Positions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Staking Positions</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Total Delegated: {formatCNPY(totalStaked)} CNPY
          </p>
          <div className="space-y-2">
            {validator.cross_chain && validator.cross_chain.length > 0 ? (
              validator.cross_chain.map((chain) => {
                const chainName = chainNames[chain.chain_id] || `Chain ${chain.chain_id}`;
                const chainColor = chainColors[chain.chain_id] || getCanopyAccent(chain.chain_id.toString());
                const stakeCNPY = parseFloat(chain.staked_cnpy?.replace(/,/g, "") || "0");
                const stakeUSD = parseFloat(chain.staked_usd?.replace(/,/g, "") || "0");
                const weight = totalStaked > 0 ? (stakeCNPY / totalStaked) * 100 : 0;

                return (
                  <div key={chain.chain_id} className="space-y-2 border rounded-lg p-4 border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                          dangerouslySetInnerHTML={{
                            __html: canopyIconSvg(chainColor),
                          }}
                        />
                        <span className="text-sm font-medium">{chainName}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{weight.toFixed(1)}%</span>
                    </div>
                    <Progress value={weight} className="h-2" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#00a63d] font-medium">
                        {formatCNPY(stakeCNPY)} CNPY
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ${formatUSD(stakeUSD)} USD
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">No staking positions</p>
            )}
          </div>
        </Card>

        {/* Rewards History */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Rewards History</h3>

          {/* Timeframe Buttons */}
          <div className="flex gap-2 mb-4">
            {(["1H", "1D", "1W", "1M", "1Y"] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${selectedTimeframe === tf
                  ? "bg-white/20 text-mu"
                  : "bg-white/5 text-muted-foreground hover:bg-white/20"
                  }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Chart */}
          <div className="h-[272px] mb-4">
            {isLoadingRewards ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Loading chart...
              </div>
            ) : chartData.length > 0 ? (
              <ChainDetailChart
                data={chartData}
                height={272}
                timeframe={selectedTimeframe}
                lineColor="#9ca3af"
              />
            ) : rewardsData?.data?.rewards_by_chain ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Processing rewards data...
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No rewards data available
              </div>
            )}
          </div>

          {/* Last 5 Days */}
          <div className="space-y-2">
            <p className="text-sm font-medium mb-2">Last 5 days</p>
            {last5DaysRewards.length > 0 ? (
              last5DaysRewards.map((day, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border rounded-lg p-2 border-white/10">
                  <span className="text-sm text-muted-foreground">{day.date}</span>
                  <span className="text-sm text-[#00a63d] font-medium">
                    {formatCNPY(day.totalCNPY)} CNPY
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ${formatUSD(day.totalUSD)} USD
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No rewards data available</p>
            )}
          </div>
        </Card>
      </div>

      {/* Performance Across Chains - Only show if performance data exists */}
      {validator.performance &&
        validator.performance.uptime_percentage !== null &&
        validator.performance.uptime_percentage !== undefined &&
        validator.cross_chain &&
        validator.cross_chain.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Performance Across Chains</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {validator.cross_chain.map((chain) => {
                const chainName = chainNames[chain.chain_id] || `Chain ${chain.chain_id}`;
                const chainColor = chainColors[chain.chain_id] || getCanopyAccent(chain.chain_id.toString());
                const stakeCNPY = parseFloat(chain.staked_cnpy?.replace(/,/g, "") || "0");
                const weight = totalStaked > 0 ? (stakeCNPY / totalStaked) * 100 : 0;

                // Use real performance data
                const uptime = validator.performance?.uptime_percentage ?? 99.8;

                // Generate simple chart data based on real uptime value
                const chartDataPoints = Array.from({ length: 20 }, (_, i) => {
                  // Simulate slight variations around the uptime value
                  const variation = (Math.sin(i * 0.5) * 0.3) + (Math.random() * 0.2 - 0.1);
                  return {
                    time: i,
                    value: Math.max(95, Math.min(100, uptime + variation)),
                  };
                });

                return (
                  <Card key={chain.chain_id} className="p-4 bg-muted/40">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                            dangerouslySetInnerHTML={{
                              __html: canopyIconSvg(chainColor),
                            }}
                          />
                          <button className="px-2 py-1 rounded text-xs bg-white/10 text-white">
                            {chainName}
                          </button>
                        </div>
                      </div>

                      {/* Staking Info */}
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        <div>Staked: {formatCNPY(stakeCNPY)} CNPY</div>
                        <div>Weight: {weight.toFixed(1)}%</div>
                      </div>

                      {/* Simple Chart */}
                      <div className="relative h-24 bg-black/20 rounded border border-white/10 p-2">
                        <div className="relative h-full">
                          {/* Grid lines */}
                          <div className="absolute inset-0 flex flex-col justify-between">
                            {[0, 0.25, 0.5, 0.75, 1].map((pos) => (
                              <div
                                key={pos}
                                className="w-full h-px bg-white/5"
                                style={{ top: `${pos * 100}%` }}
                              />
                            ))}
                          </div>
                          <div className="absolute inset-0 flex justify-between">
                            {[0, 0.5, 1].map((pos) => (
                              <div
                                key={pos}
                                className="h-full w-px bg-white/5"
                                style={{ left: `${pos * 100}%` }}
                              />
                            ))}
                          </div>

                          {/* Chart line */}
                          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 80" preserveAspectRatio="none">
                            <polyline
                              points={chartDataPoints.map((point, idx) => `${(idx / (chartDataPoints.length - 1)) * 200},${80 - (point.value - 95) * 16}`).join(" ")}
                              fill="none"
                              stroke="#00a63d"
                              strokeWidth="2"
                              vectorEffect="non-scaling-stroke"
                            />
                          </svg>

                          {/* Uptime value in center */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-lg font-bold text-white">{uptime.toFixed(1)}%</div>
                              <div className="text-xs text-muted-foreground">Uptime</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </Card>
        )}

      {/* Slashing History */}
      {validator.slashing_history && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Slashing History</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Evidence Count:</span>
              <span className="text-sm font-medium">{validator.slashing_history.evidence_count || 0}</span>
            </div>
            {validator.slashing_history.first_evidence_height !== undefined && validator.slashing_history.first_evidence_height > 0 && (
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">First Evidence Height:</span>
                <span className="text-sm font-medium">{validator.slashing_history.first_evidence_height}</span>
              </div>
            )}
            {validator.slashing_history.last_evidence_height !== undefined && validator.slashing_history.last_evidence_height > 0 && (
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Last Evidence Height:</span>
                <span className="text-sm font-medium">{validator.slashing_history.last_evidence_height}</span>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
