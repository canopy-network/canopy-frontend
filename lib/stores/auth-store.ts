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
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: AuthUser, token?: string) => void;
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

  return data;
}

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

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user, token) => {
        // Store user ID in localStorage for API authentication
        if (user?.id) {
          setUserId(user.id);
        }

        // Store token in localStorage if provided
        if (token && typeof window !== "undefined") {
          localStorage.setItem("auth_token", token);
          console.log("🔑 Authorization token stored");
        }

        set({
          user,
          token,
          isAuthenticated: true,
          error: null,
        });

        // Verify persistence
        if (typeof window !== "undefined") {
          setTimeout(() => {
            const stored = localStorage.getItem("canopy-auth-storage");
            if (stored) {
              const parsed = JSON.parse(stored);
              console.log("✅ Verified data persisted to localStorage:", {
                userFieldCount: Object.keys(parsed.state?.user || {}).length,
                hasUser: !!parsed.state?.user,
                hasToken: !!parsed.state?.token,
                userId: parsed.state?.user?.id,
                userEmail: parsed.state?.user?.email,
              });
            }
          }, 100);
        }
      },

      clearUser: () => {
        clearUserId();
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth_token");
        }
        set({
          user: null,
          token: null,
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
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth_token");
        }
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },
    }),
    {
      name: "canopy-auth-storage",
      storage,
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
