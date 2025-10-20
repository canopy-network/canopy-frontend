/**
 * @fileoverview Authentication Store
 *
 * This store manages the authentication state for email-based authentication.
 * Handles email verification code flow and user session.
 *
 * @author Canopy Development Team
 * @version 1.0.0
 * @since 2024-01-01
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types/api";
import { setUserId, clearUserId } from "@/lib/api/client";

export type AuthUser = User;

export interface AuthState {
  // State
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: AuthUser) => void;
  clearUser: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
}

/**
 * Helper function to get persisted auth data from localStorage
 * Useful for debugging and verification
 */
export function getPersistedAuthData() {
  if (typeof window === "undefined") return null;

  const stored = localStorage.getItem("canopy-auth-storage");
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored);
    return parsed.state;
  } catch (error) {
    console.error("Failed to parse persisted auth data:", error);
    return null;
  }
}

/**
 * Log current persisted auth data to console
 */
export function logPersistedAuthData() {
  const data = getPersistedAuthData();
  console.log("📊 Current persisted auth data:", data);
  console.log(
    "📋 User fields stored:",
    data?.user ? Object.keys(data.user) : []
  );
  console.log("📝 Full user object:", data?.user);
  return data;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) => {
        // Store user ID in localStorage for API authentication
        if (user?.id) {
          setUserId(user.id);
        }

        // Log full user object being stored
        console.log("📝 Storing full user object in auth store:", user);
        console.log("📦 User fields being persisted:", Object.keys(user || {}));

        set({
          user,
          isAuthenticated: true,
          error: null,
        });

        // Verify persistence
        setTimeout(() => {
          const stored = localStorage.getItem("canopy-auth-storage");
          if (stored) {
            const parsed = JSON.parse(stored);
            console.log("✅ Verified data persisted to localStorage:", {
              userFieldCount: Object.keys(parsed.state?.user || {}).length,
              hasUser: !!parsed.state?.user,
              userId: parsed.state?.user?.id,
              userEmail: parsed.state?.user?.email,
            });
          }
        }, 100);
      },

      clearUser: () => {
        clearUserId();
        set({
          user: null,
          isAuthenticated: false,
        });
      },

      setLoading: (isLoading) =>
        set({
          isLoading,
        }),

      setError: (error) =>
        set({
          error,
        }),

      logout: () => {
        clearUserId();
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },
    }),
    {
      name: "canopy-auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
