"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Zap,
  BarChart3,
  TrendingUp,
  Droplets,
} from "lucide-react";

export const navigation = [
  { name: "Launchpad", href: "/", icon: Zap },
  { name: "Explorer", href: "/explorer", icon: BarChart3 },
  { name: "Liquidity", href: "/liquidity", icon: Droplets },
  { name: "Trade", href: "/orderbook", icon: TrendingUp },
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

  // Helper function to check if a route is active
  const isActive = (href: string) => {
    if (href === "/") {
      // For home route, only match exactly "/" or "/" with trailing slash
      return pathname === "/" || pathname === "";
    }
    // Special case for Explorer: also highlight on /transactions, /blocks, /validators
    if (href === "/explorer") {
      return (
        pathname === href ||
        pathname.startsWith(href + "/") ||
        pathname.startsWith("/transactions") ||
        pathname.startsWith("/blocks") ||
        pathname.startsWith("/validators")
      );
    }
    // For other routes, match if pathname starts with the href
    // and ensure we don't match partial paths (e.g., /explorer-something)
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <nav
      className={cn(
        "flex gap-2 transition-all duration-300",
        isCondensed ? "flex-col items-center" : "flex-col"
      )}
    >
      {navigation.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex font-medium rounded-xl transition-colors text-white",
              isCondensed
                ? "w-[57px] flex-col items-center justify-center gap-1 py-2 text-sm"
                : "items-center gap-3 px-3 py-2 text-sm ",
              active
                ? "bg-white/5"
                : isCondensed
                ? " hover:bg-white/5"
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
