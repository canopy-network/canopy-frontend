import { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import type { User } from "@/types/api";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user?: User;
  }

  interface JWT {
    accessToken?: string;
    user?: User;
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
        token.user = user as User;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      session.accessToken = token.accessToken as string;
      if (token.user) {
        session.user = token.user as User;
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
