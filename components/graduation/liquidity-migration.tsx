"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle, Clock, AlertCircle } from "lucide-react"

interface MigrationStep {
  id: string
  name: string
  status: "pending" | "in-progress" | "completed" | "failed"
  description: string
  progress: number
}

export function LiquidityMigration() {
  const migrationSteps: MigrationStep[] = [
    {
      id: "1",
      name: "Pause Virtual Pool",
      status: "completed",
      description: "Temporarily halt trading on bonding curve",
      progress: 100,
    },
    {
      id: "2",
      name: "Calculate Final Price",
      status: "completed",
      description: "Determine final token price from bonding curve",
      progress: 100,
    },
    {
      id: "3",
      name: "Create AMM Pool",
      status: "in-progress",
      description: "Initialize CNPY-paired liquidity pool",
      progress: 75,
    },
    {
      id: "4",
      name: "Migrate Liquidity",
      status: "pending",
      description: "Transfer assets from virtual to real pool",
      progress: 0,
    },
    {
      id: "5",
      name: "Enable Trading",
      status: "pending",
      description: "Activate AMM trading with full liquidity",
      progress: 0,
    },
  ]

  const getStatusIcon = (status: MigrationStep["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "in-progress":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
    }
  }

  const getStatusColor = (status: MigrationStep["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-500"
      case "in-progress":
        return "bg-yellow-500/10 text-yellow-500"
      case "failed":
        return "bg-red-500/10 text-red-500"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Liquidity Migration Process</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Migration Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">$2.4M</div>
            <div className="text-sm text-muted-foreground">Virtual Pool TVL</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">$1.2455</div>
            <div className="text-sm text-muted-foreground">Final Token Price</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">75%</div>
            <div className="text-sm text-muted-foreground">Migration Progress</div>
          </div>
        </div>

        {/* Migration Steps */}
        <div className="space-y-4">
          {migrationSteps.map((step, index) => (
            <div key={step.id} className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                {getStatusIcon(step.status)}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-medium">{step.name}</div>
                    <div className="text-sm text-muted-foreground">{step.description}</div>
                  </div>
                  <Badge className={getStatusColor(step.status)}>{step.status.replace("-", " ")}</Badge>
                </div>

                {step.status === "in-progress" && <Progress value={step.progress} className="w-full" />}
              </div>

              {index < migrationSteps.length - 1 && <ArrowRight className="w-4 h-4 text-muted-foreground" />}
            </div>
          ))}
        </div>

        {/* Migration Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <h4 className="font-medium mb-2">Source (Virtual Pool)</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>CNPY Tokens:</span>
                <span className="font-mono">1,926,829</span>
              </div>
              <div className="flex justify-between">
                <span>USDC Value:</span>
                <span className="font-mono">$2,400,000</span>
              </div>
              <div className="flex justify-between">
                <span>Bonding Curve:</span>
                <span className="font-mono">y = 0.0001x²</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Destination (AMM Pool)</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>CNPY Amount:</span>
                <span className="font-mono">1,926,829</span>
              </div>
              <div className="flex justify-between">
                <span>USDC Amount:</span>
                <span className="font-mono">$2,400,000</span>
              </div>
              <div className="flex justify-between">
                <span>Initial Price:</span>
                <span className="font-mono">$1.2455</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-4">
          <Button variant="outline" className="flex-1 bg-transparent">
            Pause Migration
          </Button>
          <Button className="flex-1">Continue Migration</Button>
        </div>
      </CardContent>
    </Card>
  )
}
