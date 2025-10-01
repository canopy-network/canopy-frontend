"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Rocket, BarChart3, ArrowUpDown, BookOpen, Settings, Wallet, GitBranch, TrendingUp } from "lucide-react"

const navigation = [
  { name: "Launchpad", href: "/", icon: Rocket },
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Explorer", href: "/explorer", icon: BookOpen },
  { name: "AMM", href: "/amm", icon: ArrowUpDown },
  { name: "Graduation", href: "/graduation", icon: GitBranch },
  { name: "Order Book", href: "/orderbook", icon: TrendingUp },
  { name: "Wallet", href: "/wallet", icon: Wallet },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-2">
      {navigation.map((item) => {
        const Icon = item.icon
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
              pathname === item.href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.name}
          </Link>
        )
      })}
    </nav>
  )
}
