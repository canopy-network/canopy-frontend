"use client";

import { useCallback } from "react";
import { Copy, Shield, TrendingUp, Info, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ValidatorDetailData } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { canopyIconSvg, getCanopyAccent } from "@/lib/utils/brand";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ValidatorDetailClientProps {
  validator: ValidatorDetailData;
}

const MICRO_UNITS = 1_000_000;

const formatStake = (stake: number) => {
  const stakeInTokens = stake / MICRO_UNITS;
  return stakeInTokens.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatAddress = (address: string, prefix = 6, suffix = 6) => {
  if (address.length <= prefix + suffix) return address;
  return `${address.slice(0, prefix)}...${address.slice(-suffix)}`;
};

const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

export function ValidatorDetailClient({
  validator,
}: ValidatorDetailClientProps) {
  const copyToClipboard = useCallback(async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy value", error);
      toast.error("Failed to copy to clipboard");
    }
  }, []);

  // Return early if validator data is not available
  if (!validator) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">Validator data not available</p>
      </Card>
    );
  }

  const chainStakes = [
    ...(validator.staked_amount ? [validator.staked_amount] : []),
    ...(validator.cross_chain || []).map((chain) => chain.staked_amount),
  ];

  // Calculate totals and averages
  const totalStaked = chainStakes.reduce((sum, stake) => sum + stake, 0);
  const chainCount = chainStakes.length || 1;
  const averageStake = totalStaked / chainCount;

  const calcVotingPower = (stake: number) =>
    (stake / MICRO_UNITS / 10000) * 100;

  const votingPowers = chainStakes.map(calcVotingPower);
  const averageVotingPower =
    votingPowers.length > 0
      ? votingPowers.reduce((sum, vp) => sum + vp, 0) / votingPowers.length
      : 0;

  const rawApy = typeof validator.apy === "number" ? validator.apy : 0;
  const averageApy = rawApy;

  // Status styling
  const statusStyles = {
    active:
      "border-[#00a63d] bg-[#00a63d]/10 text-[#00a63d] shadow-[0_0_14px_rgba(0,166,61,0.35)]",
    unstaking: "border-gray-500/40 bg-gray-500/10 text-gray-300",
    paused:
      "border-red-500/60 bg-red-500/10 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.3)]",
  };

  // Use average voting power for dominance placeholder
  const dominance = averageVotingPower;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-[#00a63d]" />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                Validator {formatAddress(validator.address || "Unknown", 8, 8)}
              </h1>
              <Badge
                variant="outline"
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold",
                  statusStyles[validator.status || "active"]
                )}
              >
                <span className="h-2 w-2 rounded-full bg-current shadow-[0_0_0_3px_rgba(255,255,255,0.08)]" />
                {(validator.status || "active").charAt(0).toUpperCase() +
                  (validator.status || "active").slice(1)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {validator.delegate ? "Delegate" : "Validator"} •{" "}
              {validator.compound ? "Auto-Compound Enabled" : "Auto-Withdrawal"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Total Stake Weight */}
        <Card>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                Average Stake
              </p>
              <TrendingUp className="w-4 h-4 text-[#00a63d]" />
            </div>
            <div>
              <p className="text-3xl font-bold">
                {formatStake(averageStake)} CNPY
              </p>
              <p className="text-xs text-[#00a63d] mt-1">
                APY: {averageApy.toFixed(2)}%
              </p>
            </div>
          </div>
        </Card>

        {/* Voting Power */}
        <Card>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                Average Voting Power
              </p>
              <Info className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-3xl font-bold">
                {averageVotingPower.toFixed(2)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Network Control
              </p>
            </div>
          </div>
        </Card>

        {/* Validator Return */}
        <Card>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                Average APY
              </p>
              <TrendingUp className="w-4 h-4 text-[#00a63d]" />
            </div>
            <div>
              <p className="text-3xl font-bold">
                {averageApy.toFixed(2)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">Annual Yield</p>
            </div>
          </div>
        </Card>

        {/* Uptime */}
        <Card>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                Uptime
              </p>
              <TrendingUp className="w-4 h-4 text-[#00a63d]" />
            </div>
            <div>
              <p className="text-3xl font-bold">
                {(validator.uptime ?? 0).toFixed(2)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">Performance</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Validator Information Card */}
      <Card className="p-6 border-primary/10">
        <h2 className="text-lg font-semibold mb-4">Validator Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Address</p>
              <div className="flex items-center gap-2">
                <code className="text-sm bg-muted px-3 py-1.5 rounded-md flex-1">
                  {validator.address || "N/A"}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(validator.address || "")}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Public Key</p>
              <div className="flex items-center gap-2">
                <code className="text-sm bg-muted px-3 py-1.5 rounded-md flex-1 truncate">
                  {validator.public_key || "N/A"}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(validator.public_key || "")}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Output Address
              </p>
              <div className="flex items-center gap-2">
                <code className="text-sm bg-muted px-3 py-1.5 rounded-md flex-1">
                  {validator.output || "N/A"}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(validator.output || "")}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Network Address
              </p>
              <code className="text-sm bg-muted px-3 py-1.5 rounded-md block">
                {validator.net_address || "N/A"}
              </code>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Last Updated</p>
              <p className="text-sm font-medium">
                {formatDate(validator.updated_at)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Configuration
              </p>
              <div className="flex gap-2">
                <Badge variant="secondary">
                  {validator.delegate ? "Delegate" : "Validator"}
                </Badge>
                <Badge variant="secondary">
                  {validator.compound ? "Auto-Compound" : "Auto-Withdrawal"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Cross-Chain Stakes */}
      <Card className="p-6 border-primary/10">
        <h2 className="text-lg font-semibold mb-4">Cross-Chain Stakes</h2>
        <div className="space-y-4">
          {!validator.cross_chain || validator.cross_chain.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No cross-chain stakes found
            </p>
          ) : (
            validator.cross_chain.map((chain) => {
              const chainStake = chain.staked_amount;
              const chainVotingPower = calcVotingPower(chainStake);

              return (
                <div
                  key={chain.chain_id}
                  className="p-4 rounded-lg border border-primary/10 bg-primary/5"
                >
                  <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10"
                      dangerouslySetInnerHTML={{
                        __html: canopyIconSvg(
                          getCanopyAccent(chain.chain_id)
                        ),
                      }}
                    />
                    <div>
                      <p className="font-semibold">
                        Canopy Chain {chain.chain_id}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {chainVotingPower.toFixed(2)}% voting power
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant="outline"
                      className={cn(
                        "mb-1",
                        chain.status === "active"
                          ? "border-[#00a63d]/40 bg-[#00a63d]/10 text-[#00a63d]"
                          : "border-gray-500/40 bg-gray-500/10 text-gray-300"
                      )}
                    >
                        {chain.status}
                      </Badge>
                      <p className="text-sm font-semibold">
                        {chainVotingPower.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                  <Progress
                    value={Math.min(Math.max(chainVotingPower, 0), 100)}
                    className="h-2"
                    variant="green"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Last updated: {formatDate(chain.updated_at)}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Cross-Chain Performance */}
      {validator.cross_chain && validator.cross_chain.length > 0 && (
        <Card className="p-6 border-primary/10">
          <h2 className="text-lg font-semibold mb-4">Cross-Chain Performance</h2>
          {(() => {
            const chartData = validator.cross_chain.map((chain) => {
              const chainApy =
                typeof chain.apy === "number"
                  ? chain.apy
                  : typeof validator.apy === "number"
                  ? validator.apy
                  : 0;
              return {
                name: `C${String(chain.chain_id).padStart(3, "0")}`,
                apy: chainApy,
                status: chain.status,
                chainId: chain.chain_id,
              };
            });

            return (
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barSize={32} margin={{ top: 10, right: 16, left: 0, bottom: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#9CA3AF", fontSize: 12 }}
                      axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#9CA3AF", fontSize: 12 }}
                      axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                      tickLine={false}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <RechartsTooltip
                      cursor={{ fill: "rgba(255,255,255,0.04)" }}
                      content={({ active, payload, label }) => {
                        if (!active || !payload || !payload.length) return null;
                        const item = payload[0].payload;
                        return (
                          <div className="rounded-md border border-white/10 bg-background/90 px-3 py-2 shadow-lg">
                            <p className="text-sm font-semibold text-white">
                              {label}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Status: {item.status}
                            </p>
                            <p className="text-sm text-[#00a63d] font-semibold">
                              APY: {item.apy.toFixed(2)}%
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="apy" fill="#00a63d" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            );
          })()}
        </Card>
      )}

      {/* Slashing Events */}
      <Card className="p-6 border-primary/10">
        <h2 className="text-lg font-semibold mb-4">Slashing Events</h2>
        {validator.slashing_history?.evidence_count ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="font-semibold">
                  Evidence Count: {validator.slashing_history.evidence_count}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                Height: {validator.slashing_history.height}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Last updated: {formatDate(validator.slashing_history.updated_at)}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No slashing events recorded.
          </p>
        )}
      </Card>

      {/* Cross-Chain Unstaking Countdowns */}
      {validator.cross_chain && validator.cross_chain.length > 0 && (
        <Card className="p-6 border-primary/10">
          <h2 className="text-lg font-semibold mb-4">
            Cross-Chain Unstaking Countdowns
          </h2>
          <div className="space-y-2">
            {validator.cross_chain.map((chain) => {
              const blocks = chain.unstaking_blocks ?? 0;
              const display =
                blocks === 0 ? "Infinity" : `${blocks.toLocaleString()} blocks`;
              return (
                <div
                  key={`unstake-${chain.chain_id}`}
                  className="flex items-center justify-between rounded-md border border-white/10 bg-white/5 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center bg-white/5 border border-white/10"
                      dangerouslySetInnerHTML={{
                        __html: canopyIconSvg(getCanopyAccent(chain.chain_id)),
                      }}
                    />
                    <div className="flex flex-col">
                      <span className="font-semibold">
                        Canopy Chain {chain.chain_id}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Status: {chain.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Countdown</p>
                    <p className="text-sm font-semibold text-[#00a63d]">
                      {display}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Committees */}
      {validator.committees && validator.committees.length > 0 && (
        <Card className="p-6 border-primary/10">
          <h2 className="text-lg font-semibold mb-4">Committees</h2>
          <div className="flex flex-wrap gap-2">
            {validator.committees.map((committeeId) => (
              <Badge
                key={committeeId}
                variant="outline"
                className="border-primary/20 bg-primary/5"
              >
                Committee {committeeId}
              </Badge>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
