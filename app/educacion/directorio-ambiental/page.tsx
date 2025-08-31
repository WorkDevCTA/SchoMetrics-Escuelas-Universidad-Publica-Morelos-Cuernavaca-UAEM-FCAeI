"use client";

import React from "react";
import { Globe } from "lucide-react";
import ResourceSection from "./components/ResourceSection";
import AccordionMedia from "./components/AccordionMedia";
import { directoryData } from "./data";
import DashboardLayout from "@/app/components/DashboardLayout";
import { FloatingNavEducation } from "../components/FloatingNavEducation";

export default function DirectorioAmbientalPage() {
  return (
    <DashboardLayout>
      <FloatingNavEducation />
      <div className="flex flex-col gap-8 p-6">
        <div className="mt-16 flex flex-col gap-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 p-8 text-white shadow-2xl lg:mt-0">
          <h1 className="flex flex-col items-center gap-3 text-4xl font-bold tracking-tight md:flex-row">
            <Globe className="h-10 w-10 animate-bounce" />
            Directorio de Recursos Ambientales
          </h1>
          <p className="text-center text-lg opacity-90 md:text-start">
            {" "}
            Explora organizaciones, entidades y materiales educativos clave para
            la sostenibilidad en México y Morelos
          </p>
        </div>

        {directoryData.sections.map((section) => (
          <ResourceSection
            key={section.id}
            section={section}
            cardType={
              section.id === "ngos-mexico" ? "organization" : "organization"
            }
          />
        ))}

        <AccordionMedia
          title={directoryData.mediaSection.title}
          items={directoryData.mediaSection.accordionItems}
        />
      </div>
    </DashboardLayout>
  );
}
