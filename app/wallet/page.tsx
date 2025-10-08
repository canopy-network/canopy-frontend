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
import {
  Wallet,
  Copy,
  ExternalLink,
  Plus,
  Activity,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Coins,
} from "lucide-react";

function WalletContent() {
  const { accounts, currentAccount, addAccount } = useWallet();

  const transactions = [
    {
      id: "1",
      type: "send",
      amount: "0.5 ETH",
      to: "0x742d...8D4C",
      status: "completed",
      timestamp: "2 hours ago",
    },
    {
      id: "2",
      type: "receive",
      amount: "1.2 CNPY",
      from: "0x123a...9F2E",
      status: "completed",
      timestamp: "5 hours ago",
    },
    {
      id: "3",
      type: "send",
      amount: "0.1 ETH",
      to: "0x456b...7A1B",
      status: "pending",
      timestamp: "1 day ago",
    },
  ];

  const copyAddress = () => {
    if (currentAccount) {
      navigator.clipboard.writeText(currentAccount.address);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-balance">Wallet</h1>
        <p className="text-muted-foreground mt-2 text-pretty">
          Manage your accounts, view balances, and track transaction history.
        </p>
      </div>

      {currentAccount ? (
        <div className="space-y-6">
          {/* Current Account */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Current Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-mono text-sm">{currentAccount.address}</p>
                </div>
                <Button variant="outline" size="sm" onClick={copyAddress}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Balance</p>
                  <p className="text-2xl font-bold">
                    {currentAccount.balance} ETH
                  </p>
                </div>
                <Badge variant="secondary">{currentAccount.chain}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Portfolio Overview */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Balance
                </CardTitle>
                <Coins className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$2,847.32</div>
                <p className="text-xs text-primary">+12.5% from last week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Chains
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{accounts.length}</div>
                <p className="text-xs text-muted-foreground">
                  Connected accounts
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  24h Change
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+5.7%</div>
                <p className="text-xs text-primary">+$162.45</p>
              </CardContent>
            </Card>
          </div>

          {/* All Accounts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>All Accounts</CardTitle>
                <CardDescription>
                  Manage your connected blockchain accounts
                </CardDescription>
              </div>
              <Button onClick={() => addAccount("Polygon")} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Account
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {accounts.map((account) => (
                  <div
                    key={account.address}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Wallet className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{account.chain}</p>
                        <p className="text-sm text-muted-foreground font-mono">
                          {account.address}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{account.balance} ETH</p>
                      <Badge
                        variant={account.isConnected ? "default" : "secondary"}
                      >
                        {account.isConnected ? "Connected" : "Disconnected"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest blockchain activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          tx.type === "send"
                            ? "bg-red-100 text-red-600"
                            : "bg-green-100 text-green-600"
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
                          {tx.type === "send"
                            ? `To ${tx.to}`
                            : `From ${tx.from}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{tx.amount}</p>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            tx.status === "completed" ? "default" : "secondary"
                          }
                        >
                          {tx.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Wallet Connected</CardTitle>
            <CardDescription>
              Connect your wallet to view account details and manage your
              assets.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Use the "Connect Wallet" button in the sidebar to get started.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function WalletPage() {
  return <WalletContent />;
}
