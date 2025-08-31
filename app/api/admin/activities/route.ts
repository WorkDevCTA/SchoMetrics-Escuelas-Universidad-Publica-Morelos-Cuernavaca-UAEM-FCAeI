import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getPublicSupabaseUrl } from "@/lib/supabase-service";
import { ActivityStatus } from "@prisma/client"; // Importar ActivityStatus

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get("search") || "";
    const userType = searchParams.get("userType") || "all";
    const statusFilter = searchParams.get("status") as
      | ActivityStatus
      | "all"
      | null; // Nuevo filtro
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (searchTerm) {
      whereClause.user = {
        OR: [
          { matricula: { contains: searchTerm /*, mode: "insensitive" */ } },
        ],
      };
    }

    if (userType !== "all") {
      if (whereClause.user) {
        whereClause.user.userType = userType;
      } else {
        whereClause.user = { userType };
      }
    }

    // Aplicar filtro de estado de actividad
    if (statusFilter && statusFilter !== "all") {
      whereClause.status = statusFilter;
    }

    const activitiesFromDb = await prisma.activity.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            matricula: true,
            userType: true,
            profile: {
              select: { avatarUrl: true },
            },
          },
        },
        evidence: {
          select: {
            id: true,
            fileUrl: true,
            fileType: true,
            fileName: true,
            // format: true // Si se añade al schema
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    const totalActivities = await prisma.activity.count({ where: whereClause });

    const activities = activitiesFromDb.map((activity) => {
      let userAvatarPublicUrl: string | null = null;
      if (activity.user.profile?.avatarUrl) {
        userAvatarPublicUrl = getPublicSupabaseUrl(
          activity.user.profile.avatarUrl,
        );
      }

      return {
        ...activity,
        // 'points' y 'status' ya vienen de la base de datos con los valores correctos.
        user: {
          ...activity.user,
          profile: {
            ...activity.user.profile,
            avatarPublicUrl: userAvatarPublicUrl,
          },
        },
        evidence:
          activity.evidence?.map((ev) => {
            const publicDisplayUrl = ev.fileUrl
              ? getPublicSupabaseUrl(ev.fileUrl)
              : null;
            return {
              ...ev,
              publicDisplayUrl,
              format: ev.fileName.split(".").pop() || "", // Asegurar que format esté presente
            };
          }) || [],
      };
    });

    return NextResponse.json({
      activities,
      pagination: {
        total: totalActivities,
        page,
        limit,
        totalPages: Math.ceil(totalActivities / limit),
      },
    });
  } catch (error) {
    console.error("Error al obtener actividades para admin:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al obtener actividades." },
      { status: 500 },
    );
  }
}
