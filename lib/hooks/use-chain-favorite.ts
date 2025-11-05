import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";
import {
  getChainPreference,
  setChainPreference,
  removeChainPreference,
} from "@/lib/api/chain-favorites";

/**
 * Custom hook for managing chain favorites
 * Handles fetching, toggling, and tracking the favorite state for a specific chain
 */
export function useChainFavorite(chainId: string) {
  const { user, isAuthenticated } = useAuthStore();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Load the current preference when component mounts or user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      loadPreference();
    } else {
      setIsFavorited(false);
      setIsInitializing(false);
    }
  }, [chainId, user, isAuthenticated]);

  const loadPreference = async () => {
    if (!user) return;

    try {
      setIsInitializing(true);
      const result = await getChainPreference(chainId);
      if (result.success) {
        setIsFavorited(result.preference === "like");
      }
    } catch (error) {
      console.error("Error loading chain preference:", error);
    } finally {
      setIsInitializing(false);
    }
  };

  const toggleFavorite = useCallback(
    async (e?: React.MouseEvent) => {
      // Prevent event propagation if called from within a Link
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (!isAuthenticated || !user) {
        // Could trigger a login modal here
        console.log("User must be logged in to favorite chains");
        return;
      }

      setIsLoading(true);

      try {
        if (isFavorited) {
          // Remove favorite
          const result = await removeChainPreference(user.id, chainId);
          if (result.success) {
            setIsFavorited(false);
          }
        } else {
          // Add favorite
          const result = await setChainPreference(user.id, chainId, "like");
          if (result.success) {
            setIsFavorited(true);
          }
        }
      } catch (error) {
        console.error("Error toggling favorite:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [isFavorited, isAuthenticated, user, chainId]
  );

  return {
    isFavorited,
    isLoading,
    isInitializing,
    toggleFavorite,
    isAuthenticated,
  };
}
