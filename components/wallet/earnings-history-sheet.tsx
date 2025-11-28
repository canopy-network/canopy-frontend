"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatBalance, formatUSD } from "@/lib/utils/wallet-helpers";
import { format, isToday, isYesterday } from "date-fns";

interface EarningRecord {
  id: number;
  date: string; // ISO date string
  chain: string;
  symbol: string;
  amount: number;
  usdValue: number;
  color: string;
}

interface EarningsHistorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  earnings: EarningRecord[];
}

function formatDateHeader(dateString: string): string {
  const date = new Date(dateString);
  
  if (isToday(date)) {
    return "Today";
  } else if (isYesterday(date)) {
    return "Yesterday";
  } else {
    return format(date, "MMMM d, yyyy");
  }
}

function groupEarningsByDate(earnings: EarningRecord[]): Map<string, EarningRecord[]> {
  const grouped = new Map<string, EarningRecord[]>();
  
  earnings.forEach((earning) => {
    const dateKey = earning.date.split("T")[0]; // Get just the date part
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)!.push(earning);
  });
  
  return grouped;
}

export function EarningsHistorySheet({
  open,
  onOpenChange,
  earnings,
}: EarningsHistorySheetProps) {
  const groupedEarnings = groupEarningsByDate(earnings);
  const sortedDates = Array.from(groupedEarnings.keys()).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  const totalEarnings = earnings.reduce((sum, e) => sum + e.usdValue, 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[420px] p-0">
        <SheetHeader className="p-6 border-b">
          <SheetTitle>Earnings History</SheetTitle>
          <div className="pt-4">
            <p className="text-sm text-muted-foreground">Total Earned</p>
            <p className="text-3xl font-bold">{formatUSD(totalEarnings)}</p>
          </div>
        </SheetHeader>

        <div className="overflow-y-auto h-[calc(100vh-180px)]">
          {sortedDates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <p className="text-muted-foreground">No earnings yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Start staking to earn rewards
              </p>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {sortedDates.map((dateKey) => {
                const dayEarnings = groupedEarnings.get(dateKey)!;
                const dayTotal = dayEarnings.reduce((sum, e) => sum + e.usdValue, 0);

                return (
                  <div key={dateKey} className="space-y-3">
                    {/* Date Header */}
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm">
                        {formatDateHeader(dateKey)}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {formatUSD(dayTotal)}
                      </p>
                    </div>

                    {/* Earnings List */}
                    <div className="space-y-2">
                      {dayEarnings.map((earning) => (
                        <div
                          key={earning.id}
                          className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: `${earning.color}20` }}
                            >
                              <span
                                className="text-sm font-bold"
                                style={{ color: earning.color }}
                              >
                                {earning.symbol[0]}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-sm">{earning.chain}</p>
                              <p className="text-xs text-muted-foreground">
                                {earning.symbol}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-sm">
                              +{formatBalance(earning.amount, 4)} {earning.symbol}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatUSD(earning.usdValue)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
