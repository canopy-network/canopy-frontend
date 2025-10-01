"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plus, Info, Zap } from "lucide-react"

interface Token {
  symbol: string
  name: string
  balance: string
  price: number
  icon: string
}

const tokens: Token[] = [
  { symbol: "CNPY", name: "Canopy", balance: "1,234.56", price: 0.42, icon: "🌳" },
  { symbol: "DEFI", name: "DeFi Chain Alpha", balance: "567.89", price: 1.25, icon: "🔷" },
  { symbol: "GAME", name: "GameFi Universe", balance: "890.12", price: 0.85, icon: "🎮" },
  { symbol: "SUPPLY", name: "Supply Chain Pro", balance: "345.67", price: 2.1, icon: "📦" },
  { symbol: "ETH", name: "Ethereum", balance: "2.45", price: 2450.0, icon: "Ξ" },
  { symbol: "USDC", name: "USD Coin", balance: "5,678.90", price: 1.0, icon: "💵" },
]

export function LiquidityProvider() {
  const [token0] = useState(tokens[0]) // Always CNPY
  const [token1, setToken1] = useState(tokens[1])
  const [amount0, setAmount0] = useState("")
  const [amount1, setAmount1] = useState("")

  const calculateAmount1 = (amount: string) => {
    if (!amount || isNaN(Number(amount))) return ""
    const ratio = token0.price / token1.price
    return (Number(amount) * ratio).toFixed(6)
  }

  const handleAmount0Change = (value: string) => {
    setAmount0(value)
    setAmount1(calculateAmount1(value))
  }

  const totalValue = amount0 && amount1 ? Number(amount0) * token0.price + Number(amount1) * token1.price : 0
  const poolShare = totalValue > 0 ? (totalValue / 1000000) * 100 : 0

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Add Liquidity Interface */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add Liquidity
            </CardTitle>
            <CardDescription>Provide liquidity to CNPY hub pools and earn trading fees</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Token 0 (Always CNPY) */}
            <div className="space-y-2">
              <Label>CNPY Amount</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="0.0"
                    value={amount0}
                    onChange={(e) => handleAmount0Change(e.target.value)}
                    className="text-lg"
                  />
                </div>
                <Button variant="outline" className="min-w-32 gap-2 bg-transparent" disabled>
                  <span className="text-lg">{token0.icon}</span>
                  {token0.symbol}
                </Button>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Balance: {token0.balance}</span>
                <span>${token0.price.toFixed(2)}</span>
              </div>
            </div>

            {/* Plus Icon */}
            <div className="flex justify-center">
              <div className="p-2 rounded-full bg-muted">
                <Plus className="h-4 w-4" />
              </div>
            </div>

            {/* Token 1 */}
            <div className="space-y-2">
              <Label>Paired Token</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input placeholder="0.0" value={amount1} readOnly className="text-lg bg-muted" />
                </div>
                <Button variant="outline" className="min-w-32 gap-2 bg-transparent">
                  <span className="text-lg">{token1.icon}</span>
                  {token1.symbol}
                </Button>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Balance: {token1.balance}</span>
                <span>${token1.price.toFixed(2)}</span>
              </div>
            </div>

            <Separator />

            {/* Liquidity Details */}
            {amount0 && amount1 && (
              <div className="space-y-3 p-4 bg-muted rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Total Value</span>
                  <span className="font-medium">${totalValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Pool Share</span>
                  <span className="text-muted-foreground">{poolShare.toFixed(4)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>LP Tokens</span>
                  <span className="text-muted-foreground">
                    {Math.sqrt(Number(amount0) * Number(amount1)).toFixed(6)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Est. APR</span>
                  <span className="text-primary font-medium">12.5%</span>
                </div>
              </div>
            )}

            <Button className="w-full" size="lg" disabled={!amount0 || Number(amount0) <= 0}>
              {!amount0 ? "Enter Amount" : "Add Liquidity"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Liquidity Info & Stats */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Info className="h-4 w-4" />
              Pool Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Current Pool</span>
                <span className="font-medium">
                  {token0.symbol}/{token1.symbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Pool TVL</span>
                <span className="font-medium">$4.2M</span>
              </div>
              <div className="flex justify-between">
                <span>24h Volume</span>
                <span className="font-medium">$1.2M</span>
              </div>
              <div className="flex justify-between">
                <span>24h Fees</span>
                <span className="font-medium text-primary">$3,600</span>
              </div>
              <div className="flex justify-between">
                <span>Your Share</span>
                <span className="font-medium">0.12%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4" />
              CNPY Hub Benefits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground space-y-2">
              <p>• All pools paired with CNPY for universal liquidity</p>
              <p>• 83.3% of trading fees distributed to LPs</p>
              <p>• Auto-compounding rewards</p>
              <p>• Reduced impermanent loss risk</p>
            </div>
            <Badge variant="outline" className="w-full justify-center">
              Hub Pool Advantage
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your LP Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span>CNPY/DEFI</span>
                <div className="text-right">
                  <div className="font-medium">$2,450</div>
                  <div className="text-xs text-primary">+$45 fees</div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>CNPY/GAME</span>
                <div className="text-right">
                  <div className="font-medium">$1,200</div>
                  <div className="text-xs text-primary">+$28 fees</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
