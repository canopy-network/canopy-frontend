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
  convertOHLCToChartData,
} from "@/lib/api";

interface ChainDetailsProps {
  chain: ChainWithUI;
  virtualPool?: VirtualPool | null;
}

export function ChainDetails({ chain, virtualPool }: ChainDetailsProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");
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
  const fetchPriceHistory = async (timeframe: string) => {
    try {
      setLoadingChart(true);
      setChartError(null);

      const timeRange = getTimeRangeForTimeframe(timeframe);
      const response = await getChainPriceHistory(chain.id, timeRange);

      if (response.data && response.data.length > 0) {
        const formattedData = convertOHLCToChartData(response.data);
        setChartData(formattedData);
      } else {
        // No data available for this timeframe
        setChartData([]);
        setChartError("No price data available for this timeframe");
      }
    } catch (err) {
      console.error("Failed to fetch price history:", err);
      setChartError("Failed to load price data");
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

  // Fetch price history when timeframe changes
  useEffect(() => {
    fetchPriceHistory(selectedTimeframe);
  }, [selectedTimeframe, chain.id]);

  return (
    <div className="w-full max-w-7xl mx-auto lg:flex gap-4">
      {/* Header */}
      <main id="chain-details" className="flex-1 min-w-0">
        <ChainDetailsHeader chain={chain} />

        <section className="chain-details-live-data px-1 border border-white/[0.1] rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-2 px-3 py-4">
            <div className="flex flex-col">
              <span className="text-white/50 text-sm ">Price</span>
              <span className="text-white/50 text-sm">
                <span className="text-white font-medium text-2xl sm:text-3xl mr-1">
                  25K
                </span>
                +$1.93
              </span>
            </div>

            <div className="flex flex-col flex-1 sm:ml-auto sm:items-end">
              <span className="text-white/50 text-xs sm:text-sm mb-2">
                $233.23k until graduation
              </span>
              <span className="w-full bg-white/[0.1] rounded-full h-6 overflow-hidden sm:max-w-[220px]">
                <span
                  className="bg-gradient-to-r block from-green-500 to-green-400 h-full rounded-full transition-all duration-500"
                  style={{ width: "35%" }}
                />
              </span>
            </div>
          </div>

          <div
            id="chart-container"
            className="bg-white/[0.1] rounded-lg py-4 px-3 sm:px-5 mb-2 relative"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                {(["1H", "1D", "1W", "1M", "1Y"] as const).map((timeframe) => (
                  <Button
                    key={timeframe}
                    variant="clear"
                    size="sm"
                    onClick={() => setSelectedTimeframe(timeframe)}
                    disabled={loadingChart}
                    className={`px-2 sm:px-3 py-1 text-xs sm:text-sm text-white/[.50] font-medium rounded-md transition-colors ${
                      selectedTimeframe === timeframe
                        ? "bg-white/[.1] hover:bg-white/[.2] text-white"
                        : ""
                    }`}
                  >
                    {timeframe}
                  </Button>
                ))}
              </div>
              {loadingChart && (
                <span className="text-xs sm:text-sm text-white/50">
                  Loading...
                </span>
              )}
            </div>

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

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white/[0.1] rounded-lg py-4 px-3 sm:px-5 mb-1">
            <h3 className="text-white font-medium text-sm sm:text-base">
              Live updates
            </h3>

            <div className="flex items-center gap-3 sm:gap-6 flex-wrap sm:ml-auto">
              <div className="text-left">
                <span className="text-white/[0.5] text-xs sm:text-sm mr-1">
                  VOL (24h)
                </span>
                <span className="text-white font-medium text-sm sm:text-base">
                  $1.8B
                </span>
              </div>
              <div className="text-left">
                <span className="text-white/[0.5] text-xs sm:text-sm mr-1">
                  MCap
                </span>
                <span className="text-white font-medium text-sm sm:text-base">
                  $2.8B
                </span>
              </div>
              <div className="text-left">
                <span className="text-white/[0.5] text-xs sm:text-sm mr-1">
                  FDV
                </span>
                <span className="text-white font-medium text-sm sm:text-base">
                  $3.8B
                </span>
              </div>
            </div>
          </div>
        </section>

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
