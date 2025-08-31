import { getSession } from "@/lib/auth";
import { optimizeImage } from "@/lib/image-compress-utils";
import prisma from "@/lib/prisma";
import {
  deleteFileFromSupabase,
  deleteUserFolderFromSupabase,
  getPublicSupabaseUrl,
  uploadAvatarToSupabase,
  validateAvatarFile,
} from "@/lib/supabase-service";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } },
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const { userId } = params;

    const findUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: {
            badges: true,
          },
        },
      },
    });

    if (!findUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 },
      );
    }

    let publicAvatarDisplayUrl: string | null = null;
    if (findUser.profile?.avatarUrl) {
      // avatarUrl es la fileKey
      publicAvatarDisplayUrl = getPublicSupabaseUrl(findUser.profile.avatarUrl);
      if (!publicAvatarDisplayUrl) {
        console.warn(
          "No se pudieron construir las URLs públicas de S3 para el avatar del perfil. Verifica las variables de entorno AWS_BUCKET_NAME y AWS_REGION.",
        );
      }
    }

    const response = {
      id: findUser.id,
      name: findUser.name,
      matricula: findUser.matricula,
      role: findUser.role,
      userType: findUser.userType,
      points: findUser.points,
      createdAt: findUser.createdAt.toISOString(),
      profile: findUser.profile
        ? {
            id: findUser.profile.id,
            email: findUser.profile.email,
            bio: findUser.profile.bio,
            city: findUser.profile.city,
            state: findUser.profile.state,
            avatarUrl: findUser.profile.avatarUrl, // Esta es la fileKey
            publicAvatarDisplayUrl: publicAvatarDisplayUrl, // URL pública para el frontend
            badges: findUser.profile.badges || [],
          }
        : null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error al obtener el usuario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al obtener el usuario" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } },
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { userId } = params;

    const formData = await request.formData();
    const name = formData.get("name") as string;
    const matricula = formData.get("matricula") as string;
    const points = parseInt(formData.get("points") as string, 10) || 0;
    const email = formData.get("email") as string;
    const bio = formData.get("bio") as string | null;
    const address = formData.get("address") as string | null;
    const city = formData.get("city") as string | null;
    const state = formData.get("state") as string | null;
    const zipCode = formData.get("zipCode") as string | null;
    const phone = formData.get("phone") as string | null;
    const avatarFile = formData.get("avatarFile") as File | null;
    const deleteAvatar = formData.get("deleteAvatar") === "true";

    if (!name) {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 },
      );
    }
    if (!matricula) {
      return NextResponse.json(
        { error: "La matrícula es requerida" },
        { status: 400 },
      );
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 },
      );
    }

    // Verificar si la matrícula ya está registrada por otro usuario
    const existingMatriculaUser = await prisma.user.findFirst({
      where: {
        matricula,
        NOT: { id: userId },
      },
    });

    if (existingMatriculaUser) {
      return NextResponse.json(
        { error: "La matrícula ya está registrada en otro usuario." },
        { status: 409 },
      );
    }

    // Verificar si el email ya está registrado por otro perfil
    const existingEmailProfile = await prisma.profile.findFirst({
      where: {
        email,
        userId: { not: userId },
      },
    });

    if (existingEmailProfile) {
      return NextResponse.json(
        { error: "El correo electrónico ya está registrado en otro usuario." },
        { status: 409 },
      );
    }

    let newAvatarFileKey: string | null | undefined =
      currentUser.profile?.avatarUrl;

    if (deleteAvatar) {
      if (currentUser.profile?.avatarUrl) {
        await deleteFileFromSupabase(currentUser.profile.avatarUrl);
        newAvatarFileKey = null;
      }
    } else if (avatarFile) {
      const validation = validateAvatarFile(avatarFile);
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error || "Archivo de avatar inválido" },
          { status: 400 },
        );
      }

      if (currentUser.profile?.avatarUrl) {
        await deleteFileFromSupabase(currentUser.profile.avatarUrl);
      }

      const optimizedBuffer = await optimizeImage(avatarFile);

      const s3Response = await uploadAvatarToSupabase(
        optimizedBuffer,
        avatarFile.name,
        "image/jpeg",
        currentUser.userType,
        currentUser.matricula,
      ); // Usa la función de s3-service
      newAvatarFileKey = s3Response.fileKey; // uploadAvatarToS3 devuelve fileKey
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        matricula,
        points: points as number,
        profile: {
          upsert: {
            create: {
              email,
              bio,
              city,
              state,
              avatarUrl: newAvatarFileKey, // Guardar la fileKey
            },
            update: {
              email,
              bio,
              city,
              state,
              avatarUrl: newAvatarFileKey, // Guardar la fileKey
            },
          },
        },
      },
      include: {
        profile: {
          include: {
            badges: true,
          },
        },
      },
    });

    let publicAvatarDisplayUrl: string | null = null;
    if (updatedUser.profile?.avatarUrl) {
      publicAvatarDisplayUrl = getPublicSupabaseUrl(
        updatedUser.profile.avatarUrl,
      );
      if (!publicAvatarDisplayUrl) {
        console.warn(
          "No se pudieron construir las URLs públicas de S3 para el avatar del perfil. Verifica las variables de entorno AWS_BUCKET_NAME y AWS_REGION.",
        );
      }
    }

    const response = {
      id: updatedUser.id,
      name: updatedUser.name,
      matricula: updatedUser.matricula,
      role: updatedUser.role,
      userType: updatedUser.userType,
      points: updatedUser.points,
      createdAt: updatedUser.createdAt.toISOString(),
      profile: updatedUser.profile
        ? {
            id: updatedUser.profile.id,
            email: updatedUser.profile.email,
            bio: updatedUser.profile.bio,
            city: updatedUser.profile.city,
            state: updatedUser.profile.state,
            avatarUrl: updatedUser.profile.avatarUrl, // fileKey
            publicAvatarDisplayUrl: publicAvatarDisplayUrl, // URL pública para el frontend
            badges: updatedUser.profile.badges || [],
          }
        : null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Error desconocido al actualizar perfil";
    return NextResponse.json(
      { error: "Error al actualizar perfil: " + errorMessage },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { userId: string } },
) {
  try {
    // Asegurarse de que params esté accesible correctamente.
    if (!params || !params.userId) {
      return NextResponse.json(
        { error: "ID de usuario requerido" },
        { status: 400 },
      );
    }

    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { userId } = params;
    if (!userId) {
      return NextResponse.json(
        { error: "ID de usuario requerido" },
        { status: 400 },
      );
    }

    // ------ Inicio Eliminar Avatar ----- //
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 },
      );
    }

    await prisma.$transaction(async (tx) => {
      // Paso 2.1: Eliminar la carpeta y su contenido de AWS S3
      console.log(
        `Iniciando la eliminación de datos en S3 para el usuario: ${currentUser.matricula}`,
      );
      await deleteUserFolderFromSupabase(
        currentUser.userType,
        currentUser.matricula,
      );
    });

    // 4. Utilizar una transacción de Prisma para eliminar todos los datos del usuario de la BD.
    // El orden es importante para evitar violaciones de restricciones de clave externa.
    await prisma.$transaction(async (tx) => {
      await tx.articleRating.deleteMany({ where: { id: userId } });
      await tx.notification.deleteMany({ where: { id: userId } });
      await tx.redemption.deleteMany({ where: { id: userId } });
      await tx.badge.deleteMany({ where: { id: userId } });
      await tx.activity.deleteMany({ where: { id: userId } });
      // ...agregar aquí cualquier otra tabla con relación al usuario ...

      // Finalmente, eliminar al usuario.
      await tx.user.delete({ where: { id: userId } });
    });

    return NextResponse.json({
      message: "Cuenta eliminada exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar la cuenta:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al eliminar la cuenta" },
      { status: 500 },
    );
  }
}
