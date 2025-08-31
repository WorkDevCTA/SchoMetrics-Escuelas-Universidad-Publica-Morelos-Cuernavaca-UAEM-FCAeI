import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { AnnouncementTopic } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Esquema de validación para la actualización
const UpdateAnnouncementSchema = z.object({
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
 * PUT: Actualizar un aviso existente
 * Disponible solo para usuarios con rol ADMIN.
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "No autorizado" }, { status: 403 });
  }

  const body = await req.json();
  const validation = UpdateAnnouncementSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { errors: validation.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const updatedAnnouncement = await prisma.announcement.update({
      where: { id: params.id },
      data: { ...validation.data, updatedAt: new Date() },
    });
    return NextResponse.json(updatedAnnouncement);
  } catch (error) {
    return NextResponse.json(
      { message: "Error de base de datos al actualizar" },
      { status: 500 },
    );
  }
}

/**
 * DELETE: Eliminar un aviso
 * Disponible solo para usuarios con rol ADMIN.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "No autorizado" }, { status: 403 });
  }

  try {
    await prisma.announcement.delete({
      where: { id: params.id },
    });
    return NextResponse.json(
      { message: "Aviso eliminado correctamente" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error de base de datos al eliminar" },
      { status: 500 },
    );
  }
}
