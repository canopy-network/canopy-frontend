/**
 * @fileoverview GitHub Repositories API
 *
 * Functions for fetching and managing GitHub repositories via the GitHub API
 */

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  owner: {
    login: string;
    avatar_url: string;
  };
  html_url: string;
  description: string | null;
  fork: boolean;
  parent?: {
    full_name: string;
  };
  created_at: string;
  updated_at: string;
  pushed_at: string;
  language: string | null;
}

export interface Repository {
  id: string;
  name: string;
  fullName: string;
  forkedFrom?: string;
  url: string;
  language?: string;
  isPrivate: boolean;
}

/**
 * Fetch user's repositories from GitHub
 */
export async function fetchUserRepositories(
  accessToken: string
): Promise<Repository[]> {
  try {
    const response = await fetch(
      "https://api.github.com/user/repos?per_page=100&sort=updated&affiliation=owner",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const repos: GitHubRepository[] = await response.json();

    // Transform to our format
    return repos.map((repo) => ({
      id: repo.id.toString(),
      name: repo.name,
      fullName: repo.full_name,
      forkedFrom: repo.parent?.full_name,
      url: repo.html_url,
      language: repo.language || undefined,
      isPrivate: repo.private,
    }));
  } catch (error) {
    console.error("Error fetching repositories:", error);
    throw error;
  }
}

/**
 * Verify repository ownership
 */
export async function verifyRepositoryOwnership(
  repoFullName: string,
  accessToken: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${repoFullName}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!response.ok) {
      return false;
    }

    const repo: GitHubRepository = await response.json();

    // Check if the authenticated user has push access
    const permissionsResponse = await fetch(
      `https://api.github.com/repos/${repoFullName}/collaborators`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    return permissionsResponse.ok;
  } catch (error) {
    console.error("Error verifying repository ownership:", error);
    return false;
  }
}

/**
 * Get current authenticated GitHub user
 */
export async function getGitHubUser(accessToken: string) {
  try {
    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching GitHub user:", error);
    throw error;
  }
}
