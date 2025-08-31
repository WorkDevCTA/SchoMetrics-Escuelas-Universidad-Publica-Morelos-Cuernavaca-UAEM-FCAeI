"use client";
import {
  Award,
  BarChart2,
  Gift,
  GraduationCap,
  Leaf,
  Map,
  Trophy,
  User,
} from "lucide-react";
import { useScroll, useTransform, motion } from "motion/react";
import React, { useEffect, useRef, useState } from "react";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

export const Timeline = ({ data }: { data: TimelineEntry[] }) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        setHeight(rect.height);
      }
    };

    handleResize(); // Initial resize calculation
    window.addEventListener("resize", handleResize); // Add event listener for resize

    return () => {
      window.removeEventListener("resize", handleResize); // Cleanup on component unmount
    };
  }, [data]); // Recalculate when data changes

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 100%"], // Adjust offset to better track scroll position
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  const iconSection = [
    {
      icon: <Leaf className="h-7 w-7 animate-heartbeat text-green-500" />,
    },
    {
      icon: <BarChart2 className="h-7 w-7 animate-heartbeat text-teal-400" />,
    },
    {
      icon: (
        <GraduationCap className="h-7 w-7 animate-heartbeat text-blue-800" />
      ),
    },
    {
      icon: <Gift className="h-7 w-7 animate-heartbeat text-orange-400" />,
    },
    {
      icon: <Award className="h-7 w-7 animate-heartbeat text-yellow-400" />,
    },
    {
      icon: <Trophy className="h-7 w-7 animate-heartbeat text-purple-500" />,
    },
    {
      icon: <Map className="h-7 w-7 animate-heartbeat text-cyan-500" />,
    },
    {
      icon: <User className="h-7 w-7 animate-heartbeat text-slate-600" />,
    },
  ];

  return (
    <div className="w-full bg-white font-sans md:px-10" ref={containerRef}>
      <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 lg:px-10">
        <h1 className="mx-auto mb-16 max-w-full text-center text-2xl font-bold text-slate-600 md:text-4xl lg:text-6xl">
          ¿Cómo Funciona SchoMetrics?
        </h1>
        <p className="text-sm text-slate-500 md:text-base lg:text-lg">
          Explora las distintas secciones de SchoMetrics, sube Actividades
          Ambientales, canjea increíbles Recompensas y conviertete en una
          persona más sostenible, cada acción, aún por más pequeña cuenta.{" "}
          <b className="text-baseColor">
            ¿Estás listo para ser el #1 en Sostenibilidad Ambiental?
          </b>
        </p>
      </div>

      <div ref={ref} className="relative mx-auto max-w-7xl pb-20">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex justify-start pt-10 md:gap-10 md:pt-40"
          >
            <div className="sticky top-40 z-40 flex max-w-xs flex-col items-center self-start md:w-full md:flex-row lg:max-w-sm">
              <div className="absolute left-3 flex h-10 w-10 items-center justify-center rounded-full bg-white md:left-3">
                {iconSection[index].icon}
              </div>
              <h3 className="hidden text-xl font-bold text-baseColor md:block md:pl-20 md:text-5xl">
                {item.title}
              </h3>
            </div>

            <div className="relative w-full pl-20 pr-4 md:pl-4">
              <h3 className="mb-4 block text-left text-2xl font-bold text-baseColor md:hidden">
                {item.title}
              </h3>
              {item.content}
            </div>
          </div>
        ))}
        <div
          style={{
            height: height + "px",
          }}
          className="absolute left-8 top-0 w-[2px] overflow-hidden bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-green-100 to-transparent to-[99%] [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)] md:left-8"
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0 w-[2px] rounded-full bg-gradient-to-t from-sky-400 from-[0%] via-baseColor via-[10%] to-transparent"
          />
        </div>
      </div>
    </div>
  );
};
