"use client";

import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";

/**
 * Helper function to get cookie value
 */
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

/**
 * Component to ensure auth cookies are synced with localStorage state
 * This is needed for middleware to detect authentication status
 * Only runs on client side to avoid SSR issues
 */
export function AuthCookieSync() {
  const [isMounted, setIsMounted] = useState(false);
  const lastUserIdRef = useRef<string | null>(null);
  const lastAuthStateRef = useRef<boolean>(false);

  // Only access store after component mounts (client-side only)
  // Use stable selectors to avoid unnecessary re-renders
  const isAuthenticated = useAuthStore(
    (state) => state?.isAuthenticated ?? false
  );
  const userId = useAuthStore((state) => state?.user?.id ?? null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Only run on client side after mount
    if (!isMounted || typeof window === "undefined") return;

    // Check if state has actually changed to avoid unnecessary cookie writes
    const authChanged = lastAuthStateRef.current !== isAuthenticated;
    const userIdChanged = lastUserIdRef.current !== userId;

    // Only update cookies if state actually changed
    if (!authChanged && !userIdChanged) {
      return;
    }

    // Update refs
    lastAuthStateRef.current = isAuthenticated;
    lastUserIdRef.current = userId;

    // Sync auth state to cookies whenever it changes
    if (isAuthenticated && userId) {
      // Check if cookies are already set correctly to avoid unnecessary writes
      const currentAuthCookie = getCookie("canopy_auth");
      const currentUserIdCookie = getCookie("canopy_user_id");

      if (currentAuthCookie !== "true" || currentUserIdCookie !== userId) {
        // Only set cookies if they're not already correct
        document.cookie = `canopy_auth=true; path=/; max-age=2592000; SameSite=Lax`;
        document.cookie = `canopy_user_id=${userId}; path=/; max-age=2592000; SameSite=Lax`;
        console.log("✅ Auth cookies synced for middleware access");
      }
    } else {
      // Clear cookies if not authenticated
      const currentAuthCookie = getCookie("canopy_auth");
      if (currentAuthCookie) {
        document.cookie = "canopy_auth=; path=/; max-age=0";
        document.cookie = "canopy_user_id=; path=/; max-age=0";
        console.log("🔒 Auth cookies cleared");
      }
    }
  }, [isMounted, isAuthenticated, userId]);

  // This component doesn't render anything
  return null;
}
