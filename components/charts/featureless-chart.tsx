"use client";

import { useRef, useEffect } from "react";
import {
  createChart,
  ColorType,
  AreaSeries,
  LineWidth,
} from "lightweight-charts";
import { format } from "date-fns";

// Smooth data using interpolation for curved lines
const smoothData = (
  data: Array<{ time: string | number; value: number }>,
  tension: number = 0.5
) => {
  if (data.length < 2) return data;

  const smoothed: Array<{ time: number; value: number }> = [];
  const points = data.map((d) => ({
    time: typeof d.time === "string" ? parseInt(d.time) : d.time,
    value: d.value,
  }));

  // Add interpolated points between each pair of data points
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    smoothed.push(p1);

    // Add interpolated points using Catmull-Rom spline
    const steps = 8; // Number of interpolated points
    for (let t = 1; t < steps; t++) {
      const t_norm = t / steps;
      const t2 = t_norm * t_norm;
      const t3 = t2 * t_norm;

      // Catmull-Rom spline formula
      const value =
        0.5 *
        (2 * p1.value +
          (-p0.value + p2.value) * t_norm +
          (2 * p0.value - 5 * p1.value + 4 * p2.value - p3.value) * t2 +
          (-p0.value + 3 * p1.value - 3 * p2.value + p3.value) * t3);

      const time = p1.time + (p2.time - p1.time) * t_norm;

      smoothed.push({ time, value });
    }
  }

  // Add the last point
  smoothed.push(points[points.length - 1]);

  return smoothed;
};

export const FeaturelessChart = ({
  data,
  isDark = true,
  lineColor = "#1dd13a",
}: {
  data: Array<{ time: string | number; value: number }>;
  isDark?: boolean;
  lineColor?: string;
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const RIGHT_PADDING = 8;

  const getChartOptions = (width: number) => ({
    layout: {
      background: {
        type: ColorType.Solid,
        color: "transparent",
      },
      attributionLogo: false,
    },
    width: width,
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
      rightOffset: RIGHT_PADDING,
    },
    handleScroll: false,
    handleScale: false,
  });

  // Convert hex color to rgba for gradient
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const areaSeriesOptions = {
    lineWidth: 2 as LineWidth,
    relativeGradient: false,
    lastPriceAnimation: 1,
    crosshairMarkerVisible: false,
    priceLineVisible: false,
    crosshairMarkerBorderColor: "red",
    lineColor: lineColor,
    topColor: hexToRgba(lineColor, 0.3),
    bottomColor: hexToRgba(lineColor, 0),
  };
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Add unique class to container for scoped CSS
    const containerId = `featureless-chart-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    chartContainerRef.current.setAttribute("data-chart-container", containerId);

    // Inject scoped CSS to force overflow visible on all chart elements
    const styleId = "featureless-chart-overflow-fix";
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    // Add scoped styles for this chart instance
    const scopedStyle = `
      [data-chart-container="${containerId}"] .tv-lightweight-charts,
      [data-chart-container="${containerId}"] .tv-lightweight-charts *,
      [data-chart-container="${containerId}"] .tv-lightweight-charts canvas,
      [data-chart-container="${containerId}"] .tv-lightweight-charts table,
      [data-chart-container="${containerId}"] .tv-lightweight-charts td,
      [data-chart-container="${containerId}"] .tv-lightweight-charts tr,
      [data-chart-container="${containerId}"] .tv-lightweight-charts div {
        overflow: visible !important;
        overflow-x: visible !important;
        overflow-y: visible !important;
      }
    `;

    if (!styleElement.textContent?.includes(containerId)) {
      styleElement.textContent = (styleElement.textContent || "") + scopedStyle;
    }

    // Apply overflow visible to container and all child elements
    chartContainerRef.current.style.overflow = "visible";

    const toolTip = document.createElement("span");
    toolTip.classList.add("chart-tooltip");
    chartContainerRef.current.appendChild(toolTip);

    const containerWidth = chartContainerRef.current.clientWidth || 0;
    const chart = createChart(
      chartContainerRef.current,
      getChartOptions(containerWidth)
    );

    // Apply overflow visible to lightweight-charts internal elements, especially canvas
    const applyOverflowVisible = () => {
      if (!chartContainerRef.current) return;
      // Target all elements including canvas specifically
      const chartElements = chartContainerRef.current.querySelectorAll(
        ".tv-lightweight-charts, .tv-lightweight-charts *, canvas, table, td, tr, div"
      );
      chartElements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        if (htmlEl) {
          htmlEl.style.overflow = "visible";
          htmlEl.style.overflowX = "visible";
          htmlEl.style.overflowY = "visible";
        }
      });
    };

    // Apply immediately and with multiple delays to catch all dynamically created elements
    applyOverflowVisible();
    setTimeout(applyOverflowVisible, 50);
    setTimeout(applyOverflowVisible, 100);
    setTimeout(applyOverflowVisible, 200);

    // Use MutationObserver to catch any newly created elements
    const observer = new MutationObserver(() => {
      applyOverflowVisible();
    });

    if (chartContainerRef.current) {
      observer.observe(chartContainerRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["style"],
      });
    }

    const series = chart.addSeries(AreaSeries, areaSeriesOptions);

    let chartData;
    if (data && data.length > 0) {
      chartData = smoothData(data);
    } else {
      // Fallback test data if no data provided
      // Generate random test data
      const baseTime = Math.floor(Date.now() / 1000) - 86400 * 30; // 30 days ago
      const test_data = Array.from({ length: 30 }, (_, i) => ({
        time: baseTime + i * 86400, // One day intervals
        value: Math.random() * 50 + 10, // Random value between 10 and 60
      }));
      chartData = smoothData(test_data);
    }

    series.setData(chartData as any);

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

    // Apply overflow visible after chart is fully rendered
    setTimeout(applyOverflowVisible, 300);

    const handleResize = () => {
      if (chartContainerRef.current) {
        const containerWidth = chartContainerRef.current.clientWidth || 0;
        chart.applyOptions({
          width: containerWidth,
          timeScale: {
            visible: false,
            rightOffset: RIGHT_PADDING,
          },
        });
        // Reapply overflow visible after resize
        setTimeout(applyOverflowVisible, 50);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
      chart.remove();
      // Remove injected style on unmount
      const style = document.getElementById("featureless-chart-overflow-fix");
      if (style) {
        style.remove();
      }
    };
  }, [data, lineColor]);

  return (
    <div
      ref={chartContainerRef}
      className="w-full h-full relative overflow-visible"
      style={{ paddingRight: "8px" }}
    />
  );
};
