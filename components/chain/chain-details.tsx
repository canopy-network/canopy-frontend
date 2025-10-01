"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { BondingCurveChart } from "@/components/launchpad/bonding-curve-chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Share2, Star, Bell } from "lucide-react";

interface ChainProject {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  creator: string;
  creatorProfile: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  progress: number;
  raised: string;
  target: string;
  participants: number;
  timeLeft: string;
  status: "active" | "graduated" | "pending";
  bondingCurve: { price: number; supply: number }[];
  tokenSymbol: string;
  tokenIcon: string; // Added token icon
  chainIcon: string; // Added chain icon
  contractAddress: string;
  website?: string;
  twitter?: string;
  discord?: string;
  github?: string;
  whitepaper?: string;
  features: string[];
  roadmap: {
    phase: string;
    status: "completed" | "current" | "upcoming";
    items: string[];
  }[];
  team: { name: string; role: string; avatar: string }[];
  tokenomics: {
    category: string;
    percentage: number;
    amount: string;
    description: string;
  }[];
  metrics: {
    holders: number;
    transactions: number;
    volume24h: string;
    marketCap: string;
    fdv: string;
    currentPrice: string;
  };
  images?: string[]; // Added user-uploaded images
}

// Mock data - in real app this would come from API
const mockChainData: Record<string, ChainProject> = {
  "1": {
    id: "1",
    name: "DeFi Chain Alpha",
    description:
      "Next-generation DeFi infrastructure with cross-chain compatibility",
    longDescription:
      "DeFi Chain Alpha is building the next generation of decentralized finance infrastructure with native cross-chain compatibility, advanced yield farming mechanisms, and institutional-grade security features.",
    creator: "0x742d...8D4",
    creatorProfile: {
      name: "Alex Chen",
      avatar: "/developer-working.png",
      verified: true,
    },
    progress: 75,
    raised: "450,000",
    target: "600,000",
    participants: 234,
    timeLeft: "2d 14h",
    status: "active",
    tokenSymbol: "DEFI",
    tokenIcon: "🔷", // Added token icon
    chainIcon: "⛓️", // Added chain icon
    contractAddress: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
    website: "https://defichainalpha.com",
    twitter: "https://twitter.com/defichainalpha",
    discord: "https://discord.gg/defichainalpha",
    github: "https://github.com/defichainalpha",
    whitepaper: "https://defichainalpha.com/whitepaper.pdf",
    bondingCurve: [
      { price: 0.1, supply: 0 },
      { price: 0.15, supply: 100000 },
      { price: 0.25, supply: 300000 },
      { price: 0.4, supply: 450000 },
      { price: 0.6, supply: 600000 },
    ],
    features: [
      "Cross-chain asset bridges",
      "Advanced yield farming",
      "Institutional custody",
      "MEV protection",
      "Gasless transactions",
      "DAO governance",
    ],
    roadmap: [
      {
        phase: "Phase 1: Foundation",
        status: "completed",
        items: [
          "Core blockchain development",
          "Basic DeFi protocols",
          "Security audits",
        ],
      },
      {
        phase: "Phase 2: DeFi Expansion",
        status: "current",
        items: [
          "Advanced AMM",
          "Yield farming protocols",
          "Cross-chain bridges",
        ],
      },
      {
        phase: "Phase 3: Enterprise",
        status: "upcoming",
        items: [
          "Institutional features",
          "Compliance tools",
          "Enterprise partnerships",
        ],
      },
    ],
    team: [
      {
        name: "Alex Chen",
        role: "Founder & CEO",
        avatar: "/diverse-ceo-group.png",
      },
      { name: "Sarah Kim", role: "CTO", avatar: "/cto.jpg" },
      {
        name: "Mike Johnson",
        role: "Head of DeFi",
        avatar: "/defi-concept.png",
      },
      {
        name: "Lisa Wang",
        role: "Security Lead",
        avatar: "/digital-security-abstract.png",
      },
    ],
    tokenomics: [
      {
        category: "Public Sale",
        percentage: 40,
        amount: "400M",
        description: "Available through bonding curve",
      },
      {
        category: "Team & Advisors",
        percentage: 20,
        amount: "200M",
        description: "4-year vesting",
      },
      {
        category: "Development",
        percentage: 25,
        amount: "250M",
        description: "Protocol development fund",
      },
      {
        category: "Ecosystem",
        percentage: 10,
        amount: "100M",
        description: "Partnerships and grants",
      },
      {
        category: "Treasury",
        percentage: 5,
        amount: "50M",
        description: "DAO treasury",
      },
    ],
    metrics: {
      holders: 1247,
      transactions: 15420,
      volume24h: "125,000",
      marketCap: "450,000",
      fdv: "600,000",
      currentPrice: "0.45",
    },
    images: [
      "/defi-concept.png",
      "/interconnected-blocks.png",
      "/digital-security-abstract.png",
    ], // Added sample images
  },
  "2": {
    id: "2",
    name: "GameFi Universe",
    description: "Gaming-focused blockchain with built-in NFT marketplace",
    longDescription:
      "GameFi Universe is the ultimate gaming blockchain designed for the next generation of play-to-earn games, NFT marketplaces, and virtual worlds. Built with high-performance gaming in mind, our chain supports complex game mechanics, real-time interactions, and seamless NFT trading.",
    creator: "0x123a...9F2",
    creatorProfile: {
      name: "Gaming Studios DAO",
      avatar: "/gaming-setup.png",
      verified: true,
    },
    progress: 45,
    raised: "180,000",
    target: "400,000",
    participants: 156,
    timeLeft: "5d 8h",
    status: "active",
    tokenSymbol: "GAME",
    tokenIcon: "🎮", // Added token icon
    chainIcon: "🚀", // Added chain icon
    contractAddress: "0x123a35Cc6634C0532925a3b8D4C0532925a3b9F2",
    website: "https://gamefi-universe.com",
    twitter: "https://twitter.com/gamefi_universe",
    discord: "https://discord.gg/gamefi-universe",
    bondingCurve: [
      { price: 0.08, supply: 0 },
      { price: 0.12, supply: 80000 },
      { price: 0.18, supply: 180000 },
      { price: 0.3, supply: 300000 },
      { price: 0.5, supply: 400000 },
    ],
    features: [
      "High-performance gaming",
      "Built-in NFT marketplace",
      "Play-to-earn mechanics",
      "Virtual world support",
      "Cross-game assets",
      "Tournament infrastructure",
    ],
    roadmap: [
      {
        phase: "Phase 1: Core Gaming",
        status: "completed",
        items: ["Gaming blockchain core", "NFT standards", "Basic marketplace"],
      },
      {
        phase: "Phase 2: Ecosystem",
        status: "current",
        items: [
          "Game partnerships",
          "Advanced marketplace",
          "Tournament system",
        ],
      },
      {
        phase: "Phase 3: Metaverse",
        status: "upcoming",
        items: [
          "Virtual worlds",
          "Cross-game interoperability",
          "VR/AR support",
        ],
      },
    ],
    team: [
      {
        name: "David Park",
        role: "Game Director",
        avatar: "/game-director.jpg",
      },
      {
        name: "Emma Rodriguez",
        role: "Blockchain Lead",
        avatar: "/interconnected-blocks.png",
      },
      {
        name: "Tom Wilson",
        role: "NFT Specialist",
        avatar: "/digital-art-collection.png",
      },
    ],
    tokenomics: [
      {
        category: "Public Sale",
        percentage: 35,
        amount: "350M",
        description: "Available through bonding curve",
      },
      {
        category: "Gaming Rewards",
        percentage: 30,
        amount: "300M",
        description: "Play-to-earn rewards",
      },
      {
        category: "Team",
        percentage: 15,
        amount: "150M",
        description: "3-year vesting",
      },
      {
        category: "Development",
        percentage: 15,
        amount: "150M",
        description: "Game development fund",
      },
      {
        category: "Marketing",
        percentage: 5,
        amount: "50M",
        description: "Community growth",
      },
    ],
    metrics: {
      holders: 892,
      transactions: 8340,
      volume24h: "45,000",
      marketCap: "180,000",
      fdv: "400,000",
      currentPrice: "0.18",
    },
    images: ["/game-director.jpg", "/digital-art-collection.png"], // Added sample images
  },
};

interface ChainDetailsProps {
  chainId: string;
}

export function ChainDetails({ chainId }: ChainDetailsProps) {
  const [chain, setChain] = useState<ChainProject | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isPriceAlertSet, setIsPriceAlertSet] = useState(false);
  const [showBondingCurve, setShowBondingCurve] = useState(false);

  useEffect(() => {
    // In real app, fetch chain data from API
    const chainData = mockChainData[chainId];
    setChain(chainData || null);
  }, [chainId]);

  if (!chain) {
    return (
      <div className="flex flex-col h-full">
        <div className="border-b border-[#2a2a2a] p-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/"
                  className="text-gray-400 hover:text-white"
                >
                  Launchpad
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-gray-600" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white">
                  Chain Not Found
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex-1 p-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-8 text-center">
              <p className="text-gray-400">Chain not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(chain.contractAddress);
  };

  const shareProject = () => {
    if (navigator.share) {
      navigator.share({
        title: chain.name,
        text: chain.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-[#2a2a2a] p-3 flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/"
                className="text-gray-400 hover:text-white"
              >
                Launchpad
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-gray-600" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-white">
                {chain?.name || "Loading..."}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {chain && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-800 rounded-lg mr-4">
              <div>
                <div className="text-gray-400 text-xs">Contract</div>
                <div className="text-white font-mono text-xs">
                  {chain.contractAddress.slice(0, 8)}...
                  {chain.contractAddress.slice(-6)}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyAddress}
                className="text-gray-400 hover:text-white h-6 w-6 p-0"
              >
                📋
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFollowing(!isFollowing)}
              className={`border-gray-700 hover:bg-gray-800 ${
                isFollowing
                  ? "bg-green-500 text-black border-green-500"
                  : "bg-transparent"
              }`}
            >
              <Star
                className={`h-4 w-4 mr-1 ${isFollowing ? "fill-current" : ""}`}
              />
              {isFollowing ? "Following" : "Follow"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPriceAlertSet(!isPriceAlertSet)}
              className={`border-gray-700 hover:bg-gray-800 ${
                isPriceAlertSet
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-transparent"
              }`}
            >
              <Bell
                className={`h-4 w-4 mr-1 ${
                  isPriceAlertSet ? "fill-current" : ""
                }`}
              />
              Price Alert
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={shareProject}
              className="border-gray-700 hover:bg-gray-800 bg-green-500 text-black border-green-500"
            >
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-4">
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{chain.tokenIcon}</span>
                <span className="text-xl">{chain.chainIcon}</span>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-xl font-bold text-white">{chain.name}</h1>
                  <Badge className="text-xs bg-gray-700 text-gray-300">
                    {chain.tokenSymbol}
                  </Badge>
                  <Badge className="text-xs bg-gray-700 text-gray-300">
                    NASDAQ
                  </Badge>
                  <Badge
                    variant={
                      chain.status === "active" ? "default" : "secondary"
                    }
                    className={
                      chain.status === "active"
                        ? "bg-green-500 text-black text-xs"
                        : "bg-gray-700 text-gray-300 text-xs"
                    }
                  >
                    {chain.status}
                  </Badge>
                </div>
                <p className="text-gray-400 text-sm">{chain.description}</p>
              </div>
            </div>

            <Tabs defaultValue="overview" className="mb-4">
              <TabsList className="bg-transparent border-b border-gray-800 rounded-none h-auto p-0">
                <TabsTrigger
                  value="overview"
                  className="bg-transparent border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:bg-transparent rounded-none px-4 py-2 text-sm"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="historical"
                  className="bg-transparent border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:bg-transparent rounded-none px-4 py-2 text-sm"
                >
                  Historical Data
                </TabsTrigger>
                <TabsTrigger
                  value="financials"
                  className="bg-transparent border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:bg-transparent rounded-none px-4 py-2 text-sm"
                >
                  Financials
                </TabsTrigger>
                <TabsTrigger
                  value="team"
                  className="bg-transparent border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:bg-transparent rounded-none px-4 py-2 text-sm"
                >
                  Team
                </TabsTrigger>
                <TabsTrigger
                  value="research"
                  className="bg-transparent border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:bg-transparent rounded-none px-4 py-2 text-sm"
                >
                  Research
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4">
                <div className="grid gap-6 lg:grid-cols-4">
                  {/* Left Column - Chart */}
                  <div className="lg:col-span-3">
                    <Card className="bg-gray-900 border-gray-800 mb-6">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-sm text-gray-400">
                            powered by
                          </span>
                          <span className="text-sm font-medium text-white">
                            perplexity
                          </span>
                          <div className="flex gap-1 ml-4">
                            {[
                              "1D",
                              "5D",
                              "1M",
                              "6M",
                              "YTD",
                              "1Y",
                              "5Y",
                              "MAX",
                            ].map((period) => (
                              <Button
                                key={period}
                                variant="ghost"
                                size="sm"
                                className={`h-6 px-2 text-xs ${
                                  period === "1D"
                                    ? "bg-gray-700 text-white"
                                    : "text-gray-400 hover:text-white"
                                }`}
                              >
                                {period}
                              </Button>
                            ))}
                          </div>
                          <div className="ml-auto flex items-center gap-2 text-sm">
                            <span className="text-red-500">-$1.41</span>
                            <span className="text-red-500">↓ 0.55%</span>
                          </div>
                        </div>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chain.bondingCurve}>
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#374151"
                              />
                              <XAxis
                                dataKey="supply"
                                tickFormatter={(value) =>
                                  `${(value / 1000).toFixed(0)}K`
                                }
                                tick={{ fill: "#9CA3AF", fontSize: 12 }}
                                axisLine={{ stroke: "#374151" }}
                              />
                              <YAxis
                                tickFormatter={(value) =>
                                  `$${value.toFixed(2)}`
                                }
                                tick={{ fill: "#9CA3AF", fontSize: 12 }}
                                axisLine={{ stroke: "#374151" }}
                              />
                              <Tooltip
                                formatter={(value: number) => [
                                  `$${value.toFixed(3)}`,
                                  "Price",
                                ]}
                                labelFormatter={(value) =>
                                  `Supply: ${Number.parseInt(
                                    value
                                  ).toLocaleString()}`
                                }
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
                        <div className="text-xs text-gray-500 mt-2">
                          Prev close: $256.87
                        </div>
                      </CardContent>
                    </Card>

                    {/* Quick Stats Section */}
                    <Card className="bg-gray-900 border-gray-800">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-bold text-white mb-4">
                          Quick Stats
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Transactions</span>
                            <span className="text-white font-bold">
                              {chain.metrics.transactions.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Token Symbol</span>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{chain.tokenIcon}</span>
                              <span className="text-white font-bold">
                                {chain.tokenSymbol}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Holders</span>
                            <span className="text-white font-bold">
                              {chain.metrics.holders.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">24h Volume</span>
                            <span className="text-white font-bold">
                              ${chain.metrics.volume24h}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Column - Trading Section + Company Info */}
                  <div className="space-y-6">
                    {/* Trading Section */}
                    <Card className="bg-gray-900 border-gray-800">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                          <span className="text-2xl">{chain.tokenIcon}</span>
                          <h2 className="text-xl font-bold text-white">
                            Trade {chain.tokenSymbol}
                          </h2>
                        </div>

                        {/* Progress Section */}
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400">
                              Progress to Graduation
                            </span>
                            <span className="text-green-500 font-bold">
                              {chain.progress}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${chain.progress}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">
                              ${chain.raised} raised
                            </span>
                            <span className="text-gray-400">
                              ${chain.target} target
                            </span>
                          </div>
                        </div>

                        {/* Key Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div>
                            <div className="text-gray-400 text-sm mb-1">
                              Participants
                            </div>
                            <div className="text-white text-xl font-bold">
                              {chain.participants}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-400 text-sm mb-1">
                              Time Left
                            </div>
                            <div className="text-white text-xl font-bold">
                              {chain.timeLeft}
                            </div>
                          </div>
                        </div>

                        {/* Prominent Buy Button */}
                        <Button
                          className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-4 text-lg mb-4"
                          onClick={() => setShowBondingCurve(true)}
                        >
                          <TrendingUp className="h-5 w-5 mr-2" />
                          Buy {chain.tokenSymbol}
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Company Info Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Symbol</span>
                        <span className="font-medium text-white">
                          {chain.tokenSymbol}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">
                          Market Cap
                        </span>
                        <span className="font-medium text-white">
                          ${chain.metrics.marketCap}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">IPO Date</span>
                        <span className="font-medium text-white">
                          Dec 11, 1980
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">CEO</span>
                        <span className="font-medium text-white">
                          {chain.creatorProfile.name}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">
                          Fulltime Employees
                        </span>
                        <span className="font-medium text-white">164K</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Sector</span>
                        <span className="font-medium text-white">
                          Technology
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Industry</span>
                        <span className="font-medium text-white">
                          Consumer Electronics
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Country</span>
                        <span className="font-medium text-white">US</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Exchange</span>
                        <span className="font-medium text-white">
                          NASDAQ Global Select
                        </span>
                      </div>
                    </div>

                    <div className="text-sm text-gray-300 leading-relaxed">
                      {chain.longDescription}
                      <button className="text-green-500 hover:underline ml-1">
                        Read More
                      </button>
                    </div>

                    {/* Watchlist Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-medium text-white">
                          Watchlist
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                        >
                          <span className="text-xs">⚙️</span>
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 rounded border border-gray-800">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{chain.tokenIcon}</span>
                            <div>
                              <div className="text-sm font-medium text-white">
                                {chain.name}
                              </div>
                              <div className="text-xs text-gray-400">
                                {chain.tokenSymbol} • NASDAQ
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-white">
                              ${chain.metrics.currentPrice}
                            </div>
                            <div className="text-xs text-red-500">-0.55%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Other tab contents remain the same */}
              <TabsContent value="historical">
                <div className="text-center py-8 text-gray-400">
                  Historical data coming soon...
                </div>
              </TabsContent>
              <TabsContent value="financials">
                <div className="text-center py-8 text-gray-400">
                  Financial data coming soon...
                </div>
              </TabsContent>
              <TabsContent value="team">
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-4">
                    <div className="grid gap-6 md:grid-cols-2">
                      {chain.team.map((member, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 p-4 rounded-lg border border-gray-800 bg-gray-800/50"
                        >
                          <img
                            src={member.avatar || "/placeholder.svg"}
                            alt={member.name}
                            className="w-12 h-12 rounded-full"
                          />
                          <div>
                            <h3 className="font-semibold text-white">
                              {member.name}
                            </h3>
                            <p className="text-sm text-gray-400">
                              {member.role}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="research">
                <div className="text-center py-8 text-gray-400">
                  Research reports coming soon...
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Bonding Curve Modal */}
          {showBondingCurve && (
            <BondingCurveChart
              project={chain}
              isOpen={showBondingCurve}
              onClose={() => setShowBondingCurve(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
