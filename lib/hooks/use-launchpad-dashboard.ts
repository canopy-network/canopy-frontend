/**
 * @fileoverview Launchpad Dashboard Hook
 *
 * This hook provides a clean interface for the launchpad dashboard to interact
 * with the chains store and API. It handles data fetching, filtering, and
 * provides computed values for the UI components.
 *
 * @author Canopy Development Team
 * @version 1.0.0
 * @since 2024-01-01
 */

import { useEffect, useMemo } from "react";
import { useChainsStore } from "@/lib/stores/chains-store";
import { Chain } from "@/types/chains";
import { getStatusLabel } from "@/lib/utils/chain-ui-helpers";

// ============================================================================
// HOOK INTERFACE
// ============================================================================

interface UseLaunchpadDashboardProps {
  autoFetch?: boolean;
  includeVirtualPools?: boolean;
}

interface UseLaunchpadDashboardReturn {
  // Data
  chains: Chain[];
  featuredProject: Chain | null;
  activeProjects: Chain[];
  graduatedProjects: Chain[];

  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isDeleting: boolean;

  // Error handling`
  error: string | null;
  clearError: () => void;

  // Actions
  refreshData: () => Promise<void>;
  createChain: (data: any) => Promise<void>;
  deleteChain: (id: string) => Promise<void>;

  // Filtering and search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Computed values
  filteredChains: Chain[];
  categoryOptions: Array<{ value: string; label: string }>;
  totalProjects: number;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useLaunchpadDashboard({
  autoFetch = true,
  includeVirtualPools = true,
}: UseLaunchpadDashboardProps = {}): UseLaunchpadDashboardReturn {
  // Get store state and actions
  const {
    // Data
    chains,
    virtualPools,
    isLoading,
    isCreating,
    isDeleting,
    error,
    filters,

    // Actions
    fetchChains,
    fetchVirtualPool,
    createChain: storeCreateChain,
    deleteChain: storeDeleteChain,
    clearError,
    setFilters,

    // Computed
    getFilteredChains,
  } = useChainsStore();

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Auto-fetch data on mount
  useEffect(() => {
    if (autoFetch) {
      fetchChains({
        include: "template,creator,assets",
        limit: 50,
      });
    }
  }, [autoFetch, fetchChains]);

  // Fetch virtual pools for active chains
  useEffect(() => {
    if (includeVirtualPools && chains.length > 0) {
      const activeChains = chains.filter(
        (chain) => chain.status === "virtual_active"
      );
      activeChains.forEach((chain) => {
        fetchVirtualPool(chain.id);
      });
    }
  }, [chains, includeVirtualPools, fetchVirtualPool]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  // Get featured project (first active project)
  const featuredProject = useMemo(() => {
    const activeProjects = chains.filter(
      (p) => getStatusLabel(p.status) === "active"
    );
    return activeProjects[0] || null;
  }, [chains]);

  // Get active projects
  const activeProjects = useMemo(() => {
    return chains.filter((p) => getStatusLabel(p.status) === "active");
  }, [chains]);

  // Get graduated projects
  const graduatedProjects = useMemo(() => {
    return chains.filter((p) => getStatusLabel(p.status) === "graduated");
  }, [chains]);

  // Category options for dropdown
  const categoryOptions = useMemo(() => {
    const categories = new Set<string>();
    chains.forEach((chain) => {
      if (chain.template?.template_category) {
        categories.add(chain.template.template_category);
      }
    });

    return [
      { value: "all", label: "All Categories" },
      ...Array.from(categories).map((category) => ({
        value: category,
        label: category.charAt(0).toUpperCase() + category.slice(1),
      })),
    ];
  }, [chains]);

  // Filter projects based on current filters and active tab
  const filteredChains = useMemo(() => {
    let filtered = [...chains];

    // Apply search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (project) =>
          project.chain_name.toLowerCase().includes(query) ||
          project.chain_description.toLowerCase().includes(query) ||
          project.creator?.display_name?.toLowerCase().includes(query) ||
          project.creator?.wallet_address?.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (filters.category && filters.category !== "all") {
      filtered = filtered.filter(
        (project) => project.template?.template_category === filters.category
      );
    }

    // Apply tab filter (comparing against Chain.status, not the UI status label)
    if (filters.status) {
      filtered = filtered.filter((p) => p.status === filters.status);
    }

    // Sort by creation date (newest first)
    filtered.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return filtered;
  }, [chains, filters]);

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const refreshData = async () => {
    await fetchChains({
      include: "template,creator,assets",
      limit: 50,
    });
  };

  const createChain = async (data: any) => {
    try {
      await storeCreateChain(data);
      // Refresh data after creating
      await refreshData();
    } catch (error) {
      console.error("Failed to create chain:", error);
      throw error;
    }
  };

  const deleteChain = async (id: string) => {
    try {
      await storeDeleteChain(id);
      // Refresh data after deleting
      await refreshData();
    } catch (error) {
      console.error("Failed to delete chain:", error);
      throw error;
    }
  };

  // ============================================================================
  // FILTER ACTIONS
  // ============================================================================

  const setSearchQuery = (query: string) => {
    setFilters({ searchQuery: query });
  };

  const setSelectedCategory = (category: string) => {
    setFilters({ category });
  };

  const setActiveTab = (tab: string) => {
    // Tab values now directly correspond to status values
    let status: string | undefined;

    if (tab === "all") {
      status = undefined; // Show all projects
    } else {
      // Use the tab value directly as the status
      status = tab;
    }

    setFilters({ status: status as any });
  };

  // ============================================================================
  // RETURN INTERFACE
  // ============================================================================

  return {
    // Data
    chains,
    featuredProject,
    activeProjects,
    graduatedProjects,

    // Loading states
    isLoading,
    isCreating,
    isDeleting,

    // Error handling
    error,
    clearError,

    // Actions
    refreshData,
    createChain,
    deleteChain,

    // Filtering and search
    searchQuery: filters.searchQuery,
    setSearchQuery,
    selectedCategory: filters.category || "all",
    setSelectedCategory,
    activeTab: filters.status || "all",
    setActiveTab,

    // Computed values
    filteredChains,
    categoryOptions,
    totalProjects: chains.length,
  };
}
