"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Announcement, User, UserType } from "@prisma/client";
import { Megaphone, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { FloatingNavAdmin } from "../components/FloatingNavAdmin";
import GoToBackAdmin from "../components/GoToBackAdmin";
import SchoMetricsLoader from "@/app/components/SchoMetricsLoader";

// Tipo extendido para el aviso
type AnnouncementWithUser = Announcement & {
  user: Pick<User, "name">;
};

function formatDate(dateString: Date) {
  return new Date(dateString).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const USER_TYPE_MAP: { [key: string]: string } = {
  AVISO_SCHOMETRICS: "AVISO SCHOMETRICS",
  AVISO_ESCOLAR: "AVISO ESCOLAR",
  AVISO_AMBIENTAL: "AVISO AMBIENTAL",
  AVISO_GENERAL: "AVISO GENERAL",
  AVISO_ACTUALIZACION: "AVISO ACTUALIZACION",
};

function AnnouncementCard({
  announcement,
  isAdmin,
}: {
  announcement: AnnouncementWithUser;
  isAdmin: boolean;
}) {
  return (
    <Card className="mb-4 rounded-lg border-2 bg-white p-6 shadow-md">
      <div className="flex flex-col items-center justify-center gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <Badge
            variant={
              announcement.topic === "AVISO_SCHOMETRICS"
                ? "outline"
                : announcement.topic === "AVISO_ESCOLAR"
                  ? "outline"
                  : announcement.topic === "AVISO_AMBIENTAL"
                    ? "outline"
                    : announcement.topic === "AVISO_GENERAL"
                      ? "outline"
                      : announcement.topic === "AVISO_ACTUALIZACION"
                        ? "outline"
                        : "default"
            }
            className={
              announcement.topic === "AVISO_SCHOMETRICS"
                ? "w-max border-teal-300 bg-teal-100 text-teal-700"
                : announcement.topic === "AVISO_ESCOLAR"
                  ? "w-max border-amber-300 bg-amber-100 text-amber-700"
                  : announcement.topic === "AVISO_AMBIENTAL"
                    ? "w-max border-teal-300 bg-[#53c932] text-green-100"
                    : announcement.topic === "AVISO_GENERAL"
                      ? "w-max border-purple-300 bg-purple-100 text-purple-700"
                      : announcement.topic === "AVISO_ACTUALIZACION"
                        ? "w-max border-rose-300 bg-rose-100 text-rose-700"
                        : "w-max border-gray-300 bg-gray-100 text-gray-700"
            }
          >
            {USER_TYPE_MAP[announcement.topic] || announcement.topic}
          </Badge>
        </div>
        {isAdmin && (
          <Link
            href={`/admin/avisos/editar/${announcement.id}`}
            className="mb-3 text-sm"
          >
            <Button className="bg-blue-950 hover:bg-sky-900">Editar</Button>
          </Link>
        )}
      </div>
      <div className="flex flex-col items-center justify-center border-t-2 border-gray-200 pt-4 text-center">
        <h2 className="text-xl font-bold text-red-800">{announcement.title}</h2>
        <p className="mt-2 rounded-xl bg-[#faf0f0] p-2 text-gray-600">
          {announcement.content}
        </p>
        <div className="mt-4 border-t-2 border-gray-200 pt-2 text-right text-sm text-gray-500">
          <p>
            Publicado por:{" "}
            <strong className="uppercase text-[#2e86c1]">
              {announcement.user?.name || "Admin"}
            </strong>
          </p>
          <p>Creado: {formatDate(announcement.createdAt)}</p>
        </div>
      </div>
    </Card>
  );
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementWithUser[]>(
    [],
  );
  const { session, isLoadingSession } = useUserSession(); // Usando el hook de sesión
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const response = await fetch("/api/admin/announcements");
        if (!response.ok) {
          throw new Error("Error al obtener los avisos");
        }
        const data = await response.json();
        setAnnouncements(data);
      } catch (error) {
        console.error("Error fetching announcements:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (!isLoadingSession) {
      // Solo cargar avisos después de verificar la sesión
    }
  }, [isLoadingSession]);

  const isAdmin = session?.role === "ADMIN";

  if (isLoading) {
    return <SchoMetricsLoader />;
  }

  return (
    <main className="p-4 md:p-6">
      <div className="mb-10 mt-16 flex flex-col items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-lime-500 to-lime-500 p-5 text-white shadow-lg lg:mt-0 lg:flex-row lg:justify-between">
        <div className="my-3">
          <div className="flex items-center gap-3">
            <Megaphone className="h-8 w-8" />
            <h1 className="text-3xl font-bold tracking-tight">Avisos</h1>
          </div>
          <p className="text-white">
            Crea o Edita Avisos para los Usuarios de EcoMetrics School.
          </p>
        </div>
        <GoToBackAdmin />
      </div>
      <FloatingNavAdmin />
      <div className="my-5 p-2">
        <Link href="/admin/avisos/nuevo">
          <Button className="mt-3 w-full bg-emerald-500 text-white hover:bg-emerald-600 md:mt-0 md:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" /> Crear Nuevo Aviso
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {announcements.length > 0 ? (
          announcements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              isAdmin={isAdmin}
            />
          ))
        ) : (
          <div className="rounded-lg bg-white py-10 text-center shadow-md">
            <p className="text-gray-500">
              No hay avisos para mostrar en este momento.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

// Hook simple para obtener la sesión del usuario (reutilizado)
function useUserSession() {
  const [session, setSession] = useState<{
    id: string;
    userType: UserType;
    role: string;
    name: string;
    email: string;
  } | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          setSession(data.user);
        } else {
          setSession(null);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
        setSession(null);
      } finally {
        setIsLoadingSession(false);
      }
    }
    fetchSession();
  }, []);
  return { session, isLoadingSession };
}
