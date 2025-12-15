"use client";

/**
 * @fileoverview Wallet Linking Section Component
 *
 * Allows authenticated users to link/unlink Ethereum wallets to their account.
 * Uses SIWE (Sign-In With Ethereum) for secure wallet verification.
 *
 * @author Canopy Development Team
 * @version 1.0.0
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Wallet, Check, ExternalLink } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { getSiweNonce, linkWalletToAccount } from "@/lib/api/siwe";
import { createWalletLinkMessage } from "@/lib/web3/siwe-client";
import { hasValidLinkedWallet } from "@/lib/web3/utils";
import { useAccount, useSignMessage, useDisconnect } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { toast } from "sonner";

export function WalletLinkingSection() {
  const { user, setUser } = useAuthStore();
  const [isLinking, setIsLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConnectButton, setShowConnectButton] = useState(false);

  // Wagmi hooks
  const { address, isConnected, chain } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();

  // Check if wallet is already linked (wallet_address might contain email, so validate it)
  const hasLinkedWallet = hasValidLinkedWallet(user?.wallet_address);

  // Reset state when dialog closes
  useEffect(() => {
    if (!showConnectButton) {
      setError(null);
      setIsLinking(false);
    }
  }, [showConnectButton]);

  const handleLinkWallet = async () => {
    if (!isConnected || !address || !chain) {
      // Open RainbowKit modal directly
      setShowConnectButton(true);
      openConnectModal?.();
      return;
    }

    setIsLinking(true);
    setError(null);

    try {
      // 1. Get nonce from backend
      const nonceResponse = await getSiweNonce(address);
      const nonce = nonceResponse.data.nonce;

      // 2. Create wallet link message
      const message = createWalletLinkMessage(address, nonce, chain.id);
      const messageString = message.prepareMessage();

      // 3. Sign message with wallet
      const signature = await signMessageAsync({ message: messageString });

      // 4. Link wallet to account (uses Bearer token automatically)
      await linkWalletToAccount(messageString, signature);

      // 5. Update user in store with new wallet address
      if (user) {
        setUser({
          ...user,
          wallet_address: address,
        });
      }

      // 6. Show success message
      toast.success("Wallet linked successfully!");

      // 7. Disconnect wallet UI (keep the link on backend)
      disconnect();
      setShowConnectButton(false);
    } catch (error: any) {
      console.error("Wallet linking error:", error);
      setError(
        error.message || "Failed to link wallet. Please try again."
      );
      toast.error("Failed to link wallet");
    } finally {
      setIsLinking(false);
    }
  };

  // Effect to auto-trigger linking when wallet connects
  useEffect(() => {
    if (showConnectButton && isConnected && address && !isLinking && !hasLinkedWallet) {
      handleLinkWallet();
    }
  }, [showConnectButton, isConnected, address]);

  const handleUnlinkWallet = async () => {
    // TODO: Implement unlink functionality when backend endpoint is ready
    toast.error("Unlink functionality coming soon");
  };

  // Format wallet address for display
  const formatAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Get explorer URL for the wallet
  const getExplorerUrl = (addr: string) => {
    return `https://etherscan.io/address/${addr}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Linked Wallet
        </CardTitle>
        <CardDescription>
          Connect your Ethereum wallet to access blockchain features and prove ownership
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasLinkedWallet ? (
          // Wallet is already linked
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <Check className="h-5 w-5 text-green-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">Connected Wallet</p>
                <div className="flex items-center gap-2">
                  <p className="font-mono font-medium truncate">
                    {formatAddress(user.wallet_address)}
                  </p>
                  <a
                    href={getExplorerUrl(user.wallet_address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>

            <Button
              onClick={handleUnlinkWallet}
              variant="outline"
              className="w-full"
            >
              Unlink Wallet
            </Button>

            <p className="text-xs text-muted-foreground">
              Note: Unlinking your wallet will remove access to blockchain features
            </p>
          </div>
        ) : (
          // No wallet linked yet
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {showConnectButton && isConnected ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-4">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Waiting for signature...</span>
                </div>

                <Button
                  onClick={() => {
                    setShowConnectButton(false);
                    disconnect();
                  }}
                  variant="outline"
                  className="w-full"
                  disabled={isLinking}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleLinkWallet}
                className="w-full gap-2"
                disabled={showConnectButton}
              >
                {showConnectButton ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Opening wallet...
                  </>
                ) : (
                  <>
                    <Wallet className="h-4 w-4" />
                    Link Wallet
                  </>
                )}
              </Button>
            )}

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                By linking your wallet, you can:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Sign in with your wallet</li>
                <li>• Participate in token launches</li>
                <li>• Access exclusive features</li>
                <li>• Prove wallet ownership</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
