"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Droplets, Users, Zap } from "lucide-react"

interface Pool {
  id: string
  pair: string
  token0: { symbol: string; icon: string }
  token1: { symbol: string; icon: string }
  tvl: string
  volume24h: string
  apr: number
  fees24h: string
  lpTokens: string
  utilization: number
  myLiquidity?: string
}

const pools: Pool[] = [
  {
    id: "1",
    pair: "CNPY/DEFI",
    token0: { symbol: "CNPY", icon: "🌳" },
    token1: { symbol: "DEFI", icon: "🔷" },
    tvl: "$4.2M",
    volume24h: "$1.2M",
    apr: 12.5,
    fees24h: "$3,600",
    lpTokens: "2.1M",
    utilization: 85,
    myLiquidity: "$2,450",
  },
  {
    id: "2",
    pair: "CNPY/GAME",
    token0: { symbol: "CNPY", icon: "🌳" },
    token1: { symbol: "GAME", icon: "🎮" },
    tvl: "$2.8M",
    volume24h: "$680K",
    apr: 15.8,
    fees24h: "$2,040",
    lpTokens: "1.4M",
    utilization: 65,
    myLiquidity: "$1,200",
  },
  {
    id: "3",
    pair: "CNPY/SUPPLY",
    token0: { symbol: "CNPY", icon: "🌳" },
    token1: { symbol: "SUPPLY", icon: "📦" },
    tvl: "$5.4M",
    volume24h: "$890K",
    apr: 10.2,
    fees24h: "$2,670",
    lpTokens: "2.7M",
    utilization: 92,
  },
  {
    id: "4",
    pair: "CNPY/ETH",
    token0: { symbol: "CNPY", icon: "🌳" },
    token1: { symbol: "ETH", icon: "Ξ" },
    tvl: "$8.1M",
    volume24h: "$2.1M",
    apr: 8.7,
    fees24h: "$6,300",
    lpTokens: "4.05M",
    utilization: 78,
  },
  {
    id: "5",
    pair: "CNPY/USDC",
    token0: { symbol: "CNPY", icon: "🌳" },
    token1: { symbol: "USDC", icon: "💵" },
    tvl: "$12.6M",
    volume24h: "$3.4M",
    apr: 6.8,
    fees24h: "$10,200",
    lpTokens: "6.3M",
    utilization: 95,
  },
]

export function LiquidityPools() {
  const totalTVL = pools.reduce(
    (sum, pool) => sum + Number.parseFloat(pool.tvl.replace("$", "").replace("M", "")) * 1000000,
    0,
  )
  const totalVolume = pools.reduce(
    (sum, pool) => sum + Number.parseFloat(pool.volume24h.replace("$", "").replace("K", "").replace("M", "")) * 1000,
    0,
  )

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total TVL</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalTVL / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-primary">Across all pools</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">24h Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalVolume / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-primary">+18.2% from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Pools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pools.length}</div>
            <p className="text-xs text-muted-foreground">CNPY hub pairs</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {pools.map((pool) => (
          <Card key={pool.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <span className="text-xl">{pool.token0.icon}</span>
                      <span className="text-xl">{pool.token1.icon}</span>
                    </div>
                    <CardTitle className="text-xl">{pool.pair}</CardTitle>
                    <Badge variant="outline" className="gap-1">
                      <Zap className="h-3 w-3" />
                      Hub Pool
                    </Badge>
                  </div>
                  {pool.myLiquidity && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Your Liquidity: {pool.myLiquidity}</Badge>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">Add Liquidity</Button>
                  {pool.myLiquidity && <Button variant="outline">Remove</Button>}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    Total Value Locked
                  </div>
                  <div className="text-2xl font-bold">{pool.tvl}</div>
                  <div className="text-xs text-muted-foreground">{pool.lpTokens} LP tokens</div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Droplets className="h-4 w-4" />
                    24h Volume
                  </div>
                  <div className="text-2xl font-bold">{pool.volume24h}</div>
                  <div className="text-xs text-muted-foreground">Fees: {pool.fees24h}</div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    APR
                  </div>
                  <div className="text-2xl font-bold text-primary">{pool.apr}%</div>
                  <div className="text-xs text-muted-foreground">LP rewards</div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    Utilization
                  </div>
                  <div className="text-2xl font-bold">{pool.utilization}%</div>
                  <Progress value={pool.utilization} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
