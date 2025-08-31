import React from "react";
import Image from "next/legacy/image";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, Lock, Info } from "lucide-react";
import { Badge as UiBadge } from "@/components/ui/badge"; // Shadcn UI Badge
import { type BadgeApiResponseItem } from "@/app/api/badges/route";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; //
import toast from "react-hot-toast";
import { BackgroundGradient } from "@/components/ui/background-gradient";

interface BadgeCardProps {
  badge: BadgeApiResponseItem;
}

const showInfoModalBadge = (badge: BadgeApiResponseItem): string => {
  switch (badge.criteriaType) {
    case "ACTIVITY_COUNT":
      return toast(`Registra ${badge.criteriaThreshold} actividad en total.`);
    case "TOTAL_POINTS":
      return toast(`Acumula ${badge.criteriaThreshold} eco-puntos.`);
    case "SPECIFIC_ACTIVITY_TYPE_COUNT":
      const activityTypeName = badge.criteriaActivityType
        ? badge.criteriaActivityType.toLowerCase().replace(/_/g, " ")
        : "cierto tipo";
      return toast(
        `Acumula ${badge.criteriaThreshold} unidades/kg/árboles en actividades de ${activityTypeName}.`,
      );
    default:
      return toast("Completa el objetivo específico para desbloquear.");
  }
};

const getCriteriaText = (badge: BadgeApiResponseItem): string => {
  switch (badge.criteriaType) {
    case "ACTIVITY_COUNT":
      return `Registra ${badge.criteriaThreshold} actividad(es) en total.`;
    case "TOTAL_POINTS":
      return `Acumula ${badge.criteriaThreshold} eco-puntos.`;
    case "SPECIFIC_ACTIVITY_TYPE_COUNT":
      const activityTypeName = badge.criteriaActivityType
        ? badge.criteriaActivityType.toLowerCase().replace(/_/g, " ")
        : "cierto tipo";
      return `Acumula ${badge.criteriaThreshold} unidades/kg/árboles en actividades de ${activityTypeName}.`;
    default:
      return "Completa el objetivo específico para desbloquear.";
  }
};

const BadgeCard: React.FC<BadgeCardProps> = ({ badge }) => {
  const cardContent = (
    <div
      className={cn(
        "flex h-full flex-col items-center overflow-hidden text-center transition-all duration-300 ease-in-out",
        badge.obtained
          ? "rounded-3xl bg-white" // Fondo oscuro para el contenido dentro del gradiente
          : "rounded-xl border-2 border-baseColor/20 bg-white shadow-lg",
        "group", // Para efectos hover en elementos hijos
      )}
    >
      <CardHeader className="w-full pb-3 pt-6">
        <div
          className={cn(
            "relative mx-auto mb-2 h-28 w-28 transition-transform duration-300 group-hover:scale-110",
            !badge.obtained && "grayscale group-hover:grayscale-0",
          )}
        >
          <Image
            src={badge.imageUrl || ""}
            alt={badge.name}
            width={112}
            height={112}
            className="aspect-square rounded-full object-cover shadow-md"
            onError={(e) => (e.currentTarget.src = "")}
          />
          {badge.obtained && (
            <CheckCircle className="absolute bottom-0 right-0 h-8 w-8 rounded-full border-2 border-slate-900 bg-green-500 p-1 text-white" />
          )}
          {!badge.obtained && (
            <Lock className="absolute bottom-0 right-0 h-8 w-8 rounded-full border-2 border-gray-100 bg-gray-600 p-1.5 text-gray-300" />
          )}
        </div>
        <CardTitle
          className={cn(
            "text-lg font-bold tracking-tight",
            badge.obtained ? "text-green-400" : "text-gray-700",
          )}
        >
          {badge.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow px-4 pb-3">
        <CardDescription
          className={cn(
            "line-clamp-3 text-xs",
            badge.obtained ? "text-gray-800" : "text-gray-400",
          )}
        >
          {badge.description}
        </CardDescription>
      </CardContent>
      <CardFooter className="w-full pb-5 pt-2">
        {!badge.obtained ? (
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <UiBadge
                  variant="outline"
                  className="mx-auto cursor-help border-amber-400/50 bg-amber-100/80 text-xs text-amber-800"
                >
                  <Info className="mr-1.5 h-3.5 w-3.5" />
                  <button
                    onClick={() => {
                      showInfoModalBadge(badge);
                    }}
                  >
                    Cómo obtener
                  </button>
                </UiBadge>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="max-w-xs rounded-md border-gray-700 bg-gray-800 p-2 text-xs text-white shadow-lg"
              >
                <p>{getCriteriaText(badge)}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <UiBadge
            variant="default"
            className="mx-auto bg-green-600/90 text-xs text-white shadow-sm"
          >
            ¡Obtenida!
          </UiBadge>
        )}
      </CardFooter>
    </div>
  );

  return badge.obtained ? (
    <BackgroundGradient
      className="h-full rounded-[22px] bg-white p-0.5"
      containerClassName="h-full"
    >
      {cardContent}
    </BackgroundGradient>
  ) : (
    cardContent
  );
};

export default BadgeCard;
