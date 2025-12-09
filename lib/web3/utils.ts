/**
 * @fileoverview Web3 Utility Functions
 *
 * Utility functions for working with Ethereum addresses and web3 data.
 *
 * @author Canopy Development Team
 * @version 1.0.0
 */

/**
 * Check if a string is a valid Ethereum wallet address
 * @param address - The string to check
 * @returns True if the string is a valid Ethereum address (0x + 40 hex characters)
 */
export function isValidEthereumAddress(address: string | undefined | null): boolean {
  if (!address) return false;

  // Ethereum addresses are 42 characters: "0x" + 40 hex characters
  const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  return ethereumAddressRegex.test(address);
}

/**
 * Check if a user has a valid linked wallet
 * (wallet_address field might contain email or invalid data)
 * @param walletAddress - The wallet_address value from the user object
 * @returns True if the user has a valid Ethereum wallet linked
 */
export function hasValidLinkedWallet(walletAddress: string | undefined | null): boolean {
  return isValidEthereumAddress(walletAddress);
}
