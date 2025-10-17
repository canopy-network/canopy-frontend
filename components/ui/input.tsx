import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const inputVariants = cva(
  "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 flex w-full min-w-0 rounded-md border bg-transparent transition-[color,box-shadow] outline-none file:inline-flex file:border-0 file:bg-transparent file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "border-gray-700 focus-visible:border-primary focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        wallet: "border-none focus-visible:outline-none",
        ghost:
          "border-transparent hover:border-gray-700 focus-visible:border-primary focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        destructive:
          "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/50 focus-visible:ring-[3px]",
      },
      size: {
        sm: "h-8 px-2 py-1 text-sm file:h-6 file:text-xs",
        default: "h-9 px-3 py-1 text-base md:text-sm file:h-7 file:text-sm",
        lg: "h-10 px-4 py-2 text-lg file:h-8 file:text-base",
        wallet: "h-14 px-4 text-3xl file:h-8 file:text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> &
  VariantProps<typeof inputVariants>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, size, ...props }, ref) => {
    return (
      <input
        type={type}
        data-slot="input"
        className={cn(inputVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
