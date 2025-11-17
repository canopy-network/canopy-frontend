"use client";

// Force SSR for this page
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useWallet } from "@/components/wallet/wallet-provider";
import { useWalletStore } from "@/lib/stores/wallet-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { SendTransactionDialog } from "@/components/wallet/send-transaction-dialog";
import { ReceiveDialog } from "@/components/wallet/receive-dialog";
import { AssetItem } from "@/components/wallet/asset-item";
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
  Settings,
  Filter,
  Search,
  ExternalLink,
} from "lucide-react";
import { showSuccessToast } from "@/lib/utils/error-handler";
import { useRouter } from "next/navigation";
import { formatTokenAmount } from "@/lib/utils/denomination";

function WalletContent() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { currentWallet, connectWallet, setShowSelectDialog } = useWallet();
  const {
    balance,
    transactions,
    fetchBalance,
    fetchTransactions,
    fetchPortfolioOverview,
  } = useWalletStore();

  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showReceiveDialog, setShowReceiveDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("assets");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch data when wallet changes
  useEffect(() => {
    if (currentWallet) {
      fetchBalance(currentWallet.id);
      fetchTransactions(currentWallet.id);
      fetchPortfolioOverview([currentWallet.address]);
    }
  }, [currentWallet]);

  const copyAddress = () => {
    if (currentWallet) {
      navigator.clipboard.writeText(currentWallet.address);
      showSuccessToast("Address copied to clipboard");
    }
  };

  const formatAddress = (address: string) => {
    return `${address?.slice(0, 10)}...${address.slice(-8)}`;
  };

  // Use real balance data from the store, fallback to defaults
  const displayBalance = balance?.total || "0.00";
  const displayTokens = balance?.tokens || [];

  // Debug logging
  console.log("Wallet page - balance:", balance);
  console.log("Wallet page - displayTokens:", displayTokens);

  // Calculate total USD value from tokens
  const totalUSDValue = displayTokens.reduce((acc, token) => {
    const usdValue = parseFloat(token.usdValue?.replace(/[^0-9.-]+/g, "") || "0");
    return acc + usdValue;
  }, 0);

  const displayUSDValue = `$${totalUSDValue.toFixed(2)}`;
  const displayTransactions = transactions.length > 0 ? transactions : [];

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

  // Filter transactions based on search
  const filteredTransactions = transactions.filter(tx =>
    tx.txHash?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.to?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.from?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Wallet</h1>
          <p className="text-muted-foreground mt-2 text-pretty">
            Manage your assets, view balances, and track transactions.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSelectDialog(true)}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Switch Wallet
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
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
                <p className="text-3xl font-bold">{formatTokenAmount(displayBalance)} CNPY</p>
                <p className="text-lg text-muted-foreground">{displayUSDValue}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2 pt-4">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setShowSendDialog(true)}
              >
                <Send className="h-4 w-4" />
                Send
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setShowReceiveDialog(true)}
              >
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

        {/* Tabs for Assets, Activity, Staking */}
        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <CardHeader>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="assets">Assets</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="staking" disabled>Staking</TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent>
              {/* Assets Tab */}
              <TabsContent value="assets" className="mt-0">
                {displayTokens.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Coins className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm mb-2">No assets yet</p>
                    <p className="text-xs">
                      Get started by receiving tokens to your wallet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {displayTokens.map((token) => (
                      <AssetItem key={token.symbol} token={token} />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="mt-0 space-y-4">
                {/* Search and Filter */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by address or hash..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline" size="icon" disabled>
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>

                {/* Transactions List */}
                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <ArrowUpRight className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm mb-2">
                      {searchQuery ? "No transactions found" : "No activity yet"}
                    </p>
                    <p className="text-xs">
                      {searchQuery
                        ? "Try a different search term"
                        : "Your transaction history will appear here"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredTransactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors group"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className={`p-2 rounded-full flex-shrink-0 ${
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
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium capitalize">{tx.type}</p>
                              {tx.txHash && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => {
                                    // TODO: Link to block explorer
                                  }}
                                  disabled
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {tx.type === "send"
                                ? tx.to
                                  ? `To ${tx.to.slice(0, 10)}...${tx.to.slice(-8)}`
                                  : "Sent"
                                : tx.from
                                ? `From ${tx.from.slice(0, 10)}...${tx.from.slice(-8)}`
                                : "Received"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                          <p className="font-medium">
                            {formatTokenAmount(tx.amount)} {tx.token}
                          </p>
                          <Badge
                            variant={
                              tx.status === "completed" ? "default" : "secondary"
                            }
                            className="text-xs"
                          >
                            {tx.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Staking Tab - Placeholder */}
              <TabsContent value="staking" className="mt-0">
                <div className="text-center py-12 text-muted-foreground">
                  <Coins className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">Staking coming soon</p>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        {/* Info Banner */}
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-500">
                  Full Blockchain Integration
                </p>
                <p className="text-sm text-muted-foreground">
                  You can now send and receive CNPY tokens. Swap and staking
                  functionality will be available soon!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <SendTransactionDialog
        open={showSendDialog}
        onOpenChange={setShowSendDialog}
      />
      <ReceiveDialog
        open={showReceiveDialog}
        onOpenChange={setShowReceiveDialog}
      />
    </div>
  );
}

export default function WalletPage() {
  return <WalletContent />;
}
