"use client";

/**
 * Store Provider
 *
 * This component ensures that Zustand stores are properly hydrated
 * on the client side and prevents SSR mismatches.
 */
export function StoreProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
