import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { WalletProvider } from "@/components/wallet/wallet-provider";
import { WalletPopup } from "@/components/wallet/wallet-popup";
import { Sidebar } from "@/components/layout/sidebar";
import { StoreProvider } from "@/components/providers/store-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { ErrorBoundary } from "@/components/providers/error-boundary";
import { AuthCookieSync } from "@/components/auth/auth-cookie-sync";
import { Web3Provider } from "@/components/web3/web3-provider";
import { Toaster } from "sonner";
import { Toaster as HotToaster } from "react-hot-toast";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { TooltipProvider } from "@/components/ui/tooltip";
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
        <ErrorBoundary>
          <Web3Provider>
            <QueryProvider>
              <StoreProvider>
                <AuthCookieSync />
                <WalletProvider>
                  <TooltipProvider>
                  <div className="flex h-screen bg-background overflow-hidden">
                    {/* Desktop Sidebar - hidden on mobile */}
                    <div className="hidden lg:block">
                      <Sidebar />
                    </div>
                    <main className="w-full overflow-auto">
                      <Header />
                      <div className="flex-1 overflow-y-auto overflow-x-hidden">
                        <Suspense fallback={null}>{children}</Suspense>
                      </div>
                    </main>
                  </div>
                  <WalletPopup />
                  <Toaster
                    position="top-center"
                    theme="dark"
                    toastOptions={{
                      style: {
                        background: "rgba(255, 255, 255, 0.1)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "white",
                        backdropFilter: "blur(8px)",
                      },
                    }}
                  />
                  <HotToaster />
                  </TooltipProvider>
                </WalletProvider>
              </StoreProvider>
            </QueryProvider>
          </Web3Provider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
