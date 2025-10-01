"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Shield, Target, Clock } from "lucide-react"

interface StakingOpportunity {
  id: string
  chain: string
  validator: string
  apr: number
  minStake: string
  lockupPeriod: string
  risk: "low" | "medium" | "high"
  totalStaked: string
  capacity: number
  rewards: string
  description: string
}

const opportunities: StakingOpportunity[] = [
  {
    id: "1",
    chain: "DeFi Chain Alpha",
    validator: "Validator Alpha",
    apr: 12.5,
    minStake: "100 CNPY",
    lockupPeriod: "21 days",
    risk: "low",
    totalStaked: "1.2M CNPY",
    capacity: 85,
    rewards: "Daily",
    description: "High-performance validator with consistent rewards and excellent uptime",
  },
  {
    id: "2",
    chain: "GameFi Universe",
    validator: "GameFi Node",
    apr: 15.8,
    minStake: "50 CNPY",
    lockupPeriod: "14 days",
    risk: "medium",
    totalStaked: "650K CNPY",
    capacity: 65,
    rewards: "Daily",
    description: "Gaming-focused validator with higher rewards but moderate risk",
  },
  {
    id: "3",
    chain: "Supply Chain Pro",
    validator: "Enterprise Secure",
    apr: 10.5,
    minStake: "200 CNPY",
    lockupPeriod: "28 days",
    risk: "low",
    totalStaked: "1.8M CNPY",
    capacity: 92,
    rewards: "Weekly",
    description: "Enterprise-grade validator with stable returns and maximum security",
  },
  {
    id: "4",
    chain: "DeFi Chain Alpha",
    validator: "Staking Pro",
    apr: 13.2,
    minStake: "75 CNPY",
    lockupPeriod: "21 days",
    risk: "low",
    totalStaked: "890K CNPY",
    capacity: 70,
    rewards: "Daily",
    description: "Low commission validator optimized for maximum delegator returns",
  },
]

export function StakingOpportunities() {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "bg-primary/10 text-primary"
      case "medium":
        return "bg-yellow-500/10 text-yellow-600"
      case "high":
        return "bg-destructive/10 text-destructive"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Best APR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">15.8%</div>
            <p className="text-xs text-muted-foreground">GameFi Universe</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Lockup</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">21 days</div>
            <p className="text-xs text-muted-foreground">Unbonding period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{opportunities.length}</div>
            <p className="text-xs text-muted-foreground">Active validators</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Min Stake</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">50 CNPY</div>
            <p className="text-xs text-muted-foreground">Lowest minimum</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {opportunities.map((opportunity) => (
          <Card key={opportunity.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{opportunity.validator}</CardTitle>
                    <Badge variant="outline">{opportunity.chain}</Badge>
                    <Badge className={getRiskColor(opportunity.risk)}>{opportunity.risk} risk</Badge>
                  </div>
                  <CardDescription className="text-pretty">{opportunity.description}</CardDescription>
                </div>
                <Button className="shrink-0">Stake Now</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    Annual Percentage Rate
                  </div>
                  <div className="text-2xl font-bold text-primary">{opportunity.apr}%</div>
                  <div className="text-xs text-muted-foreground">Rewards: {opportunity.rewards}</div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Target className="h-4 w-4" />
                    Minimum Stake
                  </div>
                  <div className="text-xl font-bold">{opportunity.minStake}</div>
                  <div className="text-xs text-muted-foreground">Entry requirement</div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Lockup Period
                  </div>
                  <div className="text-xl font-bold">{opportunity.lockupPeriod}</div>
                  <div className="text-xs text-muted-foreground">Unbonding time</div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    Capacity
                  </div>
                  <div className="text-xl font-bold">{opportunity.capacity}%</div>
                  <Progress value={opportunity.capacity} className="h-2" />
                  <div className="text-xs text-muted-foreground">Total: {opportunity.totalStaked}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
