import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    const findUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!findUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Obtener las recompensas canjeadas por el usuario
    const redeemedRewards = await prisma.redemption.findMany({
      where: {
        userId: userId,
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
      rewardFolio: redemption.rewardFolio,
      rewardTitle: redemption.rewardTitle,
      rewardDesc: redemption.rewardDesc,
      rewardPoints: redemption.rewardPoints,
      rewardQuantity: redemption.rewardQuantity,
      rewardExpiresAt: redemption.rewardExpiresAt,
      rewardCreatedAt: redemption.rewardCreatedAt,
      rewardLimitToUse: redemption.rewardLimitToUse,
      rewardCategory: redemption.rewardCategory,
    }));

    return NextResponse.json(formattedRedemptions);
  } catch (error) {
    console.error("Error al obtener recompensas canjeadas:", error);
    return NextResponse.json(
      { error: "Error al obtener recompensas canjeadas" },
      { status: 500 }
    );
  }
}
