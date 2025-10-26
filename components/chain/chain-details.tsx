"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChainDetailsHeader } from "@/components/chain/chain-details-header";
import { ChainWithUI, useChainsStore } from "@/lib/stores/chains-store";
import { VirtualPool } from "@/types/chains";
import { ChainDetailChart } from "@/components/charts/chain-detail-chart";
import { WalletContent } from "../wallet/wallet-content";
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

interface ChainDetailsProps {
  chain: ChainWithUI;
  virtualPool?: VirtualPool | null;
}

export function ChainDetails({ chain, virtualPool }: ChainDetailsProps) {
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

  // Save chain to store when component mounts or chain changes
  useEffect(() => {
    setCurrentChain(chain);

    // Cleanup: clear current chain when component unmounts
    return () => {
      setCurrentChain(null);
    };
  }, [chain, setCurrentChain]);

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
    <div className="w-full max-w-7xl mx-auto lg:flex gap-4">
      {/* Main Content */}
      <main id="chain-details" className="flex-1 min-w-0">
        <ChainDetailsHeader chain={chain} />

        {/* Main Chart Card */}
        <Card className="p-1 mt-4">
          <div className="space-y-2">
            {/* Price Tabs and Value */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="space-y-2 flex-1">
                {/* Metric Toggle Tabs */}
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

                {/* Price/Volume Display */}
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
              </div>
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
                    <span className="font-medium">$45200</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs text-muted-foreground">MCap</span>
                    <span className="font-medium">$67.5k</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs text-muted-foreground">
                      Liquidity
                    </span>
                    <span className="font-medium">$40500</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs text-muted-foreground">HOLD</span>
                    <span className="font-medium">892</span>
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
            <ChainOverview chain={chain} />
          </TabsContent>

          <TabsContent value="holders">
            <Card className="p-6">
              <HoldersTable />
            </Card>
          </TabsContent>

          <TabsContent value="milestones">
            <ChainMilestones />
          </TabsContent>

          <TabsContent value="code">
            <ChainCode />
          </TabsContent>

          <TabsContent value="explorer">
            <BlockExplorerHeader />

            <ChainBlocks />

            <Card className="p-6">
              <BlockExplorerTable chainId={chain.id} />
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <aside className="w-[352px] flex-shrink-0 card h-fit p-4 lg:block hidden">
        <WalletContent showBalance={false} />
      </aside>
    </div>
  );
}
