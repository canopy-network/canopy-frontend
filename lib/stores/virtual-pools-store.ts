import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  virtualPoolsApi,
  GetVirtualPoolsParams,
} from "@/lib/api/virtual-pools";
import type { VirtualPool } from "@/components/amm/types/api/pool";

interface VirtualPoolsState {
  virtualPools: VirtualPool[];
  currentPool: VirtualPool | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
  isLoading: boolean;
  error: string | null;

  fetchVirtualPools: (params?: GetVirtualPoolsParams) => Promise<void>;
  fetchVirtualPool: (chainId: string) => Promise<void>;
  clearError: () => void;
}

export const useVirtualPoolsStore = create<VirtualPoolsState>()(
  devtools(
    (set) => ({
      virtualPools: [],
      currentPool: null,
      pagination: null,
      isLoading: false,
      error: null,

      fetchVirtualPools: async (params) => {
        set({ isLoading: true, error: null });
        try {
          const response = await virtualPoolsApi.getVirtualPools(params);
          set({
            virtualPools: response.data,
            pagination: response.pagination,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch virtual pools";
          set({
            error: errorMessage,
            isLoading: false,
          });
        }
      },

      fetchVirtualPool: async (chainId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await virtualPoolsApi.getVirtualPool(chainId);
          set({ currentPool: response.data, isLoading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch virtual pool";
          set({
            error: errorMessage,
            isLoading: false,
          });
        }
      },

      clearError: () => set({ error: null }),
    }),
    { name: "virtual-pools-store" },
  ),
);
