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
 */
export const config = getDefaultConfig({
  appName: "Canopy",
  projectId: WALLETCONNECT_PROJECT_ID,
  chains: [mainnet, polygon, arbitrum, base, optimism],
  ssr: true, // Enable server-side rendering support
});
