import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ user: null });
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: {
        id: session.id as string,
      },
      select: {
        id: true,
        name: true,
        matricula: true,
        role: true,
        points: true,
        userType: true,
      },
    });

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error al obtener la sesión:", error);
    return NextResponse.json(
      { error: "Error al obtener la sesión" },
      { status: 500 },
    );
  }
}
