import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";
import { API_CONFIG } from "@/lib/config/api";

// Handles GitHub OAuth callback
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
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: `${process.env.NEXTAUTH_URL}/api/github/callback`,
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error("GitHub token error:", tokenData);
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}${state}?error=${tokenData.error}`
      );
    }

    const accessToken = tokenData.access_token;

    // Fetch user data from GitHub
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    const githubUserData = await userResponse.json();

    // Fetch user emails
    const emailsResponse = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    const emails = await emailsResponse.json();
    const primaryEmail =
      emails.find((e: { primary: boolean; email: string }) => e.primary)
        ?.email || githubUserData.email;

    // Register/login user with our backend API
    try {
      const apiResponse = await axios.post(
        `${API_CONFIG.baseURL}/api/v1/auth/github`,
        {
          github_id: githubUserData.id,
          login: githubUserData.login,
          name: githubUserData.name,
          email: primaryEmail,
          avatar_url: githubUserData.avatar_url,
          github_access_token: accessToken,
        }
      );

      const backendUser = apiResponse.data.data.user;
      const authHeader =
        apiResponse.headers["authorization"] ||
        apiResponse.headers["Authorization"];
      const backendToken = authHeader
        ? authHeader.replace("Bearer ", "")
        : null;

      // Store session in cookies for client-side access
      const cookieStore = await cookies();

      // Store auth data in cookies
      cookieStore.set("auth_user", JSON.stringify(backendUser), {
        httpOnly: false, // Allow client-side access for auth store
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });

      if (backendToken) {
        cookieStore.set("auth_token", backendToken, {
          httpOnly: false, // Allow client-side access for auth store
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 30, // 30 days
          path: "/",
        });
      }

      // Also store GitHub-specific data
      cookieStore.set("github_access_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });

      // Redirect back to original page
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}${state}?github_auth=success`
      );
    } catch (apiError) {
      const error = apiError as {
        response?: { data?: unknown };
        message?: string;
      };
      console.error(
        "Backend API error:",
        error.response?.data || error.message
      );
      // If backend fails, still store GitHub data locally
      const cookieStore = await cookies();

      // Create a local user object from GitHub data
      const localUser = {
        id: `github_${githubUserData.id}`,
        email: primaryEmail,
        name: githubUserData.name || githubUserData.login,
        username: githubUserData.login,
        avatar_url: githubUserData.avatar_url,
        provider: "github",
      };

      cookieStore.set("auth_user", JSON.stringify(localUser), {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });

      cookieStore.set("github_access_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });

      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}${state}?github_auth=success`
      );
    }
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}${state}?error=callback_failed`
    );
  }
}
