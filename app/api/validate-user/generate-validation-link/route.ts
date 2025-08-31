import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  const { userId } = await request.json();
  if (!userId) {
    return NextResponse.json({ error: "Falta userId" }, { status: 400 });
  }

  // Generar token único
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 900000); // 15 minutos
  new Date();
  // 60000 = 1 minuto

  // Eliminar tokens anteriores para este email
  await prisma.validationToken.deleteMany({
    where: { userId },
  });

  // Crear nuevo token
  await prisma.validationToken.create({
    data: {
      userId,
      token,
      expires,
    },
  });

  const baseUrl = process.env.BASE_URL;
  // const baseUrl = "http://localhost:3000";

  const url = `${baseUrl}/validez/${userId}?token=${token}`;
  return NextResponse.json({ url });
}
