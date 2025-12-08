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

import { ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { config } from "@/lib/web3/config";

// Import RainbowKit styles
import "@rainbow-me/rainbowkit/styles.css";

// Create a client outside the component to avoid recreation on each render
const queryClient = new QueryClient();

interface Web3ProviderProps {
  children: ReactNode;
}

/**
 * Web3 Provider component
 * Provides Web3 context to all child components
 */
export function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
