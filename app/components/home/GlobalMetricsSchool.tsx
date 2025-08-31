"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2,
  Recycle,
  TreePine,
  Droplets,
  Zap,
  HousePlusIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface GlobalStatsMetricsData {
  impactMetrics: {
    recycledMaterials: number;
    treesPlanted: number;
    waterSaved: number;
    energySaved: number;
  };
  impact: {
    co2Saved: number;
    waterSaved: number;
    energySaved: number;
  };
  materialsRecycled: {
    name: string;
    quantity: number;
    unit: string;
  }[];
}

// Componente para contador animado
const AnimatedCounter = ({
  value,
  duration = 2000,
  decimals = 0,
}: {
  value: number;
  duration?: number;
  decimals?: number;
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      setCount(value * progress);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return (
    <span>{decimals > 0 ? count.toFixed(decimals) : Math.floor(count)}</span>
  );
};

// Función para generar el reporte PDF
const generatePDFReport = (stats: GlobalStatsMetricsData, period: string) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // Configuración de colores temáticos
  const primaryColor: [number, number, number] = [60, 131, 211]; // Emerald-400
  const secondaryColor: [number, number, number] = [12, 100, 201]; // Emerald-500
  const textColor: [number, number, number] = [31, 41, 55]; // Gray-800

  // Header del documento
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 40, "F");

  // Logo/Icono (simulado con texto)
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("SchoMetrics", 20, 25);

  // Título del reporte
  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
  doc.text("Reporte de Impacto Ambiental", 20, 35);

  // Fecha y período
  const currentDate = new Date().toLocaleDateString("es-MX", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text(`Generado el: ${currentDate}`, pageWidth - 20, 15, {
    align: "right",
  });

  let yPosition = 60;

  // Resumen ejecutivo
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...secondaryColor);
  doc.text("Resumen Ejecutivo", 20, yPosition);

  yPosition += 15;
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...textColor);

  const summaryText = [
    `• Material reciclado: ${stats.impactMetrics.recycledMaterials.toFixed(1)} kg`,
    `• Árboles plantados: ${stats.impactMetrics.treesPlanted}`,
    `• Agua ahorrada: ${stats.impactMetrics.waterSaved.toFixed(1)} litros`,
    `• Energía ahorrada: ${stats.impactMetrics.energySaved.toFixed(1)} kWh`,
  ];

  summaryText.forEach((text) => {
    doc.text(text, 25, yPosition);
    yPosition += 8;
  });

  yPosition += 10;

  // Tabla de métricas principales
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...secondaryColor);
  doc.text("Métricas de Impacto Detalladas", 20, yPosition);

  yPosition += 10;

  const metricsData = [
    ["Métrica", "Valor", "Unidad", "Impacto Equivalente"],
    [
      "Material Reciclado",
      stats.impactMetrics.recycledMaterials.toFixed(1),
      "kg",
      `${Math.round(stats.impactMetrics.recycledMaterials * 0.5)} kg CO₂ evitados`,
    ],
    [
      "Árboles Plantados",
      stats.impactMetrics.treesPlanted.toString(),
      "unidades",
      `${stats.impactMetrics.treesPlanted * 25} kg CO₂/año capturados`,
    ],
    [
      "Agua Ahorrada",
      stats.impactMetrics.waterSaved.toFixed(1),
      "litros",
      `${Math.round(stats.impactMetrics.waterSaved / 150)} duchas completas`,
    ],
    [
      "Energía Ahorrada",
      stats.impactMetrics.energySaved.toFixed(1),
      "kWh",
      `${Math.round(stats.impactMetrics.energySaved * 0.5)} kg CO₂ evitados`,
    ],
  ];

  autoTable(doc, {
    head: [metricsData[0]],
    body: metricsData.slice(1),
    startY: yPosition,
    theme: "grid",
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 11,
    },
    bodyStyles: {
      fontSize: 10,
      textColor: textColor,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 20, right: 20 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 20;

  // Tabla de beneficios ambientales detallados
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...secondaryColor);
  doc.text("Beneficios Ambientales Detallados", 20, yPosition);

  yPosition += 10;

  const benefitsData = [
    ["Categoría", "Beneficio", "Cantidad", "Descripción"],
    [
      "Reciclaje",
      "CO₂ Evitado",
      `${Math.round(stats.impactMetrics.recycledMaterials * 0.5)} kg`,
      "Reducción de emisiones por reciclaje",
    ],
    [
      "Reciclaje",
      "Petróleo Ahorrado",
      `${Math.round(stats.impactMetrics.recycledMaterials * 0.2)} L`,
      "Combustible fósil no utilizado",
    ],
    [
      "Forestación",
      "Oxígeno Producido",
      `Para ${stats.impactMetrics.treesPlanted * 2} personas`,
      "Producción anual de oxígeno",
    ],
    [
      "Agua",
      "Cargas de Lavadora",
      `${Math.round(stats.impactMetrics.waterSaved / 10)} cargas`,
      "Equivalente en uso doméstico",
    ],
    [
      "Energía",
      "Consumo Doméstico",
      `${Math.round(stats.impactMetrics.energySaved / 5)} días`,
      "Días de consumo de hogar promedio",
    ],
  ];

  autoTable(doc, {
    head: [benefitsData[0]],
    body: benefitsData.slice(1),
    startY: yPosition,
    theme: "grid",
    headStyles: {
      fillColor: secondaryColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 11,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: textColor,
    },
    alternateRowStyles: {
      fillColor: [240, 253, 244],
    },
    margin: { left: 20, right: 20 },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 40 },
      2: { cellWidth: 35 },
      3: { cellWidth: "auto" },
    },
  });

  // Nueva página si es necesario
  if ((doc as any).lastAutoTable.finalY > pageHeight - 60) {
    doc.addPage();
    yPosition = 30;
  } else {
    yPosition = (doc as any).lastAutoTable.finalY + 20;
  }

  // Conclusiones y recomendaciones
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...secondaryColor);
  doc.text("Conclusiones y Recomendaciones", 20, yPosition);

  yPosition += 15;
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...textColor);

  const conclusions = [
    "La institución muestra un compromiso sólido con la sostenibilidad ambiental.",
    "Se recomienda mantener el ritmo actual de actividades de reciclaje.",
    "Considerar expandir el programa de plantación de árboles.",
    "Implementar más iniciativas de ahorro de agua.",
    "Explorar nuevas oportunidades de eficiencia energética.",
    "Establecer metas más ambiciosas para el próximo período.",
  ];

  conclusions.forEach((conclusion) => {
    const lines = doc.splitTextToSize(conclusion, pageWidth - 50);
    lines.forEach((line: string) => {
      doc.text(line, 25, yPosition);
      yPosition += 6;
    });
    yPosition += 2;
  });

  // Footer
  doc.setFillColor(...primaryColor);
  doc.rect(0, pageHeight - 20, pageWidth, 20, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text(
    "SchoMetrics - Transformación educativa hacia la sostenibilidad.",
    pageWidth / 2,
    pageHeight - 10,
    {
      align: "center",
    },
  );
  doc.text(``, pageWidth - 20, pageHeight - 10, { align: "right" });

  // Descargar el PDF
  const fileName = `SchoolMetrics_Reporte_${period}_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
};

// Componente para barra de progreso circular
const CircularProgress = ({
  percentage,
  size = 120,
  strokeWidth = 8,
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="-rotate-90 transform" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-green-100"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-green-500 transition-all duration-1000 ease-out"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-green-600">
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
};

const GlobalMetricsSchool = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<GlobalStatsMetricsData | null>(null);
  const [period, setPeriod] = useState("month");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/stats/global-metrics-school?period=${period}`,
        );
        if (!response.ok) {
          throw new Error("Error al obtener estadísticas");
        }
        const data = await response.json();
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
      <div className="flex h-64 flex-col items-center justify-center space-y-4">
        <div className="relative">
          <Loader2 className="h-16 w-16 animate-spin text-[#0071bc]" />
          <div className="absolute inset-0 h-16 w-16 animate-pulse rounded-full bg-emerald-100 opacity-60 blur-xl"></div>
        </div>
        <p className="animate-pulse font-medium text-gray-600">
          Cargando Métricas de Impacto...
        </p>
      </div>
    );
  }

  if (!stats) return null;

  const metrics = [
    {
      icon: Recycle,
      title: "Material Reciclado",
      value: stats.impactMetrics.recycledMaterials,
      unit: "kg",
      decimals: 1,
      color: "emerald",
      gradient: "from-emerald-400 to-teal-500",
      bgGradient: "from-emerald-50 to-teal-50",
      details: [
        `${Math.round(stats.impactMetrics.recycledMaterials * 0.5)} kg de CO₂ evitados`,
        `${Math.round(stats.impactMetrics.recycledMaterials * 0.2)} L de petróleo ahorrados`,
        `${Math.round(stats.impactMetrics.recycledMaterials * 2)} kWh de energía ahorrados`,
      ],
      percentage: Math.min(
        (stats.impactMetrics.recycledMaterials / 1000) * 100,
        100,
      ),
    },
    {
      icon: TreePine,
      title: "Árboles Plantados",
      value: stats.impactMetrics.treesPlanted,
      unit: "",
      decimals: 0,
      color: "green",
      gradient: "from-green-400 to-emerald-600",
      bgGradient: "from-green-50 to-emerald-50",
      details: [
        `${stats.impactMetrics.treesPlanted * 25} kg de CO₂/año capturados`,
        `Oxígeno para ${stats.impactMetrics.treesPlanted * 2} personas`,
        "Prevención de erosión del suelo",
      ],
      percentage: Math.min((stats.impactMetrics.treesPlanted / 100) * 100, 100),
    },
    {
      icon: Droplets,
      title: "Agua Ahorrada",
      value: stats.impactMetrics.waterSaved,
      unit: "L",
      decimals: 1,
      color: "cyan",
      gradient: "from-cyan-400 to-blue-500",
      bgGradient: "from-cyan-50 to-blue-50",
      details: [
        `${Math.round(stats.impactMetrics.waterSaved / 150)} duchas completas`,
        `${Math.round(stats.impactMetrics.waterSaved / 10)} cargas de lavadora`,
        `Agua para ${Math.round(stats.impactMetrics.waterSaved / 2)} personas/día`,
      ],
      percentage: Math.min((stats.impactMetrics.waterSaved / 10000) * 100, 100),
    },
    {
      icon: Zap,
      title: "Energía Ahorrada",
      value: stats.impactMetrics.energySaved,
      unit: "kWh",
      decimals: 1,
      color: "yellow",
      gradient: "from-yellow-400 to-orange-500",
      bgGradient: "from-yellow-50 to-orange-50",
      details: [
        `${Math.round(stats.impactMetrics.energySaved * 0.5)} kg de CO₂ evitados`,
        `${Math.round(stats.impactMetrics.energySaved / 5)} días de consumo doméstico`,
        `${Math.round(stats.impactMetrics.energySaved * 0.1)} L de combustible ahorrados`,
      ],
      percentage: Math.min((stats.impactMetrics.energySaved / 5000) * 100, 100),
    },
  ];

  return (
    <div className="mt-10 space-y-8">
      {/* Header mejorado */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-baseColor via-blue-600 to-sky-600 p-8 text-white">
        <div className="bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 viewBox=0 0 60 60 xmlns=http://www.w3.org/2000/svg%3E%3Cg fill=none fillRule=evenodd%3E%3Cg fill=%23ffffff fillOpacity=0.05%3E%3Ccircle cx=30 cy=30 r=2/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] absolute inset-0 opacity-20"></div>
        <div className="relative flex flex-col items-center justify-center lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-col items-center justify-center gap-3 text-center lg:flex-row lg:items-start lg:text-left">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <HousePlusIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Impacto Ambiental</h1>
                <p className="text-blue-100">
                  Midiendo el impacto sostenible de nuestra institución
                </p>
              </div>
            </div>
          </div>
          <div
            className="mt-5 flex items-center gap-2"
            title="Descargar Reporte de Impacto Ambiental"
          >
            <Button
              onClick={() => stats && generatePDFReport(stats, period)}
              disabled={!stats}
              className="group border-white/30 bg-white/20 text-white backdrop-blur-sm transition-all duration-300 hover:border-white/50 hover:bg-white/30"
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 transition-transform group-hover:scale-110" />
                <span className="">Descargar Reporte</span>
                <Download className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card
              key={index}
              className={`group relative overflow-hidden border-0 bg-gradient-to-br ${metric.bgGradient} transition-all duration-500 hover:scale-105 hover:shadow-xl`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
              <CardContent className="relative p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div
                    className={`flex h-14 w-14 items-center justify-center bg-gradient-to-br ${metric.gradient} rounded-2xl shadow-lg`}
                  >
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <div className="opacity-60 transition-opacity group-hover:opacity-100">
                    <CircularProgress
                      percentage={metric.percentage}
                      size={60}
                      strokeWidth={4}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-teal-700">
                    {metric.title}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-teal-500">
                      <AnimatedCounter
                        value={metric.value}
                        decimals={metric.decimals}
                        duration={1500 + index * 200}
                      />
                    </span>
                    {metric.unit && (
                      <span className="text-lg font-medium text-teal-500">
                        {metric.unit}
                      </span>
                    )}
                  </div>
                </div>

                {/* Detalles expandibles */}
                <div className="mt-4 translate-y-2 transform space-y-1 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <div className="mb-2 text-xs font-medium text-gray-700">
                    Equivalente a:
                  </div>
                  {metric.details.map((detail, detailIndex) => (
                    <div
                      key={detailIndex}
                      className="flex items-center gap-2 text-xs text-gray-600"
                    >
                      <div
                        className={`h-1.5 w-1.5 bg-gradient-to-r ${metric.gradient} rounded-full`}
                      ></div>
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default GlobalMetricsSchool;
