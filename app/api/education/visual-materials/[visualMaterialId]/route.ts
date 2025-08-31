import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";
import {
  uploadVisualMaterialImageToSupabase,
  validateFile,
  deleteFileFromSupabase,
  getPublicSupabaseUrl,
  moveFileInSupabase,
} from "@/lib/supabase-service";
import { UserType, VisualMaterialTopic } from "@prisma/client";
import { MAX_FILES, MIN_FILES } from "@/types/types-supabase-service";
import { optimizeImage } from "@/lib/image-compress-utils";

const updateVisualMaterialSchema = z.object({
  title: z.string().min(3).max(150).optional(),
  description: z.string().max(1000).optional().nullable(),
  topic: z.nativeEnum(VisualMaterialTopic).optional(),
  authorName: z.string(),
  authorInstitution: z.string(),
  authorInfo: z.string().max(500).optional().nullable(),
  // Para la edición de imágenes, el frontend enviará `existingImageS3Keys` y `imagesToDelete`
  // y los nuevos archivos como `images[index]`.
});

export async function GET(
  request: NextRequest,
  { params }: { params: { visualMaterialId: string } },
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const { visualMaterialId } = params;

    const vmFromDb = await prisma.visualMaterial.findUnique({
      where: { id: visualMaterialId },
      include: {
        user: { select: { id: true, name: true, userType: true } },
        images: {
          orderBy: { order: "asc" },
          select: { id: true, s3Key: true, order: true },
        },
        ratings: { select: { userId: true, liked: true } },
      },
    });

    if (!vmFromDb) {
      return NextResponse.json(
        { error: "Material visual no encontrado" },
        { status: 404 },
      );
    }

    const likes = vmFromDb.ratings.filter((r) => r.liked).length;
    const dislikes = vmFromDb.ratings.filter((r) => !r.liked).length;
    const currentUserRating =
      vmFromDb.ratings.find((r) => r.userId === (session.id as string))
        ?.liked ?? null;

    const visualMaterial = {
      ...vmFromDb,
      images: vmFromDb.images.map((img) => ({
        id: img.id,
        url: getPublicSupabaseUrl(img.s3Key),
        order: img.order,
        s3Key: img.s3Key,
      })),
      likes,
      dislikes,
      currentUserRating,
      ratings: undefined,
    };

    return NextResponse.json(visualMaterial);
  } catch (error) {
    console.error("Error al obtener material visual:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { visualMaterialId: string } },
) {
  try {
    const session = await getSession();
    const { visualMaterialId } = params;

    // Buscar material existente
    const existingMaterial = await prisma.visualMaterial.findUnique({
      where: { id: visualMaterialId },
      include: { images: true },
    });

    if (!existingMaterial) {
      return NextResponse.json(
        { error: "Material visual no encontrado" },
        { status: 404 },
      );
    }

    // Validar permisos
    if (
      !session ||
      session.id !== existingMaterial.userId ||
      (session.userType !== UserType.TEACHER &&
        session.userType !== UserType.ADMIN)
    ) {
      return NextResponse.json(
        { error: "No autorizado para modificar este material." },
        { status: 403 },
      );
    }

    // Leer FormData
    const formData = await request.formData();
    const formValues: Record<string, any> = {};
    const newImageFiles: File[] = [];
    const existingImageS3KeysRaw = formData.get("existingImageS3Keys") as
      | string
      | null;
    const imagesToDeleteRaw = formData.get("imagesToDelete") as string | null;

    formData.forEach((value, key) => {
      if (key.startsWith("images[")) {
        if (value instanceof File) newImageFiles.push(value);
      } else if (key !== "existingImageS3Keys" && key !== "imagesToDelete") {
        formValues[key] = value;
      }
    });

    if (formValues.description === "") formValues.description = null;
    if (formValues.authorInfo === "") formValues.authorInfo = null;

    // Validar datos
    const validationResult = updateVisualMaterialSchema.safeParse(formValues);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Datos inválidos",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const dataToUpdate = { ...validationResult.data };

    // Procesar imágenes existentes y a eliminar
    const existingImages: { id: string; s3Key: string; order: number }[] =
      existingImageS3KeysRaw ? JSON.parse(existingImageS3KeysRaw) : [];
    const imagesToDeleteS3Keys: string[] = imagesToDeleteRaw
      ? JSON.parse(imagesToDeleteRaw)
      : [];

    // Validaciones de cantidad
    const remainingCount = existingImages.filter(
      (img) => !imagesToDeleteS3Keys.includes(img.s3Key),
    ).length;
    if (newImageFiles.length + remainingCount > MAX_FILES) {
      return NextResponse.json(
        { error: `No puedes tener más de ${MAX_FILES} imágenes.` },
        { status: 400 },
      );
    }
    if (newImageFiles.length + remainingCount < MIN_FILES) {
      return NextResponse.json(
        { error: `Debes tener al menos ${MIN_FILES} imagen.` },
        { status: 400 },
      );
    }

    // Validar archivos nuevos
    for (const file of newImageFiles) {
      const fileValidation = validateFile(file);
      if (!fileValidation.valid) {
        return NextResponse.json(
          { error: fileValidation.error || `Archivo inválido: ${file.name}` },
          { status: 400 },
        );
      }
    }

    // Usuario actual
    const currentUser = await prisma.user.findUnique({
      where: { id: session.id as string },
      include: { profile: true },
    });
    if (!currentUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 },
      );
    }

    // Título final que se usará para carpeta en Supabase
    const finalTitle = dataToUpdate.title ?? existingMaterial.title;

    const movedFiles: { oldKey: string; newKey: string }[] = [];
    const uploadedFiles: string[] = [];

    try {
      // 1. Mover imágenes existentes si cambia el título (fuera de transacción)
      if (existingMaterial.title !== finalTitle) {
        for (const img of existingImages) {
          const oldKey = img.s3Key;
          const newKey = oldKey.replace(existingMaterial.title, finalTitle);

          await moveFileInSupabase(oldKey, newKey);
          movedFiles.push({ oldKey, newKey });
        }
      }

      // 2. Eliminar imágenes marcadas (fuera de transacción)
      if (imagesToDeleteS3Keys.length > 0) {
        for (const s3KeyToDelete of imagesToDeleteS3Keys) {
          await deleteFileFromSupabase(s3KeyToDelete);
        }
      }

      // 3. Subir nuevas imágenes (fuera de transacción)
      const remainingExistingImages = existingImages.filter(
        (img) => !imagesToDeleteS3Keys.includes(img.s3Key),
      );
      let currentMaxOrder =
        remainingExistingImages.length > 0
          ? Math.max(...remainingExistingImages.map((img) => img.order))
          : -1;

      const newUploadedS3Keys: { s3Key: string; order: number }[] = [];
      for (let i = 0; i < newImageFiles.length; i++) {
        const file = newImageFiles[i];
        const optimizedBuffer = await optimizeImage(file);

        const supabaseResponse = await uploadVisualMaterialImageToSupabase(
          optimizedBuffer,
          file.name,
          "image/jpeg",
          currentUser.userType,
          currentUser.matricula,
          finalTitle,
        );
        currentMaxOrder++;
        const s3Key = supabaseResponse.fileKey;
        newUploadedS3Keys.push({
          s3Key,
          order: currentMaxOrder,
        });
        uploadedFiles.push(s3Key);
      }

      // 4. Transacción de base de datos (solo operaciones de Prisma)
      const finalUpdate = await prisma.$transaction(
        async (tx) => {
          // Actualizar referencias de archivos movidos
          if (movedFiles.length > 0) {
            for (const { oldKey, newKey } of movedFiles) {
              const imageToUpdate = existingImages.find(
                (img) => img.s3Key === oldKey,
              );
              if (imageToUpdate) {
                await tx.visualMaterialImage.update({
                  where: { id: imageToUpdate.id },
                  data: { s3Key: newKey },
                });
              }
            }
          }

          // Eliminar registros de imágenes eliminadas
          if (imagesToDeleteS3Keys.length > 0) {
            await tx.visualMaterialImage.deleteMany({
              where: { visualMaterialId, s3Key: { in: imagesToDeleteS3Keys } },
            });
          }

          // Actualizar datos del VisualMaterial y crear nuevas imágenes
          const updated = await tx.visualMaterial.update({
            where: { id: visualMaterialId },
            data: {
              ...dataToUpdate,
              images: {
                create: newUploadedS3Keys.map((img) => ({
                  s3Key: img.s3Key,
                  order: img.order,
                })),
              },
            },
            include: { images: { orderBy: { order: "asc" } } },
          });

          // Reordenar imágenes
          const allCurrentImageRecords = await tx.visualMaterialImage.findMany({
            where: { visualMaterialId },
            orderBy: { createdAt: "asc" },
          });
          for (let i = 0; i < allCurrentImageRecords.length; i++) {
            if (allCurrentImageRecords[i].order !== i) {
              await tx.visualMaterialImage.update({
                where: { id: allCurrentImageRecords[i].id },
                data: { order: i },
              });
            }
          }

          return updated;
        },
        {
          timeout: 10000, // Aumentar timeout a 10 segundos como medida adicional
        },
      );

      // Respuesta con URLs públicas
      const responseVisualMaterial = {
        ...finalUpdate,
        images: finalUpdate.images.map((img) => ({
          id: img.id,
          url: getPublicSupabaseUrl(img.s3Key),
          order: img.order,
          s3Key: img.s3Key,
        })),
      };

      return NextResponse.json(responseVisualMaterial);
    } catch (error) {
      console.error(
        "Error en actualización, haciendo rollback de archivos:",
        error,
      );

      // Revertir archivos subidos
      for (const s3Key of uploadedFiles) {
        try {
          await deleteFileFromSupabase(s3Key);
        } catch (rollbackError) {
          console.error("Error en rollback de archivo:", s3Key, rollbackError);
        }
      }

      // Revertir archivos movidos
      for (const { oldKey, newKey } of movedFiles) {
        try {
          await moveFileInSupabase(newKey, oldKey);
        } catch (rollbackError) {
          console.error(
            "Error en rollback de movimiento:",
            newKey,
            "->",
            oldKey,
            rollbackError,
          );
        }
      }

      throw error;
    }
  } catch (error) {
    console.error("Error al actualizar material visual:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { visualMaterialId: string } },
) {
  try {
    const session = await getSession();
    const { visualMaterialId } = params;

    const materialToDelete = await prisma.visualMaterial.findUnique({
      where: { id: visualMaterialId },
      include: { images: true },
    });

    if (!materialToDelete) {
      return NextResponse.json(
        { error: "Material visual no encontrado" },
        { status: 404 },
      );
    }
    if (
      !session ||
      session.id !== materialToDelete.userId ||
      (session.userType !== UserType.TEACHER &&
        session.userType !== UserType.ADMIN)
    ) {
      return NextResponse.json(
        { error: "No autorizado para eliminar este material." },
        { status: 403 },
      );
    }

    // Eliminar imágenes de Supabase y luego el registro de la base de datos (Prisma se encarga de cascada para VisualMaterialImage y VisualMaterialRating)
    for (const image of materialToDelete.images) {
      await deleteFileFromSupabase(image.s3Key);
    }

    await prisma.visualMaterial.delete({ where: { id: visualMaterialId } });

    return NextResponse.json({
      message: "Material visual eliminado correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar material visual:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
