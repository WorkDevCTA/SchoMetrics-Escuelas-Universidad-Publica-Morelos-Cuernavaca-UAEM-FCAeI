import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { name, matricula, password, adminCode } = await request.json();

    // Validar que todos los campos estén presentes
    if (!name || !matricula || !password || !adminCode) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 },
      );
    }

    // Verificar el código de administrador
    if (adminCode !== process.env.ADMIN_SECRET_CODE) {
      return NextResponse.json(
        { error: "Código de administrador inválido" },
        { status: 403 },
      );
    }

    // Verificar si la matricula ADMIN ya está registrada
    const existingUser = await prisma.user.findUnique({
      where: { matricula },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Esta matrícula ya está registrada" },
        { status: 409 },
      );
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario administrador
    const user = await prisma.user.create({
      data: {
        name,
        matricula,
        password: hashedPassword,
        role: "ADMIN", // Asignar rol de administrador
        userType: "ADMIN", // Por defecto
        points: 0,
      },
    });

    // Crear un perfil básico para el administrador
    await prisma.profile.create({
      data: {
        email: `cambiarestecorreo@${user.id.slice(0, 10)}.com`,
        bio: "Administrador de SchoMetrics",
        userId: user.id,
      },
    });

    return NextResponse.json(
      {
        message: "Administrador registrado exitosamente",
        userId: user.id,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error al registrar administrador:", error);
    return NextResponse.json(
      { error: "Error al registrar administrador" },
      { status: 500 },
    );
  }
}
