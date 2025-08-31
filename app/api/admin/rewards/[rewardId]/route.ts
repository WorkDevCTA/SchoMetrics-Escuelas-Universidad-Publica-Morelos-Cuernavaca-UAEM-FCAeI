import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { rewardId: string } },
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { rewardId } = params;

    const reward = await prisma.reward.findUnique({
      where: { id: rewardId },
    });

    if (!reward) {
      return NextResponse.json(
        { error: "Recompensa no encontrada" },
        { status: 404 },
      );
    }

    const response = {
      title: reward.title,
      description: reward.description,
      pointsCost: reward.pointsCost,
      available: reward.available,
      quantity: reward.quantity,
      expiresAt: reward.expiresAt ? reward.expiresAt.toISOString() : null,
      category: reward.category,
      createdAt: reward.createdAt.toISOString(),
      updatedAt: reward.updatedAt.toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error al obtener la recompensa:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al obtener la recompensa" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { rewardId: string } },
) {
  try {
    const session = await getSession();
    const { rewardId } = params;

    const reward = await prisma.reward.findUnique({
      where: { id: rewardId },
    });

    if (!reward) {
      return NextResponse.json(
        { error: "Recompensa no encontrada" },
        { status: 404 },
      );
    }

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No autorizado para modificar esta recompensa" },
        { status: 403 },
      );
    }

    const body = await request.json();

    const {
      title,
      description,
      pointsCost,
      available,
      quantity,
      category,
      expiresAt,
    } = body;

    const updateData = {
      title,
      description,
      pointsCost: Number(pointsCost),
      available,
      category,
      quantity: Number(quantity),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    };

    const updatedReward = await prisma.reward.update({
      where: { id: rewardId },
      data: updateData,
    });

    return NextResponse.json(updatedReward);
  } catch (error) {
    console.error("Error al actualizar la recompensa:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Error desconocido al actualizar la recompensa";
    return NextResponse.json(
      { error: "Error al actualizar la recompensa: " + errorMessage },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { rewardId: string } },
) {
  try {
    const session = await getSession();
    const { rewardId } = params;

    const reward = await prisma.reward.findUnique({
      where: { id: rewardId },
    });

    if (!reward) {
      return NextResponse.json(
        { error: "Recompensa no encontrada" },
        { status: 404 },
      );
    }

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No autorizado para eliminar esta recompensa" },
        { status: 403 },
      );
    }

    await prisma.reward.delete({
      where: { id: rewardId },
    });

    return NextResponse.json({ message: "Recompensa eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar la recompensa:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al eliminar la recompensa" },
      { status: 500 },
    );
  }
}
