import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { users } = body;

    if (!users || !Array.isArray(users)) {
      return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
    }

    const createdUsers = [];

    for (const user of users) {
      const exists = await prisma.user.findUnique({
        where: { matricula: user.matricula },
      });
      if (exists) continue; // Saltar usuarios duplicados

      const hashedPassword = await bcrypt.hash(user.password, 10);

      const newUser = await prisma.user.create({
        data: {
          name: user.name,
          matricula: user.matricula,
          licenciatura: user.licenciatura,
          password: hashedPassword,
          userType: user.userType || "STUDENT",
        },
      });

      await prisma.profile.create({
        data: {
          email: `cambiarestecorreo@${newUser.id}.com`,
          bio: "Añade una descripción personal",
          userId: newUser.id,
        },
      });

      createdUsers.push(newUser);
    }

    return NextResponse.json({
      message: "Usuarios registrados",
      count: createdUsers.length,
    });
  } catch (error) {
    console.error("Error en registro masivo:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}
