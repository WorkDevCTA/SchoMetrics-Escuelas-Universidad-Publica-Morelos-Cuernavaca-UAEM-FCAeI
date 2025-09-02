import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { matriculas } = await request.json();

    if (!Array.isArray(matriculas)) {
      return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
    }

    const existing = await prisma.user.findMany({
      where: {
        matricula: {
          in: matriculas,
        },
      },
      select: {
        matricula: true,
      },
    });

    const existingMatriculas = existing.map((u) => u.matricula);

    return NextResponse.json({ existingMatriculas });
  } catch (error) {
    console.error("Error al validar matrículas:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}
