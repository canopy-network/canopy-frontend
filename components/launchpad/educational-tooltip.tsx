"use client"

import type React from "react"

import { HelpCircle, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Button } from "@/components/ui/button"

interface EducationalTooltipProps {
  term: string
  definition: string
  example?: string
  variant?: "tooltip" | "hover-card"
  children?: React.ReactNode
}

export function EducationalTooltip({
  term,
  definition,
  example,
  variant = "tooltip",
  children,
}: EducationalTooltipProps) {
  const content = (
    <div className="space-y-2 max-w-xs">
      <div className="font-semibold text-sm">{term}</div>
      <div className="text-xs text-muted-foreground leading-relaxed">{definition}</div>
      {example && <div className="text-xs text-primary/80 italic border-t pt-2">Example: {example}</div>}
    </div>
  )

  if (variant === "hover-card") {
    return (
      <HoverCard>
        <HoverCardTrigger asChild>
          {children || (
            <Button variant="ghost" size="sm" className="h-auto p-0 text-primary hover:text-primary/80">
              <span className="underline decoration-dotted underline-offset-2">{term}</span>
              <Info className="h-3 w-3 ml-1" />
            </Button>
          )}
        </HoverCardTrigger>
        <HoverCardContent className="w-80">{content}</HoverCardContent>
      </HoverCard>
    )
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children || (
            <Button variant="ghost" size="sm" className="h-auto p-0 text-primary hover:text-primary/80">
              <HelpCircle className="h-3 w-3" />
            </Button>
          )}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Pre-defined educational terms for the launchpad
export const educationalTerms = {
  bondingCurve: {
    term: "Bonding Curve",
    definition:
      "A mathematical curve that determines the price of tokens based on supply. As more tokens are purchased, the price increases automatically.",
    example: "If 100,000 tokens exist, the next token might cost $0.15. At 300,000 tokens, it might cost $0.25.",
  },
  graduation: {
    term: "Graduation",
    definition:
      "When a project reaches its funding target, it 'graduates' from the launchpad and becomes a fully independent blockchain with its own liquidity pool.",
    example:
      "A project targeting $600,000 graduates when it reaches that amount, transitioning from bonding curve to traditional trading.",
  },
  virtualPool: {
    term: "Virtual Pool",
    definition:
      "A simulated liquidity pool that allows trading before graduation. It uses algorithmic pricing instead of traditional market makers.",
    example:
      "Users can buy/sell tokens immediately without waiting for other traders, as the virtual pool provides instant liquidity.",
  },
  participants: {
    term: "Participants",
    definition: "The number of unique wallet addresses that have purchased tokens in this project.",
    example: "234 participants means 234 different people have invested in this project.",
  },
  quickTrade: {
    term: "Quick Trade",
    definition:
      "Instantly buy or sell tokens at the current bonding curve price without complex order books or waiting for matches.",
    example: "Click 'Quick Trade' to immediately purchase $100 worth of tokens at the current price.",
  },
}
