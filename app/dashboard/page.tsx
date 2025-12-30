"use client";

// Force dynamic rendering
export const dynamic = "force-dynamic";
import { useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  TrendingUp,
  Users,
  Activity,
  DollarSign,
  Edit,
  ExternalLink,
  Info,
} from "lucide-react";
import Link from "next/link";
import { useChainsStore } from "@/lib/stores/chains-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { CHAIN_STATUS_LABELS } from "@/types/chains";

const stats = [
  {
    title: "Total Value Locked",
    value: "$0.00",
    change: "+0%",
    icon: TrendingUp,
    tooltip: "Total amount of money you are accruing across all your chains",
  },
  {
    title: "Unique Holders",
    value: "0",
    change: "+0",
    icon: Users,
    tooltip: "Total number of unique token holders across all your chains",
  },
  {
    title: "Active Chains",
    value: "0",
    change: "+0",
    icon: Activity,
    tooltip: "Number of chains currently active and trading",
  },
  {
    title: "24h Revenue",
    value: "$0.00",
    change: "+0%",
    icon: DollarSign,
    tooltip:
      "Total money collected across all your chains in the last 24 hours",
  },
];

export default function Dashboard() {
  const { chains, isLoading, fetchChains, virtualPools, fetchVirtualPool } =
    useChainsStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchChains({ include: "assets" });
  }, [fetchChains]);

  // Filter chains to only show those created by the current user
  const userChains = useMemo(
    () => chains.filter((chain) => chain.created_by === user?.id),
    [chains, user?.id]
  );

  // Fetch virtual pools for user's chains with concurrency limit
  useEffect(() => {
    const chainsNeedingPools = userChains.filter((chain) => !virtualPools[chain.id]);

    if (chainsNeedingPools.length === 0) return;

    // Fetch in batches of 3 to avoid overwhelming the network
    const MAX_CONCURRENT = 3;
    const fetchInBatches = async () => {
      for (let i = 0; i < chainsNeedingPools.length; i += MAX_CONCURRENT) {
        const batch = chainsNeedingPools.slice(i, i + MAX_CONCURRENT);
        await Promise.allSettled(
          batch.map((chain) => fetchVirtualPool(chain.id))
        );
      }
    };

    fetchInBatches();
  }, [userChains, virtualPools, fetchVirtualPool]);

  const getStatusVariant = (status: string): "default" | "secondary" => {
    switch (status) {
      case "virtual_active":
      case "graduated":
        return "default";
      default:
        return "secondary";
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-balance">Canopy Dashboard</h1>
        <p className="text-muted-foreground mt-2 text-pretty">
          Overview of your blockchain ecosystem activity and performance
          metrics.
        </p>
      </div>

      <TooltipProvider>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>{stat.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.change} from last month
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </TooltipProvider>

      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Your Chains</h2>
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading chains...
          </div>
        ) : userChains.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                No chains found. Create your first chain to get started!
              </p>
              <Link href="/">
                <Button>Launch a Chain</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {userChains.map((chain) => {
              const virtualPool = virtualPools[chain.id];
              const progress = virtualPool
                ? Math.min(
                    (virtualPool.cnpy_reserve / chain.graduation_threshold) *
                      100,
                    100
                  )
                : 0;
              const currentRaised = virtualPool?.cnpy_reserve || 0;
              const priceChange = virtualPool?.price_24h_change_percent || 0;

              return (
                <Card key={chain.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-lg">
                              {chain.chain_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <CardTitle className="text-xl">
                                {chain.chain_name}
                              </CardTitle>
                              <Badge
                                variant={getStatusVariant(chain.status)}
                                className="text-xs"
                              >
                                {CHAIN_STATUS_LABELS[chain.status]}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                ${chain.token_symbol}
                              </Badge>
                            </div>
                            <CardDescription>
                              {chain.creator?.display_name} · Published{" "}
                              {new Date(chain.created_at).toLocaleDateString()}
                            </CardDescription>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                          {chain.chain_description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={`/chains/${chain.id}`} target="_blank">
                          <Button variant="outline" size="sm" className="gap-2">
                            View
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/chains/${chain.id}/edit`}>
                          <Button variant="default" size="sm" className="gap-2">
                            Edit
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {currentRaised.toFixed(2)}/
                            {chain.graduation_threshold.toFixed(0)} CNPY
                          </span>
                          <span
                            className={`flex items-center gap-1 font-semibold ${
                              priceChange >= 0
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          >
                            <TrendingUp className="h-3 w-3" />
                            {priceChange.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">
                            Market Cap
                          </div>
                          <div className="font-semibold">
                            ${(virtualPool?.market_cap_usd || 0).toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">
                            Volume (24h)
                          </div>
                          <div className="font-semibold">
                            {(virtualPool?.volume_24h_cnpy || 0).toFixed(2)}{" "}
                            CNPY
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Traders</div>
                          <div className="font-semibold">
                            {virtualPool?.unique_traders || 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
