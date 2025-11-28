import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const cardVariants = cva("flex flex-col gap-6 rounded-xl border shadow-sm", {
  variants: {
    variant: {
      default: "bg-card text-card-foreground",
      dark: "bg-[#1a1a1a] text-white border-gray-800",
      glass: "bg-white/10 backdrop-blur-sm text-white border-white/20",
      outline: "bg-transparent text-foreground border-border",
      ghost: "bg-transparent text-foreground border-transparent shadow-none",
      gradient:
        "bg-gradient-to-br from-gray-900 to-gray-800 text-white border-gray-700",
    },
    size: {
      default: "py-6",
      sm: "py-4",
      lg: "py-8",
      xl: "py-12",
      none: "py-0",
    },
    padding: {
      default: "px-6",
      sm: "px-4",
      lg: "px-8",
      xl: "px-12",
      none: "px-0",
      explorer: "px-4 lg:px-6",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
    padding: "default",
  },
});

export interface CardProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof cardVariants> {}

function Card({ className, variant, size, padding, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ variant, size, padding }), className)}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
