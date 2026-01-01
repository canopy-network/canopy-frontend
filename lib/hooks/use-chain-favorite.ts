import { useCallback } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";
import {
  useIsChainFavorited,
  useToggleChainFavorite,
} from "./use-chain-favorites";

/**
 * Custom hook for managing chain favorites
 * Handles fetching, toggling, and tracking the favorite state for a specific chain
 *
 * Uses the shared favorites query from use-chain-favorites.ts for batch fetching.
 * All favorites are fetched once and cached - individual lookups are O(1).
 */
export function useChainFavorite(chainId: string) {
  const { isAuthenticated } = useAuthStore();
  const { isFavorited, isLoading } = useIsChainFavorited(chainId);
  const toggleMutation = useToggleChainFavorite();

  const toggleFavorite = useCallback(
    async (e?: React.MouseEvent) => {
      // Prevent event propagation if called from within a Link
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (!isAuthenticated) {
        console.log("User must be logged in to favorite chains");
        return;
      }

      const numericId = parseInt(chainId, 10);
      toggleMutation.mutate({ chainId: numericId, currentlyFavorited: isFavorited });
    },
    [chainId, isFavorited, isAuthenticated, toggleMutation]
  );

  return {
    isFavorited,
    isLoading: isLoading || toggleMutation.isPending,
    isInitializing: isLoading,
    toggleFavorite,
    isAuthenticated,
  };
}
