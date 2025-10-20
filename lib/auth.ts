import { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import type { User as ApiUser } from "@/types/api";

// Extend the default NextAuth types to support both GitHub and email auth
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user?: {
      // NextAuth default fields (for GitHub auth)
      name?: string | null;
      email?: string | null;
      image?: string | null;
    } & Partial<ApiUser>; // API user fields (for email auth)
  }

  interface JWT {
    accessToken?: string;
    user?: ApiUser;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email repo",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile, user }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
      }
      // Persist user data to the token
      if (user) {
        token.user = user as ApiUser;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      session.accessToken = token.accessToken as string;
      if (token.user) {
        session.user = { ...session.user, ...token.user };
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
