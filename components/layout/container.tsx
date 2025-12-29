import { cn } from "@/lib/utils";
import { useMemo } from "react";

export function Container({
  children,
  id,
  className,
  type,
  tag = "div",
}: {
  children: React.ReactNode | React.ReactNode[];
  id?: string;
  className?: string;
  tag?: "main" | "section" | "div";
  type?: "full-width" | "boxed" | "2xl" | "boxed-small";
}) {
  const size = useMemo(() => {
    switch (type) {
      case "boxed":
        return "max-w-7xl mx-auto xl:px-0";
      case "boxed-small":
        return "max-w-[1024px] mx-auto xl:px-0";
      case "full-width":
        return "w-full xl:px-0";
      case "2xl":
        return "w-full 2xl:px-0 2xl:max-w-[1680px] mx-auto";
      default:
        return "w-full xl:px-0";
    }
  }, [type]);

  const Tag = tag || "div";

  return (
    <Tag id={id} className={cn("flex-1 lg:px-6 lg:py-4  px-4 ", size, className)}>
      {children}
    </Tag>
  );
}
