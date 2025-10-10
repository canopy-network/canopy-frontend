"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { BondingCurveChart } from "@/components/launchpad/bonding-curve-chart";

import { ChainDetailsHeader } from "@/components/chain/chain-details-header";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ExternalLink,
  FileText,
  Globe,
  Twitter,
} from "lucide-react";
import { ChainWithUI } from "@/lib/stores/chains-store";
import { VirtualPool } from "@/types/chains";
import { ChainDetailChart } from "@/components/charts/chain-detail-chart";

interface ChainDetailsProps {
  chain: ChainWithUI;
  virtualPool?: VirtualPool | null;
}

export function ChainDetails({ chain, virtualPool }: ChainDetailsProps) {
  const [showBondingCurve, setShowBondingCurve] = useState(false);
  const [buyAmount, setBuyAmount] = useState("0");
  const [purchaseType, setPurchaseType] = useState("one-time");
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");

  const copyAddress = () => {
    navigator.clipboard.writeText(chain.chain_id || "");
  };

  // Use actual chain chart data
  const chartData = chain.chartData.map((point, index) => ({
    time: new Date(point.time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    price: point.value,
  }));

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
    <>
      {/* Header */}
      <main id="chain-details" className="w-full max-w-6xl mx-auto">
        <ChainDetailsHeader chain={chain} />

        <section className="bg-white/[0.1] rounded-lg p-4">
          {/* Timeframe Selection Buttons */}
          <div className="flex items-center gap-2 mb-4">
            {["1H", "1D", "1W", "1M", "1Y", "ALL"].map((timeframe) => (
              <Button
                key={timeframe}
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  selectedTimeframe === timeframe
                    ? "bg-gray-700 text-white"
                    : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
                }`}
              >
                {timeframe}
              </Button>
            ))}
          </div>

          <ChainDetailChart data={test_data} />
        </section>

        {/* Navigation Tabs */}
        <div className="mt-4">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="bg-transparent border-b border-gray-800 rounded-none h-auto p-0 w-full justify-start">
              <TabsTrigger
                value="overview"
                className="bg-transparent border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:bg-transparent rounded-none px-4 py-2 text-sm font-medium text-gray-400 data-[state=active]:text-white"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="project"
                className="bg-transparent border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:bg-transparent rounded-none px-4 py-2 text-sm font-medium text-gray-400 data-[state=active]:text-white"
              >
                Project Information
              </TabsTrigger>
              <TabsTrigger
                value="code"
                className="bg-transparent border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:bg-transparent rounded-none px-4 py-2 text-sm font-medium text-gray-400 data-[state=active]:text-white"
              >
                Code
              </TabsTrigger>
              <TabsTrigger
                value="explorer"
                className="bg-transparent border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:bg-transparent rounded-none px-4 py-2 text-sm font-medium text-gray-400 data-[state=active]:text-white"
              >
                Block Explorer
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Column - Chart and Stats */}
                <div className="lg:col-span-3 space-y-6">
                  {/* Price Chart */}
                  <Card className="bg-gray-900 border-gray-800">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-4xl font-bold text-white">
                            {chain.price.toFixed(4)}
                          </span>
                          <span className="text-red-500 text-lg font-medium">
                            -2.78%
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {["1H", "1M", "1D"].map((period) => (
                            <Button
                              key={period}
                              variant="ghost"
                              size="sm"
                              className={`h-8 px-3 text-sm ${
                                period === "1M"
                                  ? "bg-gray-700 text-white"
                                  : "text-gray-400 hover:text-white"
                              }`}
                            >
                              {period}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#374151"
                            />
                            <XAxis
                              dataKey="time"
                              tick={{ fill: "#9CA3AF", fontSize: 12 }}
                              axisLine={{ stroke: "#374151" }}
                            />
                            <YAxis
                              tick={{ fill: "#9CA3AF", fontSize: 12 }}
                              axisLine={{ stroke: "#374151" }}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#1f2937",
                                border: "1px solid #374151",
                                borderRadius: "8px",
                                color: "#ffffff",
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="price"
                              stroke="#ef4444"
                              strokeWidth={2}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Market Stats */}
                  <Card className="bg-gray-900 border-gray-800">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">
                        Market Statistics
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">i</span>
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">
                              Market cap
                            </div>
                            <div className="font-semibold text-white">
                              {chain.marketCap.toLocaleString()} CNPY
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">i</span>
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">
                              Volume (24h)
                            </div>
                            <div className="font-semibold text-white">
                              {chain.volume24h.toLocaleString()} CNPY
                            </div>
                            <div className="text-red-500 text-xs">-1.47%</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">i</span>
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">
                              Circulating supply
                            </div>
                            <div className="font-semibold text-white">
                              {chain.initial_token_supply.toLocaleString()}{" "}
                              {chain.token_symbol}
                            </div>
                            <div className="text-gray-400 text-xs">
                              {Math.round(
                                (chain.initial_token_supply /
                                  chain.token_total_supply) *
                                  100
                              )}
                              % of total supply
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">i</span>
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">Mainnet</div>
                            <div className="font-semibold text-white">
                              75 days
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">i</span>
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">
                              Bonding Curve
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${chain.progress}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {chain.progress}% complete
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">i</span>
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">
                              Popularity
                            </div>
                            <div className="font-semibold text-white">#1</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Performance */}
                  <Card className="bg-gray-900 border-gray-800">
                    <CardContent className="p-6">
                      <div className="text-sm text-gray-400 mb-2">
                        Updated December 3, 2021, 9:14 AM PST
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">DEFI</span>
                        <span className="text-green-500 font-medium">
                          +183%
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Overview */}
                  <Card className="bg-gray-900 border-gray-800">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">
                        Overview
                      </h3>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        {chain.chain_description}
                      </p>
                      {chain.template?.template_description && (
                        <p className="text-gray-300 leading-relaxed mb-4">
                          {chain.template.template_description}
                        </p>
                      )}

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-blue-400 hover:text-blue-300 cursor-pointer">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">Whitepaper</span>
                        </div>
                        <div className="flex items-center gap-2 text-blue-400 hover:text-blue-300 cursor-pointer">
                          <Globe className="h-4 w-4" />
                          <span className="text-sm">Official website</span>
                        </div>
                        <div className="flex items-center gap-2 text-blue-400 hover:text-blue-300 cursor-pointer">
                          <Twitter className="h-4 w-4" />
                          <span className="text-sm">Social Account</span>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        className="mt-4 border-gray-700 text-gray-300 hover:bg-gray-800"
                      >
                        View more
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column - Trading */}
                <div className="space-y-6">
                  {/* Buy/Sell main */}
                  <Card className="bg-gray-900 border-gray-800">
                    <CardContent className="p-6">
                      <Tabs defaultValue="buy" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-gray-800">
                          <TabsTrigger
                            value="buy"
                            className="data-[state=active]:bg-gray-700"
                          >
                            Buy
                          </TabsTrigger>
                          <TabsTrigger
                            value="sell"
                            className="data-[state=active]:bg-gray-700"
                          >
                            Sell
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="buy" className="space-y-4">
                          <div>
                            <Label
                              htmlFor="amount"
                              className="text-sm font-medium text-gray-300"
                            >
                              Amount
                            </Label>
                            <div className="relative mt-1">
                              <Input
                                id="amount"
                                value={buyAmount}
                                onChange={(e) => setBuyAmount(e.target.value)}
                                className="text-2xl font-bold pr-12 bg-gray-800 border-gray-700 text-white"
                                placeholder="$0"
                              />
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                                <ChevronUp className="h-4 w-4 text-gray-400" />
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-400 ml-2">
                                  {chain.token_symbol}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-400 mt-1">
                              You can buy up to $35,000.00
                            </p>
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-gray-300">
                              Purchase type
                            </Label>
                            <Select
                              value={purchaseType}
                              onValueChange={setPurchaseType}
                            >
                              <SelectTrigger className="mt-1 bg-gray-800 border-gray-700 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800 border-gray-700">
                                <SelectItem
                                  value="one-time"
                                  className="text-white hover:bg-gray-700"
                                >
                                  One time purchase
                                </SelectItem>
                                <SelectItem
                                  value="recurring"
                                  className="text-white hover:bg-gray-700"
                                >
                                  Recurring purchase
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 border border-gray-700 rounded-lg hover:bg-gray-800 cursor-pointer">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                                  <span className="text-white font-bold text-sm">
                                    ₿
                                  </span>
                                </div>
                                <div>
                                  <div className="font-medium text-white">
                                    {chain.chain_name}
                                  </div>
                                </div>
                              </div>
                              <ArrowRight className="h-4 w-4 text-gray-400" />
                            </div>

                            <div className="flex items-center justify-between p-3 border border-gray-700 rounded-lg hover:bg-gray-800 cursor-pointer">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                  <span className="text-white font-bold text-sm">
                                    7
                                  </span>
                                </div>
                                <div>
                                  <div className="font-medium text-white">
                                    CNPY
                                  </div>
                                </div>
                              </div>
                              <ArrowRight className="h-4 w-4 text-gray-400" />
                            </div>
                          </div>

                          <Button className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 text-lg">
                            Buy {chain.token_symbol}
                          </Button>

                          <p className="text-sm text-gray-400">
                            BTC balance 0.00355664
                          </p>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>

                  {/* Top Holders */}
                  <Card className="bg-gray-900 border-gray-800">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <h3 className="font-semibold text-white">
                          Top Holders
                        </h3>
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">i</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {Array.from({ length: 8 }, (_, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
                              <div>
                                <div className="text-sm font-medium text-white">
                                  Name
                                </div>
                                <div className="text-xs text-gray-400">
                                  0132561....16516
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-white">
                                $12.34
                              </div>
                              <div className="text-xs text-gray-400">100%</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
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
    </>
  );
}
