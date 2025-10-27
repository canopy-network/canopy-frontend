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
import { OnboardingGuide } from "../launchpad/onboarding-guide";
import { SmallProjectCard } from "./small-project-card";
import { ProjectCard } from "./project-card";
import { RecentsProjectsCarousel } from "./recents-projects-carousel";
import { SortDropdown } from "./sort-dropdown";
import { Chain } from "@/types/chains";
import {
  getMarketCap,
  getVolume24h,
  getPrice,
  getPriceChange24h,
} from "@/lib/utils/chain-ui-helpers";
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
  { value: "pending_launch", label: "Scheduled", icon: Calendar },
  { value: "virtual_active", label: "Trending", icon: TrendingUp },
  { value: "graduated", label: "Favorites", icon: Heart },
];

// No fallback data needed - working directly with API responses

export function LaunchpadDashboard() {
  const { open: openCreateChainDialog } = useCreateChainDialog();
  const [selectedProject, setSelectedProject] = useState<Chain | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortOption, setSortOption] = useState("default");

  const {
    // Data
    chains,
    filteredChains,

    // Loading states
    isLoading,
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
          (a, b) => getMarketCap(b.virtual_pool) - getMarketCap(a.virtual_pool)
        );
      case "market-cap-low":
        return chainsCopy.sort(
          (a, b) => getMarketCap(a.virtual_pool) - getMarketCap(b.virtual_pool)
        );
      case "holders-high":
        return chainsCopy.sort(
          (a, b) =>
            (b.virtual_pool?.unique_traders || 0) -
            (a.virtual_pool?.unique_traders || 0)
        );
      case "holders-low":
        return chainsCopy.sort(
          (a, b) =>
            (a.virtual_pool?.unique_traders || 0) -
            (b.virtual_pool?.unique_traders || 0)
        );
      case "volume-high":
        return chainsCopy.sort(
          (a, b) => getVolume24h(b.virtual_pool) - getVolume24h(a.virtual_pool)
        );
      case "volume-low":
        return chainsCopy.sort(
          (a, b) => getVolume24h(a.virtual_pool) - getVolume24h(b.virtual_pool)
        );
      case "price-high":
        return chainsCopy.sort(
          (a, b) => getPrice(b.virtual_pool) - getPrice(a.virtual_pool)
        );
      case "price-low":
        return chainsCopy.sort(
          (a, b) => getPrice(a.virtual_pool) - getPrice(b.virtual_pool)
        );
      case "default":
      default:
        // Return chains in their original order (as received from API)
        return chainsCopy;
    }
  }, [filteredChains, sortOption]);

  // Handle buy button click
  const handleBuyClick = (project: Chain) => {
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
