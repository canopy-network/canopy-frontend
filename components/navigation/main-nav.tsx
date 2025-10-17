"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Rocket,
  BarChart3,
  ArrowUpDown,
  BookOpen,
  Settings,
  Wallet,
  GitBranch,
  TrendingUp,
} from "lucide-react";

const navigation = [
  { name: "Launchpad", href: "/", icon: Rocket, requiresAuth: false },
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: BarChart3,
    requiresAuth: false,
  },
  { name: "Explorer", href: "/explorer", icon: BookOpen, requiresAuth: false },
  // { name: "AMM", href: "/amm", icon: ArrowUpDown, requiresAuth: true },
  {
    name: "Graduation",
    href: "/graduation",
    icon: GitBranch,
    requiresAuth: true,
  },
  // {
  //   name: "Order Book",
  //   href: "/orderbook",
  //   icon: TrendingUp,
  //   requiresAuth: true,
  // },
  // { name: "Wallet", href: "/wallet", icon: Wallet, requiresAuth: true },
  { name: "Settings", href: "/settings", icon: Settings, requiresAuth: true },
];

interface MainNavProps {
  isAuthenticated: boolean;
}

export function MainNav({ isAuthenticated }: MainNavProps) {
  const pathname = usePathname();

  const visibleNavigation = navigation.filter(
    (item) => !item.requiresAuth || isAuthenticated
  );

  return (
    <nav className="flex flex-col gap-2">
      {visibleNavigation.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
              pathname === item.href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
