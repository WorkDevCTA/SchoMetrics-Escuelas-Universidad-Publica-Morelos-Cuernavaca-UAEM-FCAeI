import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { AnnouncementTopic } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Esquema de validación con Zod
const AnnouncementSchema = z.object({
  title: z
    .string()
    .min(5, "El título debe tener al menos 5 caracteres.")
    .max(150, "Máximo 150 caracteres."),
  content: z
    .string()
    .min(50, "El contenido debe tener al menos 50 caracteres.")
    .max(2000, "Máximo 2000 caracteres."),
  topic: z.nativeEnum(AnnouncementTopic, {
    errorMap: () => ({ message: "Selecciona un tema válido." }),
  }),
});

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

/**
 * POST: Crear un nuevo aviso
 * Disponible solo para usuarios con rol ADMIN.
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "No autorizado" }, { status: 403 });
  }

  const body = await req.json();
  const validation = AnnouncementSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { errors: validation.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { title, content, topic } = validation.data;

  try {
    const newAnnouncement = await prisma.announcement.create({
      data: {
        title,
        content,
        topic,
        userId: session.id as string,
      },
    });
    return NextResponse.json(newAnnouncement, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error de base de datos al crear el aviso" },
      { status: 500 },
    );
  }
}
