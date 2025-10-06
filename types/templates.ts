/**
 * @fileoverview Template-related type definitions
 *
 * This module contains all TypeScript interfaces and types related to templates
 * and their configurations.
 *
 * @author Canopy Development Team
 * @version 1.0.0
 * @since 2024-01-01
 */

// ============================================================================
// TEMPLATE TYPES
// ============================================================================

/**
 * Template category enumeration
 */
export type TemplateCategory =
  | "defi"
  | "gaming"
  | "nft"
  | "infrastructure"
  | "social"
  | "other";

/**
 * Complexity level enumeration
 */
export type ComplexityLevel =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "expert";

/**
 * Template interface matching the /api/v1/templates response
 */
export interface Template {
  /** Unique identifier for the template */
  id: string;

  /** Display name of the template */
  template_name: string;

  /** Detailed description of the template */
  template_description: string;

  /** Category classification of the template */
  template_category: TemplateCategory;

  /** Programming language used in the template */
  supported_language: string;

  /** Default consensus mechanism */
  default_consensus: string;

  /** Default total token supply */
  default_token_supply: number;

  /** Default number of validators */
  default_validator_count: number;

  /** Complexity level of the template */
  complexity_level: ComplexityLevel;

  /** Estimated deployment time in minutes */
  estimated_deployment_time_minutes: number;

  /** URL to template documentation */
  documentation_url: string | null;

  /** Example chain names that use this template */
  example_chains: string[] | null;

  /** Template version */
  version: string;

  /** Whether the template is currently active */
  is_active: boolean;

  /** Creation timestamp (ISO 8601) */
  created_at: string;

  /** Last update timestamp (ISO 8601) */
  updated_at: string;
}

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * Query parameters for getting templates
 */
export interface GetTemplatesParams {
  category?: TemplateCategory;
  complexity_level?: ComplexityLevel;
  is_active?: boolean;
  page?: number;
  limit?: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Template with chains relationship
 */
export type TemplateWithChains = Template & {
  chains?: string[]; // Array of chain names using this template
};

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Template category labels for UI display
 */
export const TEMPLATE_CATEGORY_LABELS: Record<TemplateCategory, string> = {
  defi: "DeFi",
  gaming: "Gaming",
  nft: "NFT",
  infrastructure: "Infrastructure",
  social: "Social",
  other: "Other",
} as const;

/**
 * Complexity level labels for UI display
 */
export const COMPLEXITY_LEVEL_LABELS: Record<ComplexityLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  expert: "Expert",
} as const;

/**
 * Template category colors for UI styling
 */
export const TEMPLATE_CATEGORY_COLORS: Record<TemplateCategory, string> = {
  defi: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  gaming:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  nft: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
  infrastructure:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  social: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
} as const;

/**
 * Complexity level colors for UI styling
 */
export const COMPLEXITY_LEVEL_COLORS: Record<ComplexityLevel, string> = {
  beginner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  intermediate:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  advanced:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  expert: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
} as const;
