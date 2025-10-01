"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUpDown, Clock, CheckCircle, AlertCircle } from "lucide-react"

interface BridgeTransaction {
  id: string
  fromChain: string
  toChain: string
  amount: number
  token: string
  status: "pending" | "completed" | "failed"
  timestamp: string
  txHash: string
  estimatedTime: string
}

export function CrossChainBridge() {
  const [fromChain, setFromChain] = useState("ethereum")
  const [toChain, setToChain] = useState("polygon")
  const [amount, setAmount] = useState("")
  const [token, setToken] = useState("CNPY")

  const chains = [
    { id: "ethereum", name: "Ethereum", icon: "🔷" },
    { id: "polygon", name: "Polygon", icon: "🟣" },
    { id: "arbitrum", name: "Arbitrum", icon: "🔵" },
    { id: "optimism", name: "Optimism", icon: "🔴" },
    { id: "base", name: "Base", icon: "🔵" },
    { id: "avalanche", name: "Avalanche", icon: "🔺" },
  ]

  const tokens = ["CNPY", "USDC", "USDT", "ETH"]

  const recentTransactions: BridgeTransaction[] = [
    {
      id: "1",
      fromChain: "Ethereum",
      toChain: "Polygon",
      amount: 25000,
      token: "CNPY",
      status: "completed",
      timestamp: "2024-01-15 14:32:15",
      txHash: "0x1234...5678",
      estimatedTime: "5 minutes",
    },
    {
      id: "2",
      fromChain: "Arbitrum",
      toChain: "Ethereum",
      amount: 50000,
      token: "USDC",
      status: "pending",
      timestamp: "2024-01-15 14:28:42",
      txHash: "0x2345...6789",
      estimatedTime: "12 minutes",
    },
    {
      id: "3",
      fromChain: "Polygon",
      toChain: "Base",
      amount: 15000,
      token: "CNPY",
      status: "failed",
      timestamp: "2024-01-15 14:15:33",
      txHash: "0x3456...7890",
      estimatedTime: "8 minutes",
    },
  ]

  const swapChains = () => {
    const temp = fromChain
    setFromChain(toChain)
    setToChain(temp)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bridge Interface */}
        <Card>
          <CardHeader>
            <CardTitle>Cross-Chain Bridge</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* From Chain */}
            <div className="space-y-2">
              <Label>From</Label>
              <div className="space-y-2">
                <Select value={fromChain} onValueChange={setFromChain}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {chains.map((chain) => (
                      <SelectItem key={chain.id} value={chain.id}>
                        <div className="flex items-center space-x-2">
                          <span>{chain.icon}</span>
                          <span>{chain.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex space-x-2">
                  <Select value={token} onValueChange={setToken}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tokens.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="0.0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="flex-1"
                  />
                </div>
                <div className="text-xs text-muted-foreground">Balance: 125,000 {token}</div>
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={swapChains}
                className="rounded-full w-10 h-10 p-0 bg-transparent"
              >
                <ArrowUpDown className="w-4 h-4" />
              </Button>
            </div>

            {/* To Chain */}
            <div className="space-y-2">
              <Label>To</Label>
              <div className="space-y-2">
                <Select value={toChain} onValueChange={setToChain}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {chains
                      .filter((chain) => chain.id !== fromChain)
                      .map((chain) => (
                        <SelectItem key={chain.id} value={chain.id}>
                          <div className="flex items-center space-x-2">
                            <span>{chain.icon}</span>
                            <span>{chain.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <div className="p-3 bg-muted rounded">
                  <div className="text-sm">You will receive</div>
                  <div className="text-lg font-bold">
                    {amount ? `${Number.parseFloat(amount).toLocaleString()} ${token}` : `0 ${token}`}
                  </div>
                </div>
              </div>
            </div>

            {/* Bridge Details */}
            <div className="space-y-2 p-3 bg-muted/50 rounded">
              <div className="flex justify-between text-sm">
                <span>Bridge Fee:</span>
                <span>0.1% (~${amount ? (Number.parseFloat(amount) * 0.001 * 1.245).toFixed(2) : "0.00"})</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Gas Fee:</span>
                <span>~$12.50</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Estimated Time:</span>
                <span>8-12 minutes</span>
              </div>
            </div>

            <Button className="w-full" disabled={!amount}>
              Bridge {token}
            </Button>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Bridge Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                      {tx.status === "completed" && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {tx.status === "pending" && <Clock className="w-4 h-4 text-yellow-500" />}
                      {tx.status === "failed" && <AlertCircle className="w-4 h-4 text-red-500" />}
                    </div>
                    <div>
                      <div className="text-sm font-medium">
                        {tx.amount.toLocaleString()} {tx.token}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {tx.fromChain} → {tx.toChain}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        tx.status === "completed" ? "default" : tx.status === "pending" ? "secondary" : "destructive"
                      }
                      className={
                        tx.status === "completed"
                          ? "bg-green-500/10 text-green-500"
                          : tx.status === "pending"
                            ? "bg-yellow-500/10 text-yellow-500"
                            : "bg-red-500/10 text-red-500"
                      }
                    >
                      {tx.status}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">{tx.estimatedTime}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bridge Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Volume (24h)</div>
            <div className="text-2xl font-bold">$2.4M</div>
            <div className="text-xs text-green-500">+12.5%</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Active Bridges</div>
            <div className="text-2xl font-bold">156</div>
            <div className="text-xs text-muted-foreground">transactions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Avg. Time</div>
            <div className="text-2xl font-bold">9.2m</div>
            <div className="text-xs text-green-500">-1.3m</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Success Rate</div>
            <div className="text-2xl font-bold">99.2%</div>
            <div className="text-xs text-green-500">+0.1%</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
