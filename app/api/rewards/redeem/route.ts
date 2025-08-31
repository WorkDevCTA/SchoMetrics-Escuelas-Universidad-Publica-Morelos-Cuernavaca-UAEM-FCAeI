import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { nanoid } from "nanoid";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { rewardId } = await request.json();
    if (!rewardId) {
      return NextResponse.json(
        { error: "ID de recompensa requerido" },
        { status: 400 }
      );
    }

    // Obtener la recompensa
    const reward = await prisma.reward.findUnique({
      where: { id: rewardId },
    });

    if (!reward) {
      return NextResponse.json(
        { error: "Recompensa no encontrada" },
        { status: 404 }
      );
    }

    if (!reward.available) {
      return NextResponse.json(
        { error: "Esta recompensa no está disponible" },
        { status: 400 }
      );
    }

    // Verificar si la recompensa ha expirado
    if (reward.expiresAt && reward.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Esta recompensa ha expirado" },
        { status: 400 }
      );
    }

    // Obtener el usuario
    const user = await prisma.user.findUnique({
      where: { id: session.id as string },
      select: { points: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si el usuario tiene suficientes puntos
    if (user.points < reward.pointsCost) {
      return NextResponse.json(
        { error: "No tienes suficientes puntos" },
        { status: 400 }
      );
    }

    const rewardFolio = nanoid(8);

    // Usar una transacción para garantizar la integridad de los datos - Aquí se almacena la recompensa canjeada
    const result = await prisma.$transaction(async (tx) => {
      // 1. Obtener la fecha de canjeo actual
      const redeemedAt = new Date();

      // 2. Calcular la fecha límite sumando 15 días a la fecha de canjeo
      const rewardLimitToUse = new Date();
      rewardLimitToUse.setDate(redeemedAt.getDate() + 15);

      // Crear registro de redención
      const redemption = await tx.redemption.create({
        data: {
          rewardId: reward.id,
          rewardFolio: rewardFolio,
          userId: session.id as string,
          rewardCreatedAt: new Date(),
          rewardTitle: reward.title,
          rewardDesc: reward.description,
          rewardPoints: reward.pointsCost,
          rewardQuantity: reward.quantity,
          rewardExpiresAt: reward.expiresAt,
          rewardCategory: reward.category,
          // Usar la fecha límite recién calculada
          rewardLimitToUse: rewardLimitToUse,
        },
        include: {
          reward: true,
        },
      });

      // Actualizar puntos del usuario (sin afectar el nivel)
      await tx.user.update({
        where: { id: session.id as string },
        data: {
          points: {
            decrement: reward.pointsCost,
          },
        },
      });

      // Si la recompensa tiene cantidad limitada, decrementar
      if (reward.quantity !== null && reward.quantity > 0) {
        const newQuantity = reward.quantity - 1;
        await tx.reward.update({
          where: { id: reward.id },
          data: {
            quantity: newQuantity,
            available: newQuantity > 0,
          },
        });
      }

      return redemption;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error al canjear recompensa:", error);
    return NextResponse.json(
      { error: "Error al canjear recompensa" },
      { status: 500 }
    );
  }
}
