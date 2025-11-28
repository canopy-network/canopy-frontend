"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Card } from "../ui/card";

interface AccountPortfolioChartProps {
  data: {
    totalValue: number;
    assets: Array<{
      id: number;
      token: string;
      percentage: number;
      color: string;
    }>;
  } | null;
}

export function AccountPortfolioChart({ data }: AccountPortfolioChartProps) {
  if (!data) return null;

  const chartData = data.assets.map((asset) => ({
    name: asset.token,
    value: asset.percentage,
    color: asset.color,
  }));

  // Format the total value and count digits
  const formattedValue = data.totalValue.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  // Count digits (excluding commas and decimal point)
  const digitCount = formattedValue.replace(/[^0-9]/g, "").length;
  let textSizeClass = "text-2xl";
  if (digitCount <= 6) {
    textSizeClass = "text-2xl";
  } else if (digitCount <= 9) {
    textSizeClass = "text-xl";
  } else if (digitCount >= 10) {
    textSizeClass = "text-lg";
  }

  return (
    <Card className="py-3 px-3 w-full   xl:max-w-[282px]">
      <div className="relative h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart className="no-focus [&_.recharts-surface]:outline-0">
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              stroke="none"
              isAnimationActive={false}
              onClick={() => {}}
              onMouseEnter={() => {}}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className={`${textSizeClass} font-semibold text-white`}>
              {formattedValue}
            </p>
            <p className="text-sm text-muted-foreground">USD</p>
          </div>
        </div>
      </div>
      {/* Legend */}
      <div className="space-y-2 px-3 py-2 border border-white/10 rounded-xl mb-3">
        {data.assets.map((asset) => (
          <div key={asset.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: asset.color }}
              />
              <span className="text-sm">{asset.token}</span>
            </div>
            <span className="text-sm font-medium">{asset.percentage}%</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
