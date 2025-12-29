"use client";

import { useRef, useEffect, useMemo } from "react";
import { createChart, ColorType, IChartApi } from "lightweight-charts";

interface LiquidityChartProps {
  timeframe?: string;
  data?: Array<{ time: number; value: number }>;
  height?: number;
  isDark?: boolean;
}

export default function LiquidityChart({
  timeframe = "1D",
  data,
  height = 160,
  isDark = true,
}: LiquidityChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  // Generate mock data based on timeframe
  const mockData = useMemo(() => {
    const points =
      timeframe === "1H"
        ? 12
        : timeframe === "1D"
        ? 24
        : timeframe === "1W"
        ? 7
        : timeframe === "1M"
        ? 30
        : timeframe === "1Y"
        ? 12
        : 24;

    const now = Math.floor(Date.now() / 1000);
    const interval =
      timeframe === "1H"
        ? 300 // 5 minutes
        : timeframe === "1D"
        ? 3600 // 1 hour
        : timeframe === "1W"
        ? 86400 // 1 day
        : timeframe === "1M"
        ? 86400 // 1 day
        : timeframe === "1Y"
        ? 2592000 // 30 days
        : 3600;

    return Array.from({ length: points }, (_, i) => ({
      time: now - (points - i) * interval,
      value: Math.random() * 100000 + 20000,
      color: i % 3 === 0 ? "#1dd13a" : "#10a02c", // Alternate shades of green
    }));
  }, [timeframe]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: {
          type: ColorType.Solid,
          color: "transparent",
        },
        textColor: isDark ? "#9ca3af" : "#6b7280",
      },
      width: chartContainerRef.current.clientWidth,
      height,
      grid: {
        vertLines: {
          visible: false,
        },
        horzLines: {
          visible: false,
        },
      },
      rightPriceScale: {
        visible: false,
      },
      leftPriceScale: {
        visible: false,
      },
      timeScale: {
        visible: false,
        borderVisible: false,
      },
      handleScroll: false,
      handleScale: false,
      crosshair: {
        vertLine: {
          visible: false,
        },
        horzLine: {
          visible: false,
        },
      },
    });

    chartRef.current = chart;

    // Add histogram series for volume display
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const histogramSeries = (chart as any).addHistogramSeries({
      color: "#1dd13a",
      priceFormat: {
        type: "volume",
      },
    });

    // Set data
    const chartData = data || mockData;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    histogramSeries.setData(chartData as any);

    // Fit content
    chart.timeScale().fitContent();

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
    };
  }, [timeframe, data, height, isDark, mockData]);

  return (
    <div className="w-full relative">
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
}
