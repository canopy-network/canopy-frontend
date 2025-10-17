"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Tab configuration
interface TabConfig {
  value: string;
  label: string;
  icon: LucideIcon;
}

const tabsConfig: TabConfig[] = [
  { value: "all", label: "All", icon: Home },
  { value: "pending_launch", label: "Scheduled", icon: Calendar },
  { value: "virtual_active", label: "Trending", icon: TrendingUp },
  { value: "graduated", label: "Favorites", icon: Heart },
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

  // Get virtual pools from the store for debugging
  const { virtualPools } = useChainsStore();

  // Use fallback data if no projects are loaded
  const displayProjects = chains.length > 0 ? chains : fallbackProjects;
  const displayFilteredProjects =
    chains.length > 0 ? filteredChains : fallbackProjects;
  const displayFeaturedProject =
    chains.length > 0 ? featuredProject : fallbackProjects[0];

  // Sorting options configuration
  const sortOptions: DropdownOption[] = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "name-asc", label: "Name A-Z" },
    { value: "name-desc", label: "Name Z-A" },
    { value: "marketcap-high", label: "Market Cap High" },
    { value: "marketcap-low", label: "Market Cap Low" },
    { value: "progress-high", label: "Progress High" },
    { value: "progress-low", label: "Progress Low" },
    { value: "participants-high", label: "Participants High" },
    { value: "participants-low", label: "Participants Low" },
  ];

  // Handle project selection for detailed view
  const handleProjectSelect = (project: ChainWithUI) => {
    setSelectedProject(project);
  };

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

      {/* Main Content */}
      <div className="container max-w-5xl mx-auto px-4 py-8">
        {/* Recent Projects Carousel */}
        <div className="mb-12">
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
          <div className="flex items-center justify-between">
            <TabsList className="bg-transparent border-none p-0 gap-4 mb-4">
              {tabsConfig.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="primary-tab-button"
                  >
                    <div className="flex items-center gap-2">
                      {activeTab === tab.value && <Icon className="w-4 h-4" />}
                      {tab.label}
                    </div>
                  </TabsTrigger>
                );
              })}
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

          <TabsContent value="all" className="space-y-4">
            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredChains.map((project) => (
                <SmallProjectCard
                  key={project.id}
                  project={project}
                  href={`/launchpad/${project.id}`}
                />
              ))}
            </div>

            {/* Empty State */}
            {filteredChains.length === 0 && !isLoading && (
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

          <TabsContent value="pending_launch" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredChains.map((project) => (
                <SmallProjectCard
                  key={project.id}
                  project={project}
                  href={`/launchpad/${project.id}`}
                />
              ))}
            </div>
            {filteredChains.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No scheduled projects</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="virtual_active" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredChains.map((project) => (
                <SmallProjectCard
                  key={project.id}
                  project={project}
                  href={`/launchpad/${project.id}`}
                />
              ))}
            </div>
            {filteredChains.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No trending projects</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="graduated" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredChains.map((project) => (
                <SmallProjectCard
                  key={project.id}
                  project={project}
                  href={`/launchpad/${project.id}`}
                />
              ))}
            </div>
            {filteredChains.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No favorite projects</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

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
