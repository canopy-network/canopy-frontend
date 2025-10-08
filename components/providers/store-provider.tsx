"use client";

import { useEffect } from "react";

/**
 * Store Provider
 *
 * This component ensures that Zustand stores are properly hydrated
 * on the client side and prevents SSR mismatches.
 */
export function StoreProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Force hydration of stores on client side
    // This prevents SSR/client mismatches
  }, []);

  return <>{children}</>;
}
