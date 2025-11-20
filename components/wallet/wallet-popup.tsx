"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useWallet } from "./wallet-provider";
import { useWalletStore } from "@/lib/stores/wallet-store";
import { SendTransactionDialog } from "./send-transaction-dialog";
import { ReceiveDialog } from "./receive-dialog";
import {
  Copy,
  LogOut,
  Settings,
  Repeat,
  Download,
  Send,
  Coins,
  ChevronRight,
  Wallet,
  Activity,
} from "lucide-react";
import { showSuccessToast } from "@/lib/utils/error-handler";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {formatTokenAmount, toDisplayAmount} from "@/lib/utils/denomination";

export function WalletPopup() {
  const router = useRouter();
  const { isPopupOpen, closePopup, currentWallet, disconnectWallet } = useWallet();
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
  }, [currentWallet, fetchBalance, fetchTransactions, isPopupOpen]);

  const formatAddress = (address: string) => {
    if (!address) return "";
    const fullAddress = address.startsWith("0x") ? address : `0x${address}`;
    return `${fullAddress.slice(0, 6)}...${fullAddress.slice(-4)}`;
  };

  const copyAddress = () => {
    if (currentWallet) {
      navigator.clipboard.writeText(currentWallet.address);
      toast.success("Address copied to clipboard");
    }
  };

  const handleDisconnect = () => {
    closePopup();
    router.push("/");
    setTimeout(() => {
      disconnectWallet();
    }, 100);
  };

  const handleViewAll = () => {
    closePopup();
    router.push("/wallet");
  };

  // Use real balance data
  const displayBalance = balance?.total || "0.00";
  const displayTokens = balance?.tokens || [];

  // Calculate total USD value
  const totalUSDValue = displayTokens.reduce((acc, token) => {
    const usdValue = parseFloat(token.usdValue?.replace(/[^0-9.-]+/g, "") || "0");
    return acc + usdValue;
  }, 0);

  const recentTransactions = transactions.slice(0, 5);

  return (
    <>
      <Sheet open={isPopupOpen} onOpenChange={closePopup}>
        <SheetContent side="left" className="w-full sm:max-w-[420px] p-0 flex flex-col bg-card gap-0">
          {currentWallet ? (
            <>
              {/* Header - Fixed */}
              <div className="p-6 space-y-4 border-b border-border">
                {/* Wallet Address & Avatar */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#1dd13a] flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-white">C</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="text-base font-semibold text-foreground">
                        {formatAddress(currentWallet.address)}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-muted"
                        onClick={copyAddress}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="text-sm text-[#1dd13a]">Connected</div>
                  </div>
                </div>

                {/* Total Balance */}
                <div>
                  <button
                    onClick={handleViewAll}
                    className="flex items-center gap-1 text-sm text-muted-foreground mb-1 hover:text-foreground transition-colors cursor-pointer"
                  >
                    Estimated Balance
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <h2 className="text-4xl font-bold text-foreground mb-1">
                   ${toDisplayAmount(displayBalance)}
                  </h2>
                </div>

                {/* Action Buttons Grid */}
                <div className="grid grid-cols-4 gap-2">
                  <Button
                    variant="outline"
                    className="flex flex-col gap-1 h-auto py-3 px-2"
                  >
                    <Repeat className="w-5 h-5" />
                    <span className="text-xs">Swap</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col gap-1 h-auto py-3 px-2"
                  >
                    <Download className="w-5 h-5" />
                    <span className="text-xs">Buy</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col gap-1 h-auto py-3 px-2"
                    onClick={() => setShowSendDialog(true)}
                  >
                    <Send className="w-5 h-5" />
                    <span className="text-xs">Send</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col gap-1 h-auto py-3 px-2"
                  >
                    <Coins className="w-5 h-5" />
                    <span className="text-xs">Stake</span>
                  </Button>
                </div>
              </div>

              {/* Tabs - Scrollable */}
              <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                  <TabsList className="w-full justify-start bg-transparent p-0 px-6 border-b border-border rounded-none h-auto flex-shrink-0">
                    <TabsTrigger
                      value="balances"
                      className="py-3 px-0 mr-6 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent bg-transparent data-[state=active]:text-foreground"
                    >
                      Balances
                    </TabsTrigger>
                    <TabsTrigger
                      value="activity"
                      className="py-3 px-0 mr-6 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent bg-transparent text-muted-foreground data-[state=active]:text-foreground"
                    >
                      Activity
                    </TabsTrigger>
                  </TabsList>

                  {/* Balances Tab */}
                  <TabsContent value="balances" className="flex-1 overflow-y-auto mt-0 data-[state=inactive]:hidden">
                    <div className="p-6">
                      {displayTokens.length === 0 ? (
                        /* Empty State */
                        <Card className="p-12 border-0">
                          <div className="flex flex-col items-center text-center space-y-4">
                            <div className="p-4 bg-muted rounded-full">
                              <Wallet className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <div className="space-y-2">
                              <h3 className="text-lg font-semibold">No assets yet</h3>
                              <p className="text-sm text-muted-foreground max-w-md">
                                Start your blockchain journey by creating or investing in chains on the launchpad.
                              </p>
                            </div>
                            <Button
                              onClick={() => {
                                closePopup();
                                router.push("/");
                              }}
                              className="mt-2"
                            >
                              Go to Launchpad
                            </Button>
                          </div>
                        </Card>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-muted-foreground">TOP ASSETS</h3>
                            <Button
                              variant="link"
                              className="text-green-400 h-auto p-0 text-sm hover:text-green-400/80"
                              onClick={handleViewAll}
                            >
                              VIEW ALL
                            </Button>
                          </div>

                          {/* Assets List - Top 5 */}
                          <div className="space-y-3">
                            {displayTokens.slice(0, 5).map((token, index) => (
                              <button
                                key={index}
                                className="w-full flex items-center justify-between py-2 hover:bg-muted/50 rounded-lg px-2 transition-colors cursor-pointer"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                    <span className="text-sm font-bold text-primary">
                                      {token.symbol.slice(0, 1)}
                                    </span>
                                  </div>
                                  <div className="text-left">
                                    <div className="font-medium text-foreground">
                                      {token.name} <span className="text-muted-foreground">{token.symbol}</span>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {toDisplayAmount(token.balance)}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium text-foreground">
                                    {token.usdValue || "$0.00"}
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Activity Tab */}
                  <TabsContent value="activity" className="flex-1 overflow-y-auto mt-0 data-[state=inactive]:hidden">
                    <div className="p-6">
                      {recentTransactions.length === 0 ? (
                        /* Empty State */
                        <Card className="p-12 border-0">
                          <div className="flex flex-col items-center text-center space-y-4">
                            <div className="p-4 bg-muted rounded-full">
                              <Activity className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <div className="space-y-2">
                              <h3 className="text-lg font-semibold">No activity yet</h3>
                              <p className="text-sm text-muted-foreground max-w-md">
                                Start your blockchain journey by creating or investing in chains on the launchpad.
                              </p>
                            </div>
                            <Button
                              onClick={() => {
                                closePopup();
                                router.push("/");
                              }}
                              className="mt-2"
                            >
                              Go to Launchpad
                            </Button>
                          </div>
                        </Card>
                      ) : (
                        <div className="space-y-3">
                          {recentTransactions.map((tx, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between py-3 hover:bg-muted/50 rounded-lg px-2 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  tx.type === 'send' ? 'bg-red-500/20' : 'bg-green-500/20'
                                }`}>
                                  {tx.type === 'send' ? (
                                    <Send className="w-5 h-5 text-red-500" />
                                  ) : (
                                    <Download className="w-5 h-5 text-green-500" />
                                  )}
                                </div>
                                <div>
                                  <div className="font-medium capitalize">{tx.type}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {new Date(tx.timestamp).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={`font-medium ${
                                  tx.type === 'send' ? 'text-red-500' : 'text-green-500'
                                }`}>
                                  {tx.type === 'send' ? '-' : '+'}{tx.amount} {tx.token}
                                </div>
                                <div className="text-sm text-muted-foreground capitalize">
                                  {tx.status}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Footer - Fixed */}
              <div className="p-5 border-t border-border space-y-3">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 hover:bg-muted"
                  onClick={() => {
                    closePopup();
                    router.push("/settings");
                  }}
                >
                  <Settings className="w-5 h-5" />
                  <span>Wallet settings</span>
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-red-500 hover:text-red-500 hover:bg-red-500/10"
                  onClick={handleDisconnect}
                >
                  <LogOut className="w-5 h-5" />
                  <span>Disconnect wallet</span>
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full p-8">
              <p className="text-muted-foreground">No wallet connected</p>
            </div>
          )}
        </SheetContent>
      </Sheet>

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
    </>
  );
}
