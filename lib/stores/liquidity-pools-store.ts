/**
 * @fileoverview Liquidity Pools Store
 *
 * This store manages liquidity pool state including:
 * - Available liquidity pools
 * - Pool fetching and caching
 * - Loading states
 *
 * @author Canopy Development Team
 * @version 1.0.0
 */

import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import liquidityPoolsData from "@/data/liquidity-pools.json";

// Pool types
export interface LiquidityPool {
  id: string;
  tokenA: string;
  tokenB: string;
  tokenAReserve: number;
  tokenBReserve: number;
  totalLiquidity: number;
  volume24h: number;
  fees24h: number;
  apr: number;
  lpTokenSupply: number;
}

export interface LiquidityPoolsState {
  // State
  available_pools: LiquidityPool[];
  isLoading: boolean;
  error: string | null;
  lastFetchTime: number | null;

  // Actions
  fetchPools: () => Promise<void>;
  clearError: () => void;
  resetPoolsState: () => void;
}

// Custom storage for Zustand
const zustandStorage: StateStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(name);
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(name, value);
  },
  removeItem: (name: string): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(name);
  },
};

// Cache duration: 5 minutes
const CACHE_DURATION_MS = 5 * 60 * 1000;

export const useLiquidityPoolsStore = create<LiquidityPoolsState>()(
  persist(
    (set, get) => ({
      // Initial state
      available_pools: [],
      isLoading: false,
      error: null,
      lastFetchTime: null,

      /**
       * Fetch available liquidity pools
       *
       * For now, loads from JSON file
       * In the future, will call API endpoint
       */
      fetchPools: async () => {
        try {
          const { lastFetchTime, available_pools } = get();
          const now = Date.now();

          // Check if we have cached data that's still fresh
          if (
            lastFetchTime &&
            available_pools.length > 0 &&
            now - lastFetchTime < CACHE_DURATION_MS
          ) {
            console.log("✅ Using cached liquidity pools");
            return;
          }

          set({ isLoading: true, error: null });
          console.log("🔄 Fetching liquidity pools...");

          // TODO: Replace with actual API call
          // const response = await liquidityPoolsApi.getPools();
          // const pools = response.data;

          // For now, load from JSON with a small delay to simulate API call
          await new Promise((resolve) => setTimeout(resolve, 100));
          const pools = liquidityPoolsData as LiquidityPool[];

          set({
            available_pools: pools,
            isLoading: false,
            lastFetchTime: now,
          });

          console.log(`✅ Loaded ${pools.length} liquidity pools`);
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch liquidity pools";
          console.error("❌ Failed to fetch liquidity pools:", error);
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Reset pools state
      resetPoolsState: () => {
        set({
          available_pools: [],
          isLoading: false,
          error: null,
          lastFetchTime: null,
        });
        console.log("🔄 Liquidity pools state reset");
      },
    }),
    {
      name: "canopy-liquidity-pools-storage",
      storage: createJSONStorage(() => zustandStorage),
      skipHydration: true,
    }
  )
);

/**
 * Helper function to get a specific pool by ID
 */
export function getPoolById(poolId: string): LiquidityPool | undefined {
  const { available_pools } = useLiquidityPoolsStore.getState();
  return available_pools.find((pool) => pool.id === poolId);
}

/**
 * Helper function to get a pool by token pair
 */
export function getPoolByTokenPair(
  tokenA: string,
  tokenB: string
): LiquidityPool | undefined {
  const { available_pools } = useLiquidityPoolsStore.getState();
  return available_pools.find(
    (pool) =>
      (pool.tokenA === tokenA && pool.tokenB === tokenB) ||
      (pool.tokenA === tokenB && pool.tokenB === tokenA)
  );
}
