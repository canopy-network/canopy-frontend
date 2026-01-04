"use client";

/**
 * @fileoverview Web3 Provider Component
 *
 * Wraps the application with wagmi and RainbowKit providers
 * to enable Web3 wallet connections and SIWE functionality.
 *
 * @author Canopy Development Team
 * @version 1.0.0
 */

import { ReactNode, useState, useEffect } from "react";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { config } from "@/lib/web3/config";

// Import RainbowKit styles
import "@rainbow-me/rainbowkit/styles.css";

interface Web3ProviderProps {
  children: ReactNode;
}

/**
 * Web3 Provider component
 * Provides Web3 context to all child components
 * Note: QueryClientProvider is handled by the parent QueryProvider in the layout
 */
export function Web3Provider({ children }: Web3ProviderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiProvider config={config}>
      {mounted ? (
        <RainbowKitProvider theme={darkTheme()}>
          {children}
        </RainbowKitProvider>
      ) : (
        children
      )}
    </WagmiProvider>
  );
}
