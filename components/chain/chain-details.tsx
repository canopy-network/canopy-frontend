"use client";

import { useState, useEffect, useRef } from "react";
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
import { ChainExtended, ChainHolder, Accolade } from "@/types/chains";
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
import { getChainHolders, chainsApi } from "@/lib/api/chains";
import { DetailSheet } from "./chain-details/detail-sheet";
import type { ApiTransaction } from "@/lib/api";

interface ChainDetailsProps {
  chain: ChainExtended;
  accolades?: Accolade[];
}

export function ChainDetails({ chain, accolades = [] }: ChainDetailsProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");
  const [selectedMetric, setSelectedMetric] = useState<
    "price" | "volume" | "marketCap"
  >("price");
  const setCurrentChain = useChainsStore((state) => state.setCurrentChain);

  // Local state for updated chain data (virtual_pool and graduation)
  const [updatedChain, setUpdatedChain] = useState<ChainExtended>(chain);
  const chainRef = useRef<ChainExtended>(chain);
  const selectedTimeframeRef = useRef(selectedTimeframe);
  const selectedMetricRef = useRef(selectedMetric);

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

  // Sheet state management
  const [selectedTransaction, setSelectedTransaction] =
    useState<ApiTransaction | null>(null);
  const [transactionSheetOpen, setTransactionSheetOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<{
    number: number;
    hash: string;
    timestamp: number;
    transactions: number;
    reward: string;
  } | null>(null);
  const [blockSheetOpen, setBlockSheetOpen] = useState(false);

  // Keep refs in sync
  useEffect(() => {
    chainRef.current = updatedChain;
  }, [updatedChain]);

  useEffect(() => {
    selectedTimeframeRef.current = selectedTimeframe;
  }, [selectedTimeframe]);

  useEffect(() => {
    selectedMetricRef.current = selectedMetric;
  }, [selectedMetric]);

  // Update local chain state when prop changes
  useEffect(() => {
    setUpdatedChain(chain);
    chainRef.current = chain;
  }, [chain]);

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
    setCurrentChain(updatedChain);

    // Cleanup: clear current chain when component unmounts
    return () => {
      setCurrentChain(null);
    };
  }, [updatedChain, setCurrentChain]);

  useEffect(() => {
    fetchHolders();
  }, [chain.id]);

  // Fetch price history when timeframe or metric changes
  useEffect(() => {
    fetchPriceHistory(selectedTimeframe, selectedMetric);
  }, [selectedTimeframe, selectedMetric, chain.id]);

  // Polling: Refresh price history, virtual_pool, and graduation every 10 seconds
  useEffect(() => {
    // Function to silently refresh price history (without loading state)
    const refreshPriceHistory = async () => {
      try {
        const timeframe = selectedTimeframeRef.current;
        const metric = selectedMetricRef.current;
        const timeRange = getTimeRangeForTimeframe(timeframe);
        const response = await getChainPriceHistory(
          chainRef.current.id,
          timeRange
        );

        if (response.data && response.data.length > 0) {
          let formattedData;

          if (metric === "volume") {
            formattedData = convertVolumeHistoryToChart(response.data);
          } else if (metric === "price") {
            formattedData = convertPriceHistoryToChart(response.data);
          } else {
            formattedData = convertPriceHistoryToChart(response.data);
          }

          setChartData(formattedData);
        }
      } catch (error) {
        console.error("Failed to refresh price history:", error);
      }
    };

    // Function to refresh virtual_pool and graduation data
    const refreshChainData = async () => {
      try {
        const response = await chainsApi.getChain(chainRef.current.id, {
          include: "virtual_pool,graduation",
        });

        if (response.data) {
          const newVirtualPool = response.data.virtual_pool;
          const newGraduation = (response.data as ChainExtended).graduation;

          // Only update if data actually changed
          const virtualPoolChanged =
            JSON.stringify(chainRef.current.virtual_pool) !==
            JSON.stringify(newVirtualPool);
          const graduationChanged =
            JSON.stringify(chainRef.current.graduation) !==
            JSON.stringify(newGraduation);

          if (virtualPoolChanged || graduationChanged) {
            setUpdatedChain(
              (prev) =>
                ({
                  ...prev,
                  virtual_pool: newVirtualPool,
                  ...(newGraduation && {
                    graduation: newGraduation,
                  }),
                } as ChainExtended)
            );
          }
        }
      } catch (error) {
        console.error("Failed to refresh chain data:", error);
      }
    };

    // Initial refresh
    refreshPriceHistory();
    refreshChainData();

    // Set up polling interval (10 seconds)
    const interval = setInterval(() => {
      // Only poll if page is visible
      if (document.visibilityState === "visible") {
        refreshPriceHistory();
        // Only refresh graduation if chain is not graduated
        if (!chainRef.current.is_graduated) {
          refreshChainData();
        } else {
          // For graduated chains, only refresh virtual_pool (which becomes pool)
          refreshChainData();
        }
      }
    }, 10000); // 10 seconds

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, [chain.id]); // Only depend on chain.id

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
          <div className="flex items-center justify-between px-2 lg:px-4 py-1 lg:py-3">
            <div className="space-y-2 flex-1">
              {/* Metric Toggle Tabs */}
              {updatedChain.status === "graduated" ? (
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
              {updatedChain.is_graduated ? (
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
                    {updatedChain.virtual_pool?.market_cap_usd.toLocaleString(
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
            {!updatedChain.is_graduated && updatedChain.graduation && (
              <div className="space-y-2 w-[216px]">
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center justify-end gap-1.5 cursor-help">
                        <p className="text-xs text-muted-foreground text-right">
                          $
                          {(updatedChain.graduation?.cnpy_remaining
                            ? updatedChain.graduation.cnpy_remaining / 1000
                            : 0
                          ).toFixed(1)}
                          k until graduation
                        </p>
                        <HelpCircle className="w-3 h-3 text-muted-foreground" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-[260px]">
                      <p className="text-xs">
                        This chain starts as virtual (test mode). When market
                        cap reaches $
                        {(updatedChain.graduation?.threshold_cnpy
                          ? updatedChain.graduation.threshold_cnpy / 1000
                          : 0
                        ).toFixed(0)}
                        k, it will graduate to a real blockchain with permanent
                        on-chain transactions.
                      </p>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
                <Progress
                  value={updatedChain.graduation?.completion_percentage || 0}
                  className="h-2.5"
                />
              </div>
            )}
          </div>

          {/* Chart Container */}
          <div className="rounded-xl border text-card-foreground shadow relative h-[272px] bg-muted/40">
            {/* Timeframe Buttons - Overlay on Chart */}
            <div className="absolute left-2 lg:left-4 top-2.5 z-10 flex gap-0.5 p-0.5 bg-muted/50 rounded-lg">
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
            <div className="h-full pt-12 p-3 lg:px-4">
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
                  lineColor={updatedChain.brand_color}
                />
              )}
            </div>
          </div>

          {/* Live Updates */}
          <div className="rounded-xl border text-card-foreground shadow bg-muted/40">
            <div className="flex items-center gap-6 p-3 lg:px-5 lg:py-3.5">
              <p className="text-sm font-medium lg:inline-block hidden whitespace-nowrap">
                Live updates
              </p>

              <div className="grid grid-cols-2 w-full gap-2 lg:gap-0 lg:flex flex-1 items-center justify-between text-sm">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs text-muted-foreground">
                    VOL (24h)
                  </span>
                  <span className="font-medium">
                    {updatedChain.pool?.volume_24h_cnpy
                      ? `${updatedChain.pool.volume_24h_cnpy.toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }
                        )} CNPY`
                      : updatedChain.virtual_pool?.volume_24h_cnpy
                      ? `${updatedChain.virtual_pool.volume_24h_cnpy.toLocaleString(
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
                    {updatedChain.pool?.market_cap_usd
                      ? `$${(updatedChain.pool.market_cap_usd / 1000).toFixed(
                          1
                        )}k`
                      : updatedChain.virtual_pool?.market_cap_usd
                      ? `$${(
                          updatedChain.virtual_pool.market_cap_usd / 1000
                        ).toFixed(1)}k`
                      : "N/A"}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs text-muted-foreground">
                    Liquidity
                  </span>
                  <span className="font-medium">
                    {updatedChain.pool?.cnpy_reserve
                      ? `${(updatedChain.pool.cnpy_reserve / 1000).toFixed(
                          1
                        )}k CNPY`
                      : updatedChain.virtual_pool?.cnpy_reserve
                      ? `${(
                          updatedChain.virtual_pool.cnpy_reserve / 1000
                        ).toFixed(1)}k CNPY`
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
            chain={updatedChain}
            holders={chainHolders.holders}
            holdersCount={chainHolders.holders.length}
            accolades={accolades}
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
            repositoryUrl={updatedChain.repository?.github_url}
            repositoryName={updatedChain.repository?.repository_name}
            deploymentStatus={
              updatedChain.repository?.build_status === "success"
                ? "deployed"
                : updatedChain.repository?.build_status === "pending"
                ? "building"
                : updatedChain.repository?.build_status === "failed"
                ? "failed"
                : null
            }
          />
        </TabsContent>

        <TabsContent value="explorer" className="space-y-6">
          <BlockExplorerHeader />
          <ChainBlocks
            onBlockClick={(block) => {
              setSelectedBlock(block);
              setBlockSheetOpen(true);
            }}
          />
          <BlockExplorerTable
            chainId={updatedChain.id}
            onTransactionClick={(transaction) => {
              setSelectedTransaction(transaction);
              setTransactionSheetOpen(true);
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Transaction Detail Sheet */}
      <DetailSheet
        type="transaction"
        transaction={selectedTransaction}
        ticker={updatedChain.token_symbol || "TOKEN"}
        open={transactionSheetOpen}
        onOpenChange={setTransactionSheetOpen}
        onBlockClick={(blockNumber) => {
          // Close transaction sheet and open block sheet
          setTransactionSheetOpen(false);
          // Find the block or create a placeholder
          // For now, we'll just show a placeholder block
          setSelectedBlock({
            number: blockNumber,
            hash: `0x${Math.random().toString(16).substring(2, 66)}`,
            timestamp: Date.now(),
            transactions: 0,
            reward: "0",
          });
          setBlockSheetOpen(true);
        }}
      />

      {/* Block Detail Sheet */}
      <DetailSheet
        type="block"
        block={selectedBlock}
        ticker={updatedChain.token_symbol || "TOKEN"}
        open={blockSheetOpen}
        onOpenChange={setBlockSheetOpen}
      />
    </>
  );
}
