"use client";

import React, { useState, useEffect } from "react";
import { ChainWithUI } from "@/lib/stores/chains-store";
import { VirtualPool } from "@/types/chains";
import { ProjectCard } from "./project-card";

interface RecentsProjectsCarouselProps {
  projects: ChainWithUI[];
  virtualPools?: Record<string, VirtualPool>;
  onBuyClick: (project: ChainWithUI) => void;
}

const SAMPLE_CHART_DATA = [
  { time: "2024-01-01", value: 0.1 },
  { time: "2024-01-02", value: 0.12 },
  { time: "2024-01-03", value: 0.15 },
  { time: "2024-01-04", value: 0.18 },
  { time: "2024-01-05", value: 0.22 },
];
export const RecentsProjectsCarousel = ({
  projects,
  virtualPools = {},
  onBuyClick,
}: RecentsProjectsCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Get first 4 projects
  const displayProjects = projects.slice(0, 4);

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
            const virtualPool = virtualPools[project.id];

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
                  chartData={SAMPLE_CHART_DATA}
                  onBuyClick={onBuyClick}
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
