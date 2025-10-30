"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { useChainsStore } from "@/lib/stores/chains-store";
import { ChainExtended, ChainHolder } from "@/types/chains";
import { ChainDetailChart } from "@/components/charts/chain-detail-chart";
import { BlockExplorerTable } from "./block-explorer-table";
import { BlockExplorerHeader } from "../block-explorer/block-explorer-header";
import { HoldersTable } from "./holders-table";
import { ChainOverview } from "./chain-details/chain-overview";
import { ChainMilestones } from "./chain-details/chain-milestones";
import { ChainCode } from "./chain-details/chain-code";
import { ChainBlocks } from "./chain-blocks";
import {
  getChainPriceHistory,
  getTimeRangeForTimeframe,
  convertPriceHistoryToChart,
  convertVolumeHistoryToChart,
} from "@/lib/api";
import { getChainHolders } from "@/lib/api/chains";

interface ChainDetailsProps {
  chain: ChainExtended;
}

export function ChainDetails({ chain }: ChainDetailsProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");
  const [selectedMetric, setSelectedMetric] = useState<
    "price" | "volume" | "marketCap"
  >("price");
  const setCurrentChain = useChainsStore((state) => state.setCurrentChain);

  const [chartData, setChartData] = useState<
    {
      value: number;
      time: number;
    }[]
  >([]);
  const [loadingChart, setLoadingChart] = useState(true);
  const [chartError, setChartError] = useState<string | null>(null);
  const [chainHolders, setChainHolders] = useState<{
    pagination: {
      page: number;
      total: number;
    };
    holders: ChainHolder[];
  }>({
    pagination: {
      page: 1,
      total: 0,
    },
    holders: [],
  });

  // Fetch price history data
  const fetchPriceHistory = async (
    timeframe: string,
    metric: "price" | "volume" | "marketCap"
  ) => {
    try {
      setLoadingChart(true);
      setChartError(null);

      const timeRange = getTimeRangeForTimeframe(timeframe);
      const response = await getChainPriceHistory(chain.id, timeRange);

      if (response.data && response.data.length > 0) {
        let formattedData;

        if (metric === "volume") {
          // Convert to volume data
          formattedData = convertVolumeHistoryToChart(response.data);
        } else if (metric === "price") {
          // Convert to price data (close prices)
          formattedData = convertPriceHistoryToChart(response.data);
        } else {
          // Market cap - placeholder for now
          formattedData = convertPriceHistoryToChart(response.data);
        }

        setChartData(formattedData);
      } else {
        // No data available for this timeframe
        setChartData([]);
        setChartError(`No ${metric} data available for this timeframe`);
      }
    } catch (err) {
      console.error("Failed to fetch price history:", err);
      setChartError(`Failed to load ${metric} data`);
      setChartData([]);
    } finally {
      setLoadingChart(false);
    }
  };

  const fetchHolders = async (page: number = 1) => {
    try {
      const response = await getChainHolders(chain.id, { page });

      const { data, pagination } = response;
      if (data) {
        setChainHolders({
          pagination,
          // @ts-expect-error - data is not typed
          holders: data,
        });
      }
    } catch (error) {
      console.error("Failed to fetch holders:", error);
    }
  };

  // Save chain to store when component mounts or chain changes
  useEffect(() => {
    setCurrentChain(chain);

    // Cleanup: clear current chain when component unmounts
    return () => {
      setCurrentChain(null);
    };
  }, [chain, setCurrentChain]);

  useEffect(() => {
    fetchHolders();
  }, [chain.id]);

  // Fetch price history when timeframe or metric changes
  useEffect(() => {
    fetchPriceHistory(selectedTimeframe, selectedMetric);
  }, [selectedTimeframe, selectedMetric, chain.id]);

  // Calculate current value and percentage change from chart data
  const getCurrentValue = () => {
    if (chartData.length === 0) return { value: 0, percentChange: 0 };

    const mostRecentValue = chartData[chartData.length - 1].value;
    const oldestValue = chartData[0].value;

    const percentChange =
      oldestValue !== 0
        ? ((mostRecentValue - oldestValue) / oldestValue) * 100
        : 0;

    return { value: mostRecentValue, percentChange };
  };

  const { value: currentValue, percentChange } = getCurrentValue();

  return (
    <>
      {/* Main Chart Card */}
      <Card className="p-1 mt-4">
        <div className="space-y-2">
          {/* Price Tabs and Value */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="space-y-2 flex-1">
              {/* Metric Toggle Tabs */}
              {chain.status === "graduated" ? (
                <div className="flex gap-1 p-1 bg-muted/50 rounded-lg w-fit">
                  <Button
                    variant={selectedMetric === "price" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedMetric("price")}
                    className="rounded-md gap-1.5 h-7 text-xs px-3"
                  >
                    Price
                  </Button>
                  <Button
                    variant={
                      selectedMetric === "marketCap" ? "secondary" : "ghost"
                    }
                    size="sm"
                    onClick={() => setSelectedMetric("marketCap")}
                    disabled
                    className="rounded-md gap-1.5 h-7 text-xs px-3 opacity-50 cursor-not-allowed"
                  >
                    Market Cap
                  </Button>
                  <Button
                    variant={
                      selectedMetric === "volume" ? "secondary" : "ghost"
                    }
                    size="sm"
                    onClick={() => setSelectedMetric("volume")}
                    className="rounded-md gap-1.5 h-7 text-xs px-3"
                  >
                    Volume
                  </Button>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">Marketcap</span>
              )}

              {/* Price/Volume Display */}
              {chain.is_graduated ? (
                <div className="flex items-baseline gap-2">
                  {selectedMetric === "volume" ? (
                    <>
                      <h3 className="text-2xl font-semibold">
                        $
                        {currentValue.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </h3>
                      <span className="text-xs font-medium text-muted-foreground">
                        {selectedTimeframe}
                      </span>
                    </>
                  ) : (
                    <>
                      <h3 className="text-2xl font-semibold">
                        ${currentValue.toFixed(currentValue < 1 ? 6 : 2)}
                      </h3>
                      <span
                        className={`text-xs font-medium ${
                          percentChange >= 0 ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {percentChange >= 0 ? "+" : ""}
                        {percentChange.toFixed(2)}%
                      </span>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-semibold">
                    {chain.virtual_pool?.market_cap_usd.toLocaleString(
                      undefined,
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}
                  </h3>
                </div>
              )}
            </div>

            {/* Right: Graduation Progress (only for virtual chains) */}
            {!chain.is_graduated && chain.graduation && (
              <div className="space-y-2 w-[216px]">
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center justify-end gap-1.5 cursor-help">
                        <p className="text-xs text-muted-foreground text-right">
                          ${(chain.graduation.cnpy_remaining / 1000).toFixed(1)}
                          k until graduation
                        </p>
                        <HelpCircle className="w-3 h-3 text-muted-foreground" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-[260px]">
                      <p className="text-xs">
                        This chain starts as virtual (test mode). When market
                        cap reaches $
                        {(chain.graduation.threshold_cnpy / 1000).toFixed(0)}k,
                        it will graduate to a real blockchain with permanent
                        on-chain transactions.
                      </p>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
                <Progress
                  value={chain.graduation.completion_percentage}
                  className="h-2.5"
                />
              </div>
            )}
          </div>

          {/* Chart Container */}
          <div className="rounded-xl border text-card-foreground shadow relative h-[272px] bg-muted/40">
            {/* Timeframe Buttons - Overlay on Chart */}
            <div className="absolute left-4 top-2.5 z-10 flex gap-0.5 p-0.5 bg-muted/50 rounded-lg">
              {(["1H", "1D", "1W", "1M", "1Y", "ALL"] as const).map(
                (timeframe) => (
                  <Button
                    key={timeframe}
                    variant={
                      selectedTimeframe === timeframe ? "secondary" : "ghost"
                    }
                    size="sm"
                    onClick={() => setSelectedTimeframe(timeframe)}
                    disabled={loadingChart}
                    className="rounded-md gap-1.5 h-8 text-xs px-3"
                  >
                    {timeframe}
                  </Button>
                )
              )}
            </div>

            {/* Chart */}
            <div className="h-full pt-12 px-4">
              {chartError ? (
                <div className="flex items-center justify-center h-64 text-white/50">
                  {chartError}
                </div>
              ) : chartData.length === 0 && !loadingChart ? (
                <div className="flex items-center justify-center h-64 text-white/50">
                  No data available for this timeframe
                </div>
              ) : (
                <ChainDetailChart
                  data={chartData}
                  timeframe={selectedTimeframe}
                />
              )}
            </div>
          </div>

          {/* Live Updates */}
          <div className="rounded-xl border text-card-foreground shadow bg-muted/40">
            <div className="flex items-center gap-6 px-5 py-3.5">
              <p className="text-sm font-medium">Live updates</p>

              <div className="flex flex-1 items-center justify-between text-sm">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs text-muted-foreground">
                    VOL (24h)
                  </span>
                  <span className="font-medium">
                    {chain.pool?.volume_24h_cnpy
                      ? `${chain.pool.volume_24h_cnpy.toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }
                        )} CNPY`
                      : chain.virtual_pool?.volume_24h_cnpy
                      ? `${chain.virtual_pool.volume_24h_cnpy.toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }
                        )} CNPY`
                      : "N/A"}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs text-muted-foreground">MCap</span>
                  <span className="font-medium">
                    {chain.pool?.market_cap_usd
                      ? `$${(chain.pool.market_cap_usd / 1000).toFixed(1)}k`
                      : chain.virtual_pool?.market_cap_usd
                      ? `$${(chain.virtual_pool.market_cap_usd / 1000).toFixed(
                          1
                        )}k`
                      : "N/A"}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs text-muted-foreground">
                    Liquidity
                  </span>
                  <span className="font-medium">
                    {chain.pool?.cnpy_reserve
                      ? `${(chain.pool.cnpy_reserve / 1000).toFixed(1)}k CNPY`
                      : chain.virtual_pool?.cnpy_reserve
                      ? `${(chain.virtual_pool.cnpy_reserve / 1000).toFixed(
                          1
                        )}k CNPY`
                      : "N/A"}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs text-muted-foreground">HOLD</span>
                  <span className="font-medium">
                    {chainHolders.holders.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Navigation Tabs */}
      <Tabs defaultValue="overview" className="w-full gap-4 mt-4">
        <TabsList
          variant="clear"
          className="flex justify-start gap-2 bg-muted p-1 rounded-lg no-scrollbar overflow-auto"
        >
          {[
            {
              value: "overview",
              label: "Overview",
            },
            {
              value: "holders",
              label: "Holders",
            },
            {
              value: "milestones",
              label: "Milestones",
            },
            {
              value: "code",
              label: "Code",
            },
            {
              value: "explorer",
              label: "Block Explorer",
            },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              variant="clear"
              size="sm"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview">
          <ChainOverview
            chain={chain}
            holders={chainHolders.holders}
            holdersCount={chainHolders.holders.length}
          />
        </TabsContent>

        <TabsContent value="holders">
          <Card className="p-6">
            <HoldersTable
              data={chainHolders.holders}
              pagination={chainHolders.pagination}
              tokenSymbol={chain.token_symbol}
            />
          </Card>
        </TabsContent>

        <TabsContent value="milestones">
          <ChainMilestones />
        </TabsContent>

        <TabsContent value="code">
          <ChainCode
            repositoryUrl={chain.repository?.github_url}
            repositoryName={chain.repository?.repository_name}
            deploymentStatus={
              chain.repository?.build_status === "success"
                ? "deployed"
                : chain.repository?.build_status === "pending"
                ? "building"
                : chain.repository?.build_status === "failed"
                ? "failed"
                : null
            }
          />
        </TabsContent>

        <TabsContent value="explorer">
          <BlockExplorerHeader />

          <ChainBlocks />

          <Card className="p-6">
            <BlockExplorerTable chainId={chain.id} />
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
