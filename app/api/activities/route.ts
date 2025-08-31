import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";
import {
  uploadFileEvidenceToSupabase,
  validateFile,
  getPublicSupabaseUrl,
} from "@/lib/supabase-service";
import { ActivityStatus } from "@prisma/client";
import { MAX_FILES, MIN_FILES } from "@/types/types-supabase-service";

// Compresión de imágenes
import sharp from "sharp";

const activitySchema = z.object({
  title: z
    .string()
    .min(10, { message: "El título debe tener al menos 10 caracteres" })
    .max(100, { message: "El título no puede tener más de 100 caracteres" }),
  description: z
    .string()
    .min(50, { message: "La descripción debe tener al menos 50 caracteres" })
    .max(1000, {
      message: "La descripción no puede tener más de 1000 caracteres",
    }),
  type: z.enum([
    "RECYCLING",
    "TREE_PLANTING",
    "WATER_SAVING",
    "ENERGY_SAVING",
    "COMPOSTING",
    "EDUCATION",
    "OTHER",
  ]),
  quantity: z
    .number()
    .positive({ message: "La cantidad debe ser mayor a 0" })
    .min(1, { message: "La cantidad mínima es 1" })
    .max(500, { message: "La cantidad máxima permitida es 500" }),
  unit: z.string().min(1, { message: "La unidad es requerida" }),
  date: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), { message: "Fecha inválida" }),
  groupId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || session.id;
    const groupId = searchParams.get("groupId");
    const type = searchParams.get("type");
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where: any = {};
    if (session.role !== "ADMIN") {
      where.userId = session.id as string;
    } else if (userId && userId !== "all") {
      where.userId = userId as string;
    }

    if (groupId) where.groupId = groupId;
    if (type) where.type = type;

    const activitiesFromDb = await prisma.activity.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, matricula: true } },
        evidence: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    const activities = activitiesFromDb.map((activity) => ({
      ...activity,
      evidence:
        activity.evidence?.map((ev) => {
          const publicDisplayUrl = ev.fileUrl
            ? getPublicSupabaseUrl(ev.fileUrl)
            : null;
          if (!publicDisplayUrl && ev.fileUrl) {
            console.warn(
              `No se pudo construir la URL pública para la evidencia con fileKey: ${ev.fileUrl}`
            );
          }
          return {
            ...ev,
            publicDisplayUrl: publicDisplayUrl,
          };
        }) || [],
    }));

    const total = await prisma.activity.count({ where });

    return NextResponse.json({
      activities,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error al obtener actividades:", error);
    return NextResponse.json(
      { error: "Error al obtener actividades" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const formDataBody = await request.formData();
    const title = formDataBody.get("title") as string;
    const description = formDataBody.get("description") as string;
    const type = formDataBody.get("type") as string;
    const quantityStr = formDataBody.get("quantity") as string;
    const unit = formDataBody.get("unit") as string;
    const date = formDataBody.get("date") as string;
    const groupId = (formDataBody.get("groupId") as string) || undefined;
    const files = formDataBody.getAll("evidence") as File[];
    const quantity = Number.parseFloat(quantityStr);

    try {
      activitySchema.parse({
        title,
        description,
        type,
        quantity,
        unit,
        date,
        groupId,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: "Datos inválidos",
            details: error.errors.map(
              (e) => `${e.path.join(".")}: ${e.message}`
            ),
          },
          { status: 400 }
        );
      }
      throw error;
    }

    if (files.length < MIN_FILES) {
      return NextResponse.json(
        { error: `Debes subir al menos ${MIN_FILES} archivo como evidencia` },
        { status: 400 }
      );
    }
    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `No puedes subir más de ${MAX_FILES} archivos` },
        { status: 400 }
      );
    }

    for (const file of files) {
      const validation = validateFile(file);
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error || `Archivo inválido: ${file.name}` },
          { status: 400 }
        );
      }
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.id as string },
      include: { profile: true },
    });
    if (!currentUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const evidenceUploadPromises = files.map(async (file) => {
      if (file.type.startsWith("image/")) {
        // Usar Sharp para comprimir la imagen antes de cargarla
        const buffer = await file.arrayBuffer();
        const compressedBuffer = await sharp(Buffer.from(buffer))
          .resize({ width: 1200 })
          .toFormat("webp")
          .webp({ quality: 50 })
          .toBuffer();

        const arrayBuffer = compressedBuffer.buffer.slice(
          compressedBuffer.byteOffset,
          compressedBuffer.byteOffset + compressedBuffer.byteLength
        );

        const result = await uploadFileEvidenceToSupabase(
          new File([arrayBuffer as BlobPart], file.name, {
            type: "image/webp",
          }),
          currentUser.userType,
          currentUser.matricula,
          title
        );
        return result;
      } else {
        return uploadFileEvidenceToSupabase(
          file,
          currentUser.userType,
          currentUser.matricula,
          title
        );
      }
    });

    const evidenceResults = await Promise.all(evidenceUploadPromises);

    if (evidenceResults.length !== files.length) {
      return NextResponse.json(
        { error: "Error al subir archivos de evidencia" },
        { status: 500 }
      );
    }

    let imageCounter = 1;
    const activity = await prisma.activity.create({
      data: {
        title,
        description,
        type: type as any,
        quantity,
        unit,
        points: 0,
        date: new Date(date + "T12:00:00"),
        status: ActivityStatus.PENDING_REVIEW,
        userId: session.id as string,
        evidence: {
          create: evidenceResults.map((e) => ({
            fileUrl: e.fileKey,
            fileType: e.determinedType,
            fileName: `${title} - Image: ${imageCounter++}`,
            fileSize: e.fileSize,
            format: e.format,
          })),
        },
      },
      include: {
        user: { select: { id: true, name: true, matricula: true } },
        evidence: true,
      },
    });

    const snapShotActReviwed = await prisma.$transaction(async (tx) => {
      const activityReviewed = await tx.activityReviewed.create({
        data: {
          userId: session.id as string,
          activityId: activity.id,
          createdAt: new Date(),
          activityTitle: activity.title,
          activityDesc: activity.description,
          activityDate: activity.date,
          activityPoints: activity.points,
          activityQuantity: activity.quantity,
          activityUnit: activity.unit,
          activityType: activity.type,
          activityStatus: activity.status,
        },
        include: {
          activity: true,
        },
      });

      return activityReviewed;
    });

    const activityWithPublicUrls = {
      ...activity,
      evidence:
        activity.evidence?.map((ev) => {
          const publicDisplayUrl = ev.fileUrl
            ? getPublicSupabaseUrl(ev.fileUrl)
            : null;
          return { ...ev, publicDisplayUrl };
        }) || [],
    };

    return NextResponse.json({
      activityWithPublicUrls,
      snapShotActReviwed,
    });
  } catch (error) {
    console.error("Error al crear actividad:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Error desconocido al crear actividad";
    return NextResponse.json(
      { error: "Error al crear actividad: " + errorMessage },
      { status: 500 }
    );
  }
}
