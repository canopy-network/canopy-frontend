/**
 * @fileoverview Chains state management store
 *
 * This store manages all chain-related state including fetching, filtering,
 * and caching chain data from the API. It provides a clean interface for
 * components to access and manipulate chain data.
 *
 * @author Canopy Development Team
 * @version 1.0.0
 * @since 2024-01-01
 */

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import {
  chainsApi,
  virtualPoolsApi,
  getActiveChains,
  getGraduatedChains,
  getChainsWithRelations,
} from "@/lib/api";
import {
  Chain,
  ChainStatus,
  VirtualPool,
  Transaction,
  CreateChainRequest,
  GetChainsParams,
} from "@/types/chains";
// We'll define our own UI types here instead of using placeholder types

// ============================================================================
// UI TYPES
// ============================================================================

/**
 * Chart data point for UI display
 */
export interface ChartDataPoint {
  time: string;
  value: number;
}

/**
 * Bonding curve point for UI display
 */
export interface BondingCurvePoint {
  price: number;
  supply: number;
}

/**
 * Enhanced Chain type with UI-specific properties
 * This extends the base Chain type with computed properties needed for UI display
 */
export interface ChainWithUI extends Omit<Chain, "status"> {
  // Computed UI properties
  progress: number;
  price: number;
  marketCap: number;
  volume24h: number;
  fdv: number;
  raised: string;
  target: string;
  participants: number;
  timeLeft: string;
  chartData: ChartDataPoint[];
  bondingCurve: BondingCurvePoint[];
  status: "active" | "graduated" | "pending";
  category: "defi" | "gaming" | "nft" | "infrastructure" | "social";
  isGraduated: boolean;
}

// ============================================================================
// TYPES
// ============================================================================

interface ChainsState {
  // Data
  chains: Chain[];
  currentChain: Chain | null;
  virtualPools: Record<string, VirtualPool>; // chainId -> pool
  transactions: Record<string, Transaction[]>; // chainId -> transactions

  // UI State
  isLoading: boolean;
  isCreating: boolean;
  isDeleting: boolean;
  error: string | null;

  // Filters and Pagination
  filters: {
    status?: ChainStatus;
    category?: string;
    searchQuery: string;
    createdBy?: string;
    templateId?: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };

  // Actions
  fetchChains: (params?: GetChainsParams) => Promise<void>;
  fetchChain: (id: string) => Promise<void>;
  fetchVirtualPool: (chainId: string) => Promise<void>;
  fetchTransactions: (chainId: string) => Promise<void>;
  createChain: (data: CreateChainRequest) => Promise<Chain>;
  deleteChain: (id: string) => Promise<void>;

  // Filter Actions
  setFilters: (filters: Partial<ChainsState["filters"]>) => void;
  clearFilters: () => void;
  setPagination: (pagination: Partial<ChainsState["pagination"]>) => void;

  // Utility Actions
  clearError: () => void;
  setCurrentChain: (chain: Chain | null) => void;
  refreshChain: (id: string) => Promise<void>;

  // Computed Data
  getFilteredChains: () => Chain[];
  getActiveChains: () => Chain[];
  getGraduatedChains: () => Chain[];
  getChainsByCategory: (category: string) => Chain[];
  getChainById: (id: string) => Chain | undefined;
  getVirtualPoolByChainId: (chainId: string) => VirtualPool | undefined;
  getTransactionsByChainId: (chainId: string) => Transaction[];

  // Convert to ChainWithUI format
  getChainsWithUI: () => ChainWithUI[];
  getChainWithUI: (chainId: string) => ChainWithUI | undefined;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert Chain to ChainWithUI format for UI components
 */
function chainToChainWithUI(
  chain: Chain,
  virtualPool?: VirtualPool
): ChainWithUI {
  // Calculate progress based on graduation threshold and current reserves
  const progress = virtualPool
    ? Math.min(
        100,
        (virtualPool.cnpy_reserve / chain.graduation_threshold) * 100
      )
    : 0;

  // Calculate market cap and other metrics
  const marketCap = virtualPool?.market_cap_usd || 0;
  const volume24h = virtualPool?.volume_24h_cnpy || 0;
  const fdv = virtualPool
    ? virtualPool.current_price_cnpy * chain.token_total_supply
    : 0;

  // Generate placeholder chart data (as requested)
  const chartData: ChartDataPoint[] = generatePlaceholderChartData(
    chain.created_at
  );

  // Generate placeholder bonding curve data
  const bondingCurve: BondingCurvePoint[] =
    generatePlaceholderBondingCurve(chain);

  return {
    // Spread all Chain properties
    ...chain,
    // Override with computed UI properties
    progress: Math.round(progress),
    price: virtualPool?.current_price_cnpy || 0,
    marketCap,
    volume24h,
    fdv,
    chartData,
    raised: formatCurrency(virtualPool?.cnpy_reserve || 0),
    target: formatCurrency(chain.graduation_threshold),
    participants: virtualPool?.unique_traders || 0,
    timeLeft: calculateTimeLeft(chain.scheduled_launch_time, chain.status),
    bondingCurve,
    status: mapChainStatusToProjectStatus(chain.status),
    category: mapTemplateCategoryToProjectCategory(
      chain.template?.template_category
    ),
    isGraduated: chain.is_graduated,
  };
}

/**
 * Map Chain status to Project status
 */
function mapChainStatusToProjectStatus(
  status: ChainStatus
): "active" | "graduated" | "pending" {
  switch (status) {
    case "virtual_active":
      return "active";
    case "graduated":
      return "graduated";
    case "draft":
    case "pending_launch":
    case "failed":
    default:
      return "pending";
  }
}

/**
 * Map template category to project category
 */
function mapTemplateCategoryToProjectCategory(
  category?: string
): "defi" | "gaming" | "nft" | "infrastructure" | "social" {
  switch (category?.toLowerCase()) {
    case "defi":
      return "defi";
    case "gaming":
      return "gaming";
    case "nft":
      return "nft";
    case "infrastructure":
      return "infrastructure";
    case "social":
      return "social";
    default:
      return "defi"; // Default to DeFi
  }
}

/**
 * Generate placeholder chart data
 */
function generatePlaceholderChartData(createdAt: string): ChartDataPoint[] {
  const baseTime = new Date(createdAt).getTime();
  const now = Date.now();
  const timeDiff = now - baseTime;

  // Generate 10-15 data points over the time period
  const dataPoints = Math.min(
    15,
    Math.max(10, Math.floor(timeDiff / (24 * 60 * 60 * 1000)))
  );
  const chartData: ChartDataPoint[] = [];

  let currentValue = 0.1; // Starting price

  for (let i = 0; i < dataPoints; i++) {
    const timeOffset = (timeDiff / dataPoints) * i;
    const time = new Date(baseTime + timeOffset).toISOString();

    // Simulate price growth with some randomness
    const growth = Math.random() * 0.05 + 0.02; // 2-7% growth per point
    currentValue *= 1 + growth;

    chartData.push({
      time,
      value: Math.round(currentValue * 100) / 100, // Round to 2 decimal places
    });
  }

  return chartData;
}

/**
 * Generate placeholder bonding curve data
 */
function generatePlaceholderBondingCurve(chain: Chain): BondingCurvePoint[] {
  const points: BondingCurvePoint[] = [];
  const maxSupply = chain.initial_token_supply;
  const steps = 5;

  for (let i = 0; i <= steps; i++) {
    const supply = (maxSupply / steps) * i;
    const price = chain.bonding_curve_slope * supply + 0.01; // Base price + slope * supply

    points.push({
      price: Math.round(price * 1000) / 1000, // Round to 3 decimal places
      supply: Math.round(supply),
    });
  }

  return points;
}

/**
 * Format currency for display
 */
function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  } else {
    return amount.toFixed(0);
  }
}

/**
 * Calculate time left until launch or graduation
 */
function calculateTimeLeft(
  scheduledLaunchTime?: string,
  status?: ChainStatus
): string {
  if (!scheduledLaunchTime || status === "graduated") {
    return "Completed";
  }

  const launchTime = new Date(scheduledLaunchTime).getTime();
  const now = Date.now();
  const diff = launchTime - now;

  if (diff <= 0) {
    return "Live";
  }

  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else {
    return `${hours}h`;
  }
}

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useChainsStore = create<ChainsState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        chains: [],
        currentChain: null,
        virtualPools: {},
        transactions: {},
        isLoading: false,
        isCreating: false,
        isDeleting: false,
        error: null,
        filters: {
          searchQuery: "",
        },
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          pages: 0,
        },

        // ============================================================================
        // API ACTIONS
        // ============================================================================

        fetchChains: async (params) => {
          set({ isLoading: true, error: null });
          try {
            const response = await chainsApi.getChains({
              ...params,
              include: ["template", "creator"],
            });

            set({
              chains: response.data,
              isLoading: false,
              error: null,
              pagination: {
                page: params?.page || 1,
                limit: params?.limit || 20,
                total: response.data.length, // This would come from pagination in real API
                pages: Math.ceil(response.data.length / (params?.limit || 20)),
              },
            });
          } catch (error) {
            set({
              error:
                error instanceof Error
                  ? error.message
                  : "Failed to fetch chains",
              isLoading: false,
            });
          }
        },

        fetchChain: async (id) => {
          set({ isLoading: true, error: null });
          try {
            const response = await chainsApi.getChain(id, [
              "template",
              "creator",
            ]);
            set({
              currentChain: response.data,
              isLoading: false,
              error: null,
            });
          } catch (error) {
            set({
              error:
                error instanceof Error
                  ? error.message
                  : "Failed to fetch chain",
              isLoading: false,
            });
          }
        },

        fetchVirtualPool: async (chainId) => {
          try {
            const response = await virtualPoolsApi.getVirtualPool(chainId);
            set((state) => ({
              virtualPools: {
                ...state.virtualPools,
                [chainId]: response.data,
              },
            }));
          } catch (error) {
            console.error("Failed to fetch virtual pool:", error);
          }
        },

        fetchTransactions: async (chainId) => {
          try {
            const response = await virtualPoolsApi.getTransactions(chainId, {
              page: 1,
              limit: 50,
            });
            set((state) => ({
              transactions: {
                ...state.transactions,
                [chainId]: response.data,
              },
            }));
          } catch (error) {
            console.error("Failed to fetch transactions:", error);
          }
        },

        createChain: async (data) => {
          set({ isCreating: true, error: null });
          try {
            const response = await chainsApi.createChain(data);
            set((state) => ({
              chains: [response.data, ...state.chains],
              isCreating: false,
              error: null,
            }));
            return response.data;
          } catch (error) {
            set({
              error:
                error instanceof Error
                  ? error.message
                  : "Failed to create chain",
              isCreating: false,
            });
            throw error;
          }
        },

        deleteChain: async (id) => {
          set({ isDeleting: true, error: null });
          try {
            await chainsApi.deleteChain(id);
            set((state) => ({
              chains: state.chains.filter((chain) => chain.id !== id),
              isDeleting: false,
              error: null,
            }));
          } catch (error) {
            set({
              error:
                error instanceof Error
                  ? error.message
                  : "Failed to delete chain",
              isDeleting: false,
            });
          }
        },

        // ============================================================================
        // FILTER ACTIONS
        // ============================================================================

        setFilters: (filters) => {
          set((state) => ({
            filters: { ...state.filters, ...filters },
          }));
        },

        clearFilters: () => {
          set({
            filters: {
              searchQuery: "",
            },
          });
        },

        setPagination: (pagination) => {
          set((state) => ({
            pagination: { ...state.pagination, ...pagination },
          }));
        },

        // ============================================================================
        // UTILITY ACTIONS
        // ============================================================================

        clearError: () => set({ error: null }),

        setCurrentChain: (chain) => set({ currentChain: chain }),

        refreshChain: async (id) => {
          const { fetchChain, fetchVirtualPool, fetchTransactions } = get();
          await Promise.all([
            fetchChain(id),
            fetchVirtualPool(id),
            fetchTransactions(id),
          ]);
        },

        // ============================================================================
        // COMPUTED DATA
        // ============================================================================

        getFilteredChains: () => {
          const { chains, filters } = get();
          let filtered = [...chains];

          // Apply search filter
          if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            filtered = filtered.filter(
              (chain) =>
                chain.chain_name.toLowerCase().includes(query) ||
                chain.chain_description.toLowerCase().includes(query) ||
                chain.creator?.display_name?.toLowerCase().includes(query) ||
                chain.creator?.wallet_address?.toLowerCase().includes(query)
            );
          }

          // Apply status filter
          if (filters.status) {
            filtered = filtered.filter(
              (chain) => chain.status === filters.status
            );
          }

          // Apply category filter
          if (filters.category) {
            filtered = filtered.filter(
              (chain) => chain.template?.template_category === filters.category
            );
          }

          // Apply creator filter
          if (filters.createdBy) {
            filtered = filtered.filter(
              (chain) => chain.created_by === filters.createdBy
            );
          }

          // Apply template filter
          if (filters.templateId) {
            filtered = filtered.filter(
              (chain) => chain.template_id === filters.templateId
            );
          }

          return filtered;
        },

        getActiveChains: () => {
          return get()
            .getFilteredChains()
            .filter((chain) => chain.status === "virtual_active");
        },

        getGraduatedChains: () => {
          return get()
            .getFilteredChains()
            .filter((chain) => chain.status === "graduated");
        },

        getChainsByCategory: (category) => {
          return get()
            .getFilteredChains()
            .filter((chain) => chain.template?.template_category === category);
        },

        getChainById: (id) => {
          return get().chains.find((chain) => chain.id === id);
        },

        getVirtualPoolByChainId: (chainId) => {
          return get().virtualPools[chainId];
        },

        getTransactionsByChainId: (chainId) => {
          return get().transactions[chainId] || [];
        },

        getChainsWithUI: () => {
          const { chains, virtualPools } = get();
          return chains.map((chain) =>
            chainToChainWithUI(chain, virtualPools[chain.id])
          );
        },

        getChainWithUI: (chainId) => {
          const chain = get().getChainById(chainId);
          if (!chain) return undefined;

          const virtualPool = get().getVirtualPoolByChainId(chainId);
          return chainToChainWithUI(chain, virtualPool);
        },
      }),
      {
        name: "chains-store",
        partialize: (state) => ({
          // Only persist filters and pagination, not the actual data
          filters: state.filters,
          pagination: state.pagination,
        }),
        skipHydration: true, // Skip hydration on SSR
      }
    ),
    { name: "ChainsStore" }
  )
);
