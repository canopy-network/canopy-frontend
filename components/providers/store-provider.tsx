"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useWalletStore } from "@/lib/stores/wallet-store";

/**
 * Store Provider
 *
 * This component ensures that Zustand stores are properly hydrated
 * on the client side and prevents SSR mismatches.
 */
export function StoreProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Manually rehydrate stores on client mount
    useAuthStore.persist.rehydrate();
    useWalletStore.persist.rehydrate();
  }, []);

  return <>{children}</>;
}
