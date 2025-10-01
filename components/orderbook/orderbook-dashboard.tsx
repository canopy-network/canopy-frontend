"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OrderBookInterface } from "./orderbook-interface"
import { TradeHistory } from "./trade-history"
import { LiquidityProviders } from "./liquidity-providers"
import { CrossChainBridge } from "./cross-chain-bridge"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Activity, Users } from "lucide-react"

export function OrderBookDashboard() {
  const [activeTab, setActiveTab] = useState("trading")

  const stats = [
    {
      title: "Total Volume (24h)",
      value: "$12.4M",
      change: "+8.2%",
      trend: "up" as const,
      icon: TrendingUp,
    },
    {
      title: "Active Orders",
      value: "1,247",
      change: "+12",
      trend: "up" as const,
      icon: Activity,
    },
    {
      title: "Liquidity Providers",
      value: "89",
      change: "+5",
      trend: "up" as const,
      icon: Users,
    },
    {
      title: "Avg. Spread",
      value: "0.15%",
      change: "-0.02%",
      trend: "down" as const,
      icon: TrendingDown,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center space-x-1 text-xs">
                  <Badge
                    variant={stat.trend === "up" ? "default" : "secondary"}
                    className={stat.trend === "up" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}
                  >
                    {stat.change}
                  </Badge>
                  <span className="text-muted-foreground">vs yesterday</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trading">Order Book</TabsTrigger>
          <TabsTrigger value="history">Trade History</TabsTrigger>
          <TabsTrigger value="liquidity">Liquidity</TabsTrigger>
          <TabsTrigger value="bridge">Cross-Chain</TabsTrigger>
        </TabsList>

        <TabsContent value="trading" className="space-y-4">
          <OrderBookInterface />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <TradeHistory />
        </TabsContent>

        <TabsContent value="liquidity" className="space-y-4">
          <LiquidityProviders />
        </TabsContent>

        <TabsContent value="bridge" className="space-y-4">
          <CrossChainBridge />
        </TabsContent>
      </Tabs>
    </div>
  )
}
