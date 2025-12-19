"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useLaunchpadDashboard } from "@/lib/hooks/use-launchpad-dashboard";
import { useAuthStore } from "@/lib/stores/auth-store";
import { listUserFavorites } from "@/lib/api/chain-favorites";
import { chainsApi } from "@/lib/api/chains";
import { getChainPriceHistory, convertPriceHistoryToChart } from "@/lib/api/price-history";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BondingCurveChart } from "./bonding-curve-chart";
import { OnboardingGuide } from "../launchpad/onboarding-guide";
import { SmallProjectCard } from "./small-project-card";
import { RecentsProjectsCarousel } from "./recents-projects-carousel";
import { SortDropdown } from "./sort-dropdown";
import { HomePageSkeleton } from "@/components/skeletons";
import { Chain } from "@/types/chains";
import { getMarketCap, filterAccoladesByCategory } from "@/lib/utils/chain-ui-helpers";
import { AlertCircle, Home, Calendar, TrendingUp, Heart, LucideIcon, Grid3x3, List, GraduationCap } from "lucide-react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Container } from "@/components/layout/container";
import { Spacer } from "@/components/layout/spacer";

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
  const { user, isAuthenticated } = useAuthStore();
  const [selectedProject, setSelectedProject] = useState<Chain | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortOption, setSortOption] = useState("default");
  const [favoriteChains, setFavoriteChains] = useState<Chain[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [localActiveTab, setLocalActiveTab] = useState("all");
  const [priceHistoryData, setPriceHistoryData] = useState<Record<string, Array<{ value: number; time: number }>>>({});
  const chainsRef = useRef<Chain[]>([]);
  const refreshDataRef = useRef<(() => Promise<void>) | undefined>(undefined);
  const loadMoreChainsRef = useRef<(() => Promise<void>) | undefined>(undefined);
  const loadMoreObserverRef = useRef<IntersectionObserver | null>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null);

  const {
    // Data
    chains,
    filteredChains,

    // Loading states
    isLoading,
    isLoadingMore,
    hasMore,
    // Error handling
    error,
    clearError,

    // Actions
    refreshData,
    loadMoreChains,

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
          return chainsCopy.sort((a, b) => getMarketCap(b.virtual_pool) - getMarketCap(a.virtual_pool));
        case "market-cap-low":
          return chainsCopy.sort((a, b) => getMarketCap(a.virtual_pool) - getMarketCap(b.virtual_pool));
        case "volume-high":
          return chainsCopy.sort(
            (a, b) => (b.virtual_pool?.total_volume_cnpy || 0) - (a.virtual_pool?.total_volume_cnpy || 0)
          );
        case "volume-low":
          return chainsCopy.sort(
            (a, b) => (a.virtual_pool?.total_volume_cnpy || 0) - (b.virtual_pool?.total_volume_cnpy || 0)
          );
        case "price-high":
          return chainsCopy.sort(
            (a, b) => (b.virtual_pool?.current_price_cnpy || 0) - (a.virtual_pool?.current_price_cnpy || 0)
          );
        case "price-low":
          return chainsCopy.sort(
            (a, b) => (a.virtual_pool?.current_price_cnpy || 0) - (b.virtual_pool?.current_price_cnpy || 0)
          );
        case "completion-percentage-high":
          return chainsCopy.sort(
            (a, b) => (b.graduation?.completion_percentage || 0) - (a.graduation?.completion_percentage || 0)
          );
        case "completion-percentage-low":
          return chainsCopy.sort(
            (a, b) => (a.graduation?.completion_percentage || 0) - (b.graduation?.completion_percentage || 0)
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
        return chainsCopy.sort((a, b) => getMarketCap(b.virtual_pool) - getMarketCap(a.virtual_pool));
      case "market-cap-low":
        return chainsCopy.sort((a, b) => getMarketCap(a.virtual_pool) - getMarketCap(b.virtual_pool));
      case "volume-high":
        return chainsCopy.sort(
          (a, b) => (b.virtual_pool?.total_volume_cnpy || 0) - (a.virtual_pool?.total_volume_cnpy || 0)
        );
      case "volume-low":
        return chainsCopy.sort(
          (a, b) => (a.virtual_pool?.total_volume_cnpy || 0) - (b.virtual_pool?.total_volume_cnpy || 0)
        );
      case "price-high":
        return chainsCopy.sort(
          (a, b) => (b.virtual_pool?.current_price_cnpy || 0) - (a.virtual_pool?.current_price_cnpy || 0)
        );
      case "price-low":
        return chainsCopy.sort(
          (a, b) => (a.virtual_pool?.current_price_cnpy || 0) - (b.virtual_pool?.current_price_cnpy || 0)
        );
      case "completion-percentage-high":
        return chainsCopy.sort(
          (a, b) => (b.graduation?.completion_percentage || 0) - (a.graduation?.completion_percentage || 0)
        );
      case "completion-percentage-low":
        return chainsCopy.sort(
          (a, b) => (a.graduation?.completion_percentage || 0) - (b.graduation?.completion_percentage || 0)
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
          x;
          if (result.success && result.chains && result.chains.length > 0) {
            const chainIds = result.chains.map((c) => c.chain_id);

            // Then, fetch full chain data for each favorite ID
            const chainPromises = chainIds.map(async (chainId) => {
              try {
                const response = await chainsApi.getChain(chainId, {
                  include: "creator,template,assets,virtual_pool,graduated_pool,graduation_progress,accolades",
                });
                return response.data;
              } catch (error) {
                console.error(`Error fetching chain ${chainId}:`, error);
                return null;
              }
            });

            const fetchedChains = await Promise.all(chainPromises);
            // Filter out any null values (failed fetches)
            const validChains = fetchedChains.filter((chain): chain is Chain => chain !== null);
            setFavoriteChains(validChains);
          } else {
            // No favorites found
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

  // Keep refs in sync with latest values
  useEffect(() => {
    chainsRef.current = chains;
  }, [chains]);

  useEffect(() => {
    refreshDataRef.current = refreshData;
  }, [refreshData]);

  useEffect(() => {
    loadMoreChainsRef.current = loadMoreChains;
  }, [loadMoreChains]);

  // Infinite scroll: Set up Intersection Observer to load more chains
  useEffect(() => {
    if (!hasMore || isLoadingMore || isLoading) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && hasMore && !isLoadingMore && !isLoading) {
          loadMoreChainsRef.current?.();
        }
      },
      {
        root: null,
        rootMargin: "200px", // Start loading 200px before reaching the trigger
        threshold: 0.1,
      }
    );

    if (loadMoreTriggerRef.current) {
      observer.observe(loadMoreTriggerRef.current);
    }

    loadMoreObserverRef.current = observer;

    return () => {
      if (loadMoreObserverRef.current) {
        loadMoreObserverRef.current.disconnect();
      }
    };
  }, [hasMore, isLoadingMore, isLoading]);

  // Polling: Refresh only virtual_pool, graduation, and price history every 30 seconds
  // This avoids refetching all chains which causes unnecessary rerenders
  // OPTIMIZED: Reduced frequency from 10s to 30s and limited to first 20 chains for better performance
  useEffect(() => {
    // Don't poll if component is loading
    if (isLoading) {
      return;
    }

    // Function to refresh virtual_pool and graduation data for each chain individually
    // This updates only the specific fields without replacing the entire chain object
    const refreshChainData = async () => {
      const currentChains = chainsRef.current;
      if (currentChains.length === 0) return;

      // PERFORMANCE: Only poll first 20 chains to reduce load
      const chainsToUpdate = currentChains.slice(0, 20);

      // Fetch virtual_pool and graduation for each chain in batches
      const batchSize = 5;
      for (let i = 0; i < chainsToUpdate.length; i += batchSize) {
        const batch = chainsToUpdate.slice(i, i + batchSize);
        const promises = batch.map(async (chain) => {
          try {
            // Fetch chain with only virtual_pool and graduation to minimize data transfer
            const response = await chainsApi.getChain(chain.id, {
              include: "virtual_pool,graduation",
            });

            if (response.data) {
              // Update the chain in the store by merging new data
              // Only update if data actually changed to prevent unnecessary rerenders
              const { useChainsStore } = await import("@/lib/stores/chains-store");
              const store = useChainsStore.getState();
              const existingChainIndex = store.chains.findIndex((c) => c.id === chain.id);

              if (existingChainIndex !== -1) {
                const existingChain = store.chains[existingChainIndex];
                const newVirtualPool = response.data.virtual_pool;
                const newGraduation = (response.data as any).graduation;

                // Only update if data actually changed (shallow comparison)
                const virtualPoolChanged =
                  JSON.stringify(existingChain.virtual_pool) !== JSON.stringify(newVirtualPool);
                const graduationChanged =
                  JSON.stringify((existingChain as any).graduation) !== JSON.stringify(newGraduation);

                if (virtualPoolChanged || graduationChanged) {
                  // Merge new virtual_pool and graduation data into existing chain
                  const updatedChains = [...store.chains];
                  updatedChains[existingChainIndex] = {
                    ...updatedChains[existingChainIndex],
                    virtual_pool: newVirtualPool,
                    ...(newGraduation && {
                      graduation: newGraduation,
                    }),
                  } as any;
                  useChainsStore.setState({ chains: updatedChains });
                }
              }
            }
          } catch (error) {
            console.error(`Failed to refresh data for chain ${chain.id}:`, error);
          }
        });

        await Promise.all(promises);
      }
    };

    // Function to refresh price history for currently loaded chains
    const refreshPriceHistory = async () => {
      // Use ref to get latest chains without causing re-renders
      const currentChains = chainsRef.current;
      if (currentChains.length === 0) return;

      // PERFORMANCE: Only poll first 20 chains to reduce load
      const chainsToUpdate = currentChains.slice(0, 20);

      // Fetch price history for chains in parallel (batched)
      const batchSize = 5;
      for (let i = 0; i < chainsToUpdate.length; i += batchSize) {
        const batch = chainsToUpdate.slice(i, i + batchSize);
        const promises = batch.map(async (chain) => {
          try {
            const response = await getChainPriceHistory(chain.id);
            if (response.data && response.data.length > 0) {
              const chartData = convertPriceHistoryToChart(response.data);
              return { chainId: chain.id, chartData };
            }
          } catch (error) {
            console.error(`Failed to fetch price history for ${chain.id}:`, error);
          }
          return null;
        });

        const results = await Promise.all(promises);
        setPriceHistoryData((prev) => {
          const updated = { ...prev };
          results.forEach((result) => {
            if (result) {
              updated[result.chainId] = result.chartData;
            }
          });
          return updated;
        });
      }
    };

    // Initial refresh only if we have chains
    if (chainsRef.current.length > 0) {
      refreshChainData();
      refreshPriceHistory();
    }

    // Set up polling interval (30 seconds - reduced frequency to prevent excessive API calls)
    const interval = setInterval(() => {
      // Only poll if page is visible (not in background tab)
      if (document.visibilityState === "visible" && chainsRef.current.length > 0) {
        refreshChainData();
        refreshPriceHistory();
      }
    }, 30000); // 30 seconds - increased from 10s to reduce API load

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, [isLoading]); // Only depend on isLoading, not chains or refreshData

  const sortComponent = () => {
    return (
      <>
        {/* Right: Sort and View Controls */}
        <div className="flex items-center gap-2">
          {/* Sort Dropdown - Mobile: Icon only, Desktop: Full dropdown */}
          <div className="lg:hidden">
            <SortDropdown value={sortOption} onSort={setSortOption} mobile={true} />
          </div>
          <div className="hidden lg:block">
            <SortDropdown value={sortOption} onSort={setSortOption} />
          </div>

          {/* View Toggle */}
          <div className="hidden lg:flex items-center gap-1 bg-muted/50 rounded-lg p-1">
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
      </>
    );
  };

  if (isLoading) {
    return <HomePageSkeleton />;
  }
  return (
    <div className="min-h-screen text-white overflow-x-hidden">
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
          {chains && chains.length > 0 ? (
            <RecentsProjectsCarousel
              projects={chains}
              onBuyClick={handleBuyClick}
              priceHistoryData={priceHistoryData}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No recent projects available</p>
            </div>
          )}
        </div>

        <Tabs value={localActiveTab} onValueChange={handleTabChange} className="min-h-[400px]" id="chain-list">
          {/* Filter Bar */}
          <div className="flex items-center justify-between gap-4" id="filter-bar">
            <div className="card-like p-1 mb-4 lg:mb-8 overflow-auto no-scrollbar w-full flex items-center justify-between">
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
              <div className="hidden lg:block" id="filter-bar-desktop">
                {sortComponent()}
              </div>
            </div>
            <div className="block lg:hidden mb-4" id="filter-bar-mobile">
              {sortComponent()}
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
              {sortedChains &&
                sortedChains.map((project) => {
                  const chainAccolades = (project as any).accolades || [];
                  const filteredAccolades = filterAccoladesByCategory(chainAccolades);
                  return (
                    <SmallProjectCard
                      key={project.id}
                      project={project}
                      href={`/chains/${project.id}`}
                      viewMode={viewMode}
                      accolades={filteredAccolades}
                    />
                  );
                })}
            </div>

            {/* Empty State */}
            {sortedChains.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No projects found</p>
                <p className="text-gray-500 text-sm mt-2">Try adjusting your filters or check back later</p>
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
            {sortedChains &&
              sortedChains.map((project) => {
                const chainAccolades = (project as any).accolades || [];
                const filteredAccolades = filterAccoladesByCategory(chainAccolades);
                return (
                  <SmallProjectCard
                    key={project.id}
                    project={project}
                    href={`/chains/${project.id}`}
                    viewMode={viewMode}
                    accolades={filteredAccolades}
                  />
                );
              })}
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
            {sortedChains &&
              sortedChains.map((project) => {
                const chainAccolades = (project as any).accolades || [];
                const filteredAccolades = filterAccoladesByCategory(chainAccolades);
                return (
                  <SmallProjectCard
                    key={project.id}
                    project={project}
                    href={`/chains/${project.id}`}
                    viewMode={viewMode}
                    accolades={filteredAccolades}
                  />
                );
              })}
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
            {sortedChains &&
              sortedChains.map((project) => {
                const chainAccolades = (project as any).accolades || [];
                const filteredAccolades = filterAccoladesByCategory(chainAccolades);
                return (
                  <SmallProjectCard
                    key={project.id}
                    project={project}
                    href={`/chains/${project.id}`}
                    viewMode={viewMode}
                    accolades={filteredAccolades}
                  />
                );
              })}
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
                <p className="text-gray-400 text-sm mt-4">Loading your favorites...</p>
              </div>
            ) : !isAuthenticated ? (
              <div className="text-center py-12 w-full col-span-4">
                <Heart className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400 text-lg mb-2">Login to see your favorites</p>
                <p className="text-gray-500 text-sm">Star chains to save them here for quick access</p>
              </div>
            ) : sortedChains && sortedChains.length === 0 ? (
              <div className="text-center py-12 w-full col-span-4">
                <Heart className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400 text-lg mb-2">No favorite chains yet</p>
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
              sortedChains &&
              sortedChains.map((project) => {
                const chainAccolades = (project as any).accolades || [];
                const filteredAccolades = filterAccoladesByCategory(chainAccolades);
                return (
                  <SmallProjectCard
                    key={project.id}
                    project={project}
                    href={`/chains/${project.id}`}
                    viewMode={viewMode}
                    accolades={filteredAccolades}
                  />
                );
              })
            )}
          </TabsContent>
        </Tabs>

        {/* Infinite scroll trigger and loading indicator */}
        {hasMore && (
          <div ref={loadMoreTriggerRef} id="loading-spinner" className="flex items-center justify-center py-16">
            {isLoadingMore && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>}
          </div>
        )}
        <Spacer height={320} />
      </Container>

      {/* Onboarding Modal */}
      {showOnboarding && <OnboardingGuide isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />}

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">{selectedProject.chain_name}</h3>
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
                  <h4 className="text-lg font-semibold text-white mb-4">Bonding Curve</h4>
                  <BondingCurveChart
                    project={{
                      id: selectedProject.id,
                      name: selectedProject.chain_name,
                      description: selectedProject.chain_description,
                      creator: selectedProject.creator?.display_name || "Unknown",
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
                  <h4 className="text-lg font-semibold text-white mb-4">Project Details</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Creator:</span>
                      <span className="text-white">{selectedProject.creator?.display_name || "Unknown"}</span>
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
                      <span className="text-white">{selectedProject.progress}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Raised:</span>
                      <span className="text-white">{selectedProject.raised}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Target:</span>
                      <span className="text-white">{selectedProject.target}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Participants:</span>
                      <span className="text-white">{selectedProject.participants}</span>
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
