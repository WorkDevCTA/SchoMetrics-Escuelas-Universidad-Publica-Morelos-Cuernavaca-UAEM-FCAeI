import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    // Obtener todas las recompensas disponibles
    const rewards = await prisma.reward.findMany({
      where: {
        available: true,
      },
      orderBy: {
        pointsCost: "asc",
      },
    });

    // Transformar los datos para el frontend
    const formattedRewards = rewards.map((reward) => ({
      id: reward.id,
      title: reward.title,
      description: reward.description,
      pointsCost: reward.pointsCost,
      available: reward.available,
      quantity: reward.quantity,
      expiresAt: reward.expiresAt ? reward.expiresAt.toISOString() : null,
      category: reward.category.toLowerCase(), // Convertir a minúsculas para el frontend
      createdAt: reward.createdAt.toISOString(),
      updatedAt: reward.updatedAt.toISOString(),
    }));

    return NextResponse.json(formattedRewards);
  } catch (error) {
    console.error("Error al obtener recompensas:", error);
    return NextResponse.json(
      { error: "Error al obtener recompensas" },
      { status: 500 },
    );
  }
}
