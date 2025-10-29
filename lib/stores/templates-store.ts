/**
 * @fileoverview Templates state management store
 *
 * This store manages all template-related state including fetching, filtering,
 * and caching template data from the API. Templates are loaded on application
 * startup and used throughout the app for chain creation.
 *
 * @author Canopy Development Team
 * @version 1.0.0
 * @since 2024-01-01
 */

import { useEffect, useState } from "react";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { templatesApi } from "@/lib/api";
import {
  Template,
  TemplateCategory,
  ComplexityLevel,
  GetTemplatesParams,
} from "@/types/templates";

// ============================================================================
// TYPES
// ============================================================================

interface TemplatesState {
  // Data
  templates: Template[];
  currentTemplate: Template | null;

  // UI State
  isLoading: boolean;
  error: string | null;

  // Filters
  filters: {
    category?: TemplateCategory;
    complexityLevel?: ComplexityLevel;
    searchQuery: string;
    language?: string;
    isActive?: boolean;
  };

  // Actions
  fetchTemplates: (params?: GetTemplatesParams) => Promise<void>;
  fetchTemplate: (id: string) => Promise<void>;
  refreshTemplates: () => Promise<void>;

  // Filter Actions
  setFilters: (filters: Partial<TemplatesState["filters"]>) => void;
  clearFilters: () => void;

  // Utility Actions
  clearError: () => void;
  setCurrentTemplate: (template: Template | null) => void;

  // Computed Data
  getFilteredTemplates: () => Template[];
  getActiveTemplates: () => Template[];
  getTemplatesByCategory: (category: TemplateCategory) => Template[];
  getTemplatesByComplexity: (level: ComplexityLevel) => Template[];
  getTemplatesByLanguage: (language: string) => Template[];
  getTemplateById: (id: string) => Template | undefined;
  getTemplateStatistics: () => TemplateStatistics;
}

interface TemplateStatistics {
  total: number;
  active: number;
  byCategory: Record<string, number>;
  byComplexity: Record<string, number>;
  byLanguage: Record<string, number>;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate template statistics
 */
function calculateStatistics(templates: Template[]): TemplateStatistics {
  const stats: TemplateStatistics = {
    total: templates.length,
    active: templates.filter((t) => t.is_active).length,
    byCategory: {},
    byComplexity: {},
    byLanguage: {},
  };

  templates.forEach((template) => {
    // Count by category
    stats.byCategory[template.template_category] =
      (stats.byCategory[template.template_category] || 0) + 1;

    // Count by complexity
    stats.byComplexity[template.complexity_level] =
      (stats.byComplexity[template.complexity_level] || 0) + 1;

    // Count by language
    stats.byLanguage[template.supported_language] =
      (stats.byLanguage[template.supported_language] || 0) + 1;
  });

  return stats;
}

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

// Custom storage that handles SSR
const createNoopStorage = (): any => {
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };
};

const storage =
  typeof window !== "undefined" ? localStorage : createNoopStorage();

export const useTemplatesStore = create<TemplatesState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        templates: [],
        currentTemplate: null,
        isLoading: false,
        error: null,
        filters: {
          searchQuery: "",
          isActive: true, // By default, only show active templates
        },

        // ============================================================================
        // API ACTIONS
        // ============================================================================

        fetchTemplates: async (params) => {
          set({ isLoading: true, error: null });
          try {
            const response = await templatesApi.getTemplates(params);

            set({
              templates: response.data,
              isLoading: false,
              error: null,
            });
          } catch (error) {
            set({
              error:
                error instanceof Error
                  ? error.message
                  : "Failed to fetch templates",
              isLoading: false,
            });
          }
        },

        fetchTemplate: async (id) => {
          set({ isLoading: true, error: null });
          try {
            const response = await templatesApi.getTemplates();
            const template = response.data.find((t) => t.id === id);

            if (template) {
              set({
                currentTemplate: template,
                isLoading: false,
                error: null,
              });
            } else {
              set({
                error: "Template not found",
                isLoading: false,
              });
            }
          } catch (error) {
            set({
              error:
                error instanceof Error
                  ? error.message
                  : "Failed to fetch template",
              isLoading: false,
            });
          }
        },

        refreshTemplates: async () => {
          const { filters } = get();
          await get().fetchTemplates(filters);
        },

        // ============================================================================
        // FILTER ACTIONS
        // ============================================================================

        setFilters: (filters) => {
          set((state) => ({
            filters: { ...state.filters, ...filters },
          }));
        },

        clearFilters: () => {
          set({
            filters: {
              searchQuery: "",
              isActive: true,
            },
          });
        },

        // ============================================================================
        // UTILITY ACTIONS
        // ============================================================================

        clearError: () => set({ error: null }),

        setCurrentTemplate: (template) => set({ currentTemplate: template }),

        // ============================================================================
        // COMPUTED DATA
        // ============================================================================

        getFilteredTemplates: () => {
          const { templates, filters } = get();
          let filtered = [...templates];

          // Apply search filter
          if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            filtered = filtered.filter(
              (template) =>
                template.template_name.toLowerCase().includes(query) ||
                template.template_description.toLowerCase().includes(query)
            );
          }

          // Apply category filter
          if (filters.category) {
            filtered = filtered.filter(
              (template) => template.template_category === filters.category
            );
          }

          // Apply complexity filter
          if (filters.complexityLevel) {
            filtered = filtered.filter(
              (template) =>
                template.complexity_level === filters.complexityLevel
            );
          }

          // Apply language filter
          if (filters.language) {
            filtered = filtered.filter(
              (template) =>
                template.supported_language.toLowerCase() ===
                filters.language?.toLowerCase()
            );
          }

          // Apply active filter
          if (filters.isActive !== undefined) {
            filtered = filtered.filter(
              (template) => template.is_active === filters.isActive
            );
          }

          return filtered;
        },

        getActiveTemplates: () => {
          return get()
            .getFilteredTemplates()
            .filter((template) => template.is_active);
        },

        getTemplatesByCategory: (category) => {
          return get()
            .getFilteredTemplates()
            .filter((template) => template.template_category === category);
        },

        getTemplatesByComplexity: (level) => {
          return get()
            .getFilteredTemplates()
            .filter((template) => template.complexity_level === level);
        },

        getTemplatesByLanguage: (language) => {
          return get()
            .getFilteredTemplates()
            .filter(
              (template) =>
                template.supported_language.toLowerCase() ===
                language.toLowerCase()
            );
        },

        getTemplateById: (id) => {
          return get().templates.find((template) => template.id === id);
        },

        getTemplateStatistics: () => {
          return calculateStatistics(get().getFilteredTemplates());
        },
      }),
      {
        name: "templates-store",
        storage,
        partialize: (state) => ({
          // Persist templates data and filters for better UX
          templates: state.templates,
          filters: state.filters,
        }),
      }
    ),
    { name: "TemplatesStore" }
  )
);

// ============================================================================
// INITIALIZATION HOOK
// ============================================================================

/**
 * Hook to initialize templates on app startup
 * Call this hook once in your root layout or app component
 */
export function useInitializeTemplates() {
  const [isHydrated, setIsHydrated] = useState(false);
  const templates = useTemplatesStore((state) => state.templates);
  const isLoading = useTemplatesStore((state) => state.isLoading);
  const fetchTemplates = useTemplatesStore((state) => state.fetchTemplates);

  // Wait for client-side hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Fetch templates after hydration if not already loaded
  useEffect(() => {
    if (isHydrated && templates.length === 0 && !isLoading) {
      fetchTemplates({ is_active: true });
    }
  }, [isHydrated, templates.length, isLoading, fetchTemplates]);

  return { isLoading, templates };
}
