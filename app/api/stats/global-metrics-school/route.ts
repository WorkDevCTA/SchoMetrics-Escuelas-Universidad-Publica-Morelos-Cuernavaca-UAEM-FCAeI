import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "month"; // day, week, month, year, all

    // Determinar fecha de inicio según el período
    let startDate: Date | null = null;
    const now = new Date();

    if (period !== "all") {
      startDate = new Date();

      switch (period) {
        case "day":
          startDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          startDate.setDate(now.getDate() - now.getDay());
          startDate.setHours(0, 0, 0, 0);
          break;
        case "month":
          startDate.setDate(1);
          startDate.setHours(0, 0, 0, 0);
          break;
        case "year":
          startDate.setMonth(0, 1);
          startDate.setHours(0, 0, 0, 0);
          break;
      }
    }

    // Construir filtros
    const where: any = {};
    if (startDate) {
      where.date = {
        gte: startDate,
      };
    }

    // Calcular métricas de impacto
    const recyclingActivities = await prisma.activityReviewed.findMany({
      where: {
        activityType: "RECYCLING",
      },
      select: {
        activityQuantity: true,
      },
    });
    const recycledMaterials = recyclingActivities.reduce(
      (sum, activity) => sum + activity.activityQuantity,
      0,
    );

    const treePlantingActivities = await prisma.activityReviewed.findMany({
      where: {
        activityType: "TREE_PLANTING",
      },
      select: {
        activityQuantity: true,
      },
    });
    const treesPlanted = treePlantingActivities.reduce(
      (sum, activity) => sum + activity.activityQuantity,
      0,
    );

    const waterSavingActivities = await prisma.activityReviewed.findMany({
      where: {
        activityType: "WATER_SAVING",
      },
      select: {
        activityQuantity: true,
      },
    });
    const waterSaved = waterSavingActivities.reduce(
      (sum, activity) => sum + activity.activityQuantity,
      0,
    );

    const energySavingActivities = await prisma.activityReviewed.findMany({
      where: {
        activityType: "ENERGY_SAVING",
      },
      select: {
        activityQuantity: true,
      },
    });
    const energySaved = energySavingActivities.reduce(
      (sum, activity) => sum + activity.activityQuantity,
      0,
    );

    // Obtener estadísticas por período de tiempo (para gráficos)
    // Agrupar por día para los últimos 30 días
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // const timeSeriesData = await prisma.activityReviewed.groupBy({
    //   by: ["date"],
    //   where: {
    //     activityDate: {
    //       gte: thirtyDaysAgo,
    //     },
    //   },
    //   _sum: {
    //     activityPoints: true,
    //   },
    //   _count: {
    //     id: true,
    //   },
    //   orderBy: {
    //     activityDate: "asc",
    //   },
    // });

    // const timeSeries = timeSeriesData.map((data) => ({
    //   date: data.activityDate?.toISOString(),
    //   points: data._sum?.activityPoints || 0,
    //   count: data._count?.id,
    // }));

    return NextResponse.json({
      // timeSeries,
      impactMetrics: {
        recycledMaterials,
        treesPlanted,
        waterSaved,
        energySaved,
      },
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    return NextResponse.json(
      { error: "Error al obtener estadísticas" },
      { status: 500 },
    );
  }
}
