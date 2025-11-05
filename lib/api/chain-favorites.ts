/**
 * @fileoverview Chain Favorites API Client
 *
 * Client-side functions for managing chain favorites (like/dislike).
 * All operations require user authentication.
 *
 * @author Canopy Development Team
 * @version 1.0.0
 * @since 2025-11-05
 */

type PreferenceType = "like" | "dislike";

interface FavoriteResponse {
  success: boolean;
  preference?: PreferenceType | null;
  message?: string;
  error?: string;
  chain_id?: string;
  created_at?: string;
  updated_at?: string;
}

interface ChainPreference {
  chain_id: string;
  preference: PreferenceType;
  created_at: string;
  updated_at: string;
}

interface ListFavoritesResponse {
  success: boolean;
  chains?: ChainPreference[];
  count?: number;
  error?: string;
}

/**
 * Get the current user's preference for a chain
 *
 * @param chainId - The ID of the chain
 * @returns The user's preference (like, dislike, or null)
 */
export async function getChainPreference(
  chainId: string
): Promise<FavoriteResponse> {
  try {
    const response = await fetch(
      `/api/chains/favorite?chain_id=${encodeURIComponent(chainId)}`,
      {
        method: "GET",
        credentials: "include", // Include cookies for authentication
      }
    );

    const data = await response.json();
    return data;
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
 *
 * @param userId - The ID of the authenticated user
 * @param chainId - The ID of the chain
 * @param preference - "like" or "dislike"
 * @returns Response indicating success or failure
 */
export async function setChainPreference(
  userId: string,
  chainId: string,
  preference: PreferenceType
): Promise<FavoriteResponse> {
  try {
    const response = await fetch("/api/chains/favorite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies for authentication
      body: JSON.stringify({
        user_id: userId,
        chain_id: chainId,
        preference,
      }),
    });

    const data = await response.json();
    return data;
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
 *
 * @param userId - The ID of the authenticated user
 * @param chainId - The ID of the chain
 * @returns Response indicating success or failure
 */
export async function removeChainPreference(
  userId: string,
  chainId: string
): Promise<FavoriteResponse> {
  try {
    const response = await fetch("/api/chains/favorite", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies for authentication
      body: JSON.stringify({
        user_id: userId,
        chain_id: chainId,
      }),
    });

    const data = await response.json();
    return data;
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
 * If the user has already liked the chain, this will dislike it, and vice versa
 *
 * @param userId - The ID of the authenticated user
 * @param chainId - The ID of the chain
 * @returns Response indicating success or failure
 */
export async function toggleChainPreference(
  userId: string,
  chainId: string
): Promise<FavoriteResponse> {
  try {
    // First, get the current preference
    const currentPref = await getChainPreference(chainId);

    if (!currentPref.success) {
      return currentPref;
    }

    // Toggle the preference
    const newPreference: PreferenceType =
      currentPref.preference === "like" ? "dislike" : "like";

    return await setChainPreference(userId, chainId, newPreference);
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
 *
 * @param userId - The ID of the authenticated user
 * @param preference - Filter by "like", "dislike", or "all" (defaults to "like")
 * @returns List of chains with their preferences
 */
export async function listUserFavorites(
  userId: string,
  preference: "like" | "dislike" | "all" = "like"
): Promise<ListFavoritesResponse> {
  try {
    const response = await fetch(
      `/api/chains/favorite/list?user_id=${encodeURIComponent(
        userId
      )}&preference=${encodeURIComponent(preference)}`,
      {
        method: "GET",
        credentials: "include", // Include cookies for authentication
      }
    );

    const data = await response.json();
    return data;
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
 *
 * @param userId - The ID of the authenticated user
 * @returns Array of chain IDs that the user has liked
 */
export async function getLikedChainIds(userId: string): Promise<string[]> {
  try {
    const response = await listUserFavorites(userId, "like");
    if (response.success && response.chains) {
      return response.chains.map((chain) => chain.chain_id);
    }
    return [];
  } catch (error) {
    console.error("Error getting liked chain IDs:", error);
    return [];
  }
}
