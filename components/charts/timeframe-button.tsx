import { Button } from "@/components/ui/button";

export const TimeframeButton = ({
  timeframe,
  selectedTimeframe,
  setSelectedTimeframe,
  loadingChart,
  children,
}: {
  timeframe: string;
  selectedTimeframe: string;
  setSelectedTimeframe: (timeframe: string) => void;
  loadingChart: boolean;
  children: React.ReactNode;
}) => {
  const isSelected = selectedTimeframe === timeframe;
  return (
    <Button
      key={timeframe}
      variant={isSelected ? "secondary" : "ghost"}
      size="sm"
      onClick={() => setSelectedTimeframe(timeframe)}
      disabled={loadingChart}
      className="rounded-md gap-1.5 h-8 text-xs px-3 transition-all"
    >
      {children}
    </Button>
  );
};

export const TimeframeButtonLayout = ({
  children,
}: {
  children: React.ReactNode | React.ReactNode[];
}) => {
  return (
    <div className="absolute left-2 lg:left-4 top-2.5 z-10 flex gap-0.5 p-0.5 bg-muted/50 rounded-lg">
      {children}
    </div>
  );
};
