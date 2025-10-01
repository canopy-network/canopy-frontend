"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { TrendingUp, Wallet, Award, Clock } from "lucide-react"

const portfolioData = [
  { name: "DeFi Chain Alpha", value: 45, amount: "$2,250", color: "hsl(var(--primary))" },
  { name: "GameFi Universe", value: 30, amount: "$1,500", color: "hsl(var(--chart-2))" },
  { name: "Supply Chain Pro", value: 25, amount: "$1,250", color: "hsl(var(--chart-3))" },
]

const stakingPositions = [
  {
    id: "1",
    chain: "DeFi Chain Alpha",
    validator: "Validator Alpha",
    amount: "1,500 CNPY",
    value: "$1,800",
    apr: 12.5,
    rewards: "45.2 CNPY",
    status: "active",
    unbondingTime: null,
  },
  {
    id: "2",
    chain: "GameFi Universe",
    validator: "GameFi Node",
    amount: "800 CNPY",
    value: "$960",
    apr: 15.8,
    rewards: "28.7 CNPY",
    status: "active",
    unbondingTime: null,
  },
  {
    id: "3",
    chain: "Supply Chain Pro",
    validator: "Enterprise Secure",
    amount: "600 CNPY",
    value: "$720",
    apr: 10.5,
    rewards: "18.9 CNPY",
    status: "unbonding",
    unbondingTime: "12 days",
  },
]

const rewardsHistory = [
  { month: "Jan", rewards: 45 },
  { month: "Feb", rewards: 52 },
  { month: "Mar", rewards: 48 },
  { month: "Apr", rewards: 61 },
  { month: "May", rewards: 58 },
  { month: "Jun", rewards: 67 },
]

export function PortfolioView() {
  const totalValue = portfolioData.reduce(
    (sum, item) => sum + Number.parseFloat(item.amount.replace("$", "").replace(",", "")),
    0,
  )
  const totalRewards = stakingPositions.reduce((sum, pos) => sum + Number.parseFloat(pos.rewards.split(" ")[0]), 0)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
            <p className="text-xs text-primary flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +12.5% this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Stakes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stakingPositions.filter((p) => p.status === "active").length}</div>
            <p className="text-xs text-muted-foreground">Earning rewards</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRewards.toFixed(1)} CNPY</div>
            <p className="text-xs text-primary">+8.2 this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg APR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.9%</div>
            <p className="text-xs text-muted-foreground">Weighted average</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Portfolio Allocation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Portfolio Allocation
            </CardTitle>
            <CardDescription>Distribution across chains</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={portfolioData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {portfolioData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${value}%`,
                      portfolioData.find((d) => d.name === name)?.amount,
                    ]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {portfolioData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">{item.amount}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rewards History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Rewards History
            </CardTitle>
            <CardDescription>Monthly staking rewards earned</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rewardsHistory}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-muted-foreground" />
                  <YAxis className="text-muted-foreground" />
                  <Tooltip
                    formatter={(value: number) => [`${value} CNPY`, "Rewards"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="rewards" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staking Positions */}
      <Card>
        <CardHeader>
          <CardTitle>Staking Positions</CardTitle>
          <CardDescription>Your active and pending staking positions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stakingPositions.map((position) => (
              <div key={position.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{position.validator}</span>
                    <Badge variant="outline">{position.chain}</Badge>
                    <Badge variant={position.status === "active" ? "default" : "secondary"}>{position.status}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{position.amount}</span>
                    <span>{position.value}</span>
                    <span className="text-primary">{position.apr}% APR</span>
                    {position.unbondingTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {position.unbondingTime} left
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="font-medium text-primary">+{position.rewards}</div>
                  <div className="text-xs text-muted-foreground">Rewards earned</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
