import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Get current session (checks both email and GitHub auth)
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authUser = cookieStore.get("auth_user")?.value;
    const authToken = cookieStore.get("auth_token")?.value;
    const githubAccessToken = cookieStore.get("github_access_token")?.value;

    if (!authUser) {
      return NextResponse.json(
        { authenticated: false, user: null, accessToken: null },
        { status: 200 }
      );
    }

    const user = JSON.parse(authUser);

    return NextResponse.json(
      {
        authenticated: true,
        user,
        token: authToken,
        githubAccessToken,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Session retrieval error:", error);
    return NextResponse.json(
      { authenticated: false, user: null, accessToken: null },
      { status: 200 }
    );
  }
}

// Logout - clear all session cookies
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();

    // Clear all auth-related cookies
    cookieStore.delete("auth_user");
    cookieStore.delete("auth_token");
    cookieStore.delete("github_access_token");

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}
