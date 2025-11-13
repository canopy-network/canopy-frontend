import { NextRequest, NextResponse } from "next/server";

// Initiates GitHub OAuth flow
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const redirectTo = searchParams.get("redirectTo") || "/launchpad";

  const clientId = process.env.GH_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      { error: "GitHub OAuth is not configured" },
      { status: 500 }
    );
  }

  // Store redirect URL in a cookie for after OAuth
  const response = NextResponse.redirect(
    `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=read:user user:email repo&redirect_uri=${encodeURIComponent(
      `${process.env.NEXTAUTH_URL}/api/github/callback`
    )}&state=${encodeURIComponent(redirectTo)}`
  );

  return response;
}
