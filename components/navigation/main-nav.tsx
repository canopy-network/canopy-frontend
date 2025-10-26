"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Zap, BarChart3, Activity, TrendingUp, User } from "lucide-react";

export const navigation = [
  { name: "Launchpad", href: "/", icon: Zap },
  { name: "Explorer", href: "/explorer", icon: BarChart3 },
  { name: "Staking", href: "/staking", icon: Activity },
  { name: "Trade", href: "/orderbook", icon: TrendingUp },
  { name: "Profile", href: "/settings", icon: User },
];

interface MainNavProps {
  isAuthenticated: boolean;
  isCondensed?: boolean;
}

export function MainNav({
  isAuthenticated,
  isCondensed = false,
}: MainNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "flex gap-2 transition-all duration-300",
        isCondensed ? "flex-col items-center" : "flex-col"
      )}
    >
      {navigation.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex font-medium rounded-xl transition-colors",
              isCondensed
                ? "w-[57px] flex-col items-center justify-center gap-1 py-2 text-sm"
                : "items-center gap-3 px-3 py-2 text-sm rounded-lg",
              pathname === item.href
                ? "bg-primary text-primary-foreground"
                : isCondensed
                ? "text-white hover:bg-white/5"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <Icon className="w-4 h-4" />
            <span className={cn(isCondensed ? "text-[10px]" : "")}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
