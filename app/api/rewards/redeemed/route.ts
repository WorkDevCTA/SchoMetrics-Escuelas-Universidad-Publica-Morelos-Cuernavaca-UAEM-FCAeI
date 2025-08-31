import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = session.id as string;

    // Obtener las recompensas canjeadas por el usuario
    const redeemedRewards = await prisma.redemption.findMany({
      where: {
        userId,
      },
      include: {
        reward: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transformar los datos para el frontend
    const formattedRedemptions = redeemedRewards.map((redemption) => ({
      id: redemption.id,
      rewardId: redemption.rewardId,
      userId: redemption.userId,
      createdAt: redemption.createdAt.toISOString(),
      redeemedAt: redemption.redeemedAt.toISOString(),
      rewardTitle: redemption.rewardTitle,
      rewardDesc: redemption.rewardDesc,
      rewardPoints: redemption.rewardPoints,
      rewardQuantity: redemption.rewardQuantity,
      rewardExpiresAt: redemption.rewardExpiresAt,
      rewardCategory: redemption.rewardCategory,
    }));

    return NextResponse.json(formattedRedemptions);
  } catch (error) {
    console.error("Error al obtener recompensas canjeadas:", error);
    return NextResponse.json(
      { error: "Error al obtener recompensas canjeadas" },
      { status: 500 },
    );
  }
}
