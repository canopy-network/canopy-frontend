"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, X, Wallet } from "lucide-react";
import { formatAddress } from "@/lib/utils/wallet-helpers";
import { withCommas } from "@/lib/utils/denomination";

export interface ConnectedWallet {
  provider: string; // 'MetaMask', 'WalletConnect', etc
  address: string;
  balances: Record<string, number>; // { 'ETH': 0.5, 'USDC': 150.75 }
}

interface ExternalWalletConnectorProps {
  type: "evm" | "solana";
  label: string;
  onConnect: (wallet: ConnectedWallet) => void;
  onDisconnect: () => void;
  connectedWallet?: ConnectedWallet | null;
  disabled?: boolean;
}

const PROVIDERS = {
  evm: [
    { id: "metamask", name: "MetaMask" },
    { id: "walletconnect", name: "WalletConnect" },
  ],
  solana: [
    { id: "phantom", name: "Phantom" },
    { id: "solflare", name: "Solflare" },
  ],
};

export function ExternalWalletConnector({
  type,
  label,
  onConnect,
  onDisconnect,
  connectedWallet,
  disabled = false,
}: ExternalWalletConnectorProps) {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleProviderSelect = async (providerId: string) => {
    setIsConnecting(true);

    // Simulate wallet connection delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock wallet data based on type
    const mockWallet: ConnectedWallet = {
      provider: PROVIDERS[type].find((p) => p.id === providerId)?.name || providerId,
      address: type === "evm" 
        ? "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199"
        : "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
      balances:
        type === "evm"
          ? {
              ETH: 0.5,
              USDC: 150.75,
            }
          : {
              SOL: 2.5,
              USDT: 200.0,
            },
    };

    setIsConnecting(false);
    onConnect(mockWallet);
  };

  if (connectedWallet) {
    return (
      <Card className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <p className="font-medium text-sm">{connectedWallet.provider}</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {formatAddress(connectedWallet.address)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onDisconnect}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Balances */}
          <div className="space-y-1.5 pt-2 border-t">
            {Object.entries(connectedWallet.balances).map(([token, amount]) => (
              <div key={token} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{token}</span>
                <span className="font-medium">{withCommas(amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <Wallet className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-sm">{label}</p>
            <p className="text-xs text-muted-foreground">Not connected</p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={disabled || isConnecting}
            >
              {isConnecting ? "Connecting..." : "Connect"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {PROVIDERS[type].map((provider) => (
              <DropdownMenuItem
                key={provider.id}
                onClick={() => handleProviderSelect(provider.id)}
              >
                {provider.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}
