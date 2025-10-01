"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SwapInterface } from "./swap-interface"
import { LiquidityPools } from "./liquidity-pools"
import { LiquidityProvider } from "./liquidity-provider"
import { PoolAnalytics } from "./pool-analytics"
import { TrendingUp, Droplets, ArrowUpDown, BarChart3 } from "lucide-react"

const ammStats = [
  {
    title: "Total Value Locked",
    value: "$12.4M",
    change: "+18.2%",
    icon: TrendingUp,
  },
  {
    title: "24h Volume",
    value: "$2.8M",
    change: "+12.5%",
    icon: ArrowUpDown,
  },
  {
    title: "Active Pools",
    value: "24",
    change: "+3 this week",
    icon: Droplets,
  },
  {
    title: "LP Rewards",
    value: "8.4%",
    change: "Average APR",
    icon: BarChart3,
  },
]

export function AMMDashboard() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-balance">AMM Hub</h1>
        <p className="text-muted-foreground mt-2 text-pretty">
          Universal liquidity with CNPY hub pools. Trade, provide liquidity, and earn fees across all chains.
        </p>
      </div>

      {/* AMM Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {ammStats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-primary">{stat.change}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main AMM Interface */}
      <Tabs defaultValue="swap" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="swap">Swap</TabsTrigger>
          <TabsTrigger value="pools">Pools</TabsTrigger>
          <TabsTrigger value="liquidity">Add Liquidity</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="swap">
          <SwapInterface />
        </TabsContent>

        <TabsContent value="pools">
          <LiquidityPools />
        </TabsContent>

        <TabsContent value="liquidity">
          <LiquidityProvider />
        </TabsContent>

        <TabsContent value="analytics">
          <PoolAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  )
}
