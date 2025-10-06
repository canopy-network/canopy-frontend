/**
 * @fileoverview API Client Usage Examples
 *
 * This file demonstrates how to use the API client in various scenarios.
 * These examples can be used as reference for implementing API calls in components.
 *
 * @author Canopy Development Team
 * @version 1.0.0
 * @since 2024-01-01
 */

import {
  chainsApi,
  virtualPoolsApi,
  templatesApi,
  authApi,
  healthApi,
  getActiveChains,
  getTemplatesByCategory,
  authenticateWithValidation,
  isApiHealthy,
} from "./index";
import { useState } from "react";

// ============================================================================
// BASIC USAGE EXAMPLES
// ============================================================================

/**
 * Example: Check API health
 */
export async function checkApiHealth() {
  try {
    const isHealthy = await isApiHealthy();
    console.log("API is healthy:", isHealthy);
    return isHealthy;
  } catch (error) {
    console.error("Health check failed:", error);
    return false;
  }
}

/**
 * Example: Get all chains
 */
export async function getAllChains() {
  try {
    const response = await chainsApi.getChains();
    console.log("Chains:", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch chains:", error);
    throw error;
  }
}

/**
 * Example: Get chains with filters
 */
export async function getActiveChainsWithTemplates() {
  try {
    const response = await getActiveChains({
      include: ["template", "creator"],
      page: 1,
      limit: 10,
    });
    console.log("Active chains with templates:", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch active chains:", error);
    throw error;
  }
}

/**
 * Example: Get templates by category
 */
export async function getDeFiTemplates() {
  try {
    const response = await getTemplatesByCategory("defi", { is_active: true });
    console.log("DeFi templates:", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch DeFi templates:", error);
    throw error;
  }
}

/**
 * Example: Create a new chain
 */
export async function createNewChain() {
  try {
    const chainData = {
      chain_name: "My DeFi Chain",
      token_symbol: "DEFI",
      chain_description: "A revolutionary DeFi protocol",
      template_id: "550e8400-e29b-41d4-a716-446655441001", // DeFi template ID
      token_total_supply: 1000000000,
      graduation_threshold: 50000,
      initial_cnpy_reserve: 10000,
      creator_initial_purchase_cnpy: 1000,
    };

    const response = await chainsApi.createChain(chainData);
    console.log("Chain created:", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to create chain:", error);
    throw error;
  }
}

/**
 * Example: Authentication flow
 */
export async function authenticateUser(email: string, code: string) {
  try {
    const result = await authenticateWithValidation(email, code);

    if (result.success) {
      console.log("Authentication successful:", result);
      return result;
    } else {
      console.error("Authentication failed:", result.error);
      return result;
    }
  } catch (error) {
    console.error("Authentication error:", error);
    throw error;
  }
}

// ============================================================================
// ADVANCED USAGE EXAMPLES
// ============================================================================

/**
 * Example: Get chain with virtual pool data
 */
export async function getChainWithPoolData(chainId: string) {
  try {
    // Get chain data
    const chainResponse = await chainsApi.getChain(chainId, [
      "template",
      "creator",
    ]);

    // Get virtual pool data
    const poolResponse = await virtualPoolsApi.getVirtualPool(chainId);

    // Get recent transactions
    const transactionsResponse = await virtualPoolsApi.getTransactions(
      chainId,
      {
        page: 1,
        limit: 10,
      }
    );

    return {
      chain: chainResponse.data,
      pool: poolResponse.data,
      transactions: transactionsResponse.data,
    };
  } catch (error) {
    console.error("Failed to fetch chain with pool data:", error);
    throw error;
  }
}

/**
 * Example: Search and filter templates
 */
export async function searchTemplates(searchTerm: string) {
  try {
    // Get all templates
    const allTemplates = await templatesApi.getTemplates({ is_active: true });

    // Filter by search term
    const filteredTemplates = allTemplates.data.filter(
      (template) =>
        template.template_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        template.template_description
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );

    console.log(
      `Found ${filteredTemplates.length} templates matching "${searchTerm}"`
    );
    return filteredTemplates;
  } catch (error) {
    console.error("Failed to search templates:", error);
    throw error;
  }
}

/**
 * Example: Get template statistics
 */
export async function getTemplateStats() {
  try {
    const templates = await templatesApi.getTemplates();

    const stats = {
      total: templates.data.length,
      active: templates.data.filter((t) => t.is_active).length,
      byCategory: {} as Record<string, number>,
      byComplexity: {} as Record<string, number>,
    };

    // Count by category
    templates.data.forEach((template) => {
      stats.byCategory[template.template_category] =
        (stats.byCategory[template.template_category] || 0) + 1;
    });

    // Count by complexity
    templates.data.forEach((template) => {
      stats.byComplexity[template.complexity_level] =
        (stats.byComplexity[template.complexity_level] || 0) + 1;
    });

    console.log("Template statistics:", stats);
    return stats;
  } catch (error) {
    console.error("Failed to get template statistics:", error);
    throw error;
  }
}

// ============================================================================
// ERROR HANDLING EXAMPLES
// ============================================================================

/**
 * Example: Handle API errors gracefully
 */
export async function safeApiCall<T>(
  apiCall: () => Promise<T>,
  fallbackValue: T
): Promise<T> {
  try {
    return await apiCall();
  } catch (error) {
    console.error("API call failed:", error);

    // You can add specific error handling here
    if (error instanceof Error) {
      if (error.message.includes("Network Error")) {
        console.log("Network error - check your connection");
      } else if (error.message.includes("401")) {
        console.log("Unauthorized - please log in again");
      } else if (error.message.includes("404")) {
        console.log("Resource not found");
      }
    }

    return fallbackValue;
  }
}

/**
 * Example: Retry failed API calls
 */
export async function retryApiCall<T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error as Error;
      console.warn(
        `API call failed (attempt ${attempt}/${maxRetries}):`,
        error
      );

      if (attempt < maxRetries) {
        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, attempt - 1) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

// ============================================================================
// REACT HOOK EXAMPLES (for future use with TanStack Query)
// ============================================================================

/**
 * Example: Custom hook for fetching chains
 * This would be used with TanStack Query in React components
 */
export function useChainsExample() {
  // This is just an example - in practice, you'd use TanStack Query
  const [chains, setChains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchChains = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await chainsApi.getChains();
      setChains(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { chains, loading, error, fetchChains };
}
