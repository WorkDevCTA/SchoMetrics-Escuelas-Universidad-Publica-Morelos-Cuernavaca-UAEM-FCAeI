"use client";
import React from "react";
import { FloatingNav } from "@/components/ui/floating-navbar";
import {
  FileSpreadsheet,
  ImagePlay,
  FileVideo2,
  LucideGlobe2,
} from "lucide-react";
export function FloatingNavEducation() {
  const navItems = [
    {
      name: "Artículos",
      link: "/educacion/articulos",
      icon: <FileSpreadsheet className="h-4 w-4 text-white" />,
    },
    {
      name: "Visual",
      link: "/educacion/visual",
      icon: <ImagePlay className="h-4 w-4 text-white" />,
    },
    {
      name: "Videos",
      link: "/educacion/videos",
      icon: <FileVideo2 className="h-4 w-4 text-white" />,
    },
    {
      name: "Directorio",
      link: "/educacion/directorio-ambiental",
      icon: <LucideGlobe2 className="h-4 w-4 text-white" />,
    },
  ];
  return (
    <div className="relative z-[4999] w-full">
      <FloatingNav navItems={navItems} />
    </div>
  );
}
