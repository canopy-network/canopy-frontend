"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Shield, Server, CheckCircle, Clock, AlertTriangle } from "lucide-react"

interface ValidatorNode {
  id: string
  name: string
  operator: string
  chain: string
  status: "ready" | "bootstrapping" | "active" | "offline"
  uptime: number
  stake: string
  commission: number
  location: string
  specs: {
    cpu: string
    memory: string
    storage: string
    network: string
  }
}

const validatorNodes: ValidatorNode[] = [
  {
    id: "1",
    name: "Alpha Validator 1",
    operator: "Validator Alpha",
    chain: "DeFi Chain Alpha",
    status: "ready",
    uptime: 100,
    stake: "50,000 CNPY",
    commission: 5.0,
    location: "US-East",
    specs: {
      cpu: "16 vCPU",
      memory: "32 GB",
      storage: "1 TB NVMe",
      network: "10 Gbps",
    },
  },
  {
    id: "2",
    name: "Alpha Validator 2",
    operator: "Staking Pro",
    chain: "DeFi Chain Alpha",
    status: "ready",
    uptime: 100,
    stake: "75,000 CNPY",
    commission: 3.5,
    location: "EU-West",
    specs: {
      cpu: "16 vCPU",
      memory: "32 GB",
      storage: "1 TB NVMe",
      network: "10 Gbps",
    },
  },
  {
    id: "3",
    name: "Alpha Validator 3",
    operator: "Enterprise Secure",
    chain: "DeFi Chain Alpha",
    status: "bootstrapping",
    uptime: 0,
    stake: "100,000 CNPY",
    commission: 4.0,
    location: "Asia-Pacific",
    specs: {
      cpu: "32 vCPU",
      memory: "64 GB",
      storage: "2 TB NVMe",
      network: "25 Gbps",
    },
  },
  {
    id: "4",
    name: "GameFi Validator 1",
    operator: "GameFi Node",
    chain: "GameFi Universe",
    status: "active",
    uptime: 99.8,
    stake: "60,000 CNPY",
    commission: 7.0,
    location: "US-West",
    specs: {
      cpu: "16 vCPU",
      memory: "32 GB",
      storage: "1 TB NVMe",
      network: "10 Gbps",
    },
  },
  {
    id: "5",
    name: "GameFi Validator 2",
    operator: "Community Node",
    chain: "GameFi Universe",
    status: "offline",
    uptime: 95.2,
    stake: "25,000 CNPY",
    commission: 2.0,
    location: "EU-Central",
    specs: {
      cpu: "8 vCPU",
      memory: "16 GB",
      storage: "500 GB SSD",
      network: "1 Gbps",
    },
  },
]

export function ValidatorBootstrap() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ready":
        return <CheckCircle className="h-4 w-4 text-primary" />
      case "bootstrapping":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "active":
        return <Shield className="h-4 w-4 text-green-500" />
      case "offline":
        return <AlertTriangle className="h-4 w-4 text-destructive" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "bg-primary/10 text-primary"
      case "bootstrapping":
        return "bg-blue-500/10 text-blue-600"
      case "active":
        return "bg-green-500/10 text-green-600"
      case "offline":
        return "bg-destructive/10 text-destructive"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const readyValidators = validatorNodes.filter((v) => v.status === "ready")
  const activeValidators = validatorNodes.filter((v) => v.status === "active")
  const bootstrappingValidators = validatorNodes.filter((v) => v.status === "bootstrapping")

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ready Validators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{readyValidators.length}</div>
            <p className="text-xs text-muted-foreground">Ready for deployment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Validators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeValidators.length}</div>
            <p className="text-xs text-muted-foreground">Currently validating</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bootstrapping</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bootstrappingValidators.length}</div>
            <p className="text-xs text-muted-foreground">Setting up nodes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Stake</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">310K</div>
            <p className="text-xs text-muted-foreground">CNPY staked</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {validatorNodes.map((validator) => (
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
                      {getStatusIcon(validator.status)}
                      <CardTitle className="text-lg">{validator.name}</CardTitle>
                      <Badge className={getStatusColor(validator.status)}>{validator.status}</Badge>
                      <Badge variant="outline">{validator.chain}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Operated by {validator.operator} • {validator.location}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {validator.status === "ready" && <Button size="sm">Bootstrap</Button>}
                  {validator.status === "active" && (
                    <Button variant="outline" size="sm">
                      Monitor
                    </Button>
                  )}
                  {validator.status === "offline" && (
                    <Button variant="outline" size="sm">
                      Restart
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    Stake & Commission
                  </div>
                  <div className="text-lg font-bold">{validator.stake}</div>
                  <div className="text-xs text-muted-foreground">{validator.commission}% commission</div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Server className="h-4 w-4" />
                    Uptime
                  </div>
                  <div className="text-lg font-bold">{validator.uptime}%</div>
                  <div className="text-xs text-muted-foreground">
                    {validator.status === "active" ? "Operational" : "Not started"}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Hardware Specs</div>
                  <div className="text-xs space-y-1">
                    <div>{validator.specs.cpu}</div>
                    <div>{validator.specs.memory}</div>
                    <div>{validator.specs.storage}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Network</div>
                  <div className="text-xs space-y-1">
                    <div>{validator.specs.network}</div>
                    <div>{validator.location}</div>
                    <div className="text-primary">{validator.status === "active" ? "Connected" : "Standby"}</div>
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
