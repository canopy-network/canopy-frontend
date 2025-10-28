"use client";

/**
 * @fileoverview Templates Initializer Component
 *
 * This component initializes templates on application startup.
 * It should be included once at the root of the application.
 *
 * @author Canopy Development Team
 * @version 1.0.0
 * @since 2024-01-01
 */

import { useEffect, useState } from "react";
import { useTemplatesStore } from "@/lib/stores";

/**
 * Component that initializes templates on mount
 * This should be placed in the root layout to ensure templates are loaded on app startup
 */
export function TemplatesInitializer() {
  const [isHydrated, setIsHydrated] = useState(false);
  const { templates, isLoading, fetchTemplates } = useTemplatesStore();

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Fetch templates after hydration
  useEffect(() => {
    if (isHydrated && templates.length === 0 && !isLoading) {
      fetchTemplates({ is_active: true });
    }
  }, [isHydrated, templates.length, isLoading, fetchTemplates]);

  // This is a non-rendering component
  return null;
}
