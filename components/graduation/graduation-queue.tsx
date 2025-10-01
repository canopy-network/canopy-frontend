"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Clock, AlertTriangle, Rocket, Target, Users } from "lucide-react"

interface GraduationCandidate {
  id: string
  name: string
  description: string
  creator: string
  progress: number
  raised: string
  target: string
  participants: number
  timeToGraduation: string
  status: "ready" | "pending" | "processing"
  estimatedDeployTime: string
  validatorsReady: number
  liquidityAmount: string
}

const candidates: GraduationCandidate[] = [
  {
    id: "1",
    name: "DeFi Chain Alpha",
    description: "Next-generation DeFi infrastructure with cross-chain compatibility",
    creator: "0x742d...8D4",
    progress: 100,
    raised: "600,000",
    target: "600,000",
    participants: 234,
    timeToGraduation: "Ready",
    status: "ready",
    estimatedDeployTime: "3-5 minutes",
    validatorsReady: 3,
    liquidityAmount: "$720,000",
  },
  {
    id: "2",
    name: "GameFi Universe",
    description: "Gaming-focused blockchain with built-in NFT marketplace",
    creator: "0x123a...9F2",
    progress: 98,
    raised: "392,000",
    target: "400,000",
    participants: 156,
    timeToGraduation: "~2 hours",
    status: "pending",
    estimatedDeployTime: "4-6 minutes",
    validatorsReady: 2,
    liquidityAmount: "$470,400",
  },
  {
    id: "3",
    name: "Enterprise Chain",
    description: "Private blockchain for enterprise supply chain management",
    creator: "0x456b...7A1",
    progress: 95,
    raised: "760,000",
    target: "800,000",
    participants: 89,
    timeToGraduation: "~6 hours",
    status: "pending",
    estimatedDeployTime: "5-7 minutes",
    validatorsReady: 4,
    liquidityAmount: "$912,000",
  },
]

export function GraduationQueue() {
  const readyCandidates = candidates.filter((c) => c.status === "ready")
  const pendingCandidates = candidates.filter((c) => c.status === "pending")

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ready":
        return <CheckCircle className="h-4 w-4 text-primary" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "processing":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "bg-primary/10 text-primary"
      case "pending":
        return "bg-yellow-500/10 text-yellow-600"
      case "processing":
        return "bg-orange-500/10 text-orange-600"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ready to Graduate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{readyCandidates.length}</div>
            <p className="text-xs text-muted-foreground">Threshold reached</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Graduation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCandidates.length}</div>
            <p className="text-xs text-muted-foreground">Approaching threshold</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Liquidity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2.1M</div>
            <p className="text-xs text-muted-foreground">Ready for migration</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {candidates.map((candidate) => (
          <Card key={candidate.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(candidate.status)}
                    <CardTitle className="text-xl">{candidate.name}</CardTitle>
                    <Badge className={getStatusColor(candidate.status)}>{candidate.status}</Badge>
                  </div>
                  <CardDescription className="text-pretty max-w-2xl">{candidate.description}</CardDescription>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Creator: {candidate.creator}</span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {candidate.participants} participants
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {candidate.timeToGraduation}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {candidate.status === "ready" && (
                    <Button className="gap-2">
                      <Rocket className="h-4 w-4" />
                      Deploy Chain
                    </Button>
                  )}
                  <Button variant="outline">View Details</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Progress & Funding */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Funding Progress</span>
                      <span className="font-medium">
                        ${candidate.raised} / ${candidate.target} CNPY
                      </span>
                    </div>
                    <Progress value={candidate.progress} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{candidate.progress}% complete</span>
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {candidate.progress >= 100 ? "Threshold reached" : "To graduation"}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Liquidity to Migrate</div>
                      <div className="font-medium">{candidate.liquidityAmount}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Validators Ready</div>
                      <div className="font-medium">{candidate.validatorsReady} nodes</div>
                    </div>
                  </div>
                </div>

                {/* Deployment Info */}
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg space-y-3">
                    <h4 className="font-medium text-sm">Deployment Plan</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Est. Deploy Time</span>
                        <span>{candidate.estimatedDeployTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Chain Genesis</span>
                        <span>Auto-generated</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Initial Validators</span>
                        <span>{candidate.validatorsReady} ready</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">AMM Pool Creation</span>
                        <span>Automatic</span>
                      </div>
                    </div>
                  </div>

                  {candidate.status === "ready" && (
                    <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                      <div className="flex items-center gap-2 text-sm text-primary font-medium">
                        <CheckCircle className="h-4 w-4" />
                        Ready for immediate deployment
                      </div>
                      <p className="text-xs text-primary/80 mt-1">
                        All requirements met. Chain can be deployed with zero downtime migration.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
