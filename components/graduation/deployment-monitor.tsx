"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, AlertCircle, Loader2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DeploymentStep {
  id: string
  name: string
  description: string
  status: "completed" | "in-progress" | "pending" | "failed"
  duration?: string
  details?: string
}

interface Deployment {
  id: string
  chainName: string
  status: "deploying" | "completed" | "failed"
  startTime: string
  completionTime?: string
  progress: number
  steps: DeploymentStep[]
  chainId?: string
  rpcEndpoint?: string
  explorerUrl?: string
}

const activeDeployments: Deployment[] = [
  {
    id: "1",
    chainName: "DeFi Chain Alpha",
    status: "deploying",
    startTime: "2 minutes ago",
    progress: 75,
    steps: [
      {
        id: "1",
        name: "Genesis Block Creation",
        description: "Generating initial chain state and configuration",
        status: "completed",
        duration: "15s",
      },
      {
        id: "2",
        name: "Validator Network Bootstrap",
        description: "Initializing validator nodes and consensus",
        status: "completed",
        duration: "45s",
      },
      {
        id: "3",
        name: "Liquidity Migration",
        description: "Moving bonding curve liquidity to AMM pool",
        status: "in-progress",
        details: "Migrating $720,000 to CNPY/DEFI pool",
      },
      {
        id: "4",
        name: "Chain Activation",
        description: "Enabling public transactions and API endpoints",
        status: "pending",
      },
      {
        id: "5",
        name: "Explorer Integration",
        description: "Adding chain to Canopy explorer and indexing",
        status: "pending",
      },
    ],
  },
]

const recentDeployments: Deployment[] = [
  {
    id: "2",
    chainName: "Supply Chain Pro",
    status: "completed",
    startTime: "2 hours ago",
    completionTime: "4 minutes 23 seconds",
    progress: 100,
    chainId: "canopy-supply-1",
    rpcEndpoint: "https://rpc.supply.canopy.network",
    explorerUrl: "https://explorer.canopy.network/supply",
    steps: [
      {
        id: "1",
        name: "Genesis Block Creation",
        description: "Generating initial chain state and configuration",
        status: "completed",
        duration: "12s",
      },
      {
        id: "2",
        name: "Validator Network Bootstrap",
        description: "Initializing validator nodes and consensus",
        status: "completed",
        duration: "38s",
      },
      {
        id: "3",
        name: "Liquidity Migration",
        description: "Moving bonding curve liquidity to AMM pool",
        status: "completed",
        duration: "1m 45s",
      },
      {
        id: "4",
        name: "Chain Activation",
        description: "Enabling public transactions and API endpoints",
        status: "completed",
        duration: "25s",
      },
      {
        id: "5",
        name: "Explorer Integration",
        description: "Adding chain to Canopy explorer and indexing",
        status: "completed",
        duration: "1m 23s",
      },
    ],
  },
  {
    id: "3",
    chainName: "GameFi Universe",
    status: "completed",
    startTime: "1 day ago",
    completionTime: "3 minutes 56 seconds",
    progress: 100,
    chainId: "canopy-gamefi-1",
    rpcEndpoint: "https://rpc.gamefi.canopy.network",
    explorerUrl: "https://explorer.canopy.network/gamefi",
    steps: [
      {
        id: "1",
        name: "Genesis Block Creation",
        status: "completed",
        description: "",
        duration: "18s",
      },
      {
        id: "2",
        name: "Validator Network Bootstrap",
        status: "completed",
        description: "",
        duration: "42s",
      },
      {
        id: "3",
        name: "Liquidity Migration",
        status: "completed",
        description: "",
        duration: "1m 28s",
      },
      {
        id: "4",
        name: "Chain Activation",
        status: "completed",
        description: "",
        duration: "31s",
      },
      {
        id: "5",
        name: "Explorer Integration",
        status: "completed",
        description: "",
        duration: "57s",
      },
    ],
  },
]

export function DeploymentMonitor() {
  const getStepIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-primary" />
      case "in-progress":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-destructive" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-primary/10 text-primary"
      case "deploying":
        return "bg-blue-500/10 text-blue-600"
      case "failed":
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
            <CardTitle className="text-sm font-medium">Active Deployments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeDeployments.length}</div>
            <p className="text-xs text-muted-foreground">Currently deploying</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">99.9%</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Deploy Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2 min</div>
            <p className="text-xs text-muted-foreground">Last 30 deployments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Chains Deployed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-primary">+3 this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Deployments */}
      {activeDeployments.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Active Deployments</h3>
          {activeDeployments.map((deployment) => (
            <Card key={deployment.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">{deployment.chainName}</CardTitle>
                      <Badge className={getStatusColor(deployment.status)}>{deployment.status}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">Started {deployment.startTime}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{deployment.progress}%</div>
                    <div className="text-xs text-muted-foreground">Complete</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Progress value={deployment.progress} className="h-2" />

                  <div className="space-y-3">
                    {deployment.steps.map((step, index) => (
                      <div key={step.id} className="flex items-start gap-3">
                        <div className="mt-0.5">{getStepIcon(step.status)}</div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{step.name}</span>
                            {step.duration && <span className="text-xs text-muted-foreground">{step.duration}</span>}
                          </div>
                          <p className="text-xs text-muted-foreground">{step.description}</p>
                          {step.details && <p className="text-xs text-blue-600">{step.details}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Recent Deployments */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Recent Deployments</h3>
        {recentDeployments.map((deployment) => (
          <Card key={deployment.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl">{deployment.chainName}</CardTitle>
                    <Badge className={getStatusColor(deployment.status)}>{deployment.status}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Deployed {deployment.startTime} in {deployment.completionTime}
                  </div>
                </div>
                <div className="flex gap-2">
                  {deployment.explorerUrl && (
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                      <ExternalLink className="h-4 w-4" />
                      Explorer
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    View Chain
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Chain ID</div>
                  <div className="font-mono text-sm">{deployment.chainId}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">RPC Endpoint</div>
                  <div className="font-mono text-sm truncate">{deployment.rpcEndpoint}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Status</div>
                  <div className="flex items-center gap-1 text-sm">
                    <CheckCircle className="h-3 w-3 text-primary" />
                    Operational
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
