import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  githubApiClient,
  githubOAuthClient,
} from "@/lib/api/github-client";

interface GitHubUserResponse {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
}

interface GitHubEmailResponse {
  email: string;
  primary: boolean;
}

// Handles GitHub OAuth callback - ONLY for repository access, NOT for app authentication
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state") || "/launchpad";
  const error = searchParams.get("error");

  if (error) {
    console.error("GitHub OAuth error:", error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}${state}?error=${error}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}${state}?error=no_code`
    );
  }

  try {
    // Exchange code for access token
    const tokenData = await githubOAuthClient.postRaw<{
      access_token?: string;
      error?: string;
      error_description?: string;
    }>(
      "/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/github/callback`,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        skipAuth: true,
      }
    );

    if (tokenData.error) {
      console.error("GitHub token error:", tokenData);
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}${state}?error=${tokenData.error}`
      );
    }

    const accessToken = tokenData.access_token;

    if (!accessToken) {
      console.error("No access token received from GitHub");
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}${state}?error=no_access_token`
      );
    }

    // Fetch user data from GitHub
    const githubUserData = await githubApiClient.getRaw<GitHubUserResponse>(
      "/user",
      undefined,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
        skipAuth: true,
      }
    );

    // Fetch user emails
    const emails = await githubApiClient.getRaw<GitHubEmailResponse[]>(
      "/user/emails",
      undefined,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
        skipAuth: true,
      }
    );
    const primaryEmail =
      emails.find((e: { primary: boolean; email: string }) => e.primary)
        ?.email || githubUserData.email;

    // Store GitHub session in cookies (for repository access only)
    const cookieStore = await cookies();

    // Store GitHub access token (client-accessible for repository operations)
    cookieStore.set("github_access_token", accessToken, {
      httpOnly: false, // Allow client-side access for repository API calls
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    // Store GitHub user info (for display purposes)
    const githubUser = {
      id: githubUserData.id,
      login: githubUserData.login,
      name: githubUserData.name,
      email: primaryEmail,
      avatar_url: githubUserData.avatar_url,
    };

    cookieStore.set("github_user", JSON.stringify(githubUser), {
      httpOnly: false, // Allow client-side access for display
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    console.log("✅ GitHub connected successfully:", githubUser.login);

    // Redirect back to original page
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}${state}?github_connected=success`
    );
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}${state}?error=callback_failed`
    );
  }
}
