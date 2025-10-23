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
import { HoldersTable } from "./holders-table";
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

                {/* Price Display */}
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-semibold">$0.0135</h3>
                  <span className="text-xs font-medium text-green-500">
                    +12.8%
                  </span>
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
        <Tabs defaultValue="holders" className="w-full gap-4 mt-4">
          <TabsList variant="clear" className="flex justify-start gap-2">
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
                value: "code",
                label: "Code",
              },
              {
                value: "explorer",
                label: "Block Explorer",
              },
            ].map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} variant="clear">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <div className="flex items-center gap-4 mb-4">
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg text-sm transition-colors"
                >
                  <span>🌐</span>
                </a>

                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg text-sm transition-colors"
                >
                  <span>𝕏</span>
                  <span>3.3k</span>
                </a>

                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg text-sm transition-colors"
                >
                  <span>⭐</span>
                  <span>23 stars</span>
                </a>
              </div>
              <h2 className="text-xl font-semibold mb-3">
                Token Chain Project: Revolutionizing Digital Asset Management
              </h2>
              <p className="text-[#737373] leading-relaxed">
                Introducing the Token Chain Project, a revolutionary platform
                designed to enhance the way digital assets are managed, traded,
                and secured. Built on cutting-edge blockchain technology, this
                project aims to provide users with a seamless and secure
                experience for managing their cryptocurrency portfolios.
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="holders">
            <Card className="p-6">
              <HoldersTable />
            </Card>
          </TabsContent>

          <TabsContent value="code">
            <div className="text-center py-8 text-gray-400">
              Code repository coming soon...
            </div>
          </TabsContent>

          <TabsContent value="explorer">
            <Card className="p-6">
              <BlockExplorerTable chainId={chain.id} />
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <aside className="w-[352px] flex-shrink-0 card h-fit p-4">
        <WalletContent showBalance={false} />
      </aside>
    </div>
  );
}
