"use client";

// Force SSR for this page
export const dynamic = "force-dynamic";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/components/wallet/wallet-provider";
import { useWalletStore } from "@/lib/stores/wallet-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import {
  Wallet,
  Copy,
  Send,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
  Coins,
  AlertCircle,
} from "lucide-react";
import { showSuccessToast } from "@/lib/utils/error-handler";
import { useRouter } from "next/navigation";

function WalletContent() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { currentWallet, connectWallet, setShowSelectDialog } = useWallet();
  const { balance, transactions, fetchBalance, fetchTransactions } =
    useWalletStore();

  const copyAddress = () => {
    if (currentWallet) {
      navigator.clipboard.writeText(currentWallet.address);
      showSuccessToast("Address copied to clipboard");
    }
  };

  const formatAddress = (address: string) => {
    return `${address?.slice(0, 10)}...${address.slice(-8)}`;
  };

  // Mock data for demo (until blockchain integration)
  const mockBalance = "0.00";
  const mockUSDValue = "$0.00";
  const mockTokens = [
    {
      symbol: "CNPY",
      name: "Canopy",
      balance: "0.00",
      usdValue: "$0.00",
      logo: null,
    },
  ];

  const mockTransactions = transactions.length > 0 ? transactions : [];

  if (!isAuthenticated) {
    return (
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please log in to access your wallet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/")}>Go to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentWallet) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-balance">Wallet</h1>
          <p className="text-muted-foreground mt-2 text-pretty">
            Connect your wallet to manage assets and view transactions.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>No Wallet Connected</CardTitle>
            <CardDescription>
              Connect your wallet to view account details and manage your
              assets.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-8 text-center">
              <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Wallet className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Get started by connecting or creating a wallet
              </p>
              <Button onClick={connectWallet} size="lg" className="gap-2">
                <Wallet className="h-4 w-4" />
                Connect Wallet
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Wallet</h1>
          <p className="text-muted-foreground mt-2 text-pretty">
            Manage your assets, view balances, and track transactions.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSelectDialog(true)}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Switch Wallet
        </Button>
      </div>

      <div className="space-y-6">
        {/* Wallet Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                {currentWallet.wallet_name || "My Wallet"}
              </div>
              {currentWallet.isUnlocked ? (
                <Badge variant="default" className="gap-1">
                  Unlocked
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  Locked
                </Badge>
              )}
            </CardTitle>
            {currentWallet.wallet_description && (
              <CardDescription>{currentWallet.wallet_description}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">Address</p>
                <p className="font-mono text-sm">
                  {formatAddress(currentWallet.address)}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={copyAddress}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            {/* Balance */}
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-1">Total Balance</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold">{mockBalance} CNPY</p>
                <p className="text-lg text-muted-foreground">{mockUSDValue}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2 pt-4">
              <Button variant="outline" className="gap-2" disabled>
                <Send className="h-4 w-4" />
                Send
              </Button>
              <Button variant="outline" className="gap-2" disabled>
                <Download className="h-4 w-4" />
                Receive
              </Button>
              <Button variant="outline" className="gap-2" disabled>
                <RefreshCw className="h-4 w-4" />
                Swap
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Assets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Assets</CardTitle>
              <CardDescription>Your token balances</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {mockTokens.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Coins className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No assets yet</p>
                <p className="text-xs mt-1">
                  Get started by receiving tokens to your wallet
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {mockTokens.map((token) => (
                  <div
                    key={token.symbol}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Coins className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{token.symbol}</p>
                        <p className="text-sm text-muted-foreground">
                          {token.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{token.balance}</p>
                      <p className="text-sm text-muted-foreground">
                        {token.usdValue}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest blockchain activity</CardDescription>
          </CardHeader>
          <CardContent>
            {mockTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ArrowUpRight className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No transactions yet</p>
                <p className="text-xs mt-1">
                  Your transaction history will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {mockTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          tx.type === "send"
                            ? "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                            : "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                        }`}
                      >
                        {tx.type === "send" ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownLeft className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium capitalize">{tx.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {tx.type === "send" ? `To ${tx.to}` : `From ${tx.from}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {tx.amount} {tx.token}
                      </p>
                      <Badge
                        variant={
                          tx.status === "completed" ? "default" : "secondary"
                        }
                      >
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Banner */}
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-500">
                  Blockchain Integration Coming Soon
                </p>
                <p className="text-sm text-muted-foreground">
                  Send, receive, and swap functionality will be available once
                  the Canopy blockchain is fully integrated. Stay tuned!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function WalletPage() {
  return <WalletContent />;
}
