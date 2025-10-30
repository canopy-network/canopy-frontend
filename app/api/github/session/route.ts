import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Get current GitHub connection status (for repository access only)
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const githubAccessToken = cookieStore.get("github_access_token")?.value;
    const githubUser = cookieStore.get("github_user")?.value;

    if (!githubAccessToken || !githubUser) {
      return NextResponse.json(
        { connected: false, user: null, accessToken: null },
        { status: 200 }
      );
    }

    const user = JSON.parse(githubUser);

    return NextResponse.json(
      {
        connected: true,
        user,
        accessToken: githubAccessToken,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Session retrieval error:", error);
    return NextResponse.json(
      { connected: false, user: null, accessToken: null },
      { status: 200 }
    );
  }
}

// Disconnect GitHub - clear GitHub session only (does NOT affect app authentication)
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();

    // Clear only GitHub-related cookies
    cookieStore.delete("github_access_token");
    cookieStore.delete("github_user");

    console.log("✅ GitHub session cleared");

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}
