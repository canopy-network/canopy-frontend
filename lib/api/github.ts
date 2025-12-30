/**
 * GitHub API service for repository ownership validation
 */

import { ApiClientError } from "./client";
import { githubApiClient } from "./github-client";

export interface GitHubRepoInfo {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    id: number;
    type: string;
  };
  permissions: {
    admin: boolean;
    push: boolean;
    pull: boolean;
  };
  private: boolean;
  html_url: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface GitHubValidationResult {
  isValid: boolean;
  error?: string;
  repoInfo?: GitHubRepoInfo;
}

/**
 * Validates GitHub repository ownership using GitHub API
 */
export async function validateGitHubOwnership(
  githubUrl: string,
  accessToken: string
): Promise<GitHubValidationResult> {
  try {
    // Extract owner/repo from URL
    const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)(?:\/.*)?$/);
    if (!match) {
      return {
        isValid: false,
        error:
          "Invalid GitHub URL format. Expected: https://github.com/owner/repo",
      };
    }

    const [, owner, repo] = match;

    // Check repository permissions
    const repoData = await githubApiClient.getRaw<GitHubRepoInfo>(
      `/repos/${owner}/${repo}`,
      undefined,
      {
        headers: {
          Authorization: `token ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Canopy-Chain-Creator",
        },
        skipAuth: true,
      }
    );

    // Check if user has write/admin permissions
    const permissions = repoData.permissions;
    if (!permissions || (!permissions.push && !permissions.admin)) {
      return {
        isValid: false,
        error:
          "You don't have write permissions to this repository. You need push or admin access.",
      };
    }

    return {
      isValid: true,
      repoInfo: repoData,
    };
  } catch (error) {
    if (error instanceof ApiClientError) {
      if (error.status === 404) {
        return {
          isValid: false,
          error: "Repository not found or you don't have access to it",
        };
      }

      if (error.status === 403) {
        return {
          isValid: false,
          error: "Rate limit exceeded. Please try again later.",
        };
      }
    }

    console.error("GitHub validation error:", error);
    return {
      isValid: false,
      error:
        "Failed to validate repository. Please check your internet connection and try again.",
    };
  }
}

/**
 * Extracts repository information from GitHub URL
 */
export function parseGitHubUrl(
  url: string
): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)(?:\/.*)?$/);
  if (!match) return null;

  return {
    owner: match[1],
    repo: match[2],
  };
}

/**
 * Validates GitHub URL format
 */
export function isValidGitHubUrl(url: string): boolean {
  return /^https:\/\/github\.com\/[^\/]+\/[^\/]+(?:\/.*)?$/.test(url);
}
