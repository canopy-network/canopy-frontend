"use client";

import { useRef, useEffect } from "react";
import {
  createChart,
  ColorType,
  IChartApi,
  AreaSeries,
  Time,
} from "lightweight-charts";
import { PoolGrowthPoint } from "../types/api/metrics";
import { ChartMetric } from "../types/amm/chart";

// TODO: Replace with actual volume data from API when available
// This is a mock multiplier to estimate volume as a percentage of TVL
const MOCK_VOLUME_MULTIPLIER = 0.15;

interface AMMMetricsChartProps {
  data: PoolGrowthPoint[];
  metric: ChartMetric;
  isDark?: boolean;
  lineColor?: string;
  height?: number;
}

export function AMMMetricsChart({
  data,
  metric,
  isDark = true,
  lineColor = "#1dd13a",
  height = 300,
}: AMMMetricsChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: {
          type: ColorType.Solid,
          color: "transparent",
        },
        textColor: isDark ? "rgba(255, 255, 255, 0.7)" : "#000000",
      },
      width: chartContainerRef.current.clientWidth,
      height,
      grid: {
        vertLines: {
          color: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
        },
        horzLines: {
          color: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
        },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: isDark ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)",
          width: 1,
          style: 3,
        },
        horzLine: {
          color: isDark ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)",
          width: 1,
          style: 3,
        },
      },
      rightPriceScale: {
        borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
      },
      timeScale: {
        borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    const topColor =
      lineColor === "#1dd13a" ? "rgba(29, 209, 58, 0.3)" : `${lineColor}33`;
    const bottomColor =
      lineColor === "#1dd13a" ? "rgba(29, 209, 58, 0.05)" : `${lineColor}0D`;

    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor,
      topColor,
      bottomColor,
      lineWidth: 2,
    });

    const chartData = data.map((point) => {
      const timestamp = new Date(point.timestamp).getTime() / 1000;
      let value: number;

      switch (metric) {
        case ChartMetric.TVL:
          value = point.tvl_usd;
          break;
        case ChartMetric.Volume:
          value = point.tvl_usd * MOCK_VOLUME_MULTIPLIER;
          break;
        case ChartMetric.Price:
          value = point.tvl_usd / point.tvl;
          break;
        default:
          value = point.tvl_usd;
      }

      return {
        time: timestamp as Time,
        value,
      };
    });

    areaSeries.setData(chartData);
    chart.timeScale().fitContent();

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
    };
  }, [data, metric, isDark, lineColor, height]);

  return <div ref={chartContainerRef} className="w-full" />;
}
