"use client";

import { useEffect, useState } from "react";
import type { UserStats } from "@/types/types";
import {
  Clock4,
  CircleQuestionMark,
  Crown,
  Leaf,
  Trophy,
} from "lucide-react";
import { luckiestGuy } from "@/fonts/fonts";

export const calculateNextGoal = (points: number): number => {
  if (points < 500) return 500;
  return Math.ceil(points / 500) * 500;
};

export const calculatePreviousGoal = (points: number): number => {
  if (points < 500) return 0;
  return Math.floor(points / 500) * 500;
};

export const calculateProgress = (points: number): number => {
  const nextGoal = calculateNextGoal(points);
  const previousGoal = calculatePreviousGoal(points);

  if (nextGoal === previousGoal) return 100;

  const progress = ((points - previousGoal) / (nextGoal - previousGoal)) * 100;
  return Math.min(Math.max(progress, 0), 100);
};

const EcoPointsUserCardProposal3 = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<UserStats>({
    totalPoints: 0,
    activityCount: 0,
    recentActivities: [],
  });

  const nextGoal = calculateNextGoal(stats.totalPoints);
  const progress = calculateProgress(stats.totalPoints);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setIsLoading(true);
        const statsResponse = await fetch("/api/stats");
        if (!statsResponse.ok) {
          throw new Error("Error al obtener estadísticas");
        }
        const statsData = await statsResponse.json();

        const activitiesResponse = await fetch("/api/activities?limit=3");
        if (!activitiesResponse.ok) {
          throw new Error("Error al obtener actividades");
        }
        const activitiesData = await activitiesResponse.json();

        const userResponse = await fetch("/api/auth/session");
        if (!userResponse.ok) {
          throw new Error("Error al obtener datos del usuario");
        }
        const userData = await userResponse.json();

        setStats({
          totalPoints: statsData.totalPoints || 0,
          activityCount: statsData.activityCount || 0,
          recentActivities: activitiesData.activities || [],
        });
      } catch (error) {
        console.error("Error al cargar datos del dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserStats();
  }, []);

  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-lime-50 to-emerald-50 p-0.5 shadow-xl">
        <div className="relative m-0.5 rounded-3xl bg-white p-6">
          <div className="animate-pulse text-center">
            <div className="mx-auto mb-4 h-[90px] w-[90px] rounded-full bg-lime-200"></div>
            <div className="mb-2 h-8 rounded bg-lime-200"></div>
            <div className="mb-4 h-12 rounded bg-lime-200"></div>
            <div className="mb-2 h-6 rounded bg-lime-200"></div>
            <div className="h-3 rounded bg-lime-200"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-xl border-2 border-lime-200 bg-white shadow-xl transition-all duration-500 hover:scale-105 hover:border-lime-300">
      {/* Geometric eco pattern background */}
      <div className="absolute inset-0 opacity-5">
        <svg className="h-full w-full" viewBox="0 0 100 100">
          <defs>
            <pattern
              id="eco-pattern"
              x="0"
              y="0"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx="10"
                cy="10"
                r="2"
                fill="currentColor"
                className="text-lime-500"
              />
              <path
                d="M5,5 L15,15 M15,5 L5,15"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-emerald-500"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#eco-pattern)" />
        </svg>
      </div>

      <div className="relative p-8">
        <div className="flex flex-col items-center justify-center text-center">
          {/* Modern header with energy theme */}
          <div className="mb-6 flex flex-col">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-lime-100 to-emerald-100 px-4 py-2">
              <CircleQuestionMark className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-semibold uppercase tracking-wide text-green-600 sm:text-sm">
                ¿SchoChampion?
              </span>
              <Crown className="h-4 w-4 text-green-600" />
            </div>
            <h3 className="text-3xl font-extrabold uppercase tracking-wider text-schoMetricsBaseColor sm:text-4xl">
              <p className={`${luckiestGuy.className}`}>EcoPoints:</p>
            </h3>
          </div>

          {/* EcoPoints Background - UNCHANGED */}
          <div className="mb-8">
            <div
              className="relative mx-auto h-[63px] w-[200px] bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage:
                  "url('https://zibiwzddvrpjapmmgyeu.supabase.co/storage/v1/object/public/schometrics-for-schools/schometrics-resources/media/ecopoints-badge.svg')",
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className="ml-10 animate-heartbeat pt-1 text-xl font-bold tracking-wide text-white"
                  style={{
                    textShadow: "2px 2px 4px rgba(0,0,0,0.9)",
                  }}
                >
                  {stats.totalPoints.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Stats cards */}
          <div className="flex flex-col items-center justify-center gap-4 pb-5 sm:flex-row sm:justify-center">
            <div className="rounded-xl border border-lime-200 bg-gradient-to-br from-lime-50 to-emerald-50 p-4">
              <Leaf className="mx-auto mb-2 h-6 w-6 animate-spin text-lime-600" />
              <div className="text-xs uppercase tracking-wide text-gray-600">
                Actividades
              </div>
              <div className="text-lg font-bold text-lime-700">
                {stats.activityCount}
              </div>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
              <Trophy className="mx-auto mb-2 h-6 w-6 animate-heartbeat text-emerald-600" />
              <div className="text-xs uppercase tracking-wide text-gray-600">
                ¿ Serás el
              </div>
              <div className="text-lg font-bold text-emerald-700">#1 ?</div>
            </div>
          </div>

          {/* Progress section with modern design */}
          <div className="w-full space-y-4 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 shadow-lg shadow-schoMetricsBaseColor/30">
            <div className="space-y-2">
              <div
                className="flex flex-col items-center justify-center text-sm md:flex-row md:justify-between"
                title={`Próximo Objetivo  Llegar a ${nextGoal.toLocaleString()} EcoPoints`}
              >
                <div className="flex items-center gap-2">
                  <Clock4 className="h-4 w-4 animate-spin text-sky-500" />
                  <span className="font-semibold text-sky-500">
                    Próximo Objetivo
                  </span>
                </div>
                <span className="font-bold uppercase tracking-wide text-[#17d627]">
                  <p
                    className={`${luckiestGuy.className}`}
                    title="Próximo Objetivo Llegar a 500 EcoPoints"
                  >
                    {nextGoal.toLocaleString()} EcoPoints
                  </p>
                </span>
              </div>

              {/* Barra de progreso dinámica */}
              <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="relative h-3 rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-teal-500 transition-all duration-700 ease-out"
                  style={{ width: `${progress}%` }}
                  title="Barra de Progreso Dinámica Para llegar al Próximo Objetivo"
                >
                  <div
                    className="absolute inset-0 animate-pulse bg-white/30"
                    title="Barra de Progreso Dinámica Para llegar al Próximo Objetivo"
                  ></div>
                </div>
              </div>

              {/* Indicador de progreso en texto */}
              <div
                className={`${luckiestGuy.className} mt-1 flex flex-col items-center justify-between text-xs tracking-wider text-[#17d627] sm:flex-row`}
              >
                <span
                  title={`Objetivo Actual de ${calculatePreviousGoal(stats.totalPoints).toLocaleString()} a ${nextGoal.toLocaleString()} EcoPoints`}
                >
                  {calculatePreviousGoal(stats.totalPoints).toLocaleString()}{" "}
                  Epts
                </span>
                <span
                  className="text-2xl font-bold tracking-wider text-sky-400"
                  title="Porcentaje de Progreso de EcoPoints con respecto al Próximo Objetivo"
                >
                  {progress.toFixed(1)}%
                </span>
                <span
                  title={`Próximo Objetivo  Llegar a ${nextGoal.toLocaleString()} EcoPoints`}
                >
                  {nextGoal.toLocaleString()} Epts
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EcoPointsUserCardProposal3;
