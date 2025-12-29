import { useState, useEffect } from "react";
import { localApiClient } from "@/lib/api/local-client";

export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
}

export interface GitHubSession {
  connected: boolean;
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

/**
 * Hook to manage GitHub OAuth connection for repository access
 * This is SEPARATE from app authentication - only used to read repositories
 */
export function useGitHubSession() {
  const [session, setSession] = useState<GitHubSession>({
    connected: false,
    user: null,
    accessToken: null,
  });
  const [loading, setLoading] = useState(true);

  // Load GitHub session from cookies
  const loadSession = () => {
    try {
      const githubUserCookie = getCookie("github_user");
      const githubAccessToken = getCookie("github_access_token");

      console.log("🔍 Loading GitHub session from cookies:", {
        hasUserCookie: !!githubUserCookie,
        hasAccessToken: !!githubAccessToken,
        userCookieLength: githubUserCookie?.length,
        tokenLength: githubAccessToken?.length,
      });

      if (githubUserCookie && githubAccessToken) {
        try {
          const githubUser = JSON.parse(decodeURIComponent(githubUserCookie));
          setSession({
            connected: true,
            user: githubUser,
            accessToken: githubAccessToken,
          });
          console.log("✅ GitHub session loaded:", githubUser.login);
        } catch (parseError) {
          console.error("Failed to parse GitHub user data:", parseError);
          setSession({
            connected: false,
            user: null,
            accessToken: null,
          });
        }
      } else {
        console.log("❌ No GitHub cookies found");
        setSession({
          connected: false,
          user: null,
          accessToken: null,
        });
      }
    } catch (error) {
      console.error("Failed to load GitHub session:", error);
      setSession({
        connected: false,
        user: null,
        accessToken: null,
      });
    } finally {
      setLoading(false);
    }
  };

  // Check for GitHub connection success on mount and handle redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const githubConnected = urlParams.get("github_connected");

    if (githubConnected === "success") {
      console.log("🔗 GitHub connection successful, loading session...");

      // Give cookies time to be set, then reload session
      setTimeout(() => {
        loadSession();
        // Clean up URL after loading
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }, 100);
    } else {
      loadSession();
    }
  }, []);

  const login = () => {
    // Redirect to GitHub OAuth
    window.location.href = "/api/github/auth";
  };

  const logout = async () => {
    try {
      // Clear GitHub session via API
      await localApiClient.deleteRaw("/github/session");

      // Clear local state
      setSession({
        connected: false,
        user: null,
        accessToken: null,
      });

      // Clear cookies
      if (typeof window !== "undefined") {
        document.cookie =
          "github_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie =
          "github_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }

      console.log("✅ GitHub disconnected");
    } catch (error) {
      console.error("Failed to disconnect GitHub:", error);
    }
  };

  return {
    session,
    loading,
    login,
    logout,
    refetch: loadSession,
  };
}
