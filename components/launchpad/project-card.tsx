"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LaunchpadProjectChart } from "@/components/charts/launchpad-project-chart";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, TrendingUp } from "lucide-react";
import Link from "next/link";
import { LaunchProjectItem, PROJECT_CATEGORY_LABELS } from "@/types";

/**
 * Props interface for the ProjectCard component
 * Defines the required data and callbacks for rendering a project card
 * Used by the ProjectCard component to display project information and handle user interactions
 */
export interface ProjectCardProps {
  /** Complete project data object containing all information needed for display */
  project: LaunchProjectItem;
  /** Callback function triggered when the buy button is clicked */
  onBuyClick: (project: LaunchProjectItem) => void;
}

export const ProjectCard = ({ project, onBuyClick }: ProjectCardProps) => {
  return (
    <>
      <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] border-[#2a2a2a] overflow-hidden hover:from-[#2a2a2a] hover:to-[#3a3a3a] transition-all duration-300 shadow-xl">
        <CardContent className="p-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">
                    {project.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold text-white">
                      {project.name}
                    </h2>

                    <Link href={`/launchpad/${project.id}`}>
                      <Badge className="bg-[#2a2a2a] text-white border-[#3a3a3a]">
                        ${project.name.toUpperCase()}
                      </Badge>
                    </Link>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {PROJECT_CATEGORY_LABELS[project.category]} · Published 20
                    mins ago
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-3xl font-bold text-white mb-2 leading-tight">
                  {project.description}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Buy an asset chain company with $700 in assets or not, take
                  everything onchain
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <Link
                  href={`/launchpad/${project.id}`}
                  className="w-full text-center bg-primary hover:bg-primary/90 text-black font-semibold py-3 text-lg rounded-lg hover:shadow-xl transition-all duration-200"
                >
                  Buy ${project.name.toUpperCase()}
                </Link>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Progress value={45} className="w-32 h-2 bg-[#2a2a2a]" />
                    <span className="text-sm text-muted-foreground font-medium">
                      27k/60k
                    </span>
                    <span className="text-sm text-primary font-semibold flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      24%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-64 bg-[#0a0a0a] rounded-xl p-4 flex items-center justify-center border border-[#1a1a1a]">
              <div className="w-full h-full relative">
                <LaunchpadProjectChart data={project.chartData} isDark={true} />
                <ArrowRight className="absolute top-4 right-4 h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">A</span>
            </div>
            <span className="text-sm text-muted-foreground">23k</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">By</span>
            <div className="flex -space-x-2">
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-green-500 to-blue-500 border-2 border-[#1a1a1a]"></div>
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-[#1a1a1a]"></div>
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 border-2 border-[#1a1a1a]"></div>
            </div>
            <span className="text-sm text-muted-foreground">+2</span>
            <span className="text-sm text-white font-medium">Zinic.eth</span>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <div className="text-center">
            <div className="text-muted-foreground">VOL (24h)</div>
            <div className="text-white font-semibold">
              ${(project.volume24h / 1e9).toFixed(1)}B
            </div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground">MCap</div>
            <div className="text-white font-semibold">
              ${(project.marketCap / 1e9).toFixed(2)}B
            </div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground">FDV</div>
            <div className="text-white font-semibold">
              ${(project.fdv / 1e9).toFixed(1)}B
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
