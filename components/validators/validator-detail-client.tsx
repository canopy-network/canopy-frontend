"use client";

import * as React from "react";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ValidatorDetailData } from "@/lib/api/validators";
import { canopyIconSvg, getCanopyAccent } from "@/lib/utils/brand";
import { CopyableText } from "@/components/ui/copyable-text";
import { chainsApi } from "@/lib/api/chains";
import type { Chain } from "@/types/chains";

interface ValidatorDetailClientProps {
  validator: ValidatorDetailData;
}

// Format time ago from timestamp (e.g., "1 hr 22 mins ago")
const formatTimeAgo = (timestamp: string | number): string => {
  const date = typeof timestamp === "string" ? new Date(timestamp) : new Date(timestamp);
  const now = Date.now();
  const seconds = Math.floor((now - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.floor(seconds / 3600);
  const remainingMinutes = Math.floor((seconds % 3600) / 60);
  if (hours < 24) {
    if (remainingMinutes === 0) {
      return `${hours} hr ago`;
    }
    return `${hours} hr ${remainingMinutes} min${remainingMinutes === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(seconds / 86400);
  return `${days} day${days === 1 ? "" : "s"} ago`;
};

// Format timestamp to readable format (Nov-18 2025 12:47:27PM)
const formatTimestamp = (timestamp: string | number): string => {
  const date = typeof timestamp === "string" ? new Date(timestamp) : new Date(timestamp);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;
  return `${month}-${day} ${year} ${hours12}:${minutes}:${seconds}${ampm}`;
};

// Format combined timestamp
const formatCombinedTimestamp = (timestamp: string | number): string => {
  const timeAgo = formatTimeAgo(timestamp);
  const fullDate = formatTimestamp(timestamp);
  return `${timeAgo} (${fullDate})`;
};

// Generate validator name from address
const getValidatorName = (address: string) => {
  const shortAddr = address.slice(0, 6);
  return `Val-${shortAddr.slice(-2)}`;
};

export function ValidatorDetailClient({ validator }: ValidatorDetailClientProps) {
  const [expandedChains, setExpandedChains] = React.useState<Set<number>>(new Set());
  const [chainNames, setChainNames] = React.useState<Record<number, string>>({});
  const [chainColors, setChainColors] = React.useState<Record<number, string>>({});

  // Fetch chain names and colors for all cross_chain entries
  React.useEffect(() => {
    const fetchChainInfo = async () => {
      if (!validator?.cross_chain) return;

      const names: Record<number, string> = {};
      const colors: Record<number, string> = {};

      await Promise.all(
        validator.cross_chain.map(async (chain) => {
          try {
            // Try direct ID match
            const response = await chainsApi.getChain(chain.chain_id.toString()).catch(() => null);

            if (response?.data) {
              const chainData = response.data as Chain;
              names[chain.chain_id] = chainData.chain_name || `Chain ${chain.chain_id}`;
              colors[chain.chain_id] = chainData.brand_color || getCanopyAccent(chain.chain_id.toString());
            } else {
              // Fallback
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

  // Calculate total stake for weight calculation
  const totalStake = React.useMemo(() => {
    if (!validator?.cross_chain) return 0;
    return validator.cross_chain.reduce((sum, chain) => {
      const staked = parseFloat(chain.staked_cnpy?.replace(/,/g, "") || "0");
      return sum + staked;
    }, 0);
  }, [validator?.cross_chain]);

  // Toggle chain expansion
  const toggleChain = React.useCallback((chainId: number) => {
    setExpandedChains((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(chainId)) {
        newSet.delete(chainId);
      } else {
        newSet.add(chainId);
      }
      return newSet;
    });
  }, []);

  // Early return AFTER all hooks
  if (!validator) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">Validator data not available</p>
      </Card>
    );
  }

  const validatorName = getValidatorName(validator.address);
  const status = validator.cross_chain?.[0]?.status || "active";

  return (
    <>
      {/* Header with Title */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-white/10 border border-white/20"
            dangerouslySetInnerHTML={{
              __html: canopyIconSvg(getCanopyAccent(validator.address)),
            }}
          />
          <div>
            <h1 className="text-2xl font-bold">Validator {validatorName}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                className={`px-2 py-1 rounded-md text-xs font-medium ${status === "active"
                  ? "bg-[#00a63d] text-white"
                  : status === "unstaking"
                    ? "bg-gray-500/20 text-gray-300 border border-gray-500/40"
                    : "bg-red-500/20 text-red-300 border border-red-500/40"
                  }`}
              >
                {status === "active" ? "Online" : status === "unstaking" ? "Offline" : "Jailed"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Validator Identity Card */}
      <Card className="w-full">
        <div className="divide-y divide-border">
          <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
            <p className="text-sm text-muted-foreground">Address:</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm break-all bg-input/30 px-2 py-2 rounded-md border border-input font-mono">
                <CopyableText text={validator.address} showFull={true} />
              </span>
            </div>
          </div>
          <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
            <p className="text-sm text-muted-foreground">Public Key:</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm break-all bg-input/30 px-2 py-2 rounded-md border border-input font-mono">
                <CopyableText text={validator.public_key} showFull={true} />
              </span>
            </div>
          </div>
          {validator.validator_url && (
            <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
              <p className="text-sm text-muted-foreground">Validator URL:</p>
              <div className="flex items-center gap-2 flex-wrap">
                <a
                  href={validator.validator_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#00a63d] hover:underline flex items-center gap-1"
                >
                  {validator.validator_url}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
          {validator.github_url && (
            <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
              <p className="text-sm text-muted-foreground">GitHub URL:</p>
              <div className="flex items-center gap-2 flex-wrap">
                <a
                  href={validator.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#00a63d] hover:underline flex items-center gap-1"
                >
                  {validator.github_url}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
          <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
            <p className="text-sm text-muted-foreground">Updated At:</p>
            <p className="text-sm font-medium">
              {formatCombinedTimestamp(validator.updated_at)}
            </p>
          </div>
        </div>
      </Card>

      {/* Validator Metrics Card */}
      <Card className="w-full">
        <div className="divide-y divide-border">
          <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
            <p className="text-sm text-muted-foreground">Total APY:</p>
            <p className="text-lg font-semibold text-green-500">
              {validator.apy !== null && validator.apy !== undefined ? `${validator.apy.toFixed(2)}%` : "-"}
            </p>
          </div>
          <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
            <p className="text-sm text-muted-foreground">Total Rewards:</p>
            <p className="text-lg font-semibold text-green-500">
              {validator.rewards_cnpy || "0"} CNPY
            </p>
          </div>
          <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
            <p className="text-sm text-muted-foreground">Reward Count:</p>
            <p className="text-lg font-semibold">
              {validator.reward_count || 0}
            </p>
          </div>
          <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
            <p className="text-sm text-muted-foreground">Commission Rate:</p>
            <p className="text-lg font-semibold">
              {validator.commission_rate !== null && validator.commission_rate !== undefined ? `${validator.commission_rate}%` : "-"}
            </p>
          </div>
          {validator.performance && (
            <>
              <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
                <p className="text-sm text-muted-foreground">Uptime:</p>
                <p className="text-lg font-semibold">
                  {validator.performance.uptime !== null && validator.performance.uptime !== undefined ? `${validator.performance.uptime.toFixed(1)}%` : "-"}
                </p>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Cross Chain Staking Positions - Table with expandable rows */}
      {validator.cross_chain && validator.cross_chain.length > 0 && (
        <Card className="w-full p-0 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-7 gap-4 px-6 py-4 text-xs text-muted-foreground border-b border-white/10">
            <div>Chain</div>
            <div>Stake</div>
            <div>Weight</div>
            <div>Value</div>
            <div>Uptime</div>
            <div>Current Rewards</div>
            <div>Rewards (30d)</div>
          </div>

          {/* Chain Rows */}
          {validator.cross_chain.map((chain) => {
            const chainName = chainNames[chain.chain_id] || `Chain ${chain.chain_id}`;
            const chainColor = chainColors[chain.chain_id] || getCanopyAccent(chain.chain_id.toString());
            const isExpanded = expandedChains.has(chain.chain_id);
            const stakeCNPY = parseFloat(chain.staked_cnpy?.replace(/,/g, "") || "0");
            const weight = totalStake > 0 ? ((stakeCNPY / totalStake) * 100) : 0;
            const valueUSD = parseFloat(chain.staked_usd?.replace(/,/g, "") || "0");

            return (
              <div key={chain.chain_id} className="border-b border-white/10 last:border-b-0">
                {/* Row Summary - Clickable */}
                <button
                  type="button"
                  className="w-full grid grid-cols-7 gap-4 px-6 py-4 items-center cursor-pointer hover:bg-white/5 transition-colors text-left"
                  onClick={() => toggleChain(chain.chain_id)}
                >
                  {/* Chain Name with Icon */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                      dangerouslySetInnerHTML={{
                        __html: canopyIconSvg(chainColor),
                      }}
                    />
                    <span className="text-white text-sm font-medium">{chainName}</span>
                  </div>

                  {/* Stake */}
                  <div className="text-white text-sm">
                    {chain.staked_cnpy || "0"} CNPY
                  </div>

                  {/* Weight */}
                  <div className="text-white text-sm">
                    {weight.toFixed(1)}%
                  </div>

                  {/* Value */}
                  <div className="text-white text-sm">
                    ${valueUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>

                  {/* Uptime */}
                  <div className="text-white text-sm">
                    99.9%
                  </div>

                  {/* Current Rewards */}
                  <div className="text-[#00a63d] text-sm font-medium">
                    {chain.rewards_cnpy || "0"} CNPY
                  </div>

                  {/* Rewards (30d) */}
                  <div className="flex items-center justify-between">
                    <span className="text-[#00a63d] text-sm font-medium">
                      {chain.rewards_cnpy || "0"} CNPY
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-6 py-4 bg-[#0a0a0a] border-t border-white/5">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                      {/* Row 1 */}
                      <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <Badge
                          className={`px-2 py-1 rounded text-xs font-medium ${chain.status === "active"
                            ? "bg-[#00a63d] text-white"
                            : chain.status === "unstaking"
                              ? "bg-gray-500/20 text-gray-300"
                              : "bg-red-500/20 text-red-300"
                            }`}
                        >
                          {chain.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-sm text-muted-foreground">APY</span>
                        <span className="text-sm text-[#00a63d] font-medium">
                          {chain.apy !== null && chain.apy !== undefined ? `${chain.apy.toFixed(2)}%` : "-"}
                        </span>
                      </div>

                      {/* Row 2 */}
                      <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-sm text-muted-foreground">Reward Count</span>
                        <span className="text-sm text-white">{chain.reward_count || 0}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-sm text-muted-foreground">Committees</span>
                        <span className="text-sm text-[#00a63d]">
                          {chain.committees && chain.committees.length > 0 ? chain.committees.join(", ") : "-"}
                        </span>
                      </div>

                      {/* Row 3 */}
                      <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-sm text-muted-foreground">Delegate</span>
                        <span className="text-sm text-white">{chain.delegate ? "Yes" : "No"}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-sm text-muted-foreground">Compound</span>
                        <span className="text-sm text-white">{chain.compound ? "Yes" : "No"}</span>
                      </div>

                      {/* Row 4 */}
                      <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-sm text-muted-foreground">Max Paused Height</span>
                        <span className="text-sm text-white">{chain.max_paused_height || 0}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-sm text-muted-foreground">Unstaking Height</span>
                        <span className="text-sm text-white">{chain.unstaking_height || 0}</span>
                      </div>

                      {/* Net Address - Full width */}
                      <div className="col-span-2 py-2 border-b border-white/5">
                        <div className="flex justify-between items-start gap-4">
                          <span className="text-sm text-muted-foreground shrink-0">Net Address</span>
                          <div className="text-sm break-all bg-input/30 px-3 py-2 rounded border border-input font-mono max-w-[500px]">
                            <CopyableText text={chain.net_address || "-"} showFull={true} />
                          </div>
                        </div>
                      </div>

                      {/* Output - Full width */}
                      <div className="col-span-2 py-2 border-b border-white/5">
                        <div className="flex justify-between items-start gap-4">
                          <span className="text-sm text-muted-foreground shrink-0">Output</span>
                          <div className="text-sm break-all bg-input/30 px-3 py-2 rounded border border-input font-mono max-w-[500px]">
                            <CopyableText text={chain.output || "-"} showFull={true} />
                          </div>
                        </div>
                      </div>

                      {/* Updated At - Full width */}
                      <div className="col-span-2 py-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Updated At</span>
                          <span className="text-sm text-white">{formatCombinedTimestamp(chain.updated_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </Card>
      )}

      {/* Slashing History Card */}
      {validator.slashing_history && (
        <Card className="w-full">
          <h4 className="text-lg mb-4">Slashing History</h4>
          <div className="divide-y divide-border">
            <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
              <p className="text-sm text-muted-foreground">Evidence Count:</p>
              <p className="text-lg font-semibold">{validator.slashing_history.evidence_count || 0}</p>
            </div>
            {validator.slashing_history.first_evidence_height !== undefined && validator.slashing_history.first_evidence_height > 0 && (
              <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
                <p className="text-sm text-muted-foreground">First Evidence Height:</p>
                <p className="text-sm font-medium">{validator.slashing_history.first_evidence_height}</p>
              </div>
            )}
            {validator.slashing_history.last_evidence_height !== undefined && validator.slashing_history.last_evidence_height > 0 && (
              <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
                <p className="text-sm text-muted-foreground">Last Evidence Height:</p>
                <p className="text-sm font-medium">{validator.slashing_history.last_evidence_height}</p>
              </div>
            )}
            <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
              <p className="text-sm text-muted-foreground">Height:</p>
              <p className="text-sm font-medium">{validator.slashing_history.height || 0}</p>
            </div>
            {validator.slashing_history.updated_at && (
              <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
                <p className="text-sm text-muted-foreground">Updated At:</p>
                <p className="text-sm font-medium">
                  {formatCombinedTimestamp(validator.slashing_history.updated_at)}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Performance Card */}
      {validator.performance && (
        <Card className="w-full">
          <h4 className="text-lg mb-4">Performance</h4>
          <div className="divide-y divide-border">
            {Object.entries(validator.performance).map(([key, value]) => (
              <div key={key} className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
                <p className="text-sm text-muted-foreground capitalize">
                  {key.replace(/_/g, " ")}:
                </p>
                <p className="text-sm font-medium">
                  {typeof value === "object" ? JSON.stringify(value) : String(value)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Commission Rate History */}
      {validator.commission_rate_history && (
        <Card className="w-full">
          <h4 className="text-lg mb-4">Commission Rate History</h4>
          <div className="divide-y divide-border">
            {typeof validator.commission_rate_history === "object" ? (
              Object.entries(validator.commission_rate_history).map(([key, value]) => (
                <div key={key} className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
                  <p className="text-sm text-muted-foreground capitalize">
                    {key.replace(/_/g, " ")}:
                  </p>
                  <p className="text-sm font-medium">
                    {typeof value === "object" ? JSON.stringify(value) : String(value)}
                  </p>
                </div>
              ))
            ) : (
              <div className="py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[212px_1fr] lg:gap-6 lg:items-center">
                <p className="text-sm text-muted-foreground">History:</p>
                <p className="text-sm font-medium">{String(validator.commission_rate_history)}</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </>
  );
}
