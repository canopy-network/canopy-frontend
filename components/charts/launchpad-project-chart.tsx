"use client";

import { useRef, useEffect } from "react";
import { AreaSeries, createChart, ColorType } from "lightweight-charts";

export const LaunchpadProjectChart = ({
  data,
  isDark = true,
}: {
  data: Array<{ time: string; value: number }>;
  isDark?: boolean;
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: {
          type: ColorType.Solid,
          color: isDark ? "#0a0a0a" : "white",
        },
        textColor: isDark ? "#ffffff" : "#000000",
      },
      width: chartContainerRef.current.clientWidth,
      height: 200,
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      crosshair: {
        mode: 0, // Disable crosshair
      },
      rightPriceScale: {
        visible: false,
      },
      timeScale: {
        visible: false,
      },
    });

    const series = chart.addSeries(AreaSeries, {
      lineColor: "#1dd13a",
      topColor: "rgba(29, 209, 58, 0.3)",
      bottomColor: "rgba(29, 209, 58, 0.05)",
      lineWidth: 2,
    });

    series.setData(data);
    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [data, isDark]);

  return <div ref={chartContainerRef} className="w-full h-full" />;
};
