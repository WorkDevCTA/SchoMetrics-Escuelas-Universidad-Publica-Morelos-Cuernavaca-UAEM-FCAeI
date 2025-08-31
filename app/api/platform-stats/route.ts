import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; //

export async function GET() {
  try {
    const totalUsers = await prisma.user.count();
    const totalActivities = await prisma.activity.count();

    return NextResponse.json({
      totalUsers,
      totalActivities,
    });
  } catch (error) {
    console.error("Error al obtener estadísticas de la plataforma:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al obtener estadísticas." },
      { status: 500 },
    );
  }
}
