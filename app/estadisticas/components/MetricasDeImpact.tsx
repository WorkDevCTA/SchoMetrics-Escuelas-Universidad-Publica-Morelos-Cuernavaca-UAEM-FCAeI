"use client";

import type React from "react";

import LoaderCircle from "@/app/components/LoaderCircle";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Leaf,
  Droplets,
  Zap,
  Recycle,
  TreePine,
  TrendingUp,
} from "lucide-react";
import { StatsData } from "@/types/types";

interface getPeriod {
  period: string;
}

const MetricasDeImpacto: React.FC<getPeriod> = ({ period }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);

        // Obtener estadísticas
        const response = await fetch(`/api/stats?period=${period}`);
        if (!response.ok) {
          throw new Error("Error al obtener estadísticas");
        }
        const data = await response.json();

        // Obtener datos del usuario (incluye nivel)
        const userResponse = await fetch("/api/auth/session");
        if (!userResponse.ok) {
          throw new Error("Error al obtener datos del usuario");
        }
        const userData = await userResponse.json();
        setStats(data);
      } catch (error) {
        console.error("Error al cargar estadísticas:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [period]);

  if (isLoading) {
    return (
      <div className="py-10 text-center">
        <LoaderCircle />
        <h3 className="text-lg font-medium">
          Cargando las Métricas de Impacto...
        </h3>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="py-10 text-center">
        <LoaderCircle />
        <h3 className="text-lg font-medium">
          Cargando las Métricas de Impacto...
        </h3>
        <p className="mt-1 text-muted-foreground">
          Si el tiempo de espera se extiende, intenta recargar la página.
        </p>
      </div>
    );
  }

  const impactData = [
    {
      name: "Material Reciclado",
      value: stats.impactMetrics.recycledMaterials,
      unit: "kg",
      color: "#22c55e",
      icon: Recycle,
      co2Impact: stats.impactMetrics.recycledMaterials * 0.5,
    },
    {
      name: "Árboles Plantados",
      value: stats.impactMetrics.treesPlanted,
      unit: "árboles",
      color: "#16a34a",
      icon: TreePine,
      co2Impact: stats.impactMetrics.treesPlanted * 25,
    },
    {
      name: "Agua Ahorrada",
      value: stats.impactMetrics.waterSaved,
      unit: "litros",
      color: "#0ea5e9",
      icon: Droplets,
      co2Impact: 0, // El agua no tiene impacto directo en CO2
    },
    {
      name: "Energía Ahorrada",
      value: stats.impactMetrics.energySaved,
      unit: "kWh",
      color: "#f59e0b",
      icon: Zap,
      co2Impact: stats.impactMetrics.energySaved * 0.5,
    },
  ];

  // Datos para el gráfico de CO2 evitado
  const co2Data = impactData
    .filter((item) => item.co2Impact > 0)
    .map((item) => ({
      name: item.name,
      co2Evitado: item.co2Impact,
      color: item.color,
    }));

  // Datos para el gráfico de actividades por tipo
  const activityTypeData = stats.activityStats.map((stat) => ({
    type:
      stat.type === "RECYCLING"
        ? "Reciclaje"
        : stat.type === "TREE_PLANTING"
          ? "Plantación"
          : stat.type === "WATER_SAVING"
            ? "Ahorro Agua"
            : stat.type === "ENERGY_SAVING"
              ? "Ahorro Energía"
              : stat.type,
    cantidad: stat._sum.quantity || 0,
    actividades: stat._count.id,
    puntos: stat._sum.points || 0,
  }));

  // Datos para el gráfico de tendencia temporal
  const timeSeriesFormatted = stats.timeSeries.map((item) => ({
    fecha: new Date(item.date).toLocaleDateString("es-ES", {
      month: "short",
      day: "numeric",
    }),
    puntos: item.points,
    actividades: item.count,
  }));

  return (
    <div className="my-10 space-y-8">
      <div className="space-y-2 text-center">
        <h2 className="flex flex-col items-center justify-center gap-2 text-3xl font-bold text-green-800 sm:flex-row">
          <TrendingUp className="h-10 w-10 text-green-700" />
          Métricas de Impacto Ambiental
        </h2>
        <p className="text-lg text-muted-foreground">
          Visualización del impacto positivo de tus actividades ambientales
        </p>
      </div>
      {/* Métricas Generales */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {impactData.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <Card
              key={index}
              className="border-2 shadow-md transition-shadow hover:shadow-lg"
              style={{ borderColor: metric.color + "40" }}
            >
              <CardHeader
                className="pb-2"
                style={{ backgroundColor: metric.color + "10" }}
              >
                <div className="flex items-center justify-between">
                  <IconComponent
                    className="h-8 w-8"
                    style={{ color: metric.color }}
                  />
                  <span
                    className="text-2xl font-bold"
                    style={{ color: metric.color }}
                  >
                    {metric.value.toFixed(1)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold text-gray-800">{metric.name}</h3>
                <p className="text-sm text-muted-foreground">{metric.unit}</p>
                {metric.co2Impact > 0 && (
                  <p className="mt-1 text-xs text-green-600">
                    CO₂ evitado: {metric.co2Impact.toFixed(1)} kg
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      <Card className="mt-10 rounded-xl border-4 border-gray-50 transition-all ease-linear hover:border-baseColor/80">
        <CardHeader>
          <CardTitle>Impacto ambiental</CardTitle>
          <CardDescription>
            Medición del impacto positivo de tus actividades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Material reciclado</h3>
                  <span className="font-bold">
                    {stats.impactMetrics.recycledMaterials.toFixed(1)} kg
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Equivalente a:</p>
                  <ul className="mt-1 list-inside list-disc space-y-1">
                    <li>
                      {Math.round(
                        (stats.impactMetrics.recycledMaterials as number) * 0.5,
                      )}{" "}
                      kg de CO₂ evitados
                    </li>
                    <li>
                      {Math.round(
                        (stats.impactMetrics.recycledMaterials as number) * 0.2,
                      )}{" "}
                      litros de petróleo ahorrados
                    </li>
                    <li>
                      {Math.round(
                        (stats.impactMetrics.recycledMaterials as number) * 2,
                      )}{" "}
                      kWh de energía ahorrados
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Árboles plantados</h3>
                  <span className="font-bold">
                    {stats.impactMetrics.treesPlanted}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Beneficios:</p>
                  <ul className="mt-1 list-inside list-disc space-y-1">
                    <li>
                      Capturarán aprox.{" "}
                      {(stats.impactMetrics.treesPlanted as number) * 25} kg de
                      CO₂ al año
                    </li>
                    <li>
                      Producirán oxígeno para{" "}
                      {(stats.impactMetrics.treesPlanted as number) * 2}{" "}
                      personas
                    </li>
                    <li>Ayudarán a prevenir la erosión del suelo</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Agua ahorrada</h3>
                  <span className="font-bold">
                    {stats.impactMetrics.waterSaved.toFixed(1)} litros
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Equivalente a:</p>
                  <ul className="mt-1 list-inside list-disc space-y-1">
                    <li>
                      {Math.round(
                        (stats.impactMetrics.waterSaved as number) / 150,
                      )}{" "}
                      duchas completas
                    </li>
                    <li>
                      {Math.round(
                        (stats.impactMetrics.waterSaved as number) / 10,
                      )}{" "}
                      cargas de lavadora
                    </li>
                    <li>
                      Agua potable para{" "}
                      {Math.round(
                        (stats.impactMetrics.waterSaved as number) / 2,
                      )}{" "}
                      personas por un día
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Energía ahorrada</h3>
                  <span className="font-bold">
                    {stats.impactMetrics.energySaved.toFixed(1)} kWh
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Equivalente a:</p>
                  <ul className="mt-1 list-inside list-disc space-y-1">
                    <li>
                      {Math.round(
                        (stats.impactMetrics.energySaved as number) * 0.5,
                      )}{" "}
                      kg de CO₂ evitados
                    </li>
                    <li>
                      {Math.round(
                        (stats.impactMetrics.energySaved as number) / 5,
                      )}{" "}
                      días de consumo de un hogar promedio
                    </li>
                    <li>
                      {Math.round(
                        (stats.impactMetrics.energySaved as number) * 0.1,
                      )}{" "}
                      litros de combustible ahorrados
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Charts */}
      <div className="flex flex-col items-center justify-center gap-6 xl:flex-row xl:justify-around">
        <Card className="w-full overflow-auto border-2 border-green-100 shadow-lg transition-all duration-300 ease-linear hover:scale-105 sm:w-min">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Recycle className="h-5 w-5" />
              Resumen de Impacto por Categoría
            </CardTitle>
            <CardDescription>
              Cantidad total de impacto generado por cada tipo de actividad
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ChartContainer
              config={{
                value: {
                  label: "Valor",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={impactData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ChartTooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-lg border border-green-200 bg-white p-3 shadow-lg">
                            <p className="font-semibold text-green-800">
                              {label}
                            </p>
                            <p className="text-green-600">{`${data.value.toFixed(1)} ${data.unit}`}</p>
                            {data.co2Impact > 0 && (
                              <p className="text-sm text-gray-600">
                                CO₂ evitado: {data.co2Impact.toFixed(1)} kg
                              </p>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {impactData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {co2Data.length > 0 && (
          <Card className="w-full overflow-auto border-2 border-blue-100 shadow-lg transition-all duration-300 ease-linear hover:scale-105 sm:w-min">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Leaf className="h-5 w-5" />
                Impacto en Reducción de CO₂
              </CardTitle>
              <CardDescription>
                Kilogramos de CO₂ evitados por cada tipo de actividad
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ChartContainer
                config={{
                  co2Evitado: {
                    label: "CO₂ Evitado (kg)",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[250px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={co2Data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <ChartTooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border border-blue-200 bg-white p-3 shadow-lg">
                              <p className="font-semibold text-blue-800">
                                {label}
                              </p>
                              <p className="text-blue-600">{`${payload[0].value} kg de CO₂ evitados`}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="co2Evitado"
                      stroke="#0ea5e9"
                      fill="#0ea5e9"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>
      <div className="flex flex-col items-center justify-center gap-6 pt-10 xl:flex-row xl:justify-around">
        {timeSeriesFormatted.length > 0 && (
          <Card className="w-full overflow-auto border-2 border-purple-100 shadow-lg transition-all duration-300 ease-linear hover:scale-105 sm:w-min">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <TreePine className="h-5 w-5" />
                Tendencia de Actividad Ambiental
              </CardTitle>
              <CardDescription>
                Evolución de puntos y actividades en los últimos 30 días
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ChartContainer
                config={{
                  puntos: {
                    label: "Puntos",
                    color: "#8b5cf6",
                  },
                  actividades: {
                    label: "Actividades",
                    color: "#06b6d4",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeSeriesFormatted}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="puntos"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                      name="Puntos"
                    />
                    <Line
                      type="monotone"
                      dataKey="actividades"
                      stroke="#06b6d4"
                      strokeWidth={3}
                      dot={{ fill: "#06b6d4", strokeWidth: 2, r: 4 }}
                      name="Actividades"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {activityTypeData.length > 0 && (
          <Card className="w-full overflow-auto border-2 border-orange-100 shadow-lg transition-all duration-300 ease-linear hover:scale-105 sm:w-min">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50">
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <Zap className="h-5 w-5" />
                Distribución de Actividades por Tipo
              </CardTitle>
              <CardDescription>
                Proporción de cada tipo de actividad ambiental realizada
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ChartContainer
                config={{
                  actividades: {
                    label: "Actividades",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={activityTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent as number * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="actividades"
                    >
                      {activityTypeData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            [
                              "#22c55e", // Verde para reciclaje
                              "#16a34a", // Verde oscuro para plantación
                              "#0ea5e9", // Azul para agua
                              "#f59e0b", // Naranja para energía
                            ][index % 4]
                          }
                        />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="rounded-lg border border-orange-200 bg-white p-3 shadow-lg">
                              <p className="font-semibold text-orange-800">
                                {data.type}
                              </p>
                              <p className="text-orange-600">
                                Actividades: {data.actividades}
                              </p>
                              <p className="text-orange-600">
                                Cantidad: {data.cantidad}
                              </p>
                              <p className="text-orange-600">
                                Puntos: {data.puntos}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MetricasDeImpacto;
