"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft } from "lucide-react";
import { mockPools } from "./mock/pool-data";
import { PoolType } from "./types/amm/pool";
import { TradePanel } from "./components/trading/trade-panel";
import { AMMMetricsChart } from "./components/metrics/amm-metrics-chart";
import { ChartMetric } from "./types/amm/chart";
import { mockPoolGrowthHistory7d } from "./mock/metrics-data";

interface PoolDetailProps {
  poolId: string;
}

export function PoolDetail({ poolId }: PoolDetailProps) {
  const router = useRouter();
  const [selectedMetric, setSelectedMetric] = useState<ChartMetric>(
    ChartMetric.TVL,
  );

  const pool = useMemo(() => {
    return mockPools.find((p) => p.id === poolId);
  }, [poolId]);

  if (!pool) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Pool Not Found</h1>
        </div>
        <p className="text-muted-foreground">
          The pool you are looking for does not exist.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <Avatar className="h-10 w-10 border-2 border-background">
              <AvatarImage src={pool.baseToken.icon} />
              <AvatarFallback>{pool.baseToken.symbol[0]}</AvatarFallback>
            </Avatar>
            <Avatar className="h-10 w-10 border-2 border-background">
              <AvatarImage src={pool.quoteToken.icon} />
              <AvatarFallback>{pool.quoteToken.symbol[0]}</AvatarFallback>
            </Avatar>
          </div>
          <div>
            <h1 className="text-3xl font-bold">{pool.pair}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant={
                  pool.type === PoolType.Virtual ? "secondary" : "default"
                }
              >
                {pool.type === PoolType.Virtual ? "Virtual" : "Graduated"}
              </Badge>
              {pool.isActive && (
                <Badge variant="outline" className="text-green-500">
                  Active
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {selectedMetric === ChartMetric.TVL && "TVL"}
                    {selectedMetric === ChartMetric.Volume && "Volume"}
                    {selectedMetric === ChartMetric.Price && "Price"}
                  </CardTitle>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-2xl font-bold">
                      {selectedMetric === ChartMetric.TVL && pool.tvl}
                      {selectedMetric === ChartMetric.Volume && pool.volume24h}
                      {selectedMetric === ChartMetric.Price &&
                        `${pool.currentPrice} ${pool.quoteToken.symbol}`}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant={
                      selectedMetric === ChartMetric.Price
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedMetric(ChartMetric.Price)}
                  >
                    Price
                  </Button>
                  <Button
                    variant={
                      selectedMetric === ChartMetric.Volume ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedMetric(ChartMetric.Volume)}
                  >
                    Volume
                  </Button>
                  <Button
                    variant={
                      selectedMetric === ChartMetric.TVL ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedMetric(ChartMetric.TVL)}
                  >
                    TVL
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <AMMMetricsChart
                data={mockPoolGrowthHistory7d.data_points}
                metric={selectedMetric}
                height={400}
              />
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">TVL</p>
                  <p className="text-xl font-bold">{pool.tvl}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">24h Volume</p>
                  <p className="text-xl font-bold">{pool.volume24h}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">APR</p>
                  <p className="text-xl font-bold">
                    {pool.apr ? `${pool.apr.toFixed(2)}%` : "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {pool.type === PoolType.Virtual && pool.graduationProgress && (
            <Card>
              <CardHeader>
                <CardTitle>Graduation Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Progress to Graduation
                    </span>
                    <span className="font-bold">
                      {pool.graduationProgress.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${pool.graduationProgress}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Pool Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {pool.baseToken.symbol} Reserve
                </span>
                <span className="font-medium">
                  {pool.tokenReserve.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {pool.quoteToken.symbol} Reserve
                </span>
                <span className="font-medium">
                  {pool.cnpyReserve.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Volume</span>
                <span className="font-medium">{pool.totalVolume}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">
                  {new Date(pool.createdAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <TradePanel
            poolId={poolId}
            baseToken={pool.baseToken}
            quoteToken={pool.quoteToken}
            currentPrice={pool.currentPrice}
          />
        </div>
      </div>
    </div>
  );
}
