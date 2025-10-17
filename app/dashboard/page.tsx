"use client";

// Force dynamic rendering
export const dynamic = "force-dynamic";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  TrendingUp,
  Users,
  Coins,
  Activity,
  Rocket,
  BarChart3,
  ArrowUpDown,
  BookOpen,
  GitBranch,
  DollarSign,
} from "lucide-react";
import Link from "next/link";

const stats = [
  {
    title: "Total Value Locked",
    value: "$12.4M",
    change: "+12.5%",
    icon: TrendingUp,
  },
  {
    title: "Active Chains",
    value: "24",
    change: "+3",
    icon: Activity,
  },
  {
    title: "Total Users",
    value: "8,429",
    change: "+18.2%",
    icon: Users,
  },
  {
    title: "CNPY Price",
    value: "$1.2455",
    change: "+5.7%",
    icon: Coins,
  },
];

const features = [
  {
    title: "Launchpad",
    description:
      "Launch new blockchain chains in under 10 minutes with bonding curves and virtual pools.",
    icon: Rocket,
    href: "/", // Updated to point to homepage since Launchpad is now there
  },
  {
    title: "Cross-Chain Explorer",
    description:
      "Discover chains, validators, and staking opportunities across the ecosystem.",
    icon: BookOpen,
    href: "/explorer",
  },
  {
    title: "This is a test",
    description:
      "Trade with CNPY-paired liquidity pools and earn fees as a liquidity provider.",
    icon: ArrowUpDown,
    href: "/amm",
  },
  {
    title: "AMM Hub",
    description:
      "Trade with CNPY-paired liquidity pools and earn fees as a liquidity provider.",
    icon: ArrowUpDown,
    href: "/amm",
  },
  {
    title: "Graduation System",
    description:
      "Automated deployment and validator bootstrapping for successful chain launches.",
    icon: GitBranch,
    href: "/graduation",
  },
  {
    title: "Order Book",
    description:
      "Large trade settlement with cross-chain atomic swaps and enterprise liquidity.",
    icon: DollarSign,
    href: "/orderbook",
  },
  {
    title: "Portfolio Analytics",
    description:
      "Track performance, yields, and market data across all connected chains.",
    icon: BarChart3,
    href: "/analytics",
  },
];

export default function Dashboard() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-balance">Canopy Dashboard</h1>
        <p className="text-muted-foreground mt-2 text-pretty">
          Overview of your blockchain ecosystem activity and performance
          metrics.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-primary">
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link key={feature.title} href={feature.href}>
              <Card className="cursor-pointer hover:bg-accent/50 transition-colors h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                  <CardDescription className="text-pretty">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
