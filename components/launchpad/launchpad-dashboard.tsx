"use client";

import { useState, useMemo, useEffect } from "react";
import { useCreateChainDialog } from "@/lib/stores/use-create-chain-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dropdown, DropdownOption } from "@/components/ui/dropdown";
import { BondingCurveChart } from "./bonding-curve-chart";
import { OnboardingGuide } from "./onboarding-guide";
import { SmallProjectCard } from "./small-project-card";
import { ProjectCard } from "./project-card";
import { LaunchProjectItem, PROJECT_CATEGORY_LABELS } from "@/types";
import { Plus, Filter, BookOpen } from "lucide-react";

const mockProjects: LaunchProjectItem[] = [
  {
    id: "1",
    name: "DeFi Chain Alpha",
    description:
      "Next-generation DeFi infrastructure with cross-chain compatibility",
    creator: "0x742d...8D4",
    progress: 75,
    price: 0.4,
    marketCap: 2520000000,
    volume24h: 1800000000,
    fdv: 3100000000,
    status: "active",
    category: "defi",
    raised: "450,000",
    target: "600,000",
    participants: 234,
    timeLeft: "2d 14h",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    bondingCurve: [
      { price: 0.1, supply: 0 },
      { price: 0.15, supply: 100000 },
      { price: 0.25, supply: 300000 },
      { price: 0.4, supply: 450000 },
      { price: 0.6, supply: 600000 },
    ],
    chartData: [
      { time: "2024-01-01", value: 0.1 },
      { time: "2024-01-02", value: 0.12 },
      { time: "2024-01-03", value: 0.15 },
      { time: "2024-01-04", value: 0.18 },
      { time: "2024-01-05", value: 0.22 },
      { time: "2024-01-06", value: 0.25 },
      { time: "2024-01-07", value: 0.28 },
      { time: "2024-01-08", value: 0.32 },
      { time: "2024-01-09", value: 0.35 },
      { time: "2024-01-10", value: 0.38 },
      { time: "2024-01-11", value: 0.4 },
    ],
  },
  {
    id: "2",
    name: "GameFi Universe",
    description: "Gaming-focused blockchain with built-in NFT marketplace",
    creator: "0x123a...9F2",
    progress: 45,
    price: 0.18,
    marketCap: 1200000000,
    volume24h: 800000000,
    fdv: 2000000000,
    status: "active",
    category: "gaming",
    raised: "180,000",
    target: "400,000",
    participants: 156,
    timeLeft: "5d 8h",
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    bondingCurve: [
      { price: 0.08, supply: 0 },
      { price: 0.12, supply: 80000 },
      { price: 0.18, supply: 180000 },
      { price: 0.3, supply: 300000 },
      { price: 0.5, supply: 400000 },
    ],
    chartData: [
      { time: "2024-01-01", value: 0.08 },
      { time: "2024-01-02", value: 0.09 },
      { time: "2024-01-03", value: 0.11 },
      { time: "2024-01-04", value: 0.13 },
      { time: "2024-01-05", value: 0.15 },
      { time: "2024-01-06", value: 0.16 },
      { time: "2024-01-07", value: 0.17 },
      { time: "2024-01-08", value: 0.18 },
      { time: "2024-01-09", value: 0.19 },
      { time: "2024-01-10", value: 0.18 },
      { time: "2024-01-11", value: 0.18 },
    ],
  },
  {
    id: "3",
    name: "Supply Chain Pro",
    description: "Enterprise supply chain tracking with privacy features",
    creator: "0x456b...7A1",
    progress: 100,
    price: 1.6,
    marketCap: 8000000000,
    volume24h: 2500000000,
    fdv: 8000000000,
    status: "graduated",
    category: "infrastructure",
    raised: "800,000",
    target: "800,000",
    participants: 445,
    timeLeft: "Graduated",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    bondingCurve: [
      { price: 0.2, supply: 0 },
      { price: 0.4, supply: 200000 },
      { price: 0.8, supply: 500000 },
      { price: 1.2, supply: 700000 },
      { price: 1.6, supply: 800000 },
    ],
    chartData: [
      { time: "2024-01-01", value: 0.2 },
      { time: "2024-01-02", value: 0.25 },
      { time: "2024-01-03", value: 0.3 },
      { time: "2024-01-04", value: 0.4 },
      { time: "2024-01-05", value: 0.5 },
      { time: "2024-01-06", value: 0.6 },
      { time: "2024-01-07", value: 0.8 },
      { time: "2024-01-08", value: 1.0 },
      { time: "2024-01-09", value: 1.2 },
      { time: "2024-01-10", value: 1.4 },
      { time: "2024-01-11", value: 1.6 },
    ],
  },
  {
    id: "4",
    name: "Social Connect",
    description:
      "Decentralized social media platform with creator monetization",
    creator: "0x789c...3B5",
    progress: 30,
    price: 0.2,
    marketCap: 600000000,
    volume24h: 300000000,
    fdv: 1500000000,
    status: "active",
    category: "social",
    raised: "120,000",
    target: "400,000",
    participants: 89,
    timeLeft: "7d 12h",
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
    bondingCurve: [
      { price: 0.05, supply: 0 },
      { price: 0.1, supply: 50000 },
      { price: 0.2, supply: 120000 },
      { price: 0.35, supply: 250000 },
      { price: 0.6, supply: 400000 },
    ],
    chartData: [
      { time: "2024-01-01", value: 0.05 },
      { time: "2024-01-02", value: 0.07 },
      { time: "2024-01-03", value: 0.09 },
      { time: "2024-01-04", value: 0.11 },
      { time: "2024-01-05", value: 0.13 },
      { time: "2024-01-06", value: 0.15 },
      { time: "2024-01-07", value: 0.17 },
      { time: "2024-01-08", value: 0.19 },
      { time: "2024-01-09", value: 0.2 },
      { time: "2024-01-10", value: 0.19 },
      { time: "2024-01-11", value: 0.2 },
    ],
  },
  {
    id: "5",
    name: "NFT Marketplace Pro",
    description: "Advanced NFT marketplace with AI-powered curation",
    creator: "0xabc1...2D8",
    progress: 85,
    price: 0.75,
    marketCap: 1500000000,
    volume24h: 900000000,
    fdv: 1800000000,
    status: "active",
    category: "nft",
    raised: "340,000",
    target: "400,000",
    participants: 312,
    timeLeft: "1d 6h",
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
    bondingCurve: [
      { price: 0.2, supply: 0 },
      { price: 0.35, supply: 100000 },
      { price: 0.55, supply: 200000 },
      { price: 0.75, supply: 340000 },
      { price: 1.0, supply: 400000 },
    ],
    chartData: [
      {
        time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        value: 0.2,
      },
      {
        time: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
        value: 0.25,
      },
      {
        time: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
        value: 0.3,
      },
      {
        time: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        value: 0.4,
      },
      {
        time: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        value: 0.5,
      },
      {
        time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        value: 0.6,
      },
      {
        time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        value: 0.7,
      },
      {
        time: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        value: 0.75,
      },
    ],
  },
  {
    id: "6",
    name: "Onchain BNB",
    description: "Binance Smart Chain integration with advanced DeFi tools",
    creator: "0xdef4...7C9",
    progress: 24,
    price: 0.12,
    marketCap: 27000,
    volume24h: 15000,
    fdv: 60000,
    status: "active",
    category: "defi",
    raised: "27,000",
    target: "60,000",
    participants: 45,
    timeLeft: "12d 8h",
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    bondingCurve: [
      { price: 0.05, supply: 0 },
      { price: 0.08, supply: 10000 },
      { price: 0.12, supply: 27000 },
      { price: 0.18, supply: 45000 },
      { price: 0.25, supply: 60000 },
    ],
    chartData: [
      {
        time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        value: 0.05,
      },
      {
        time: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        value: 0.07,
      },
      {
        time: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        value: 0.09,
      },
      {
        time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        value: 0.11,
      },
      {
        time: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        value: 0.12,
      },
    ],
  },
  {
    id: "7",
    name: "Metaverse City",
    description: "Virtual world platform with NFT land ownership",
    creator: "0xmet1...5A8",
    progress: 0,
    price: 0.05,
    marketCap: 0,
    volume24h: 0,
    fdv: 5000000,
    status: "pending",
    category: "gaming",
    raised: "0",
    target: "500,000",
    participants: 0,
    timeLeft: "Starts in 2d 5h",
    createdAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days in future
    bondingCurve: [
      { price: 0.05, supply: 0 },
      { price: 0.08, supply: 100000 },
      { price: 0.12, supply: 250000 },
      { price: 0.18, supply: 400000 },
      { price: 0.25, supply: 500000 },
    ],
    chartData: [],
  },
  {
    id: "8",
    name: "AI Trading Bot",
    description: "Automated trading system with machine learning",
    creator: "0xai2...9B3",
    progress: 0,
    price: 0.15,
    marketCap: 0,
    volume24h: 0,
    fdv: 3000000,
    status: "pending",
    category: "infrastructure",
    raised: "0",
    target: "300,000",
    participants: 0,
    timeLeft: "Starts in 1d 12h",
    createdAt: new Date(Date.now() + 1.5 * 24 * 60 * 60 * 1000).toISOString(), // 1.5 days in future
    bondingCurve: [
      { price: 0.15, supply: 0 },
      { price: 0.2, supply: 50000 },
      { price: 0.3, supply: 150000 },
      { price: 0.45, supply: 250000 },
      { price: 0.6, supply: 300000 },
    ],
    chartData: [],
  },
];

export function LaunchpadDashboard() {
  const { open: openCreateChainDialog } = useCreateChainDialog();
  const [selectedProject, setSelectedProject] =
    useState<LaunchProjectItem | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [showOnboarding, setShowOnboarding] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  // Sorting options configuration
  const sortingOptions: DropdownOption[] = [
    { value: "newest", label: "Publication Date", icon: "📅" },
    { value: "oldest", label: "Oldest First", icon: "📅" },
    { value: "name-asc", label: "A-Z", icon: "🔤" },
    { value: "name-desc", label: "Z-A", icon: "🔤" },
    { value: "marketcap-high", label: "Market Cap (High)", icon: "💰" },
    { value: "marketcap-low", label: "Market Cap (Low)", icon: "💰" },
    { value: "progress-high", label: "Progress (High)", icon: "📈" },
    { value: "progress-low", label: "Progress (Low)", icon: "📈" },
    { value: "participants-high", label: "Participants (High)", icon: "👥" },
    { value: "participants-low", label: "Participants (Low)", icon: "👥" },
  ];

  // Category filter options
  const categoryOptions: DropdownOption[] = [
    { value: "all", label: "All Categories", icon: "🌐" },
    { value: "defi", label: "DeFi", icon: "🔵" },
    { value: "gaming", label: "Gaming", icon: "🎮" },
    { value: "nft", label: "NFT", icon: "🖼️" },
    { value: "infrastructure", label: "Infrastructure", icon: "⚙️" },
    { value: "social", label: "Social", icon: "👥" },
  ];

  // Filter projects based on active tab
  const filteredProjects = useMemo(() => {
    let filtered = [...mockProjects];

    // Filter by tab
    switch (activeTab) {
      case "scheduled":
        filtered = filtered.filter((project) => project.status === "pending");
        break;
      case "trending":
        // Sort by performance (using chart data or progress)
        filtered = filtered
          .filter((project) => project.status === "active")
          .sort((a, b) => {
            const aPerformance =
              a.chartData?.length >= 2
                ? ((a.chartData[a.chartData.length - 1].value -
                    a.chartData[a.chartData.length - 2].value) /
                    a.chartData[a.chartData.length - 2].value) *
                  100
                : a.progress;
            const bPerformance =
              b.chartData?.length >= 2
                ? ((b.chartData[b.chartData.length - 1].value -
                    b.chartData[b.chartData.length - 2].value) /
                    b.chartData[b.chartData.length - 2].value) *
                  100
                : b.progress;
            return bPerformance - aPerformance;
          });
        break;
      case "favorites":
        // For now, show projects with high progress as "favorites"
        filtered = filtered.filter((project) => project.progress >= 75);
        break;
      case "all":
      default:
        // Show all active and graduated projects
        filtered = filtered.filter(
          (project) =>
            project.status === "active" || project.status === "graduated"
        );
        break;
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (project) =>
          project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          project.creator.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (project) => project.category === selectedCategory
      );
    }

    // Apply sorting
    switch (sortBy) {
      case "newest":
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "oldest":
        filtered.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "marketcap-high":
        filtered.sort((a, b) => b.marketCap - a.marketCap);
        break;
      case "marketcap-low":
        filtered.sort((a, b) => a.marketCap - b.marketCap);
        break;
      case "progress-high":
        filtered.sort((a, b) => b.progress - a.progress);
        break;
      case "progress-low":
        filtered.sort((a, b) => a.progress - b.progress);
        break;
      case "participants-high":
        filtered.sort((a, b) => b.participants - a.participants);
        break;
      case "participants-low":
        filtered.sort((a, b) => a.participants - b.participants);
        break;
    }

    return filtered;
  }, [activeTab, searchQuery, selectedCategory, sortBy]);
  const [progressFilter, setProgressFilter] = useState<string>("all");

  // Check if user has completed onboarding
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem(
      "canopy-onboarding-completed"
    );
    if (!hasCompletedOnboarding) {
      // Show onboarding after a short delay
      const timer = setTimeout(() => setShowOnboarding(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const filteredAndSortedProjects = useMemo(() => {
    const filtered = mockProjects.filter((project) => {
      // Search filter
      const matchesSearch =
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.creator.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory =
        selectedCategory === "all" || project.category === selectedCategory;

      // Progress filter
      const matchesProgress =
        progressFilter === "all" ||
        (progressFilter === "low" && project.progress < 33) ||
        (progressFilter === "medium" &&
          project.progress >= 33 &&
          project.progress < 66) ||
        (progressFilter === "high" &&
          project.progress >= 66 &&
          project.progress < 100) ||
        (progressFilter === "completed" && project.progress === 100);

      return matchesSearch && matchesCategory && matchesProgress;
    });

    // Sort projects
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "progress-high":
          return b.progress - a.progress;
        case "progress-low":
          return a.progress - b.progress;
        case "participants-high":
          return b.participants - a.participants;
        case "participants-low":
          return a.participants - b.participants;
        case "raised-high":
          return (
            Number.parseInt(b.raised.replace(/,/g, "")) -
            Number.parseInt(a.raised.replace(/,/g, ""))
          );
        case "raised-low":
          return (
            Number.parseInt(a.raised.replace(/,/g, "")) -
            Number.parseInt(b.raised.replace(/,/g, ""))
          );
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, selectedCategory, sortBy, progressFilter]);

  const activeProjects = filteredAndSortedProjects.filter(
    (p) => p.status === "active"
  );
  const graduatedProjects = filteredAndSortedProjects.filter(
    (p) => p.status === "graduated"
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-[#2a2a2a] bg-[#0a0a0a]">
        <div className="max-w-[1080px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h1 className="text-2xl font-bold text-white">Launchpad</h1>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-[#2a2a2a] text-white hover:bg-[#1a1a1a] bg-transparent"
              >
                <BookOpen className="h-4 w-4" />
                How it Works
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#2a2a2a] text-white hover:bg-[#1a1a1a] bg-transparent font-medium"
                >
                  New{" "}
                  <Badge className="ml-1 bg-primary text-black font-semibold">
                    21
                  </Badge>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#2a2a2a] text-white hover:bg-[#1a1a1a] bg-transparent font-medium"
                >
                  Graduated
                </Button>
              </div>
              <Button
                className="gap-2 bg-primary hover:bg-primary/90 text-black font-semibold shadow-lg"
                onClick={openCreateChainDialog}
              >
                <Plus className="h-4 w-4" />
                Launch Chain
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-8 space-y-8 max-w-[1080px] mx-auto">
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-2 w-2 rounded-full transition-all duration-200 ${
                    i === 0
                      ? "bg-white shadow-sm"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                />
              ))}
            </div>
          </div>

          <ProjectCard
            project={mockProjects[0] as LaunchProjectItem}
            onBuyClick={setSelectedProject}
          />
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <TabsList className="bg-[#1a1a1a] border border-[#2a2a2a] p-1">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-[#2a2a2a] data-[state=active]:text-white font-medium"
              >
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-white rounded-sm" />
                  All
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="scheduled"
                className="data-[state=active]:bg-[#2a2a2a] data-[state=active]:text-white font-medium"
              >
                Scheduled
              </TabsTrigger>
              <TabsTrigger
                value="trending"
                className="data-[state=active]:bg-[#2a2a2a] data-[state=active]:text-white font-medium"
              >
                Trending
              </TabsTrigger>
              <TabsTrigger
                value="favorites"
                className="data-[state=active]:bg-[#2a2a2a] data-[state=active]:text-white font-medium"
              >
                Favorites
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-4">
              {/* TODO: Dropdown is not working as expected. */}
              <Dropdown
                options={categoryOptions}
                value={selectedCategory}
                onValueChange={setSelectedCategory}
                placeholder="All Categories"
                label="Category"
              />
            </div>
          </div>

          <TabsContent value={activeTab} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((project) => (
                <SmallProjectCard key={project.id} project={project} />
              ))}
            </div>
            {filteredProjects.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No projects found</p>
                <p className="text-gray-500 text-sm mt-2">
                  Try adjusting your filters or check back later
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {selectedProject && (
        <BondingCurveChart
          project={selectedProject}
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}

      <OnboardingGuide
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
    </div>
  );
}
