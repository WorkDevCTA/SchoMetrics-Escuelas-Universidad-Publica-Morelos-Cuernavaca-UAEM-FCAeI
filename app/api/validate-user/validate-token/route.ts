import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { token, userId } = await request.json();

    if (!token || !userId) {
      return NextResponse.json(
        { error: "Token y userId son requeridos" },
        { status: 400 },
      );
    }

    // Buscar el token en la base de datos
    const validationToken = await prisma.validationToken.findFirst({
      where: {
        token,
        userId,
        expires: {
          gt: new Date(), // Token no debe estar expirado
        },
      },
    });

    if (!validationToken) {
      return NextResponse.json(
        { error: "Token inválido o expirado" },
        { status: 401 },
      );
    }

    // Token válido
    return NextResponse.json({ valid: true }, { status: 200 });
  } catch (error) {
    console.error("Error validando token:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
