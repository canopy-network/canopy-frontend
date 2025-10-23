import { cn } from "@/lib/utils";

export function Container({
  children,
  id,
  className,
}: {
  children: React.ReactNode | React.ReactNode[];
  id?: string;
  className?: string;
}) {
  return (
    <main id={id} className={cn("flex-1 px-6 py-4", className)}>
      {children}
    </main>
  );
}
