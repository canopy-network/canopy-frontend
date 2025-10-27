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
  ChainAsset,
} from "@/types/chains";

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
  fetchChain: (id: string, include?: string) => Promise<void>;
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
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Process chain assets and extract branding and banner URLs
 */
function processChainAssets(chain: Chain): Chain {
  if (!chain.assets || chain.assets.length === 0) {
    return chain;
  }

  // Find logo for branding
  const logoAsset = chain.assets.find((asset) => asset.asset_type === "logo");

  // Find banner or screenshot for banner
  const bannerAsset = chain.assets.find(
    (asset) =>
      asset.asset_type === "banner" || asset.asset_type === "screenshot"
  );

  return {
    ...chain,
    branding: logoAsset?.file_url,
    banner: bannerAsset?.file_url,
  };
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

        //testing@again.com user id
        // "2403b4fc-82a2-4dd3-a82a-e437ed68d3a2"

        //chris@santana.com
        // 0cd21689-de6c-4b65-ad4d-178179a07161
        fetchChains: async (params) => {
          console.log("DEEP: Chain Store - [params]", params);
          const state = get();

          // Prevent concurrent fetches
          if (state.isLoading) {
            console.log(
              "fetchChains: Already fetching, skipping duplicate call"
            );
            return;
          }

          set({ isLoading: true, error: null });
          try {
            const response = await chainsApi.getChains(params);

            // Process assets for each chain to extract branding and banner
            const processedChains = response.data.map((chain) =>
              processChainAssets(chain)
            );

            console.log(
              "DEEP: Chain Store - [processedChains]",
              processedChains
            );
            set({
              chains: processedChains,
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

        fetchChain: async (id, include?: string) => {
          set({ isLoading: true, error: null });
          try {
            const response = await chainsApi.getChain(
              id,
              include ? { include } : undefined
            );

            // Process assets to extract branding and banner
            const processedChain = processChainAssets(response.data);

            set({
              currentChain: processedChain,
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
                chain.token_name.toLowerCase().includes(query) ||
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
