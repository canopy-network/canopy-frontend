"use client";

import { useState, useEffect, useMemo } from "react";
import { useLaunchpadDashboard } from "@/lib/hooks/use-launchpad-dashboard";
import { useCreateChainDialog } from "@/lib/stores/use-create-chain-dialog";
import { useAuthStore } from "@/lib/stores/auth-store";
import { listUserFavorites } from "@/lib/api/chain-favorites";
import { chainsApi } from "@/lib/api/chains";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BondingCurveChart } from "./bonding-curve-chart";
import { OnboardingGuide } from "../launchpad/onboarding-guide";
import { SmallProjectCard } from "./small-project-card";
import { RecentsProjectsCarousel } from "./recents-projects-carousel";
import { SortDropdown } from "./sort-dropdown";
import { HomePageSkeleton } from "@/components/skeletons";
import { Chain } from "@/types/chains";
import { getMarketCap } from "@/lib/utils/chain-ui-helpers";
import {
  AlertCircle,
  Home,
  Calendar,
  TrendingUp,
  Heart,
  LucideIcon,
  Grid3x3,
  List,
  GraduationCap,
} from "lucide-react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
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
  { value: "graduated", label: "Graduated", icon: GraduationCap },
  { value: "pending_launch", label: "New", icon: Calendar },
  { value: "favorites", label: "Favorites", icon: Heart },
];

// No fallback data needed - working directly with API responses

export function LaunchpadDashboard() {
  const { open: openCreateChainDialog } = useCreateChainDialog();
  const { user, isAuthenticated } = useAuthStore();
  const [selectedProject, setSelectedProject] = useState<Chain | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortOption, setSortOption] = useState("default");
  const [favoritedChainIds, setFavoritedChainIds] = useState<string[]>([]);
  const [favoriteChains, setFavoriteChains] = useState<Chain[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [localActiveTab, setLocalActiveTab] = useState("all");

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
    setActiveTab: setStoreActiveTab,
  } = useLaunchpadDashboard({
    autoFetch: true,
  });

  // Custom handler for tab changes
  const handleTabChange = (tab: string) => {
    setLocalActiveTab(tab);
    // Handle tabs that use local filtering (favorites, graduated)
    if (tab === "favorites" || tab === "graduated") {
      setStoreActiveTab("all"); // Clear status filter for local filtering
    } else {
      setStoreActiveTab(tab);
    }
  };

  // Filter tabs based on authentication
  const visibleTabs = useMemo(() => {
    if (isAuthenticated) {
      return tabsConfig;
    }
    return tabsConfig.filter((tab) => tab.value !== "favorites");
  }, [isAuthenticated]);

  // If user logs out while on favorites tab, switch to all
  useEffect(() => {
    if (!isAuthenticated && localActiveTab === "favorites") {
      setLocalActiveTab("all");
      setStoreActiveTab("all");
    }
  }, [isAuthenticated, localActiveTab, setStoreActiveTab]);

  // Filter and sort chains based on active tab and sort option
  const sortedChains = useMemo(() => {
    // If favorites tab is active, use the favorite chains directly
    if (localActiveTab === "favorites") {
      const chainsCopy = [...favoriteChains];

      // Apply sorting
      switch (sortOption) {
        case "market-cap-high":
          return chainsCopy.sort(
            (a, b) =>
              getMarketCap(b.virtual_pool) - getMarketCap(a.virtual_pool)
          );
        case "market-cap-low":
          return chainsCopy.sort(
            (a, b) =>
              getMarketCap(a.virtual_pool) - getMarketCap(b.virtual_pool)
          );
        case "volume-high":
          return chainsCopy.sort(
            (a, b) =>
              (b.virtual_pool?.total_volume_cnpy || 0) -
              (a.virtual_pool?.total_volume_cnpy || 0)
          );
        case "volume-low":
          return chainsCopy.sort(
            (a, b) =>
              (a.virtual_pool?.total_volume_cnpy || 0) -
              (b.virtual_pool?.total_volume_cnpy || 0)
          );
        case "price-high":
          return chainsCopy.sort(
            (a, b) =>
              (b.virtual_pool?.current_price_cnpy || 0) -
              (a.virtual_pool?.current_price_cnpy || 0)
          );
        case "price-low":
          return chainsCopy.sort(
            (a, b) =>
              (a.virtual_pool?.current_price_cnpy || 0) -
              (b.virtual_pool?.current_price_cnpy || 0)
          );
        case "completion-percentage-high":
          return chainsCopy.sort(
            (a, b) =>
              (b.graduation?.completion_percentage || 0) -
              (a.graduation?.completion_percentage || 0)
          );
        case "completion-percentage-low":
          return chainsCopy.sort(
            (a, b) =>
              (a.graduation?.completion_percentage || 0) -
              (b.graduation?.completion_percentage || 0)
          );
        case "default":
        default:
          // Return chains in their original order (as received from API)
          return chainsCopy;
      }
    }

    let chainsCopy = [...filteredChains];

    // If graduated tab is active, filter by is_graduated = true
    if (localActiveTab === "graduated") {
      chainsCopy = chainsCopy.filter((chain) => chain.is_graduated === true);
    }

    // Apply sorting
    switch (sortOption) {
      case "market-cap-high":
        return chainsCopy.sort(
          (a, b) => getMarketCap(b.virtual_pool) - getMarketCap(a.virtual_pool)
        );
      case "market-cap-low":
        return chainsCopy.sort(
          (a, b) => getMarketCap(a.virtual_pool) - getMarketCap(b.virtual_pool)
        );
      case "volume-high":
        return chainsCopy.sort(
          (a, b) =>
            (b.virtual_pool?.total_volume_cnpy || 0) -
            (a.virtual_pool?.total_volume_cnpy || 0)
        );
      case "volume-low":
        return chainsCopy.sort(
          (a, b) =>
            (a.virtual_pool?.total_volume_cnpy || 0) -
            (b.virtual_pool?.total_volume_cnpy || 0)
        );
      case "price-high":
        return chainsCopy.sort(
          (a, b) =>
            (b.virtual_pool?.current_price_cnpy || 0) -
            (a.virtual_pool?.current_price_cnpy || 0)
        );
      case "price-low":
        return chainsCopy.sort(
          (a, b) =>
            (a.virtual_pool?.current_price_cnpy || 0) -
            (b.virtual_pool?.current_price_cnpy || 0)
        );
      case "completion-percentage-high":
        return chainsCopy.sort(
          (a, b) =>
            (b.graduation?.completion_percentage || 0) -
            (a.graduation?.completion_percentage || 0)
        );
      case "completion-percentage-low":
        return chainsCopy.sort(
          (a, b) =>
            (a.graduation?.completion_percentage || 0) -
            (b.graduation?.completion_percentage || 0)
        );
      case "default":
      default:
        // Return chains in their original order (as received from API)
        return chainsCopy;
    }
  }, [filteredChains, sortOption, localActiveTab, favoriteChains]);

  // Handle buy button click
  const handleBuyClick = (project: Chain) => {
    console.log("Buy clicked for project:", project.chain_name);
    // TODO: Implement buy functionality
  };

  // Fetch favorited chains when Favorites tab is active
  useEffect(() => {
    const fetchFavorites = async () => {
      if (localActiveTab === "favorites" && isAuthenticated && user) {
        setLoadingFavorites(true);
        setFavoriteChains([]); // Clear previous favorites
        try {
          // First, get the list of favorite chain IDs
          const result = await listUserFavorites(user.id, "like");
          if (result.success && result.chains && result.chains.length > 0) {
            const chainIds = result.chains.map((c) => c.chain_id);
            setFavoritedChainIds(chainIds);

            // Then, fetch full chain data for each favorite ID
            const chainPromises = chainIds.map(async (chainId) => {
              try {
                const response = await chainsApi.getChain(chainId, {
                  include:
                    "creator,template,assets,virtual_pool,graduated_pool",
                });
                return response.data;
              } catch (error) {
                console.error(`Error fetching chain ${chainId}:`, error);
                return null;
              }
            });

            const fetchedChains = await Promise.all(chainPromises);
            // Filter out any null values (failed fetches)
            const validChains = fetchedChains.filter(
              (chain): chain is Chain => chain !== null
            );
            setFavoriteChains(validChains);
          } else {
            // No favorites found
            setFavoritedChainIds([]);
            setFavoriteChains([]);
          }
        } catch (error) {
          console.error("Error fetching favorites:", error);
          setFavoriteChains([]);
        } finally {
          setLoadingFavorites(false);
        }
      } else {
        // Clear favorites when not on favorites tab
        setFavoriteChains([]);
        setFavoritedChainIds([]);
      }
    };

    fetchFavorites();
  }, [localActiveTab, isAuthenticated, user]);

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

  if (isLoading) {
    return <HomePageSkeleton />;
  }
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
          value={localActiveTab}
          onValueChange={handleTabChange}
          className="min-h-[400px]"
        >
          {/* Filter Bar */}
          <div className="rounded-xl border border-border bg-card text-card-foreground shadow p-1 flex items-center justify-between mb-8">
            {/* Left: Tab Buttons */}
            <div className="flex items-center gap-1">
              {visibleTabs.map((tab) => (
                <Button
                  key={tab.value}
                  onClick={() => handleTabChange(tab.value)}
                  variant={localActiveTab === tab.value ? "secondary" : "ghost"}
                  size="sm"
                  className={`rounded-md gap-1.5 h-9 px-4 ${
                    localActiveTab === tab.value
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
                    handleTabChange("all");
                  }}
                  variant="outline"
                  className="mt-4 border-[#2a2a2a] text-white hover:bg-[#1a1a1a]"
                >
                  Clear Filters
                </Button>
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
              <div className="text-center py-12 w-full col-span-4">
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
              <div className="text-center py-12 w-full col-span-4 ">
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
              <div className="text-center py-12 w-full col-span-4">
                <p className="text-gray-400 text-lg">No graduated projects</p>
              </div>
            )}
          </TabsContent>

          <TabsContent
            value="favorites"
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                : "flex flex-col gap-3"
            }
          >
            {loadingFavorites ? (
              <div className="text-center py-12 w-full col-span-4">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-gray-400 text-sm mt-4">
                  Loading your favorites...
                </p>
              </div>
            ) : !isAuthenticated ? (
              <div className="text-center py-12 w-full col-span-4">
                <Heart className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400 text-lg mb-2">
                  Login to see your favorites
                </p>
                <p className="text-gray-500 text-sm">
                  Star chains to save them here for quick access
                </p>
              </div>
            ) : sortedChains.length === 0 ? (
              <div className="text-center py-12 w-full col-span-4">
                <Heart className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400 text-lg mb-2">
                  No favorite chains yet
                </p>
                <p className="text-gray-500 text-sm mb-4">
                  Click the star icon on any chain to add it to your favorites
                </p>
                <Button
                  onClick={() => handleTabChange("all")}
                  variant="outline"
                  className="border-[#2a2a2a] text-white hover:bg-[#1a1a1a]"
                >
                  Browse All Chains
                </Button>
              </div>
            ) : (
              sortedChains.map((project) => (
                <SmallProjectCard
                  key={project.id}
                  project={project}
                  href={`/chain/${project.id}`}
                  viewMode={viewMode}
                />
              ))
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
