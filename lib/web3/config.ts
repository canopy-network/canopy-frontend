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
const WALLETCONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";

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
 * USDC Contract Addresses per chain
 * Used for LockOrder transactions in the cross-chain atomic swap
 */
export const USDC_ADDRESSES: Record<number, `0x${string}`> = {
  1: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // Ethereum Mainnet
  137: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", // Polygon
  42161: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // Arbitrum One
  8453: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Base
  10: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", // Optimism
  11155111: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // Sepolia Testnet
};

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
