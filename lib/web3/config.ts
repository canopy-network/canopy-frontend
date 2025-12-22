/**
 * @fileoverview Web3 Configuration
 *
 * Configures wagmi with supported chains and connectors for wallet connections.
 * Includes RainbowKit integration for beautiful wallet UI.
 *
 * @author Canopy Development Team
 * @version 1.0.0
 */

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, polygon, arbitrum, base, optimism } from "wagmi/chains";

/**
 * WalletConnect Project ID
 * Get yours at: https://cloud.walletconnect.com
 * This is required for mobile wallet connections via WalletConnect
 */
const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";

/**
 * Wagmi configuration with RainbowKit defaults
 * Includes support for multiple chains and wallet connectors
 *
 * Using a global singleton pattern to prevent multiple WalletConnect Core initializations
 * during hot module reloading in development. The config is stored on window to persist
 * across hot module reloads.
 */
declare global {
  interface Window {
    __CANOPY_WAGMI_CONFIG__?: ReturnType<typeof getDefaultConfig>;
  }
}

function getOrCreateConfig() {
  // In browser, check for existing config on window (persists across hot reloads)
  if (typeof window !== "undefined" && window.__CANOPY_WAGMI_CONFIG__) {
    return window.__CANOPY_WAGMI_CONFIG__;
  }

  // Create new config
  const newConfig = getDefaultConfig({
    appName: "Canopy",
    projectId: WALLETCONNECT_PROJECT_ID,
    chains: [mainnet, polygon, arbitrum, base, optimism],
    ssr: true, // Enable server-side rendering support
  });

  // Store on window for persistence across hot reloads
  if (typeof window !== "undefined") {
    window.__CANOPY_WAGMI_CONFIG__ = newConfig;
  }

  return newConfig;
}

export const config = getOrCreateConfig();

/**
 * USDC Contract Address
 * Used for LockOrder transactions in the cross-chain atomic swap
 * Only Ethereum Mainnet is supported
 */
export const USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // Ethereum Mainnet

/**
 * ERC20 ABI for transfer function (minimal)
 */
export const ERC20_TRANSFER_ABI = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
] as const;
