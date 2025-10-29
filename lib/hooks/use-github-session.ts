import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";

export interface GitHubUser {
  id: number | string;
  login?: string;
  name: string | null;
  email: string | null;
  avatar_url?: string;
}

export interface GitHubSession {
  authenticated: boolean;
  user: GitHubUser | null;
  accessToken: string | null;
}

function getCookie(name: string): string | null {
  if (typeof window === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

export function useGitHubSession() {
  const { user, isAuthenticated, setUser, logout: authLogout } = useAuthStore();

  // Check for GitHub auth success on mount and sync with auth store
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const githubAuthSuccess = urlParams.get("github_auth");

    if (githubAuthSuccess === "success") {
      // Read user data from cookie and store in auth store
      const authUserCookie = getCookie("auth_user");
      const authTokenCookie = getCookie("auth_token");

      if (authUserCookie) {
        try {
          const userData = JSON.parse(decodeURIComponent(authUserCookie));
          setUser(userData, authTokenCookie || undefined);

          // Clean up URL
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        } catch (error) {
          console.error("Failed to parse auth user cookie:", error);
        }
      }
    }
  }, [setUser]);

  // Read GitHub access token from cookies
  const getGitHubAccessToken = (): string | null => {
    return getCookie("github_access_token");
  };

  const login = () => {
    window.location.href = "/api/github/auth";
  };

  const logout = async () => {
    try {
      // Clear GitHub session
      await fetch("/api/github/session", { method: "DELETE" });

      // Clear auth store (this also clears localStorage)
      authLogout();

      // Clear cookies
      if (typeof window !== "undefined") {
        document.cookie =
          "auth_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie =
          "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie =
          "github_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  return {
    session: {
      authenticated: isAuthenticated,
      user: user as GitHubUser | null,
      accessToken: getGitHubAccessToken(),
    },
    loading: false, // Auth store handles loading state
    login,
    logout,
    refetch: () => {}, // Not needed anymore as we use auth store
  };
}
