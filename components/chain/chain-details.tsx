"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChainDetailsHeader } from "@/components/chain/chain-details-header";
import { ChainWithUI } from "@/lib/stores/chains-store";
import { VirtualPool } from "@/types/chains";
import { ChainDetailChart } from "@/components/charts/chain-detail-chart";
import { WalletContent } from "../wallet/wallet-content";
import { ChartDataPoint } from "@/types/launchpad";

interface ChainDetailsProps {
  chain: ChainWithUI;
  virtualPool?: VirtualPool | null;
}

// Helper function to generate intraday data points
const generateIntradayData = (
  startTime: number,
  endTime: number,
  intervalMinutes: number,
  baseValue: number,
  volatility: number
): Array<{ value: number; time: number }> => {
  const data: Array<{ value: number; time: number }> = [];
  let currentValue = baseValue;

  for (let time = startTime; time <= endTime; time += intervalMinutes * 60) {
    const randomChange = (Math.random() - 0.5) * volatility;
    currentValue = Math.max(0.001, currentValue + randomChange);
    data.push({ value: parseFloat(currentValue.toFixed(6)), time });
  }

  return data;
};

// Sample data for different timeframes - all with intraday granularity
const SAMPLE_CHART_DATA = {
  "1H": generateIntradayData(
    Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
    Math.floor(Date.now() / 1000),
    5, // 5-minute intervals
    0.015,
    0.002
  ),
  "1D": generateIntradayData(
    Math.floor(Date.now() / 1000) - 86400, // 1 day ago
    Math.floor(Date.now() / 1000),
    60, // 1-hour intervals
    0.012,
    0.003
  ),
  "1W": generateIntradayData(
    Math.floor(Date.now() / 1000) - 604800, // 1 week ago
    Math.floor(Date.now() / 1000),
    240, // 4-hour intervals (6 records per day)
    0.01,
    0.004
  ),
  "1M": (() => {
    // For 1 month, generate 2+ records per day at different times
    const data: Array<{ value: number; time: number }> = [];
    const now = Math.floor(Date.now() / 1000);
    const monthAgo = now - 30 * 86400; // 30 days ago
    let currentValue = 0.008;

    for (let day = 0; day < 30; day++) {
      // Morning record (9 AM)
      const morningTime = monthAgo + day * 86400 + 9 * 3600;
      currentValue += (Math.random() - 0.48) * 0.003;
      currentValue = Math.max(0.002, currentValue);
      data.push({
        value: parseFloat(currentValue.toFixed(6)),
        time: morningTime,
      });

      // Afternoon record (3 PM)
      const afternoonTime = monthAgo + day * 86400 + 15 * 3600;
      currentValue += (Math.random() - 0.48) * 0.003;
      currentValue = Math.max(0.002, currentValue);
      data.push({
        value: parseFloat(currentValue.toFixed(6)),
        time: afternoonTime,
      });

      // Evening record (9 PM)
      const eveningTime = monthAgo + day * 86400 + 21 * 3600;
      currentValue += (Math.random() - 0.48) * 0.003;
      currentValue = Math.max(0.002, currentValue);
      data.push({
        value: parseFloat(currentValue.toFixed(6)),
        time: eveningTime,
      });
    }

    return data;
  })(),
  "1Y": (() => {
    // For 1 year, generate 2+ records per day at different times
    const data: Array<{ value: number; time: number }> = [];
    const now = Math.floor(Date.now() / 1000);
    const yearAgo = now - 365 * 86400; // 365 days ago
    let currentValue = 0.003;

    // Sample every 3 days to keep data manageable but still intraday
    for (let day = 0; day < 365; day += 3) {
      // Morning record (8 AM)
      const morningTime = yearAgo + day * 86400 + 8 * 3600;
      currentValue += (Math.random() - 0.45) * 0.002;
      currentValue = Math.max(0.001, currentValue);
      data.push({
        value: parseFloat(currentValue.toFixed(6)),
        time: morningTime,
      });

      // Afternoon record (2 PM)
      const afternoonTime = yearAgo + day * 86400 + 14 * 3600;
      currentValue += (Math.random() - 0.45) * 0.002;
      currentValue = Math.max(0.001, currentValue);
      data.push({
        value: parseFloat(currentValue.toFixed(6)),
        time: afternoonTime,
      });

      // Night record (8 PM)
      const nightTime = yearAgo + day * 86400 + 20 * 3600;
      currentValue += (Math.random() - 0.45) * 0.002;
      currentValue = Math.max(0.001, currentValue);
      data.push({
        value: parseFloat(currentValue.toFixed(6)),
        time: nightTime,
      });
    }

    return data;
  })(),
};

export function ChainDetails({ chain, virtualPool }: ChainDetailsProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");

  const [chartData, setChartData] = useState<
    {
      value: number;
      time: number;
    }[]
  >(SAMPLE_CHART_DATA["1D"]);

  useEffect(() => {
    const data =
      SAMPLE_CHART_DATA[selectedTimeframe as keyof typeof SAMPLE_CHART_DATA] ||
      SAMPLE_CHART_DATA["1D"];
    setChartData(data);
  }, [selectedTimeframe]);

  return (
    <div className="w-full max-w-6xl mx-auto flex gap-4">
      {/* Header */}
      <main id="chain-details">
        <ChainDetailsHeader chain={chain} />

        <section className="chain-details-live-data">
          <div className="bg-white/[0.1] rounded-lg py-4 px-5 mb-2">
            <div className="flex items-center gap-2 mb-4">
              {(["1H", "1D", "1W", "1M", "1Y"] as const).map((timeframe) => (
                <Button
                  key={timeframe}
                  variant="clear"
                  size="sm"
                  onClick={() => setSelectedTimeframe(timeframe)}
                  className={`px-3 py-1 text-sm text-white/[.50] font-medium rounded-md transition-colors ${
                    selectedTimeframe === timeframe
                      ? "bg-white/[.1] hover:bg-white/[.2] text-white"
                      : ""
                  }`}
                >
                  {timeframe}
                </Button>
              ))}
            </div>

            <ChainDetailChart data={chartData} timeframe={selectedTimeframe} />
          </div>

          <div className="flex items-center justify-between bg-white/[0.1] rounded-lg py-4 px-5">
            <h3 className="text-white font-medium">Live updates</h3>

            <div className="flex items-center gap-6 ml-auto">
              <div className="text-left">
                <span className="text-white/[0.5] text-sm mr-1">VOL (24h)</span>
                <span className="text-white font-medium text-base">$1.8B</span>
              </div>
              <div className="text-left">
                <span className="text-white/[0.5] text-sm mr-1">MCap</span>
                <span className="text-white font-medium text-base">$2.8B</span>
              </div>
              <div className="text-left">
                <span className="text-white/[0.5] text-sm mr-1">FDV</span>
                <span className="text-white font-medium text-base">$3.8B</span>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation Tabs */}
        <div className="mt-4">
          <Tabs defaultValue="overview" className="w-full gap-4">
            <TabsList variant="clear" className="flex justify-start gap-2">
              {[
                {
                  value: "overview",
                  label: "Overview",
                },
                {
                  value: "project",
                  label: "Project Information",
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
                  designed to enhance the way digital assets are managed,
                  traded, and secured. Built on cutting-edge blockchain
                  technology, this project aims to provide users with a seamless
                  and secure experience for managing their cryptocurrency
                  portfolios.
                </p>
              </Card>
            </TabsContent>

            <TabsContent value="project">
              <div className="text-center py-8 text-gray-400">
                Project information coming soon...
              </div>
            </TabsContent>

            <TabsContent value="code">
              <div className="text-center py-8 text-gray-400">
                Code repository coming soon...
              </div>
            </TabsContent>

            <TabsContent value="explorer">
              <div className="text-center py-8 text-gray-400">
                Block explorer coming soon...
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <aside className="w-full max-w-[352px] card h-fit p-4">
        <WalletContent showBalance={false} />
      </aside>
    </div>
  );
}
