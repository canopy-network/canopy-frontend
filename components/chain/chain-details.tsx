"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChainDetailsHeader } from "@/components/chain/chain-details-header";
import { ChainWithUI } from "@/lib/stores/chains-store";
import { VirtualPool } from "@/types/chains";
import { ChainDetailChart } from "@/components/charts/chain-detail-chart";
import { WalletContent } from "../wallet/wallet-content";

interface ChainDetailsProps {
  chain: ChainWithUI;
  virtualPool?: VirtualPool | null;
}

export function ChainDetails({ chain, virtualPool }: ChainDetailsProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");

  const test_data = [
    { value: 0.015, time: 1640995200 }, // High start
    { value: 0.012, time: 1641000000 }, // Initial drop
    { value: 0.008, time: 1641004800 }, // Significant drop
    { value: 0.006, time: 1641009600 }, // Lower point
    { value: 0.007, time: 1641014400 }, // Small recovery
    { value: 0.005, time: 1641019200 }, // Another drop
    { value: 0.008, time: 1641024000 }, // Upward movement
    { value: 0.009, time: 1641028800 }, // Continuing up
    { value: 0.011, time: 1641033600 }, // Building momentum
    { value: 0.013, time: 1641038400 }, // Strong upward trend
    { value: 0.016, time: 1641043200 }, // Approaching peak
    { value: 0.018, time: 1641048000 }, // Sharp peak
    { value: 0.012, time: 1641052800 }, // Sharp drop after peak
    { value: 0.009, time: 1641057600 }, // Lower fluctuations
    { value: 0.01, time: 1641062400 }, // Small recovery
    { value: 0.008, time: 1641067200 }, // Drop again
    { value: 0.011, time: 1641072000 }, // Final small peak
    { value: 0.009, time: 1641076800 }, // End lower
  ];

  return (
    <div className="w-full max-w-6xl mx-auto flex gap-4">
      {/* Header */}
      <main id="chain-details">
        <ChainDetailsHeader chain={chain} />

        <section className="chain-details-live-data">
          <div className="bg-white/[0.1] rounded-lg py-4 px-5 mb-2">
            <div className="flex items-center gap-2 mb-4">
              {["1H", "1D", "1W", "1M", "1Y", "ALL"].map((timeframe) => (
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

            <ChainDetailChart data={test_data} />
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
