/**
 * @fileoverview Templates API client
 *
 * This module provides type-safe methods for interacting with the templates API endpoints.
 * All methods return properly typed responses and handle errors gracefully.
 *
 * @author Canopy Development Team
 * @version 1.0.0
 * @since 2024-01-01
 */

import { apiClient } from "./client";
import { Template, GetTemplatesParams } from "@/types/templates";

// ============================================================================
// TEMPLATES API
// ============================================================================

/**
 * Templates API client
 */
export const templatesApi = {
  /**
   * Get all templates with optional filtering and pagination
   *
   * @param params - Query parameters for filtering and pagination
   * @returns Promise resolving to templates data
   *
   * @example
   * ```typescript
   * // Get all templates
   * const templates = await templatesApi.getTemplates();
   *
   * // Get DeFi templates only
   * const defiTemplates = await templatesApi.getTemplates({
   *   category: 'defi',
   *   is_active: true,
   *   page: 1,
   *   limit: 20
   * });
   * ```
   */
  getTemplates: (params?: GetTemplatesParams) =>
    apiClient.get<Template[]>("/api/v1/templates", params),
};

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Get templates by category
 *
 * @param category - Template category
 * @param params - Additional query parameters
 * @returns Promise resolving to templates in the category
 *
 * @example
 * ```typescript
 * const defiTemplates = await getTemplatesByCategory('defi');
 * const gamingTemplates = await getTemplatesByCategory('gaming', { is_active: true });
 * ```
 */
export async function getTemplatesByCategory(
  category: string,
  params?: Omit<GetTemplatesParams, "category">
) {
  return templatesApi.getTemplates({
    ...params,
    category: category as any, // Type assertion for dynamic category
  });
}

/**
 * Get templates by complexity level
 *
 * @param complexityLevel - Complexity level
 * @param params - Additional query parameters
 * @returns Promise resolving to templates with the complexity level
 *
 * @example
 * ```typescript
 * const beginnerTemplates = await getTemplatesByComplexity('beginner');
 * const expertTemplates = await getTemplatesByComplexity('expert', { is_active: true });
 * ```
 */
export async function getTemplatesByComplexity(
  complexityLevel: string,
  params?: Omit<GetTemplatesParams, "complexity_level">
) {
  return templatesApi.getTemplates({
    ...params,
    complexity_level: complexityLevel as any, // Type assertion for dynamic complexity
  });
}

/**
 * Get active templates only
 *
 * @param params - Additional query parameters
 * @returns Promise resolving to active templates
 *
 * @example
 * ```typescript
 * const activeTemplates = await getActiveTemplates();
 * ```
 */
export async function getActiveTemplates(
  params?: Omit<GetTemplatesParams, "is_active">
) {
  return templatesApi.getTemplates({
    ...params,
    is_active: true,
  });
}

/**
 * Get templates by supported language
 *
 * @param language - Programming language
 * @param params - Additional query parameters
 * @returns Promise resolving to templates supporting the language
 *
 * @example
 * ```typescript
 * const goTemplates = await getTemplatesByLanguage('go');
 * const rustTemplates = await getTemplatesByLanguage('rust', { is_active: true });
 * ```
 */
export async function getTemplatesByLanguage(
  language: string,
  params?: GetTemplatesParams
) {
  const allTemplates = await templatesApi.getTemplates(params);

  // Filter by language on the client side since the API doesn't support language filtering
  return {
    ...allTemplates,
    data: allTemplates.data.filter(
      (template) =>
        template.supported_language.toLowerCase() === language.toLowerCase()
    ),
  };
}

/**
 * Get templates sorted by deployment time (fastest first)
 *
 * @param params - Query parameters
 * @returns Promise resolving to templates sorted by deployment time
 *
 * @example
 * ```typescript
 * const quickTemplates = await getTemplatesByDeploymentTime();
 * ```
 */
export async function getTemplatesByDeploymentTime(
  params?: GetTemplatesParams
) {
  const templates = await templatesApi.getTemplates(params);

  // Sort by estimated deployment time (ascending)
  return {
    ...templates,
    data: templates.data.sort(
      (a, b) =>
        a.estimated_deployment_time_minutes -
        b.estimated_deployment_time_minutes
    ),
  };
}

/**
 * Get templates sorted by complexity (easiest first)
 *
 * @param params - Query parameters
 * @returns Promise resolving to templates sorted by complexity
 *
 * @example
 * ```typescript
 * const easyTemplates = await getTemplatesByComplexityLevel();
 * ```
 */
export async function getTemplatesByComplexityLevel(
  params?: GetTemplatesParams
) {
  const templates = await templatesApi.getTemplates(params);

  // Define complexity order
  const complexityOrder = ["beginner", "intermediate", "advanced", "expert"];

  // Sort by complexity level
  return {
    ...templates,
    data: templates.data.sort(
      (a, b) =>
        complexityOrder.indexOf(a.complexity_level) -
        complexityOrder.indexOf(b.complexity_level)
    ),
  };
}

/**
 * Search templates by name or description
 *
 * @param searchTerm - Search term
 * @param params - Additional query parameters
 * @returns Promise resolving to matching templates
 *
 * @example
 * ```typescript
 * const searchResults = await searchTemplates('DeFi');
 * ```
 */
export async function searchTemplates(
  searchTerm: string,
  params?: GetTemplatesParams
) {
  const templates = await templatesApi.getTemplates(params);

  // Filter by search term on the client side
  const searchLower = searchTerm.toLowerCase();
  return {
    ...templates,
    data: templates.data.filter(
      (template) =>
        template.template_name.toLowerCase().includes(searchLower) ||
        template.template_description.toLowerCase().includes(searchLower)
    ),
  };
}

/**
 * Get template statistics
 *
 * @param params - Query parameters
 * @returns Promise resolving to template statistics
 *
 * @example
 * ```typescript
 * const stats = await getTemplateStatistics();
 * console.log(`Total templates: ${stats.total}`);
 * console.log(`Active templates: ${stats.active}`);
 * ```
 */
export async function getTemplateStatistics(params?: GetTemplatesParams) {
  const templates = await templatesApi.getTemplates(params);

  const stats = {
    total: templates.data.length,
    active: templates.data.filter((t) => t.is_active).length,
    byCategory: {} as Record<string, number>,
    byComplexity: {} as Record<string, number>,
    byLanguage: {} as Record<string, number>,
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

  // Count by language
  templates.data.forEach((template) => {
    stats.byLanguage[template.supported_language] =
      (stats.byLanguage[template.supported_language] || 0) + 1;
  });

  return stats;
}
