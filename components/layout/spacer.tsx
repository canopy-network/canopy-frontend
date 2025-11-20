import { cn } from "@/lib/utils";

interface SpacerProps {
  height: number | string;
  className?: string;
}

export function Spacer({ height, className }: SpacerProps) {
  const heightStyle = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className={cn("w-full", className)}
      style={{ height: heightStyle }}
      aria-hidden="true"
    />
  );
}
