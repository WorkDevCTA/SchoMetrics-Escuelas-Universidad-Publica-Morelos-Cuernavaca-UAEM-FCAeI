"use client";

import React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Leaf,
  User,
  LogOut,
  BarChart2,
  Award,
  Trophy,
  Bell,
  Gift,
  GraduationCap,
  UserCog,
  Megaphone,
  IdCardLanyard,
  Star,
  Home
} from "lucide-react"; // Añadido Bell y Gift (si no estaba)
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { UserProfileData, UserStats } from "@/types/types"; // Asumo que UserProfileBadge está en types.ts
import Image from "next/legacy/image";
import useUserSession from "@/hooks/useUserSession";
import SchoMetricsLoader from "./SchoMetricsLoader";
import { luckiestGuy } from "@/fonts/fonts";
import {
  calculateNextGoal,
  calculatePreviousGoal,
  calculateProgress,
} from "./EcoPointsUserCard";
import AvatarUser from "./AvatarUser";
import { FloatingDockLinks } from "./FloatingDockLinks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Interfaz para la respuesta de la API de notificaciones (solo necesitamos el contador aquí)
interface NotificationsSummary {
  unreadCount: number;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfileData | null>(null); // Inicializar como null para manejar mejor el estado de carga
  const [unreadNotifications, setUnreadNotifications] = useState(0); // Estado para notificaciones
  const currentSession = useUserSession();
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);

  // useEffect(() => {
  //   const handleContextMenu = (e: MouseEvent) => e.preventDefault();
  //   document.addEventListener("contextmenu", handleContextMenu);
  //   return () => document.removeEventListener("contextmenu", handleContextMenu);
  // }, []);

  // useEffect(() => {
  //   const checkDevTools = () => {
  //     if (window.outerWidth - window.innerWidth > 100) {
  //       alert("¡Cuidado! Zona de Peligro");
  //     }
  //   };
  //   window.addEventListener("resize", checkDevTools);
  //   return () => window.removeEventListener("resize", checkDevTools);
  // }, []);

  const [stats, setStats] = useState<UserStats>({
    totalPoints: 0,
    // level: 1,
    activityCount: 0,
    recentActivities: [],
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true); // Iniciar carga
      try {
        const userDataResponse = await fetch("/api/profile");
        if (!userDataResponse.ok) {
          if (userDataResponse.status === 401) {
            // Manejar caso de no autorizado
            toast.error("Sesión inválida. Por favor, inicia sesión de nuevo.");
            router.push("/login");
            return; // Salir temprano si no está autorizado
          }
          throw new Error("Error al obtener perfil de usuario");
        }
        const userData: UserProfileData = await userDataResponse.json();
        setProfile(userData); // Establecer perfil

        // Fetch notificaciones no leídas solo si el perfil se cargó correctamente
        if (userData && userData.id) {
          // Asegurarse que userData y userData.id existan
          const notificationsResponse = await fetch("/api/notifications");
          if (notificationsResponse.ok) {
            const notificationsData: NotificationsSummary =
              await notificationsResponse.json();
            setUnreadNotifications(notificationsData.unreadCount || 0);
          } else {
            console.warn(
              "No se pudieron cargar las notificaciones no leídas para el layout.",
            );
            // No mostrar toast de error aquí para no ser intrusivo, solo loguear
          }
        }
      } catch (error) {
        console.error("Error al cargar datos iniciales en layout:", error);
        // No redirigir aquí para evitar bucles si la página de login también usa este layout
        // o si hay errores intermitentes. El estado !profile se usará para mostrar un loader.
      } finally {
        setIsLoading(false); // Finalizar carga
      }
    };

    fetchInitialData();
  }, [router, pathname]); // Dependencia en pathname para re-fetch notificaciones al navegar (opcional)

  useEffect(() => {
    if (!profile) return; // Solo buscar estadísticas si el perfil está cargado

    const fetchUserStats = async () => {
      try {
        // No es necesario setIsLoading aquí si el loader principal ya está activo
        const statsResponse = await fetch("/api/stats");
        if (!statsResponse.ok) throw new Error("Error al obtener estadísticas");
        const statsData = await statsResponse.json();

        const activitiesResponse = await fetch("/api/activities?limit=3");
        if (!activitiesResponse.ok)
          throw new Error("Error al obtener actividades");
        const activitiesData = await activitiesResponse.json();

        setStats({
          totalPoints: statsData.totalPoints || 0,
          // level: profile.level || statsData.level || 1,
          activityCount: statsData.activityCount || 0,
          recentActivities: activitiesData.activities || [],
        });
      } catch (error) {
        console.error("Error al cargar estadísticas del dashboard:", error);
      }
    };
    fetchUserStats();
  }, [profile]); // Depender del perfil para cargar estadísticas

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/profile");
      if (!response.ok) throw new Error("Error al obtener perfil");
      const data: UserProfileData = await response.json();
      setProfile(data);
      setAvatarPreviewUrl(null);
    } catch (error) {
      console.error("Error al cargar perfil:", error);
      toast.error("Error, No se pudo cargar el perfil");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      await Promise.all([fetchProfileData()]);
      setIsLoading(false);
    };
    loadInitialData();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (response.ok) {
        toast.success("Has cerrado sesión correctamente");
        router.push("/");
      } else {
        toast.error("Error al cerrar sesión");
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      toast.error("No se pudo cerrar sesión");
    }
  };

  const getInitials = (name: string = "") => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "U"
    );
  };

  // Calcular valores dinámicos basados en los puntos
  const nextGoal = calculateNextGoal(stats.totalPoints);
  const progress = calculateProgress(stats.totalPoints);

  // Loader de página completa mientras se carga el perfil esencial
  if (isLoading && !profile) {
    return <SchoMetricsLoader />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header para móviles */}
      <header className="border-shadow-sm fixed top-0 z-40 h-[70px] w-full bg-white px-3 lg:hidden">
        <div className="flex items-center justify-between bg-transparent px-3">
          <Link href="/inicio" className="flex items-center">
            <Image src="/logo.png" alt="logo" width={90} height={50} priority />
          </Link>
          <Avatar className="my-3 h-12 w-12">
            <AvatarImage
              src={
                avatarPreviewUrl ||
                profile?.profile?.publicAvatarDisplayUrl ||
                ""
              }
              alt={profile?.name || "Avatar"}
            />
            <AvatarFallback className="bg-baseColor/20 text-2xl uppercase text-baseColor">
              {getInitials(profile?.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center justify-center gap-2">
            <Link href="/avisos">
              <Button
                variant="ghost"
                size="icon"
                className="relative text-gray-600"
              >
                <Bell className="h-5 w-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute right-0.5 top-0.5 flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                    <span className="border-px relative inline-flex h-3 w-3 rounded-full border-white bg-red-500"></span>
                  </span>
                )}
                <span className="sr-only">Notificaciones</span>
              </Button>
            </Link>
            <Button
              className="flex w-min items-center justify-center rounded-full bg-red-500 p-3 py-5 text-center hover:bg-red-600"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 text-white" />
            </Button>
          </div>
        </div>
        {/* Floatin Bar Here */}
        <FloatingDockLinks />
      </header>

      {/* Seccion para Escritorio */}
      <div className="flex flex-1">
        <aside className="hidden select-none border-r-2 border-teal-50 bg-white shadow-md lg:flex lg:w-64 lg:flex-col">
          <Link
            href="/inicio"
            className="flex flex-col items-center justify-center text-center"
          >
            <Image
              src="/logo.png"
              alt="logo"
              width={150}
              height={120}
              priority
              objectFit="contain"
            />
            <span className="text-2xl font-bold text-schoMetricsBaseColor">
              SchoMetrics
            </span>
          </Link>
          <div className="p-3">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:bg-red-100 hover:text-red-700"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-5 w-5" />
              Cerrar Sesión
            </Button>
          </div>
          <div className="mx-5 mb-5 p-2 text-sm">
            <span>
              Notificaciones:{" "}
              <Link href="/avisos" passHref>
                {" "}
                {/* Enlace a la pestaña de notificaciones del perfil */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-gray-600"
                >
                  <Bell className="h-5 w-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute right-0.5 top-0.5 flex h-3 w-3">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                      <span className="border-px relative inline-flex h-3 w-3 rounded-full border-white bg-red-500"></span>
                    </span>
                  )}
                  <span className="sr-only">Notificaciones</span>
                </Button>
              </Link>
            </span>
          </div>

          {profile && (
            <div className="flex flex-col items-center py-5">
              <AvatarUser />
              <div className="flex flex-col gap-1 px-5 text-center">
                <p className="font-semibold uppercase text-gray-800">
                  {profile.name}
                </p>
                <p className="font-light text-gray-400">
                  Matricula:{" "}
                  <span className="font-semibold text-baseColor">
                    {profile.matricula}
                  </span>
                </p>
              </div>
            </div>
          )}
          <DashboardEcoPointsUserCard />
          {currentSession.session?.userType === "ADMIN" && (
            <div className="mt-3 flex items-center justify-center rounded-md border-none transition-all duration-300 ease-linear">
              <Link href="/admin">
                <Button
                  size="icon"
                  className="w-full justify-start bg-rose-500 px-3 text-white transition-all duration-300 ease-in-out hover:-translate-x-1 hover:bg-red-600"
                >
                  <UserCog className="h-5 w-5" />
                  Panel de Administración
                </Button>
              </Link>
            </div>
          )}
          <nav className="flex-1 space-y-1.5 overflow-y-auto p-5">
            <NavItem
              href="/inicio"
              icon={<Home className="h-5 w-5" />}
              label="Inicio"
              active={pathname === "/inicio"}
            />
            <NavItem
              href="/actividades"
              icon={<Leaf className="h-5 w-5" />}
              label="Actividades"
              active={pathname.startsWith("/actividades")}
            />
            <NavItem
              href="/estadisticas"
              icon={<BarChart2 className="h-5 w-5" />}
              label="Estadísticas"
              active={pathname === "/estadisticas"}
            />
            <NavItem
              href="/educacion"
              icon={<GraduationCap className="h-5 w-5" />}
              label="Educacion"
              active={pathname.startsWith("/educacion")}
            />
            <NavItem
              href="/recompensas"
              icon={<Gift className="h-5 w-5" />}
              label="Recompensas"
              active={pathname === "/recompensas"}
            />
            <NavItem
              href="/insignias"
              icon={<Award className="h-5 w-5" />}
              label="Insignias"
              active={pathname === "/insignias"}
            />
            <NavItem
              href="/marcadores"
              icon={<Trophy className="h-5 w-5" />}
              label="Marcadores"
              active={pathname === "/marcadores"}
            />
            <NavItem
              href="/avisos"
              icon={<Megaphone className="h-5 w-5" />}
              label="Avisos"
              active={pathname === "/avisos"}
            />
            <NavItem
              href="/mi-carnet"
              icon={<IdCardLanyard className="h-5 w-5" />}
              label="Mi Carnet"
              active={pathname === "/mi-carnet"}
            />
            <NavItem
              href="/perfil"
              icon={<User className="h-5 w-5" />}
              label="Mi Perfil"
              active={pathname === "/perfil"}
            />
            {/* <NavItem href="/productos-disponibles" icon={<ShoppingBasket className="h-5 w-5" />} label="Productos Disponibles" active={pathname === "/productos-disponibles"} /> */}
            {/* <NavItem href="/negocios-disponibles" icon={<Store className="h-5 w-5" />} label="Negocios Disponibles" active={pathname === "/negocios-disponibles"} /> */}
          </nav>
        </aside>

        <main className="test flex-1 overflow-auto">
          <div className="container mx-auto p-4">{children}</div>
        </main>
      </div>
      <footer className="border-t bg-white py-4">
        <div className="container mx-auto flex flex-col items-center justify-between gap-2 px-4 md:flex-row">
          <p className="text-center text-xs text-gray-600 md:text-left">
            © {new Date().getFullYear()} SchoMetrics. Todos los derechos
            reservados.
          </p>
          <div className="flex gap-3">
            <Link
              href="https://schometrics.website/terminos"
              className="text-xs text-gray-600"
            >
              Términos
            </Link>
            <Link
              href="https://schometrics.website/privacidad"
              className="text-xs text-gray-600"
            >
              Privacidad
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
  function DashboardEcoPointsUserCard() {
    return (
      <div className="mt-4">
        <div className="relative w-full overflow-hidden bg-white">
          {/* Inner card */}
          <div className="relative m-0.5 w-full bg-white p-6">
            {/* Premium badge */}
            <div className="absolute right-4 top-4">
              <div className="rounded-full bg-gradient-to-r from-orange-300 to-amber-500 p-2">
                <Star className={`h-5 w-5 animate-spin text-white`} />
              </div>
            </div>

            <h3
              className={`${luckiestGuy.className} mb-2 text-2xl text-[#17d627]`}
            >
              EcoPoints:
            </h3>
            <div className="text-center">
              <div
                className="relative my-5 h-[65px] w-full bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage:
                    "url('https://zibiwzddvrpjapmmgyeu.supabase.co/storage/v1/object/public/schometrics-for-schools/schometrics-resources/media/ecopoints-badge.svg')",
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className="ml-10 animate-heartbeat pt-1 text-xl font-bold tracking-wide text-white"
                    style={{
                      textShadow: "2px 2px 4px rgba(0,0,0,0.9)",
                    }}
                  >
                    {stats.totalPoints.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mb-4 rounded-full bg-gradient-to-r from-green-100 to-emerald-50 p-3">
                <div className="flex items-center justify-center gap-2">
                  <Leaf
                    className="h-5 w-5 text-green-600 transition-all duration-1000"
                    style={{ top: "15%", left: "15%" }}
                  />
                  <span
                    className="text-sm font-bold text-green-600"
                    title="Total de actividades enviadas"
                  >
                    Actividades: {stats.activityCount}
                  </span>
                </div>
              </div>

              {/* Próximo Objetivo - Funcionalidad implementada */}
              <span className="font-bold text-sky-400">Próximo Objetivo</span>
              <div
                className={`${luckiestGuy.className} space-y-2 tracking-wider`}
              >
                <div className="flex flex-col items-center justify-center text-sm">
                  <span className="text-[#17d627]">
                    {nextGoal.toLocaleString()} EcoPoints
                  </span>
                </div>

                {/* Barra de progreso dinámica */}
                <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="relative h-3 rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-teal-500 transition-all duration-700 ease-out"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 animate-pulse bg-white/30"></div>
                  </div>
                </div>

                {/* Indicador de progreso en texto */}
                <div className="mt-1 flex flex-col items-center justify-between text-xs text-[#17d627]">
                  <span>
                    {calculatePreviousGoal(stats.totalPoints).toLocaleString()}{" "}
                    Epts
                  </span>
                  <span className={`text-[16px] text-sky-400`}>
                    {progress.toFixed(1)}%
                  </span>
                  <span>{nextGoal.toLocaleString()} Epts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// Label modificado para aceptar notificationsCount
function LabelNotificaction({
  notificationsCount,
}: {
  notificationsCount?: number;
}) {
  return (
    <span>
      {notificationsCount && notificationsCount > 0 && (
        <span className="absolute right-2 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
          {notificationsCount > 9 ? "9+" : notificationsCount}
        </span>
      )}
    </span>
  );
}

// NavItem
function NavItem({
  href, // Añadido href para que Link funcione correctamente
  icon,
  label,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <Link href={href} passHref>
      <Button
        variant={active ? "default" : "ghost"}
        className={`relative w-full justify-start px-3 py-2 text-sm ${active
          ? "bg-baseColor/90 text-white hover:bg-baseColor"
          : "text-gray-700 transition-all duration-300 ease-in-out hover:-translate-x-1 hover:bg-gray-100"
          }`}
      >
        {React.cloneElement(icon as any, { className: "h-5 w-5 mr-3" })}
        {label}
      </Button>
    </Link>
  );
}

// MobileNavItem modificado para aceptar notificationsCount
function MobileNavItem({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <Link href={href} className="block w-full">
      <Button
        variant={active ? "default" : "ghost"}
        className={`relative w-full justify-start px-4 py-3 text-base ${active
          ? "bg-baseColor/90 text-white hover:bg-baseColor"
          : "text-gray-700 hover:bg-gray-100"
          }`}
      >
        {React.cloneElement(icon as any, { className: "h-5 w-5 mr-3" })}
        {label}
      </Button>
    </Link>
  );
}
