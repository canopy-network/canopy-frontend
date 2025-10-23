import { cn } from "@/lib/utils";
import { useMemo } from "react";

export function Container({
  children,
  id,
  className,
  type,
}: {
  children: React.ReactNode | React.ReactNode[];
  id?: string;
  className?: string;
  type?: "full-width" | "boxed";
}) {
  const size = useMemo(() => {
    switch (type) {
      case "boxed":
        return "max-w-7xl mx-auto";
      case "full-width":
        return "w-full";
      default:
        return "w-full";
    }
  }, [type]);

  return (
    <main id={id} className={cn("flex-1 px-6 py-4", size, className)}>
      {children}
    </main>
  );
}
