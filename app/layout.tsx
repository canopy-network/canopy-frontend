import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { WalletProvider } from "@/components/wallet/wallet-provider";
import { WalletPopup } from "@/components/wallet/wallet-popup";
import { Sidebar } from "@/components/layout/sidebar";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { StoreProvider } from "@/components/providers/store-provider";
import "./globals.css";
import { Header } from "@/components/layout/header";

// Force dynamic rendering for the entire app
export const dynamic = "force-dynamic";

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
          <StoreProvider>
            <WalletProvider>
              <div className="flex h-screen bg-background overflow-hidden">
                {/* Desktop Sidebar - hidden on mobile */}
                <div className="hidden lg:block">
                  <Sidebar />
                </div>
                <main className="w-full overflow-x-hidden flex flex-col">
                  <Header />
                  <div className="flex-1 overflow-y-auto overflow-x-hidden">
                    <Suspense fallback={null}>{children}</Suspense>
                  </div>
                </main>
              </div>
              <WalletPopup />
            </WalletProvider>
          </StoreProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
