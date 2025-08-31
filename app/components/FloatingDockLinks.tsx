import { FloatingDock } from "@/components/ui/floating-dock";
import useUserSession from "@/hooks/useUserSession";
import {
  Award,
  BarChart2,
  Gift,
  GraduationCap,
  IdCardLanyard,
  Home,
  Leaf,
  MapPin,
  Megaphone,
  Settings2,
  Trophy,
  User,
} from "lucide-react";
export function FloatingDockLinks() {
  const currentSession = useUserSession();
  const links = [
    {
      title: "Inicio",
      icon: <Home className="h-full w-full text-baseSecondColor" />,
      href: "/inicio",
    },
    {
      title: "Actividades",
      icon: <Leaf className="h-full w-full text-baseSecondColor" />,
      href: "/actividades",
    },
    {
      title: "Estadísticas",
      icon: <BarChart2 className="h-full w-full text-baseSecondColor" />,
      href: "/estadisticas",
    },
    {
      title: "Educación",
      icon: <GraduationCap className="h-full w-full text-baseSecondColor" />,
      href: "/educacion",
    },
    {
      title: "Recompensas",
      icon: <Gift className="h-full w-full text-baseSecondColor" />,
      href: "/recompensas",
    },

    {
      title: "Insignias",
      icon: <Award className="h-full w-full text-baseSecondColor" />,
      href: "/insignias",
    },
    {
      title: "Marcadores",
      icon: <Trophy className="h-full w-full text-baseSecondColor" />,
      href: "/marcadores",
    },
    {
      title: "Avisos",
      icon: <Megaphone className="h-full w-full text-baseSecondColor" />,
      href: "/avisos",
    },
    {
      title: "Mi Carnet",
      icon: <IdCardLanyard className="h-full w-full text-baseSecondColor" />,
      href: "/mi-carnet",
    },
    {
      title: "Mi Perfil",
      icon: <User className="h-full w-full text-baseSecondColor" />,
      href: "/perfil",
    },
  ];

  // Link For Admin
  const linksForAdmin = [
    {
      title: "Panel de Administración",
      icon: <Settings2 className="h-full w-full text-black" />,
      href: "/admin",
    },
    {
      title: "Inicio",
      icon: <Home className="h-full w-full text-baseSecondColor" />,
      href: "/inicio",
    },
    {
      title: "Actividades",
      icon: <Leaf className="h-full w-full text-baseSecondColor" />,
      href: "/actividades",
    },
    {
      title: "Estadísticas",
      icon: <BarChart2 className="h-full w-full text-baseSecondColor" />,
      href: "/estadisticas",
    },
    {
      title: "Educación",
      icon: <GraduationCap className="h-full w-full text-baseSecondColor" />,
      href: "/educacion",
    },
    {
      title: "Recompensas",
      icon: <Gift className="h-full w-full text-baseSecondColor" />,
      href: "/recompensas",
    },

    {
      title: "Insignias",
      icon: <Award className="h-full w-full text-baseSecondColor" />,
      href: "/insignias",
    },
    {
      title: "Marcadores",
      icon: <Trophy className="h-full w-full text-baseSecondColor" />,
      href: "/marcadores",
    },
    {
      title: "Centros de Acopio",
      icon: <MapPin className="h-full w-full text-baseSecondColor" />,
      href: "/centros-de-acopio",
    },
    {
      title: "Avisos",
      icon: <Megaphone className="h-full w-full text-baseSecondColor" />,
      href: "/avisos",
    },
    {
      title: "Mi Carnet",
      icon: <IdCardLanyard className="h-full w-full text-baseSecondColor" />,
      href: "/mi-carnet",
    },
    {
      title: "Mi Perfil",
      icon: <User className="h-full w-full text-baseSecondColor" />,
      href: "/perfil",
    },
  ];
  return (
    <>
      {currentSession?.session?.userType === "ADMIN" ? (
        <FloatingDock
          mobileClassName="translate-y-20" // only for demo, remove for production
          items={linksForAdmin}
        />
      ) : (
        <FloatingDock
          mobileClassName="translate-y-20" // only for demo, remove for production
          items={links}
        />
      )}
    </>
  );
}
