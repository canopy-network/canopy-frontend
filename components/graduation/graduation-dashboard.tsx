"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GraduationQueue } from "./graduation-queue"
import { DeploymentMonitor } from "./deployment-monitor"
import { ValidatorBootstrap } from "./validator-bootstrap"
import { LiquidityMigration } from "./liquidity-migration"
import { Rocket, CheckCircle, Clock, Zap } from "lucide-react"

const graduationStats = [
  {
    title: "Pending Graduations",
    value: "3",
    change: "Ready to deploy",
    icon: Clock,
  },
  {
    title: "Success Rate",
    value: "99.9%",
    change: "All time",
    icon: CheckCircle,
  },
  {
    title: "Avg Deploy Time",
    value: "4.2 min",
    change: "Threshold to live",
    icon: Zap,
  },
  {
    title: "Total Graduated",
    value: "47",
    change: "+12 this month",
    icon: Rocket,
  },
]

export function GraduationDashboard() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-balance">Graduation & Deployment</h1>
        <p className="text-muted-foreground mt-2 text-pretty">
          Automated orchestration for chain deployment once bonding curve thresholds are met.
        </p>
      </div>

      {/* Graduation Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {graduationStats.map((stat) => {
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

      {/* Graduation System Tabs */}
      <Tabs defaultValue="queue" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="queue">Graduation Queue</TabsTrigger>
          <TabsTrigger value="deployment">Deployment Monitor</TabsTrigger>
          <TabsTrigger value="validators">Validator Bootstrap</TabsTrigger>
          <TabsTrigger value="migration">Liquidity Migration</TabsTrigger>
        </TabsList>

        <TabsContent value="queue">
          <GraduationQueue />
        </TabsContent>

        <TabsContent value="deployment">
          <DeploymentMonitor />
        </TabsContent>

        <TabsContent value="validators">
          <ValidatorBootstrap />
        </TabsContent>

        <TabsContent value="migration">
          <LiquidityMigration />
        </TabsContent>
      </Tabs>
    </div>
  )
}
