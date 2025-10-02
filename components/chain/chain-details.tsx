"use client";

import { useState, useEffect } from "react";
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
  Share2,
  Star,
  Bell,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ExternalLink,
  FileText,
  Globe,
  Twitter,
} from "lucide-react";

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
  const [buyAmount, setBuyAmount] = useState("0");
  const [purchaseType, setPurchaseType] = useState("one-time");

  useEffect(() => {
    // In real app, fetch chain data from API
    // For now, always show the static page with mock data
    const chainData = mockChainData["1"]; // Always use the first mock data
    setChain(chainData);
  }, [chainId]);

  if (!chain) {
    return (
      <div className="flex flex-col h-full bg-gray-900">
        <div className="border-b border-gray-800 p-4">
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

  // Mock chart data for the price chart
  const chartData = [
    { time: "10:50 AM", price: 54.8 },
    { time: "11:00 AM", price: 54.9 },
    { time: "11:30 AM", price: 55.1 },
    { time: "12:00 PM", price: 54.7 },
    { time: "12:30 PM", price: 54.5 },
    { time: "1:00 PM", price: 54.2 },
    { time: "1:30 PM", price: 54.0 },
    { time: "2:00 PM", price: 54.1 },
    { time: "2:30 PM", price: 54.3 },
    { time: "2:57 PM", price: 54.996 },
  ];

  return (
    <div className="flex flex-col h-full  max-w-8xl mx-auto">
      {/* Header */}
      <div className="border-b border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">₿</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">DeFi App</h1>
              <p className="text-sm text-gray-400">DEFI</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFollowing(!isFollowing)}
              className={`${
                isFollowing
                  ? "bg-green-500 text-white border-green-500"
                  : "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
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
              className={`${
                isPriceAlertSet
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
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
              className="bg-green-500 text-white border-green-500 hover:bg-green-600"
            >
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
          </div>
        </div>

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
                            54,996.00
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
                              5.0M CNPY
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
                              33K CNPY
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
                              50M DEFI
                            </div>
                            <div className="text-gray-400 text-xs">
                              10% of total supply
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
                                style={{ width: "70%" }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              70% buy • 30% sell
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
                        Bitcoin is the world's first widely-adopted
                        cryptocurrency. With Bitcoin, people can securely and
                        directly send each other digital money on the internet.
                      </p>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        Bitcoin was created by Satoshi Nakamoto, a pseudonymous
                        person or team who outlined the technology in a 2008
                        white paper. Bitcoin is more than a payment system—it's
                        a new kind of money.
                      </p>
                      <p className="text-gray-300 leading-relaxed mb-4">
                        Unlike traditional payment methods like Venmo and
                        PayPal, which are built on top of the traditional
                        financial system, Bitcoin is completely independent.
                        There's no company, government, or institution in charge
                        of Bitcoin. It's like the internet for money.
                      </p>

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
                  {/* Buy/Sell Section */}
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
                                  BTC
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
                                    DeFi App
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
                            Buy DEFI
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
  );
}
