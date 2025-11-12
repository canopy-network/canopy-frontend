"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useWallet } from "./wallet-provider";
import { useWalletStore } from "@/lib/stores/wallet-store";
import { SendTransactionDialog } from "./send-transaction-dialog";
import { ReceiveDialog } from "./receive-dialog";
import {
  Copy,
  LogOut,
  Settings,
  ArrowUpRight,
  ArrowDownLeft,
  Repeat,
  Download,
  Send as SendIcon,
  Coins,
  ChevronRight,
} from "lucide-react";
import { showSuccessToast } from "@/lib/utils/error-handler";
import { useRouter } from "next/navigation";
import { formatCnpy } from "@/lib/utils/denomination";

export function WalletPopup() {
  const router = useRouter();
  const { isPopupOpen, closePopup, currentWallet, disconnectWallet } =
    useWallet();
  const { balance, transactions, fetchBalance, fetchTransactions } = useWalletStore();
  const [activeTab, setActiveTab] = useState("balances");
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showReceiveDialog, setShowReceiveDialog] = useState(false);

  // Fetch balance and transactions when wallet is connected
  useEffect(() => {
    if (currentWallet && isPopupOpen) {
      fetchBalance(currentWallet.id);
      fetchTransactions(currentWallet.id);
    }
  }, [currentWallet, isPopupOpen]);

  const formatAddress = (address: string) => {
    if (!address) return "";
    // Add 0x prefix if not present
    const fullAddress = address.startsWith("0x") ? address : `0x${address}`;
    return `${fullAddress.slice(0, 6)}...${fullAddress.slice(-4)}`;
  };

  const copyAddress = () => {
    if (currentWallet) {
      navigator.clipboard.writeText(currentWallet.address);
      showSuccessToast("Address copied to clipboard");
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    closePopup();
  };

  const handleViewFullWallet = () => {
    closePopup();
    router.push("/wallet");
  };

  // Use real balance data
  const displayBalance = balance?.total || "0.00";
  const displayTokens = balance?.tokens || [
    {
      symbol: "CNPY",
      name: "Canopy",
      balance: "0.00",
      usdValue: "$0.00",
    },
  ];

  // Calculate total USD value
  const totalUSDValue = displayTokens.reduce((acc, token) => {
    const usdValue = parseFloat(token.usdValue?.replace(/[^0-9.-]+/g, "") || "0");
    return acc + usdValue;
  }, 0);

  const recentTransactions = transactions.slice(0, 5);

  return (
    <Sheet open={isPopupOpen} onOpenChange={closePopup}>
      <SheetContent side="right" className="w-[400px] sm:w-[400px] p-0 flex flex-col">
        {currentWallet ? (
          <>
            {/* Header - Fixed */}
            <div className="px-6 py-6 space-y-4">
              {/* Wallet Address */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">Wallet Address</p>
                  <p className="font-mono text-sm truncate">
                    {formatAddress(currentWallet.address)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={copyAddress}
                  className="h-8 w-8 ml-2"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              {/* Connected Badge */}
              <div className="text-center">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Connected
                </span>
              </div>

              {/* Total Balance */}
              <div className="text-center space-y-1">
                <p className="text-sm text-muted-foreground">Total Balance</p>
                <div
                  className="text-3xl font-bold cursor-pointer hover:text-primary transition-colors"
                  onClick={handleViewFullWallet}
                >
                  ${totalUSDValue.toFixed(2)}
                  <ChevronRight className="inline h-6 w-6 ml-1" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatCnpy(displayBalance)} CNPY
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-4 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-col h-auto py-3 rounded-xl"
                  disabled
                >
                  <Repeat className="h-4 w-4 mb-1" />
                  <span className="text-xs">Swap</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-col h-auto py-3 rounded-xl"
                  onClick={() => setShowReceiveDialog(true)}
                >
                  <Download className="h-4 w-4 mb-1" />
                  <span className="text-xs">Receive</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-col h-auto py-3 rounded-xl"
                  onClick={() => setShowSendDialog(true)}
                >
                  <SendIcon className="h-4 w-4 mb-1" />
                  <span className="text-xs">Send</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-col h-auto py-3 rounded-xl"
                  disabled
                >
                  <Coins className="h-4 w-4 mb-1" />
                  <span className="text-xs">Stake</span>
                </Button>
              </div>
            </div>

            <Separator />

            {/* Tabs - Scrollable */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="w-full rounded-none border-b bg-transparent p-0 h-auto">
                <TabsTrigger
                  value="balances"
                  className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Balances
                </TabsTrigger>
                <TabsTrigger
                  value="activity"
                  className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Activity
                </TabsTrigger>
              </TabsList>

              {/* Balances Tab */}
              <TabsContent value="balances" className="flex-1 overflow-y-auto mt-0 p-6 space-y-3">
                {displayTokens.length === 0 ? (
                  <div className="text-center py-12">
                    <Coins className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-sm text-muted-foreground mb-4">No assets yet</p>
                    <Button
                      size="sm"
                      onClick={() => router.push("/launchpad")}
                      className="rounded-xl"
                    >
                      Go to Launchpad
                    </Button>
                  </div>
                ) : (
                  displayTokens.map((token) => (
                    <div
                      key={token.symbol}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={handleViewFullWallet}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold bg-primary"
                        >
                          {token.symbol[0]}
                        </div>
                        <div>
                          <p className="font-medium">{token.symbol}</p>
                          <p className="text-xs text-muted-foreground">{token.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCnpy(token.balance)}</p>
                        <p className="text-xs text-muted-foreground">{token.usdValue || "$0.00"}</p>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="flex-1 overflow-y-auto mt-0 p-6 space-y-3">
                {recentTransactions.length === 0 ? (
                  <div className="text-center py-12">
                    <ArrowUpRight className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-sm text-muted-foreground mb-4">No activity yet</p>
                    <Button
                      size="sm"
                      onClick={() => router.push("/launchpad")}
                      className="rounded-xl"
                    >
                      Go to Launchpad
                    </Button>
                  </div>
                ) : (
                  recentTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors"
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
                          <p className="text-sm font-medium capitalize">{tx.type}</p>
                          <p className="text-xs text-muted-foreground">{tx.timestamp}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {formatCnpy(tx.amount)} {tx.token}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>

            <Separator />

            {/* Footer - Fixed */}
            <div className="px-6 py-4 space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 rounded-xl h-11"
                onClick={() => {
                  closePopup();
                  // TODO: Navigate to wallet settings
                }}
                disabled
              >
                <Settings className="h-4 w-4" />
                Wallet Settings
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-xl h-11"
                onClick={handleDisconnect}
              >
                <LogOut className="h-4 w-4" />
                Disconnect Wallet
              </Button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full p-6">
            <div className="text-center">
              <Coins className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No wallet connected</p>
            </div>
          </div>
        )}
      </SheetContent>

      {/* Send Transaction Dialog */}
      <SendTransactionDialog
        open={showSendDialog}
        onOpenChange={setShowSendDialog}
      />

      {/* Receive Dialog */}
      <ReceiveDialog
        open={showReceiveDialog}
        onOpenChange={setShowReceiveDialog}
      />
    </Sheet>
  );
}
