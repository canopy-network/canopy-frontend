"use client";

import React, { useState, useEffect } from "react";
import { Chain, VirtualPool, Accolade } from "@/types/chains";
import { ProjectCard } from "./project-card";
import {
  getChainPriceHistory,
  convertPriceHistoryToChart,
} from "@/lib/api/price-history";
import { chainsApi } from "@/lib/api/chains";
import { filterAccoladesByCategory } from "@/lib/utils/chain-ui-helpers";

interface RecentsProjectsCarouselProps {
  projects: Chain[];
  virtualPools?: Record<string, VirtualPool>;
  onBuyClick: (project: Chain) => void;
}

export const RecentsProjectsCarousel = ({
  projects,
  virtualPools = {},
  onBuyClick,
}: RecentsProjectsCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [priceHistoryData, setPriceHistoryData] = useState<
    Record<string, Array<{ value: number; time: number }>>
  >({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );
  const [accoladesData, setAccoladesData] = useState<
    Record<string, Accolade[]>
  >({});

  // Get first 4 projects
  const displayProjects = projects.slice(0, 4);

  // Fetch price history and accolades for all display projects
  useEffect(() => {
    const fetchProjectData = async () => {
      for (const project of displayProjects) {
        // Skip if already loaded or loading
        if (priceHistoryData[project.id] || loadingStates[project.id]) {
          continue;
        }

        // Set loading state
        setLoadingStates((prev) => ({ ...prev, [project.id]: true }));

        // Fetch price history and accolades in parallel
        try {
          const [priceHistoryResponse, accoladesResponse] = await Promise.all([
            getChainPriceHistory(project.id).catch(() => ({ data: null })),
            chainsApi.getAccolades(project.id).catch(() => ({ data: null })),
          ]);

          // Handle price history
          if (
            priceHistoryResponse.data &&
            priceHistoryResponse.data.length > 0
          ) {
            const chartData = convertPriceHistoryToChart(
              priceHistoryResponse.data
            );
            setPriceHistoryData((prev) => ({
              ...prev,
              [project.id]: chartData,
            }));
          } else {
            // No data available - set empty array
            setPriceHistoryData((prev) => ({
              ...prev,
              [project.id]: [],
            }));
          }

          // Handle accolades
          if (accoladesResponse.data) {
            const filteredAccolades = filterAccoladesByCategory(
              accoladesResponse.data
            );
            setAccoladesData((prev) => ({
              ...prev,
              [project.id]: filteredAccolades,
            }));
          }
        } catch (error) {
          console.error(`Failed to fetch data for ${project.id}:`, error);
          // Set empty arrays to indicate no data available
          setPriceHistoryData((prev) => ({
            ...prev,
            [project.id]: [],
          }));
        } finally {
          setLoadingStates((prev) => ({ ...prev, [project.id]: false }));
        }
      }
    };

    fetchProjectData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayProjects.map((p) => p.id).join(",")]); // Only re-run if projects change

  // Auto-advance carousel every 3 seconds
  useEffect(() => {
    if (!isAutoPlaying || displayProjects.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === displayProjects.length - 1 ? 0 : prevIndex + 1
      );
    }, 10000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, displayProjects.length]);

  // Handle manual navigation
  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? displayProjects.length - 1 : prevIndex - 1
    );
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === displayProjects.length - 1 ? 0 : prevIndex + 1
    );
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  if (displayProjects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">No recent projects available</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Carousel Container */}
      <div className="relative  rounded-lg mb-2">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {displayProjects.map((project, index) => {
            // Use embedded virtual_pool from project, or fallback to virtualPools prop
            const virtualPool =
              project.virtual_pool || virtualPools[project.id];
            const chartData = priceHistoryData[project.id];
            const accolades = accoladesData[project.id] || [];

            return (
              <div
                key={project.id}
                className={`w-full flex-shrink-0 transition-opacity duration-500 ease-in-out ${
                  index !== currentIndex
                    ? "opacity-0 pointer-events-none"
                    : "opacity-100 pointer-events-auto"
                }`}
              >
                <ProjectCard
                  project={project}
                  virtualPool={virtualPool}
                  chartData={chartData}
                  onBuyClick={onBuyClick}
                  accolades={accolades}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Dots Indicator - Top */}
      {displayProjects.length > 1 && (
        <div className="flex justify-center  mb-6">
          {displayProjects.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className="cursor-pointer py-3 px-1"
            >
              <span
                className={`block h-2 rounded-full transition-all duration-200 ${
                  index === currentIndex
                    ? "bg-white w-12"
                    : "bg-gray-500 hover:bg-gray-400 w-3"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
