"use client";

import React, { useState, useEffect } from "react";
import CountUp from "react-countup";
import { Users, AlertTriangle, Leaf } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"; //
import { cn } from "@/lib/utils"; //

interface PlatformStats {
  totalUsers: number;
  totalActivities: number;
  totalBusinesses: number;
  totalProducts: number;
}

interface CounterCardProps {
  icon: React.ElementType;
  title: string;
  value: number;
  duration?: number;
  description?: string;
  className?: string;
  iconClassName?: string;
}

const CounterCard: React.FC<CounterCardProps> = ({
  icon: Icon,
  title,
  value,
  duration = 2,
  description,
  className,
  iconClassName,
}: any) => (
  <Card className="flex h-[300px] w-[300px] flex-col items-center justify-center border-none bg-gradient-to-br from-blue-100 via-white to-sky-50 p-6 text-center transition-all duration-500 hover:scale-105 hover:shadow-xl">
    <CardHeader className="mb-3 flex items-center justify-center p-0">
      <div
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-white to-sky-600 shadow-lg",
          iconClassName,
        )}
      >
        <Icon className={cn("h-6 w-6 text-green-600", iconClassName)} />
      </div>
      <CardTitle className="text-lg font-semibold text-baseColor">
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="p-0">
      <div className="text-4xl font-bold text-baseColor">
        <CountUp end={value} duration={duration} separator="," />
      </div>
      {description && (
        <CardDescription className="mt-1 text-xs text-gray-500">
          {description}
        </CardDescription>
      )}
    </CardContent>
  </Card>
);

export const DynamicCounters: React.FC = () => {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/platform-stats");
        if (!response.ok) {
          throw new Error("No se pudieron cargar las estadísticas");
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Ocurrió un error desconocido",
        );
        setStats(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 py-8 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card
            key={i}
            className="flex h-48 animate-pulse flex-col items-center justify-center p-6"
          >
            <div className="mb-3 h-12 w-12 rounded-full bg-gray-300"></div>
            <div className="mb-2 h-4 w-3/4 rounded bg-gray-300"></div>
            <div className="h-8 w-1/2 rounded bg-gray-300"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center text-red-600">
        <AlertTriangle className="mx-auto mb-2 h-10 w-10" />
        <p>Error al cargar estadísticas: {error}</p>
      </div>
    );
  }

  if (!stats) {
    return null; // O un mensaje de "No hay datos disponibles"
  }

  return (
    <div className="flex w-full flex-col items-center justify-center gap-6 md:flex-row">
      <CounterCard
        icon={Users}
        title="Usuarios Registrados"
        value={stats.totalUsers}
        description="Miembros activos en nuestra comunidad."
        iconClassName="text-blue-600"
      />
      <CounterCard
        icon={Leaf}
        title="Actividades Registradas"
        value={stats.totalActivities}
        description="Acciones ecológicas completadas."
        iconClassName="text-teal-600"
      />
      {/* <CounterCard
                icon={Store}
                title="Negocios Promocionados"
                value={stats.totalBusinesses}
                description="Negocios sostenibles destacados."
                iconClassName="text-purple-600"
                className="w-[250px] h-[250px]"
            />
            <CounterCard
                icon={ShoppingBasket}
                title="Productos Promocionados"
                value={stats.totalProducts}
                description="Productos eco-amigables disponibles."
                iconClassName="text-pink-600"
                className="w-[250px] h-[250px]"
            /> */}
    </div>
  );
};
