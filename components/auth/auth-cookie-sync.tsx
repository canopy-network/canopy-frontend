"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";

/**
 * Component to ensure auth cookies are synced with localStorage state
 * This is needed for middleware to detect authentication status
 * Only runs on client side to avoid SSR issues
 */
export function AuthCookieSync() {
  const [isMounted, setIsMounted] = useState(false);

  // Only access store after component mounts (client-side only)
  const isAuthenticated = useAuthStore(
    (state) => state?.isAuthenticated ?? false
  );
  const user = useAuthStore((state) => state?.user ?? null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Only run on client side after mount
    if (!isMounted || typeof window === "undefined") return;

    // Sync auth state to cookies whenever it changes
    if (isAuthenticated && user) {
      // Ensure cookies are set
      document.cookie = `canopy_auth=true; path=/; max-age=2592000; SameSite=Lax`;
      if (user.id) {
        document.cookie = `canopy_user_id=${user.id}; path=/; max-age=2592000; SameSite=Lax`;
      }
      console.log("✅ Auth cookies synced for middleware access");
    } else {
      // Clear cookies if not authenticated
      document.cookie = "canopy_auth=; path=/; max-age=0";
      document.cookie = "canopy_user_id=; path=/; max-age=0";
      console.log("🔒 Auth cookies cleared");
    }
  }, [isMounted, isAuthenticated, user]);

  // This component doesn't render anything
  return null;
}
