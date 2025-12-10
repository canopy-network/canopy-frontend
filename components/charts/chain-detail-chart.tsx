"use client";

import { useRef, useEffect, useState } from "react";
import {
  createChart,
  ColorType,
  AreaSeries,
  LineWidth,
  LineSeries,
  IChartApi,
} from "lightweight-charts";
import { format } from "date-fns";

export const ChainDetailChart = ({
  data,
  isDark = true,
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

  // Reset chart to default view
  const handleResetChart = () => {
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  };

  // Dynamic time formatter based on timeframe
  const getTimeFormatter = (timeframe: string) => {
    return (time: number) => {
      const date = new Date(time * 1000);

      switch (timeframe) {
        case "1H":
          // For 1 hour, show time like "8:05 PM"
          return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });
        case "1D":
          // For 1 day, show time like "8 PM"
          return date.toLocaleTimeString([], {
            hour: "2-digit",
            hour12: true,
          });
        case "1W":
          // For 1 week, show day like "Mon 8PM"
          return date.toLocaleDateString([], {
            weekday: "short",
          });
        case "1M":
          // For 1 month, show day like "Oct 15"
          return date.toLocaleDateString([], {
            month: "short",
            day: "numeric",
          });
        case "1Y":
          // For 1 year, show month like "Oct 15"
          return date.toLocaleDateString([], {
            month: "short",
            day: "numeric",
          });
        default:
          return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });
      }
    };
  };

  const globalChartOptions = {
    layout: {
      background: {
        type: ColorType.Solid,
        color: "transparent", // Black background
      },
      attributionLogo: false,
    },
    width: chartContainerRef.current?.clientWidth || 0,
    height,
    grid: {
      vertLines: {
        visible: true,
        color: "#333333", // Lighter gray for black background
        style: 1, // Dotted lines
      },
      horzLines: {
        visible: true,
        color: "#333333", // Lighter gray for black background
        style: 1, // Dotted lines
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
      minBarSpacing: 4, // Minimum spacing between bars (limits zoom out) - prevents extreme zoom out
      barSpacing: 8, // Initial spacing between bars
      rightOffset: 5, // Space on the right side
    },
    handleScroll: true, // Enable horizontal scrolling (pan)
    handleScale: true, // Enable pinch-to-zoom and mouse wheel zoom
  };

  const areaSeriesOptions = {
    lineWidth: 2 as LineWidth,
    relativeGradient: false,
    lastPriceAnimation: 1,
    crosshairMarkerVisible: false,
    color: lineColor,
    priceLineVisible: false,
    crosshairMarkerBorderColor: "red",
  };

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
      series.setData(data as any);
    } else {
      // Sample data with time intervals that produce the desired time labels
      const test_data = [
        { value: 0.015, time: 1640995200 }, // 18:00 - High start
        { value: 0.014, time: 1641000000 }, // 19:00 - Slight decline
        { value: 0.012, time: 1641004800 }, // 20:00 - Initial drop
        { value: 0.01, time: 1641009600 }, // 21:00 - Continuing down
        { value: 0.008, time: 1641014400 }, // 22:00 - Significant drop
        { value: 0.007, time: 1641019200 }, // 23:00 - Further decline
        { value: 0.006, time: 1641024000 }, // 00:00 - Lower point
        { value: 0.0065, time: 1641028800 }, // 01:00 - Small bounce
        { value: 0.007, time: 1641033600 }, // 02:00 - Small recovery
        { value: 0.006, time: 1641038400 }, // 03:00 - Drop again
        { value: 0.005, time: 1641043200 }, // 04:00 - Another drop
        { value: 0.0055, time: 1641048000 }, // 05:00 - Minor recovery
        { value: 0.008, time: 1641052800 }, // 06:00 - Upward movement
        { value: 0.0085, time: 1641057600 }, // 07:00 - Continuing up
        { value: 0.009, time: 1641062400 }, // 08:00 - Continuing up
        { value: 0.0095, time: 1641067200 }, // 09:00 - Building momentum
        { value: 0.011, time: 1641072000 }, // 10:00 - Building momentum
        { value: 0.012, time: 1641076800 }, // 11:00 - Strong upward trend
        { value: 0.013, time: 1641081600 }, // 12:00 - Strong upward trend
        { value: 0.014, time: 1641086400 }, // 13:00 - Approaching peak
        { value: 0.015, time: 1641091200 }, // 14:00 - Approaching peak
        { value: 0.016, time: 1641096000 }, // 15:00 - Near peak
        { value: 0.017, time: 1641100800 }, // 16:00 - Sharp peak
        { value: 0.018, time: 1641105600 }, // 17:00 - Peak continuation
        { value: 0.016, time: 1641110400 }, // 18:00 - Sharp drop after peak
        { value: 0.014, time: 1641115200 }, // 19:00 - Continuing drop
        { value: 0.012, time: 1641120000 }, // 20:00 - Sharp drop after peak
        { value: 0.01, time: 1641124800 }, // 21:00 - Lower fluctuations
        { value: 0.009, time: 1641129600 }, // 22:00 - Lower fluctuations
        { value: 0.01, time: 1641134400 }, // 23:00 - Small recovery
        { value: 0.011, time: 1641139200 }, // 00:00 - Small recovery
        { value: 0.009, time: 1641144000 }, // 01:00 - Drop again
        { value: 0.008, time: 1641148800 }, // 02:00 - Drop again
        { value: 0.0085, time: 1641153600 }, // 03:00 - Minor bounce
        { value: 0.011, time: 1641158400 }, // 04:00 - Final small peak
        { value: 0.01, time: 1641163200 }, // 05:00 - Slight decline
        { value: 0.009, time: 1641168000 }, // 06:00 - End lower
        { value: 0.0095, time: 1641172800 }, // 07:00 - Final fluctuation
        { value: 0.008, time: 1641177600 }, // 08:00 - End lower
        { value: 0.0085, time: 1641182400 }, // 09:00 - Final small bounce
        { value: 0.007, time: 1641187200 }, // 10:00 - Final decline
        { value: 0.0075, time: 1641192000 }, // 11:00 - End with slight recovery
        { value: 0.008, time: 1641196800 }, // 12:00 - Final point
      ];
      series.setData(test_data as any);
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
          ${format(new Date(date * 1000), "MMMM do, h:mm a")}
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
        (element as HTMLElement).style.color = "#ff4444";
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
  }, [data, timeframe, lineColor]);

  return (
    <>
      <button
        id="reset-chart-button"
        onClick={handleResetChart}
        className="absolute z-[50] top-4 right-4 bg-white/[0.1] hover:bg-white/[0.2] text-white rounded-md p-2 transition-colors"
        title="Reset chart view"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
          <path d="M21 3v5h-5" />
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
          <path d="M3 21v-5h5" />
        </svg>
      </button>
      <div
        className="w-full h-full relative"
        title="Use mouse wheel to zoom, click and drag to pan"
      >
        <style jsx>{`
          /* Style the time scale labels to be red on black background */
          :global(.tv-lightweight-charts__time-axis) {
            color: #ff4444 !important;
            font-size: 12px !important;
          }
          :global(
              .tv-lightweight-charts__time-axis
                .tv-lightweight-charts__time-axis__tick
            ) {
            color: #ff4444 !important;
          }
          :global(
              .tv-lightweight-charts__time-axis
                .tv-lightweight-charts__time-axis__tick-text
            ) {
            color: #ff4444 !important;
          }
          :global([class*="time-axis"]),
          :global([class*="time-axis"] *),
          :global(div[class*="time"]),
          :global(span[class*="time"]) {
            color: #ff4444 !important;
            font-size: 12px !important;
          }
          /* Chart tooltip styling */
          .chart-tooltip {
            position: absolute;
            z-index: 1000;
            pointer-events: none;
            background: #1f2937;
            border: 1px solid #374151;
            border-radius: 8px;
            padding: 8px;
            color: white;
            font-size: 12px;
          }
          .chart-tooltip-value {
            font-weight: bold;
            color: white;
            font-size: 14px;
          }
          .chart-tooltip-date {
            color: #9ca3af;
            font-size: 11px;
          }
        `}</style>
        <div ref={chartContainerRef} className="w-full h-full" />
      </div>
    </>
  );
};
