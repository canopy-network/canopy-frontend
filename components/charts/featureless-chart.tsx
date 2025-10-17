"use client";

import { useRef, useEffect } from "react";
import {
  createChart,
  ColorType,
  AreaSeries,
  LineWidth,
} from "lightweight-charts";
import { format } from "date-fns";

export const FeaturelessChart = ({
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
      vertLines: { visible: false },
      horzLines: { visible: false },
    },

    rightPriceScale: {
      visible: false,
    },
    leftPriceScale: {
      visible: false,
    },
    timeScale: {
      visible: false,
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
    topColor: "rgba(29, 209, 58, 0.3)",
    bottomColor: "rgba(29, 209, 58, 0)",
  };
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const toolTip = document.createElement("span");
    toolTip.classList.add("chart-tooltip");
    chartContainerRef.current.appendChild(toolTip);

    const chart = createChart(chartContainerRef.current, globalChartOptions);

    const series = chart.addSeries(AreaSeries, areaSeriesOptions);

    if (data && data.length > 0) {
      series.setData(data as any);
    } else {
      // Fallback test data if no data provided
      const test_data = [
        { value: 0.1, time: 1642425322 },
        { value: 8, time: 1642511722 },
        { value: 10, time: 1642598122 },
        { value: 20, time: 1642684522 },
        { value: 3, time: 1642770922 },
        { value: 43, time: 1642857322 },
        { value: 41, time: 1642943722 },
        { value: 43, time: 1643030122 },
        { value: 56, time: 1643116522 },
        { value: 46, time: 1643202922 },
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
        toolTip.style.display = "block";
        const data = param.seriesData.get(series) as any;
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

  return <div ref={chartContainerRef} className="w-full h-full" />;
};
