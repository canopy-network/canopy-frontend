"use client";

import { useState, useEffect, useMemo } from "react";
import { useLaunchpadDashboard } from "@/lib/hooks/use-launchpad-dashboard";
import { useCreateChainDialog } from "@/lib/stores/use-create-chain-dialog";
import { useChainsStore } from "@/lib/stores/chains-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dropdown, DropdownOption } from "@/components/ui/dropdown";
import { BondingCurveChart } from "./bonding-curve-chart";
import { OnboardingGuide } from "./onboarding-guide";
import { SmallProjectCard } from "./small-project-card";
import { ProjectCard } from "./project-card";
import { RecentsProjectsCarousel } from "./recents-projects-carousel";
import { SortDropdown } from "./sort-dropdown";
import { ChainWithUI } from "@/lib/stores/chains-store";
import {
  Plus,
  Filter,
  BookOpen,
  RefreshCw,
  AlertCircle,
  Home,
  Calendar,
  TrendingUp,
  Heart,
  LucideIcon,
  Grid3x3,
  List,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Container } from "@/components/layout/container";

// Tab configuration
interface TabConfig {
  value: string;
  label: string;
  icon: LucideIcon;
}

const tabsConfig: TabConfig[] = [
  { value: "all", label: "All", icon: Home },
  { value: "virtual_active", label: "Trending", icon: TrendingUp },
  { value: "pending_launch", label: "New", icon: Calendar },
  { value: "graduated", label: "Graduated", icon: Heart },
];

// Mock data for fallback when API is not available
const fallbackProjects: ChainWithUI[] = [
  {
    // Base Chain properties
    id: "fallback-1",
    chain_name: "DeFi Chain Alpha",
    token_symbol: "DEFI",
    chain_description:
      "Next-generation DeFi infrastructure with cross-chain compatibility",
    template_id: "template-1",
    consensus_mechanism: "tendermint",
    token_total_supply: 1000000000,
    graduation_threshold: 600000,
    creation_fee_cnpy: 100,
    initial_cnpy_reserve: 10000,
    initial_token_supply: 800000000,
    bonding_curve_slope: 0.0001,
    scheduled_launch_time: new Date(
      Date.now() + 2 * 24 * 60 * 60 * 1000
    ).toISOString(),
    actual_launch_time: null,
    creator_initial_purchase_cnpy: 1000,
    status: "virtual_active" as any,
    is_graduated: false,
    graduation_time: null,
    chain_id: "defi-1",
    genesis_hash: "abc123",
    validator_min_stake: 1000,
    created_by: "user-1",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    template: {
      id: "template-1",
      template_name: "DeFi Standard",
      template_description: "Standard DeFi template",
      template_category: "defi",
      supported_language: "go",
      default_consensus: "tendermint",
      default_token_supply: 1000000000,
      default_validator_count: 21,
      complexity_level: "intermediate",
      estimated_deployment_time_minutes: 30,
      documentation_url: null,
      example_chains: null,
      version: "1.0.0",
      is_active: true,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
    creator: {
      id: "user-1",
      wallet_address: "0x742d...8D4",
      email: null,
      username: null,
      display_name: "DeFi Creator",
      bio: null,
      avatar_url: null,
      website_url: null,
      twitter_handle: null,
      github_username: null,
      telegram_handle: null,
      notification_preferences: null,
      is_verified: false,
      verification_tier: "unverified",
      total_chains_created: 1,
      total_cnpy_invested: 1000,
      reputation_score: 0,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      last_active_at: null,
    },
    // UI-specific properties
    progress: 75,
    price: 0.4,
    marketCap: 2520000000,
    volume24h: 1800000000,
    fdv: 3100000000,
    raised: "450,000",
    target: "600,000",
    participants: 234,
    timeLeft: "2d 14h",
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
    bondingCurve: [
      { price: 0.1, supply: 0 },
      { price: 0.15, supply: 100000 },
      { price: 0.25, supply: 300000 },
      { price: 0.4, supply: 450000 },
      { price: 0.6, supply: 600000 },
    ],
    category: "defi",
    isGraduated: false,
  } as unknown as ChainWithUI,
];

export function LaunchpadDashboard() {
  const { open: openCreateChainDialog } = useCreateChainDialog();
  const [selectedProject, setSelectedProject] = useState<ChainWithUI | null>(
    null
  );
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortOption, setSortOption] = useState("default");

  const {
    // Data
    chains,
    featuredProject,
    filteredChains,
    categoryOptions,

    // Loading states
    isLoading,
    isCreating,
    isDeleting,

    // Error handling
    error,
    clearError,

    // Actions
    refreshData,

    // Filtering
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    activeTab,
    setActiveTab,
  } = useLaunchpadDashboard({
    autoFetch: true,
    includeVirtualPools: true,
  });

  // Sort the filtered chains based on the selected sort option
  const sortedChains = useMemo(() => {
    const chainsCopy = [...filteredChains];

    switch (sortOption) {
      case "market-cap-high":
        return chainsCopy.sort(
          (a, b) => (b.marketCap || 0) - (a.marketCap || 0)
        );
      case "market-cap-low":
        return chainsCopy.sort(
          (a, b) => (a.marketCap || 0) - (b.marketCap || 0)
        );
      case "holders-high":
        return chainsCopy.sort(
          (a, b) => (b.participants || 0) - (a.participants || 0)
        );
      case "holders-low":
        return chainsCopy.sort(
          (a, b) => (a.participants || 0) - (b.participants || 0)
        );
      case "volume-high":
        return chainsCopy.sort(
          (a, b) => (b.volume24h || 0) - (a.volume24h || 0)
        );
      case "volume-low":
        return chainsCopy.sort(
          (a, b) => (a.volume24h || 0) - (b.volume24h || 0)
        );
      case "price-high":
        return chainsCopy.sort((a, b) => (b.price || 0) - (a.price || 0));
      case "price-low":
        return chainsCopy.sort((a, b) => (a.price || 0) - (b.price || 0));
      case "default":
      default:
        // Return chains in their original order (as received from API)
        return chainsCopy;
    }
  }, [filteredChains, sortOption]);

  // Handle buy button click
  const handleBuyClick = (project: ChainWithUI) => {
    console.log("Buy clicked for project:", project.chain_name);
    // TODO: Implement buy functionality
  };

  // Show onboarding on first visit
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
        localStorage.setItem("hasSeenOnboarding", "true");
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Error Display */}
      {error && (
        <div className="container mx-auto px-4 py-4">
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <span className="text-red-200">{error}</span>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={refreshData}
                variant="outline"
                size="sm"
                className="border-red-500/30 text-red-200 hover:bg-red-900/30"
              >
                Retry
              </Button>
              <Button
                onClick={clearError}
                variant="outline"
                size="sm"
                className="border-red-500/30 text-red-200 hover:bg-red-900/30"
              >
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}

      <Container type="2xl">
        {/* Main Content */}
        {/* Recent Projects Carousel */}
        <div className="mb-6 lg:mb-12">
          {chains.length > 0 ? (
            <RecentsProjectsCarousel
              projects={chains}
              onBuyClick={handleBuyClick}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">
                No recent projects available
              </p>
            </div>
          )}
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="min-h-[400px]"
        >
          {/* Filter Bar */}
          <div className="rounded-xl border border-border bg-card text-card-foreground shadow p-1 flex items-center justify-between mb-8">
            {/* Left: Tab Buttons */}
            <div className="flex items-center gap-1">
              {tabsConfig.map((tab) => (
                <Button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  variant={activeTab === tab.value ? "secondary" : "ghost"}
                  size="sm"
                  className={`rounded-md gap-1.5 h-9 px-4 ${
                    activeTab === tab.value
                      ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      : "hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  {tab.label}
                </Button>
              ))}
            </div>

            {/* Right: Sort and View Controls */}
            <div className="flex items-center gap-2">
              {/* Sort Dropdown */}
              <SortDropdown value={sortOption} onSort={setSortOption} />

              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
                <Button
                  onClick={() => setViewMode("grid")}
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="sm"
                  className={`h-8 w-8 p-0 ${
                    viewMode === "grid"
                      ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      : "hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <Grid3x3 className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => setViewMode("list")}
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="sm"
                  className={`h-8 w-8 p-0 ${
                    viewMode === "list"
                      ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      : "hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <TabsContent value="all" className="space-y-4">
            {/* Projects Grid/List */}
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                  : "flex flex-col gap-3"
              }
            >
              {sortedChains.map((project) => (
                <SmallProjectCard
                  key={project.id}
                  project={project}
                  href={`/chain/${project.id}`}
                  viewMode={viewMode}
                />
              ))}
            </div>

            {/* Empty State */}
            {sortedChains.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No projects found</p>
                <p className="text-gray-500 text-sm mt-2">
                  Try adjusting your filters or check back later
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setActiveTab("all");
                  }}
                  variant="outline"
                  className="mt-4 border-[#2a2a2a] text-white hover:bg-[#1a1a1a]"
                >
                  Clear Filters
                </Button>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="inline-flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 animate-spin text-pink-500" />
                  <span className="text-gray-400">Loading projects...</span>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent
            value="pending_launch"
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                : "flex flex-col gap-3"
            }
          >
            {sortedChains.map((project) => (
              <SmallProjectCard
                key={project.id}
                project={project}
                href={`/chain/${project.id}`}
                viewMode={viewMode}
              />
            ))}
            {sortedChains.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No new projects</p>
              </div>
            )}
          </TabsContent>

          <TabsContent
            value="virtual_active"
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                : "flex flex-col gap-3"
            }
          >
            {sortedChains.map((project) => (
              <SmallProjectCard
                key={project.id}
                project={project}
                href={`/chain/${project.id}`}
                viewMode={viewMode}
              />
            ))}
            {sortedChains.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No trending projects</p>
              </div>
            )}
          </TabsContent>

          <TabsContent
            value="graduated"
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                : "flex flex-col gap-3"
            }
          >
            {sortedChains.map((project) => (
              <SmallProjectCard
                key={project.id}
                project={project}
                href={`/chain/${project.id}`}
                viewMode={viewMode}
              />
            ))}
            {sortedChains.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No graduated projects</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Container>

      {/* Onboarding Modal */}
      {showOnboarding && (
        <OnboardingGuide
          isOpen={showOnboarding}
          onClose={() => setShowOnboarding(false)}
        />
      )}

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">
                  {selectedProject.chain_name}
                </h3>
                <Button
                  onClick={() => setSelectedProject(null)}
                  variant="outline"
                  size="sm"
                  className="border-[#2a2a2a] text-white hover:bg-[#2a2a2a]"
                >
                  Close
                </Button>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">
                    Bonding Curve
                  </h4>
                  <BondingCurveChart
                    project={{
                      id: selectedProject.id,
                      name: selectedProject.chain_name,
                      description: selectedProject.chain_description,
                      creator:
                        selectedProject.creator?.display_name || "Unknown",
                      progress: selectedProject.progress,
                      raised: selectedProject.raised,
                      target: selectedProject.target,
                      participants: selectedProject.participants,
                      timeLeft: selectedProject.timeLeft,
                      status: selectedProject.status,
                      bondingCurve: selectedProject.bondingCurve,
                    }}
                    isOpen={true}
                    onClose={() => {}}
                  />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">
                    Project Details
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Creator:</span>
                      <span className="text-white">
                        {selectedProject.creator?.display_name || "Unknown"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <Badge
                        className={
                          selectedProject.status === "active"
                            ? "bg-green-500 text-white"
                            : selectedProject.status === "graduated"
                            ? "bg-blue-500 text-white"
                            : "bg-yellow-500 text-white"
                        }
                      >
                        {selectedProject.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Progress:</span>
                      <span className="text-white">
                        {selectedProject.progress}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Raised:</span>
                      <span className="text-white">
                        {selectedProject.raised}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Target:</span>
                      <span className="text-white">
                        {selectedProject.target}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Participants:</span>
                      <span className="text-white">
                        {selectedProject.participants}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
