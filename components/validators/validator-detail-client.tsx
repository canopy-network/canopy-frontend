"use client";

import { useCallback } from "react";
import {
  Copy,
  Shield,
  TrendingUp,
  Info,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ValidatorDetailData } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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

  // Calculate total staked across all chains
  const totalStaked = (validator.cross_chain || []).reduce(
    (sum, chain) => sum + chain.staked_amount,
    validator.staked_amount || 0
  );

  // Calculate voting power (simplified - would need total network stake)
  const votingPower = (
    ((validator.staked_amount || 0) / MICRO_UNITS / 10000) *
    100
  ).toFixed(2);

  // Status styling
  const statusStyles = {
    active:
      "border-[#36d26a] bg-[#36d26a]/10 text-[#7cff9d] shadow-[0_0_14px_rgba(124,255,157,0.35)]",
    unstaking: "border-gray-500/40 bg-gray-500/10 text-gray-300",
    paused:
      "border-red-500/60 bg-red-500/10 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.3)]",
  };

  // Calculate dominance (percentage of total network)
  const dominance = parseFloat(votingPower);

  // Calculate APR (simplified calculation)
  const baseAPR = 12; // 12% base APR
  const apr = dominance > 0 ? baseAPR * (dominance / 10) : baseAPR;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
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
              {validator.compound ? "Auto-Compound Enabled" : "Manual Rewards"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {validator.net_address && (
            <Button
              variant="outline"
              className="border-primary/20 bg-primary/5 hover:bg-primary/10"
              onClick={() => window.open(validator.net_address, "_blank")}
            >
              View Node <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          )}
          <Button className="bg-primary hover:bg-primary/90">
            Delegate Stake
          </Button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Total Stake Weight */}
        <Card>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                Total Stake Weight
              </p>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-3xl font-bold">
                {formatStake(totalStaked)} CNPY
              </p>
              <p className="text-xs text-emerald-500 mt-1">+0.03%</p>
            </div>
          </div>
        </Card>

        {/* Voting Power */}
        <Card>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                Voting Power
              </p>
              <Info className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-3xl font-bold">{votingPower}%</p>
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
                Estimated APR
              </p>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-3xl font-bold">{apr.toFixed(2)}%</p>
              <p className="text-xs text-muted-foreground mt-1">
                Annual Return
              </p>
            </div>
          </div>
        </Card>

        {/* Slashing History */}
        <Card>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                Slashing Events
              </p>
              {validator.slashing_history?.evidence_count > 0 ? (
                <AlertTriangle className="w-4 h-4 text-red-500" />
              ) : (
                <Shield className="w-4 h-4 text-emerald-500" />
              )}
            </div>
            <div>
              <p className="text-3xl font-bold">
                {validator.slashing_history?.evidence_count || 0}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {(validator.slashing_history?.evidence_count || 0) === 0
                  ? "No Evidence"
                  : "Total Events"}
              </p>
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
                  {validator.compound ? "Auto-Compound" : "Manual"}
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
              const chainPercentage = (chainStake / totalStaked) * 100;

              return (
                <div
                  key={chain.chain_id}
                  className="p-4 rounded-lg border border-primary/10 bg-primary/5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-sm font-bold">
                          C{String(chain.chain_id).padStart(3, "0")}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold">
                          Canopy Chain {chain.chain_id}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatStake(chainStake)} CNPY
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant="outline"
                        className={cn(
                          "mb-1",
                          chain.status === "active"
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                            : "border-gray-500/40 bg-gray-500/10 text-gray-300"
                        )}
                      >
                        {chain.status}
                      </Badge>
                      <p className="text-sm font-semibold">
                        {chainPercentage.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                  <Progress value={chainPercentage} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    Last updated: {formatDate(chain.updated_at)}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </Card>

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
