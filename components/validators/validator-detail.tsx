"use client";

import { useCallback } from "react";
import {
  Copy,
  ArrowUpRight,
  Shield,
  TrendingUp,
  Globe,
  Info,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { SampleValidator } from "@/lib/demo-data/sample-validators";

interface ValidatorDetailProps {
  validator: SampleValidator;
}

const formatStake = (stake: number) => {
  return stake.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatAddress = (address: string, prefix = 6, suffix = 6) => {
  if (address.length <= prefix + suffix) return address;
  return `${address.slice(0, prefix)}...${address.slice(-suffix)}`;
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

export function ValidatorDetail({ validator }: ValidatorDetailProps) {
  const copyToClipboard = useCallback(async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch (error) {
      console.error("Failed to copy value", error);
    }
  }, []);

  // Mock data for the new structure - these would come from the validator object
  const nominatorReturn = validator.rewards / 1000; // Simplified calculation
  const totalNominators = 112;
  const nominatorChange = 3;
  const validatorReturn = validator.apr * 0.1; // Simplified
  const dominance = validator.totalNetworkControl;
  const dominanceChange = 0.01;
  const hotKey = validator.address;
  const registeredTo =
    validator.address.slice(0, 20) + validator.address.slice(-20);
  const registeredOn = new Date(
    Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
  );

  // Stake breakdown - using committees for Root/Alpha
  const rootStake =
    validator.committeeStakes.find((c) => c.committeeId === 1)?.stake || 0;
  const alphaStake =
    validator.committeeStakes.find((c) => c.committeeId === 2)?.stake ||
    validator.totalDelegated;
  const rootPercentage = (rootStake / validator.totalDelegated) * 100;
  const alphaPercentage = (alphaStake / validator.totalDelegated) * 100;
  const stakeChange = 0.01;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight capitalize">
              {validator.name}
            </h1>
            <Shield className="w-5 h-5 text-muted-foreground" />
            <Badge
              variant="outline"
              className="bg-white/5 border-white/15 text-white/80"
            >
              Rank #{validator.rank}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="border-white/15 bg-white/5 text-white hover:bg-white/10"
          >
            Discover {validator.name} <ArrowUpRight className="w-4 h-4 ml-2" />
          </Button>
          <Button
            variant="outline"
            className="border-white/15 bg-white/5 text-white hover:bg-white/10"
          >
            Delegate Stake <Plus className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Total Stake Weight Card */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Total Stake Weight
                </h3>
                <div className="text-right">
                  <p className="text-lg font-bold text-white">
                    τ {formatStake(validator.totalDelegated / 1000)} TAO
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-emerald-400">
                  {stakeChange.toFixed(2)}%
                </span>
              </div>
              <Progress value={alphaPercentage} className="h-2 bg-white/5" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Root {rootPercentage.toFixed(2)}%</span>
                <span>Alpha {alphaPercentage.toFixed(2)}%</span>
              </div>
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">
                      τ 0.00 weighted
                    </span>
                    <Info className="w-3 h-3 text-muted-foreground" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">
                      τ 0.00 delegated
                    </span>
                    <Info className="w-3 h-3 text-muted-foreground" />
                  </div>
                  <span className="text-white">
                    τ {formatStake(validator.totalDelegated / 1000)}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Nominator Return Card */}
          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Nominator Return</p>
              <p className="text-2xl font-bold text-white">
                τ {nominatorReturn.toFixed(2)}
              </p>
            </div>
          </Card>

          {/* Total Nominators Card */}
          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Nominators</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-white">
                  {totalNominators}
                </p>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-emerald-400">
                    +{nominatorChange}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Validator Details Section */}
          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {validator.name} validator
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">HotKey:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-white/80">
                      {formatAddress(hotKey)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => copyToClipboard(hotKey)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Registered To:
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-white/80">
                      {formatAddress(registeredTo)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => copyToClipboard(registeredTo)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Registered On:
                  </span>
                  <span className="text-sm text-white/80">
                    {formatDate(registeredOn)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Globe className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <div className="w-4 h-4 bg-white/20 rounded"></div>
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <div className="w-4 h-4 bg-indigo-500 rounded"></div>
                </Button>
              </div>
            </div>
          </Card>

          {/* Validator Return Card */}
          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Validator Return</p>
              <p className="text-2xl font-bold text-white">
                τ {validatorReturn.toFixed(2)} from {validator.apr.toFixed(0)}%
                take
              </p>
            </div>
          </Card>

          {/* Dominance Card */}
          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Dominance</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-white">
                  {dominance.toFixed(2)}%
                </p>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-emerald-400">
                    {dominanceChange.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
