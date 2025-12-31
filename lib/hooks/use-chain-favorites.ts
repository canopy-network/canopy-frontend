/**
 * @fileoverview Batch Chain Favorites Hook
 *
 * Fetches all user chain favorites in a single API call and caches with React Query.
 * Individual chain favorite status is derived from the cached Set for O(1) lookups.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chainFavoritesApi } from "@/lib/api/chain-favorites";
import { useAuthStore } from "@/lib/stores/auth-store";

const FAVORITES_QUERY_KEY = ["user-chain-favorites"];

interface FavoritesData {
  likedSet: Set<number>;
}

/**
 * Fetch all chain favorites once and cache with React Query.
 * Returns a Set of liked chain IDs for O(1) lookups.
 */
export function useChainFavorites() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: FAVORITES_QUERY_KEY,
    queryFn: async (): Promise<FavoritesData> => {
      const response = await chainFavoritesApi.list();
      // Build a Set of liked chain IDs for O(1) lookup
      const likedSet = new Set<number>();
      response.data.favorites.forEach((fav) => {
        if (fav.preference === "like") {
          likedSet.add(fav.chain_id);
        }
      });
      return { likedSet };
    },
    enabled: isAuthenticated,
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Check if a specific chain is favorited (from cached data).
 * Uses the shared favorites query - no additional API calls.
 */
export function useIsChainFavorited(chainId: string | number) {
  const { data, isLoading } = useChainFavorites();
  const numericId =
    typeof chainId === "string" ? parseInt(chainId, 10) : chainId;

  return {
    isFavorited: data?.likedSet.has(numericId) ?? false,
    isLoading,
  };
}

/**
 * Toggle chain favorite with optimistic updates.
 * Updates the cached Set immediately, then syncs with server.
 */
export function useToggleChainFavorite() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  return useMutation({
    mutationFn: async ({
      chainId,
      currentlyFavorited,
    }: {
      chainId: number;
      currentlyFavorited: boolean;
    }) => {
      if (currentlyFavorited) {
        await chainFavoritesApi.removePreference(chainId);
      } else {
        await chainFavoritesApi.setPreference(chainId, "like");
      }
      return { chainId, newState: !currentlyFavorited };
    },
    onMutate: async ({ chainId, currentlyFavorited }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: FAVORITES_QUERY_KEY });

      // Snapshot previous value for rollback
      const previous = queryClient.getQueryData<FavoritesData>(FAVORITES_QUERY_KEY);

      // Optimistically update the cache
      queryClient.setQueryData<FavoritesData>(FAVORITES_QUERY_KEY, (old) => {
        if (!old) return old;
        const newSet = new Set(old.likedSet);
        if (currentlyFavorited) {
          newSet.delete(chainId);
        } else {
          newSet.add(chainId);
        }
        return { likedSet: newSet };
      });

      return { previous };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(FAVORITES_QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency with server
      queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY });
    },
  });
}
