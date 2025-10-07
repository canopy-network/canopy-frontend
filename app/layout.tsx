import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { WalletProvider } from "@/components/wallet/wallet-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { CreateChainDialog } from "@/components/launchpad/create-chain-dialog";
import { TemplatesInitializer } from "@/components/providers/templates-initializer";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Canopy Super App",
  description:
    "Unified blockchain ecosystem for launching, discovering, and participating in new chains",
  generator: "Canopy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AuthSessionProvider>
          <WalletProvider>
            <TemplatesInitializer />
            <div className="flex h-screen bg-background">
              <Sidebar />
              <main className="flex-1 overflow-auto">
                <Suspense fallback={null}>{children}</Suspense>
              </main>
            </div>
            <CreateChainDialog />
          </WalletProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
