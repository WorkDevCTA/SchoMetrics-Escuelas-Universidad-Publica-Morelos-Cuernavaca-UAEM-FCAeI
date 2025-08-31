"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookText, Eye, GraduationCap } from "lucide-react";
import Image from "next/legacy/image";
import Link from "next/link";
import React, { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";

interface EducationSectionContentType {
  imageCard: string;
  badgeContent: string;
  title: string;
  description: string;
  url: string;
}

export const EducationSectionsContente: EducationSectionContentType[] = [
  {
    imageCard: "/education/robot.svg",
    badgeContent: "SchoMetrics Education",
    title: "Artículos y guías",
    description:
      "Explora distintos artículos y guias sobre, sostenibilidad, medio ambiente, entre otros temas.",
    url: "/educacion/articulos/",
  },
  {
    imageCard: "/education/cactus.svg",
    badgeContent: "SchoMetrics Education",
    title: "Material Visual",
    description:
      "Explora distintos elementos visuales como infografías, diagramas, entre otros",
    url: "/educacion/visual/",
  },
  {
    imageCard: "/education/recording.svg",
    badgeContent: "SchoMetrics Education",
    title: "Videos Cortos",
    description:
      "Explora distintos videos educativos sobre medio ambiente, sostenibilidad, recomendaciones y mucho más.",
    url: "/educacion/videos/",
  },
  {
    imageCard: "/education/monitor.svg",
    badgeContent: "SchoMetrics Education",
    title: "Directorio Ambiental",
    description:
      "Enlaces a organizaciones gubernamentales relevantes (SEMARNAT, PROFEPA, secretarías de medio ambiente estatales), ONGs, Documentales, libros, sitios web recomendados y mucho más.",
    url: "/educacion/directorio-ambiental/",
  },
];

export default function EducationPage() {
  const [contentEducation, setContentEducation] = useState<
    EducationSectionContentType[]
  >([]);

  React.useEffect(() => {
    setContentEducation(EducationSectionsContente);
  }, []);

  return (
    <DashboardLayout>
      <div className="m-5 flex flex-col gap-8 sm:m-10">
        <div className="mt-16 flex flex-col gap-3 rounded-xl bg-gradient-to-br from-blue-900 to-gray-800 p-8 text-white shadow-2xl lg:mt-0">
          <h1 className="flex flex-col items-center gap-3 text-center text-4xl font-bold tracking-tight md:flex-row">
            <GraduationCap className="h-10 w-10 animate-bounce" />
            Educación Ambiental
          </h1>
          <p className="text-center text-lg opacity-90 md:text-start">
            Aquí encontrarás Artículos, Guías, Material Visual y mucho más para
            convertirte en una persona ambientalmente sostenible
          </p>
        </div>
        <div className="m-5 flex flex-col gap-8 sm:m-10">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {contentEducation.map((item, index) => (
              <Card
                key={index}
                title={item.title}
                className="flex flex-col overflow-hidden rounded-lg shadow-lg transition-all duration-300 ease-linear hover:scale-105 hover:shadow-xl"
              >
                <CardHeader className="p-0" title={item.title}>
                  <div className="relative h-48 w-full bg-slate-50">
                    {item.imageCard ? (
                      <Image
                        src={item.imageCard}
                        alt="Card Image"
                        layout="fill"
                        objectFit="contain"
                        priority
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-pink-100 to-teal-100">
                        <BookText className="h-16 w-16 text-green-400 opacity-70" />
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent
                  className="flex flex-grow flex-col p-4"
                  title={item.title}
                >
                  <Badge className="mb-2 self-start text-xs">
                    <p>{item.badgeContent}</p>
                  </Badge>
                  <CardTitle className="mb-1 line-clamp-2 text-lg font-semibold text-gray-800 transition-colors group-hover:text-green-600">
                    <h2>{item.title}</h2>
                  </CardTitle>
                  <CardDescription className="mb-2 line-clamp-3 flex-grow text-xs text-gray-500">
                    <span>{item.description}</span>
                  </CardDescription>
                </CardContent>
                <CardFooter className="flex items-center justify-center border-t bg-gray-50 p-3 md:justify-between">
                  <div className="flex items-center gap-2">
                    <Link href={item.url}>
                      <Button className="h-auto bg-blue-900 px-3 py-2 text-xs text-white transition-all duration-300 ease-linear hover:bg-blue-900">
                        <Eye className="mr-1 h-3.5 w-3.5" /> Ver Contenido
                      </Button>
                    </Link>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
