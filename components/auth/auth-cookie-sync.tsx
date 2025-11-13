"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";

/**
 * Component to ensure auth cookies are synced with localStorage state
 * This is needed for middleware to detect authentication status
 */
export function AuthCookieSync() {
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
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
  }, [isAuthenticated, user]);

  // This component doesn't render anything
  return null;
}
