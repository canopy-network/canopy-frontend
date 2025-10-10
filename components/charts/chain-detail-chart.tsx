"use client";

import { useRef, useEffect } from "react";
import {
  createChart,
  ColorType,
  AreaSeries,
  LineWidth,
  LineSeries,
} from "lightweight-charts";
import { format } from "date-fns";

export const ChainDetailChart = ({
  data,
  isDark = true,
}: {
  data: Array<{ time: string | number; value: number }>;
  isDark?: boolean;
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const globalChartOptions = {
    layout: {
      background: {
        type: ColorType.Solid,
        color: "transparent",
      },
      attributionLogo: false,
    },
    width: chartContainerRef.current?.clientWidth || 0,
    height: 200,
    grid: {
      vertLines: {
        visible: true,
        color: "#374151",
        style: 1, // Dotted lines
      },
      horzLines: {
        visible: true,
        color: "#374151",
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
      tickMarkFormatter: (time: number) => {
        const date = new Date(time * 1000);
        return date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      },
    },
    handleScroll: false,
    handleScale: false,
  };

  const areaSeriesOptions = {
    lineWidth: 2 as LineWidth,
    relativeGradient: false,
    lastPriceAnimation: 1,
    crosshairMarkerVisible: false,
    priceLineVisible: false,
    crosshairMarkerBorderColor: "red",
  };
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const toolTip = document.createElement("span");
    toolTip.classList.add("chart-tooltip");
    chartContainerRef.current.appendChild(toolTip);

    const chart = createChart(chartContainerRef.current, globalChartOptions);

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

    const toolTipWidth = 80;
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
        console.log({ param });
        toolTip.style.display = "block";
        const data = param.seriesData.get(series) as any;
        console.log({ data });
        const price = data?.value || data?.close || 0;
        toolTip.innerHTML = `<div class="chart-tooltip-value">
          $${price.toFixed(6)}
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
  }, [data]);

  return (
    <div className="w-full h-full relative">
      <style jsx>{`
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
        /* Style the time scale labels */
        :global(.tv-lightweight-charts__time-axis) {
          color: #9ca3af !important;
          font-size: 12px !important;
        }
        :global(
            .tv-lightweight-charts__time-axis
              .tv-lightweight-charts__time-axis__tick
          ) {
          color: #9ca3af !important;
        }
      `}</style>
      <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  );
};
