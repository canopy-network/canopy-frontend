import { cn } from "@/lib/utils";
export function LiveStatusComponent({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-transparent lg:h-9  py-2 lg:gap-3 flex-nowrap flex-row",
        className
      )}
    >
      <div className="relative flex items-center justify-center">
        <div className="absolute w-1.5 h-1.5 bg-[#00a63d] rounded-full animate-ping"></div>
        <div className="relative w-1.5 h-1.5 bg-[#00a63d] rounded-full shadow-[0_0_8px_rgba(0,166,61,0.8)]"></div>
      </div>
      <span className="hidden md:inline-block text-[#00a63d]">Live</span>
    </span>
  );
}
