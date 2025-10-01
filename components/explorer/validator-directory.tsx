"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Shield, TrendingUp, AlertTriangle, CheckCircle, Users } from "lucide-react"

interface Validator {
  id: string
  name: string
  address: string
  chain: string
  status: "active" | "jailed" | "inactive"
  uptime: number
  commission: number
  delegators: number
  totalStaked: string
  apr: number
  slashingHistory: number
  description: string
}

const validators: Validator[] = [
  {
    id: "1",
    name: "Validator Alpha",
    address: "canopyval1abc123def456ghi789jkl012mno345pqr678stu",
    chain: "DeFi Chain Alpha",
    status: "active",
    uptime: 99.8,
    commission: 5.0,
    delegators: 234,
    totalStaked: "1.2M",
    apr: 12.5,
    slashingHistory: 0,
    description: "Professional validator with 99.8% uptime and enterprise-grade infrastructure",
  },
  {
    id: "2",
    name: "Staking Pro",
    address: "canopyval1def456ghi789jkl012mno345pqr678stu901vwx",
    chain: "DeFi Chain Alpha",
    status: "active",
    uptime: 99.5,
    commission: 3.5,
    delegators: 189,
    totalStaked: "890K",
    apr: 13.2,
    slashingHistory: 0,
    description: "Low commission validator focused on maximizing delegator rewards",
  },
  {
    id: "3",
    name: "GameFi Node",
    address: "canopyval1ghi789jkl012mno345pqr678stu901vwx234yza",
    chain: "GameFi Universe",
    status: "active",
    uptime: 98.9,
    commission: 7.0,
    delegators: 156,
    totalStaked: "650K",
    apr: 11.8,
    slashingHistory: 1,
    description: "Gaming-focused validator with specialized infrastructure for GameFi applications",
  },
  {
    id: "4",
    name: "Enterprise Secure",
    address: "canopyval1jkl012mno345pqr678stu901vwx234yza567bcd",
    chain: "Supply Chain Pro",
    status: "active",
    uptime: 99.9,
    commission: 4.0,
    delegators: 298,
    totalStaked: "1.8M",
    apr: 10.5,
    slashingHistory: 0,
    description: "Enterprise-grade validator with highest security standards and compliance",
  },
  {
    id: "5",
    name: "Community Node",
    address: "canopyval1mno345pqr678stu901vwx234yza567bcd890efg",
    chain: "DeFi Chain Alpha",
    status: "jailed",
    uptime: 95.2,
    commission: 2.0,
    delegators: 67,
    totalStaked: "320K",
    apr: 0,
    slashingHistory: 3,
    description: "Community-run validator currently jailed due to recent downtime",
  },
]

export function ValidatorDirectory() {
  const activeValidators = validators.filter((v) => v.status === "active")
  const jailedValidators = validators.filter((v) => v.status === "jailed")

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Validators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeValidators.length}</div>
            <p className="text-xs text-primary">Across all chains</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average APR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(activeValidators.reduce((sum, v) => sum + v.apr, 0) / activeValidators.length).toFixed(1)}%
            </div>
            <p className="text-xs text-primary">Staking rewards</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Staked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$4.86M</div>
            <p className="text-xs text-primary">Across all validators</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {validators.map((validator) => (
          <Card key={validator.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {validator.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{validator.name}</CardTitle>
                      <Badge variant={validator.status === "active" ? "default" : "destructive"}>
                        {validator.status}
                      </Badge>
                      <Badge variant="outline">{validator.chain}</Badge>
                    </div>
                    <CardDescription className="text-pretty max-w-2xl">{validator.description}</CardDescription>
                    <div className="text-xs text-muted-foreground font-mono">{validator.address}</div>
                  </div>
                </div>
                <Button variant="outline" disabled={validator.status !== "active"}>
                  {validator.status === "active" ? "Delegate" : "Unavailable"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    Uptime
                  </div>
                  <div className="text-xl font-bold">{validator.uptime}%</div>
                  <Progress value={validator.uptime} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    APR
                  </div>
                  <div className="text-xl font-bold text-primary">{validator.apr}%</div>
                  <div className="text-xs text-muted-foreground">Commission: {validator.commission}%</div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    Delegators
                  </div>
                  <div className="text-xl font-bold">{validator.delegators}</div>
                  <div className="text-xs text-muted-foreground">Total: ${validator.totalStaked}</div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {validator.slashingHistory === 0 ? (
                      <CheckCircle className="h-4 w-4 text-primary" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    )}
                    Slashing History
                  </div>
                  <div className="text-xl font-bold">
                    {validator.slashingHistory === 0 ? "Clean" : validator.slashingHistory}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {validator.slashingHistory === 0 ? "No incidents" : `${validator.slashingHistory} incidents`}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
