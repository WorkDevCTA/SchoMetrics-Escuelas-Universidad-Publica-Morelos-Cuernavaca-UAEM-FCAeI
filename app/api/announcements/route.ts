import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * GET: Obtener todos los avisos
 * Disponible para cualquier usuario con sesión activa.
 */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true } },
      },
    });
    return NextResponse.json(announcements);
  } catch (error) {
    return NextResponse.json(
      { message: "Error al obtener los avisos" },
      { status: 500 },
    );
  }
}
