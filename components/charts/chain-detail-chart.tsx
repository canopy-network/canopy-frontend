"use client";

import { useRef, useEffect, useMemo } from "react";
import {
  createChart,
  ColorType,
  LineWidth,
  LineSeries,
  IChartApi,
} from "lightweight-charts";
import { format } from "date-fns";

export const ChainDetailChart = ({
  data,
  height = 272,
  timeframe = "1D",
  lineColor = "#1dd13a",
}: {
  data: Array<{ time: string | number; value: number }>;
  isDark?: boolean;
  height?: number;
  timeframe?: string;
  lineColor?: string;
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);


  // Dynamic time formatter based on timeframe
  // Uses a closure to track the last formatted value and avoid duplicates
  const getTimeFormatter = (timeframe: string) => {
    let lastFormattedValue: string | null = null;
    let lastDateKey: string | null = null;

    return (time: number) => {
      const date = new Date(time * 1000);

      switch (timeframe) {
        case "1H":
          // For 1 hour, show time like "8:05 PM"
          const hourTime = date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });
          if (hourTime === lastFormattedValue) {
            return ""; // Don't repeat
          }
          lastFormattedValue = hourTime;
          return hourTime;
        case "1D":
          // For 1 day, show time like "8 PM"
          const dayTime = date.toLocaleTimeString([], {
            hour: "2-digit",
            hour12: true,
          });
          if (dayTime === lastFormattedValue) {
            return ""; // Don't repeat
          }
          lastFormattedValue = dayTime;
          return dayTime;
        case "1W":
          // For 1 week, show day like "Wed" - only show when day changes
          const weekDay = date.toLocaleDateString([], {
            weekday: "short",
          });
          const weekDateKey = date.toLocaleDateString([], {
            year: "numeric",
            month: "numeric",
            day: "numeric",
          });
          if (weekDateKey === lastDateKey) {
            return ""; // Don't repeat same day
          }
          lastDateKey = weekDateKey;
          lastFormattedValue = weekDay;
          return weekDay;
        case "1M":
          // For 1 month, show day like "Oct 15" - only show when day changes
          const monthDay = date.toLocaleDateString([], {
            month: "short",
            day: "numeric",
          });
          const monthDateKey = date.toLocaleDateString([], {
            year: "numeric",
            month: "numeric",
            day: "numeric",
          });
          if (monthDateKey === lastDateKey) {
            return ""; // Don't repeat same day
          }
          lastDateKey = monthDateKey;
          lastFormattedValue = monthDay;
          return monthDay;
        case "1Y":
          // For 1 year, show month like "Oct 15"
          const yearDay = date.toLocaleDateString([], {
            month: "short",
            day: "numeric",
          });
          const yearDateKey = date.toLocaleDateString([], {
            year: "numeric",
            month: "numeric",
            day: "numeric",
          });
          if (yearDateKey === lastDateKey) {
            return ""; // Don't repeat same day
          }
          lastDateKey = yearDateKey;
          lastFormattedValue = yearDay;
          return yearDay;
        default:
          const defaultTime = date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });
          if (defaultTime === lastFormattedValue) {
            return ""; // Don't repeat
          }
          lastFormattedValue = defaultTime;
          return defaultTime;
      }
    };
  };

  const globalChartOptions = useMemo(() => ({
    layout: {
      background: {
        type: ColorType.Solid,
        color: "transparent",
      },
      attributionLogo: false,
    },
    width: chartContainerRef.current?.clientWidth || 0,
    height,
    grid: {
      vertLines: {
        visible: true,
        color: "rgba(255, 255, 255, 0.05)", // Very subtle white grid lines
        style: 1, // Dotted lines
      },
      horzLines: {
        visible: true,
        color: "rgba(255, 255, 255, 0.05)",
        style: 1,
      },
    },
    rightPriceScale: {
      visible: false,
    },
    leftPriceScale: {
      visible: false,
    },
    timeScale: {
      visible: true,
      borderVisible: false,
      timeVisible: true,
      secondsVisible: false,
      tickMarkFormatter: getTimeFormatter(timeframe),
      minBarSpacing: 4,
      barSpacing: 8,
      rightOffset: 5,
    },
    handleScroll: true,
    handleScale: true,
    attribution: {
      visible: false,
    },
    // dependencies: height, timeframe, chartContainerRef
  }), [height, timeframe,]);

  const areaSeriesOptions = useMemo(() => ({
    lineWidth: 2 as LineWidth,
    lastPriceAnimation: 1,
    crosshairMarkerVisible: false,
    color: lineColor,
    priceLineVisible: false,
    crosshairMarkerBorderColor: "red",
  }), [lineColor]);

  // Format large numbers for tooltip display
  const formatTooltipValue = (value: number): string => {
    if (value >= 1_000_000) {
      // For millions, remove last 6 digits and show M
      return `$${Math.floor(value / 1_000_000)}M`;
    } else if (value >= 1_000) {
      // For thousands, remove last 3 digits and show K
      return `$${Math.floor(value / 1_000)}K`;
    } else {
      // For values less than 1000, show as is without decimals
      return `$${Math.floor(value)}`;
    }
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const existingTooltip =
      chartContainerRef.current.querySelector(".chart-tooltip");
    if (existingTooltip) {
      existingTooltip.remove();
    }

    const toolTip = document.createElement("span");
    toolTip.classList.add("chart-tooltip");
    chartContainerRef.current.appendChild(toolTip);

    const chart = createChart(chartContainerRef.current, globalChartOptions);
    chartRef.current = chart; // Store chart reference

    const series = chart.addSeries(LineSeries, areaSeriesOptions);

    if (data && data.length > 0) {
      // Ensure data is properly formatted
      const formattedData = data.map((item) => ({
        time: item.time,
        value: typeof item.value === 'number' ? item.value : parseFloat(String(item.value || 0)),
      }));
      series.setData(formattedData as any);
    }

    const toolTipWidth = 200;
    const toolTipHeight = 80;
    const toolTipMargin = 15;

    // update tooltip
    chart.subscribeCrosshairMove((param) => {
      if (!chartContainerRef.current) return;
      if (
        param.point === undefined ||
        !param.time ||
        param.point.x < 0 ||
        param.point.x > chartContainerRef.current.clientWidth ||
        param.point.y < 0 ||
        param.point.y > chartContainerRef.current.clientHeight
      ) {
        toolTip.style.display = "none";
      } else {
        // time will be in the same format that we supplied to setData.
        // thus it will be a Unix timestamp
        const date = param.time as number;
        toolTip.style.display = "block";
        const data = param.seriesData.get(series) as any;
        const price = data?.value || data?.close || 0;
        toolTip.innerHTML = `<div class="chart-tooltip-value">
          ${formatTooltipValue(price)}
          </div><div class="chart-tooltip-date">
          ${format(new Date(date * 1000), "MMMM d, h:mm a")}
          </div>`;

        const coordinate = series.priceToCoordinate(price);
        let shiftedCoordinate = (param.point.x as number) - 50;
        if (coordinate === null) {
          return;
        }
        shiftedCoordinate = Math.max(
          0,
          Math.min(
            chartContainerRef.current.clientWidth - toolTipWidth,
            shiftedCoordinate
          )
        );
        const coordinateY =
          coordinate - toolTipHeight - toolTipMargin > 0
            ? coordinate - toolTipHeight - toolTipMargin
            : Math.max(
              0,
              Math.min(
                chartContainerRef.current.clientHeight -
                toolTipHeight -
                toolTipMargin,
                coordinate + toolTipMargin
              )
            );
        toolTip.style.left = shiftedCoordinate + "px";
        toolTip.style.top = coordinateY + "px";
      }
    });
    chart.timeScale().fitContent();

    // Force style the time scale labels after chart is created
    const styleTimeLabels = () => {
      const timeAxisElements = chartContainerRef.current?.querySelectorAll(
        '.tv-lightweight-charts__time-axis, .tv-lightweight-charts__time-axis *, [class*="time-axis"], [class*="time"]'
      );
      timeAxisElements?.forEach((element) => {
        (element as HTMLElement).style.color = "rgba(255, 255, 255, 0.6)";
        (element as HTMLElement).style.fontSize = "12px";
      });
    };

    // Try multiple times to catch the elements
    setTimeout(styleTimeLabels, 100);
    setTimeout(styleTimeLabels, 500);
    setTimeout(styleTimeLabels, 1000);

    // Use MutationObserver to catch when elements are added
    // Debounce to avoid excessive DOM manipulation on mobile devices
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const observer = new MutationObserver(() => {
      // Clear existing timer
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      // Debounce the callback to reduce DOM manipulation frequency
      debounceTimer = setTimeout(() => {
        styleTimeLabels();
        debounceTimer = null;
      }, 100); // Wait 100ms after last mutation before applying
    });

    if (chartContainerRef.current) {
      observer.observe(chartContainerRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
      });
    }

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    chart.applyOptions({
      layout: {
        textColor: "rgba(255, 255, 255, 0.5)",
      },
    });

    // Apply time scale styling after chart is created
    chart.timeScale().applyOptions({
      borderVisible: false,
    });
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
      // Clear any pending debounce timer
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      if (toolTip && toolTip.parentNode) {
        toolTip.parentNode.removeChild(toolTip);
      }
      chart.remove();
      chartRef.current = null;
    };
  }, [data, timeframe, lineColor, globalChartOptions, areaSeriesOptions]);

  return (
    <>
      <div
        className="w-full h-full relative"
        title="Use mouse wheel to zoom, click and drag to pan"
      >
        <style jsx>{`
          /* Style the time scale labels to be white/gray on dark background */
          :global(.tv-lightweight-charts__time-axis) {
            color: rgba(255, 255, 255, 0.6) !important;
            font-size: 12px !important;
          }
          :global(
              .tv-lightweight-charts__time-axis
                .tv-lightweight-charts__time-axis__tick
            ) {
            color: rgba(255, 255, 255, 0.6) !important;
          }
          :global(
              .tv-lightweight-charts__time-axis
                .tv-lightweight-charts__time-axis__tick-text
            ) {
            color: rgba(255, 255, 255, 0.6) !important;
          }
          :global([class*="time-axis"]),
          :global([class*="time-axis"] *),
          :global(div[class*="time"]),
          :global(span[class*="time"]) {
            color: rgba(255, 255, 255, 0.6) !important;
            font-size: 12px !important;
          }
          /* Chart tooltip styling */
          .chart-tooltip {
            position: absolute;
            z-index: 1000;
            pointer-events: none;
            background: rgba(31, 41, 55, 0.95);
            border: 1px solid rgba(55, 65, 81, 0.5);
            border-radius: 8px;
            padding: 8px 12px;
            color: white;
            font-size: 12px;
            backdrop-filter: blur(8px);
          }
          .chart-tooltip-value {
            font-weight: bold;
            color: white;
            font-size: 14px;
          }
          .chart-tooltip-date {
            color: rgba(255, 255, 255, 0.7);
            font-size: 11px;
            margin-top: 2px;
          }
        `}</style>
        <div ref={chartContainerRef} className="w-full h-full" />
      </div>
    </>
  );
};
