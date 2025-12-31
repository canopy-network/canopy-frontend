/**
 * @fileoverview Chain Favorites API Client
 *
 * Client-side functions for managing chain favorites (like/dislike).
 * All operations require user authentication.
 *
 * Uses the launchpad API backend for data storage.
 */

import { apiClient } from "./client";

export type PreferenceType = "like" | "dislike";

export interface ChainFavoriteResponse {
  chain_id: number;
  preference: PreferenceType | null;
  created_at?: string;
  updated_at?: string;
}

export interface ChainFavoritesListResponse {
  favorites: ChainFavoriteResponse[];
  total_count: number;
}

export interface SetChainFavoriteRequest {
  chain_id: number;
  preference: PreferenceType;
}

/**
 * Chain Favorites API endpoints
 */
export const chainFavoritesApi = {
  /**
   * Set or update the user's preference for a chain
   * POST /api/v1/users/chain-favorites
   */
  setPreference: (chainId: number, preference: PreferenceType) =>
    apiClient.post<ChainFavoriteResponse>("/api/v1/users/chain-favorites", {
      chain_id: chainId,
      preference,
    }),

  /**
   * Get the user's preference for a specific chain
   * GET /api/v1/users/chain-favorites/:chainId
   */
  getPreference: (chainId: number) =>
    apiClient.get<ChainFavoriteResponse>(
      `/api/v1/users/chain-favorites/${chainId}`
    ),

  /**
   * List all chain preferences for the current user
   * GET /api/v1/users/chain-favorites
   */
  list: (preference?: PreferenceType) => {
    const params = preference ? { preference } : undefined;
    return apiClient.get<ChainFavoritesListResponse>(
      "/api/v1/users/chain-favorites",
      params
    );
  },

  /**
   * Remove the user's preference for a chain
   * DELETE /api/v1/users/chain-favorites/:chainId
   */
  removePreference: (chainId: number) =>
    apiClient.delete<{ message: string }>(
      `/api/v1/users/chain-favorites/${chainId}`
    ),

  /**
   * Toggle between like and dislike for a chain
   * If the user has already liked the chain, this will dislike it, and vice versa
   */
  togglePreference: async (chainId: number) => {
    const current = await chainFavoritesApi.getPreference(chainId);
    const newPreference: PreferenceType =
      current.data.preference === "like" ? "dislike" : "like";
    return chainFavoritesApi.setPreference(chainId, newPreference);
  },

  /**
   * Get only the chain IDs of liked chains
   */
  getLikedChainIds: async (): Promise<number[]> => {
    try {
      const response = await chainFavoritesApi.list("like");
      return response.data.favorites.map((fav) => fav.chain_id);
    } catch (error) {
      console.error("Error getting liked chain IDs:", error);
      return [];
    }
  },
};

// Legacy exports for backward compatibility
// These maintain the same interface as the old DynamoDB-based implementation

interface LegacyFavoriteResponse {
  success: boolean;
  preference?: PreferenceType | null;
  message?: string;
  error?: string;
  chain_id?: string;
  created_at?: string;
  updated_at?: string;
}

interface LegacyListFavoritesResponse {
  success: boolean;
  chains?: Array<{
    chain_id: string;
    preference: PreferenceType;
    created_at: string;
    updated_at: string;
  }>;
  count?: number;
  error?: string;
}

/**
 * Get the current user's preference for a chain
 * @deprecated Use chainFavoritesApi.getPreference instead
 */
export async function getChainPreference(
  chainId: string
): Promise<LegacyFavoriteResponse> {
  try {
    const response = await chainFavoritesApi.getPreference(Number(chainId));
    return {
      success: true,
      preference: response.data.preference,
      chain_id: String(response.data.chain_id),
      created_at: response.data.created_at,
      updated_at: response.data.updated_at,
    };
  } catch (error) {
    console.error("Error fetching chain preference:", error);
    return {
      success: false,
      error: "Failed to fetch preference",
    };
  }
}

/**
 * Set or update the user's preference for a chain
 * @deprecated Use chainFavoritesApi.setPreference instead
 */
export async function setChainPreference(
  userId: string,
  chainId: string,
  preference: PreferenceType
): Promise<LegacyFavoriteResponse> {
  try {
    // userId is not needed - the backend uses the authenticated session
    const response = await chainFavoritesApi.setPreference(
      Number(chainId),
      preference
    );
    return {
      success: true,
      preference: response.data.preference,
      chain_id: String(response.data.chain_id),
      created_at: response.data.created_at,
      updated_at: response.data.updated_at,
    };
  } catch (error) {
    console.error("Error setting chain preference:", error);
    return {
      success: false,
      error: "Failed to set preference",
    };
  }
}

/**
 * Remove the user's preference for a chain
 * @deprecated Use chainFavoritesApi.removePreference instead
 */
export async function removeChainPreference(
  userId: string,
  chainId: string
): Promise<LegacyFavoriteResponse> {
  try {
    // userId is not needed - the backend uses the authenticated session
    await chainFavoritesApi.removePreference(Number(chainId));
    return {
      success: true,
      message: "Preference removed successfully",
    };
  } catch (error) {
    console.error("Error removing chain preference:", error);
    return {
      success: false,
      error: "Failed to remove preference",
    };
  }
}

/**
 * Toggle between like and dislike for a chain
 * @deprecated Use chainFavoritesApi.togglePreference instead
 */
export async function toggleChainPreference(
  userId: string,
  chainId: string
): Promise<LegacyFavoriteResponse> {
  try {
    // userId is not needed - the backend uses the authenticated session
    const response = await chainFavoritesApi.togglePreference(Number(chainId));
    return {
      success: true,
      preference: response.data.preference,
      chain_id: String(response.data.chain_id),
      created_at: response.data.created_at,
      updated_at: response.data.updated_at,
    };
  } catch (error) {
    console.error("Error toggling chain preference:", error);
    return {
      success: false,
      error: "Failed to toggle preference",
    };
  }
}

/**
 * Get all chains that the user has liked or disliked
 * @deprecated Use chainFavoritesApi.list instead
 */
export async function listUserFavorites(
  userId: string,
  preference: "like" | "dislike" | "all" = "like"
): Promise<LegacyListFavoritesResponse> {
  try {
    // userId is not needed - the backend uses the authenticated session
    const prefFilter = preference === "all" ? undefined : preference;
    const response = await chainFavoritesApi.list(prefFilter);
    return {
      success: true,
      chains: response.data.favorites.map((fav) => ({
        chain_id: String(fav.chain_id),
        preference: fav.preference!,
        created_at: fav.created_at || "",
        updated_at: fav.updated_at || "",
      })),
      count: response.data.total_count,
    };
  } catch (error) {
    console.error("Error listing user favorites:", error);
    return {
      success: false,
      error: "Failed to list favorites",
    };
  }
}

/**
 * Get only the chain IDs of liked chains (convenience function)
 * @deprecated Use chainFavoritesApi.getLikedChainIds instead
 */
export async function getLikedChainIds(userId: string): Promise<string[]> {
  try {
    // userId is not needed - the backend uses the authenticated session
    const chainIds = await chainFavoritesApi.getLikedChainIds();
    return chainIds.map(String);
  } catch (error) {
    console.error("Error getting liked chain IDs:", error);
    return [];
  }
}
