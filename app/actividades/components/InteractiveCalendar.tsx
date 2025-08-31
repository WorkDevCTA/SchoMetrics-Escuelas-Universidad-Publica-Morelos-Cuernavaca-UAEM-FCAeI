"use client";

import type React from "react";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  CalendarIcon,
  Clock,
  CheckCircle,
  Film,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/legacy/image";
import { formatDate, getActivityIcon } from "../page";

interface ExtendedActivity {
  id: string;
  title: string;
  description?: string;
  type: string;
  quantity: number;
  unit: string;
  date: string;
  points: number;
  status: "PENDING_REVIEW" | "REVIEWED";
  evidence?: Array<{
    id: string;
    fileName?: string;
    fileType: string;
    publicDisplayUrl?: string;
  }>;
}

interface InteractiveCalendarProps {
  activities: ExtendedActivity[];
}

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export const InteractiveCalendar: React.FC<InteractiveCalendarProps> = ({
  activities,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Organizar actividades por fecha
  const activitiesByDate = useMemo(() => {
    const grouped: { [key: string]: ExtendedActivity[] } = {};

    activities.forEach((activity) => {
      const date = new Date(activity.date);
      const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(activity);
    });

    return grouped;
  }, [activities]);

  // Obtener días del mes actual
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Días del mes anterior para completar la primera semana
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDay = new Date(year, month, day);
      days.push({ date: currentDay, isCurrentMonth: true });
    }

    // Días del siguiente mes para completar la última semana
    const remainingDays = 42 - days.length; // 6 semanas × 7 días
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({ date: nextDate, isCurrentMonth: false });
    }

    return days;
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getActivitiesForDate = (date: Date) => {
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    return activitiesByDate[dateKey] || [];
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const days = getDaysInMonth(currentDate);
  const selectedDateActivities = selectedDate
    ? getActivitiesForDate(selectedDate)
    : [];

  return (
    <div className="w-full space-y-6">
      {/* Header del calendario */}
      <Card className="border-0 bg-gradient-to-r from-green-50 via-white to-emerald-100 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex flex-col items-center justify-center gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2">
                <CalendarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-800">
                  {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                </CardTitle>
                <p className="mt-1 text-sm text-gray-600">
                  {activities.length} actividades registradas
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                title="Mes anterior"
                onClick={() => navigateMonth("prev")}
                className="hover:bg-gray-100"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                title="Día actual"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
                className="hover:bg-gray-100"
              >
                Hoy
              </Button>
              <Button
                variant="outline"
                size="sm"
                title="Próximo mes"
                onClick={() => navigateMonth("next")}
                className="hover:bg-gray-100"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Grid del calendario */}
      <Card className="w-full overflow-auto p-2 shadow-lg">
        <CardContent className="w-[600px] overflow-auto p-6 md:w-full">
          {/* Días de la semana */}
          <div className="mb-4 grid grid-cols-7 gap-2">
            {DAYS.map((day) => (
              <div
                key={day}
                className="py-2 text-center text-sm font-semibold text-green-600"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Días del mes */}
          <div className="grid grid-cols-7 gap-2">
            <AnimatePresence mode="wait">
              {days.map((day, index) => {
                const dayActivities = getActivitiesForDate(day.date);
                const hasActivities = dayActivities.length > 0;
                const reviewedActivities = dayActivities.filter(
                  (a) => a.status === "REVIEWED",
                );
                const pendingActivities = dayActivities.filter(
                  (a) => a.status === "PENDING_REVIEW",
                );

                return (
                  <motion.div
                    key={`${day.date.toISOString()}-${index}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2, delay: index * 0.01 }}
                    className={`relative aspect-square cursor-pointer rounded-lg p-2 transition-all duration-200 ${day.isCurrentMonth ? "hover:bg-green-50 hover:shadow-md" : "text-gray-400 hover:bg-gray-50"} ${
                      isToday(day.date)
                        ? "border-2 border-green-500 bg-green-100 font-bold"
                        : "border border-gray-200"
                    } ${hasActivities && day.isCurrentMonth ? "bg-gradient-to-br from-green-50 to-emerald-50" : ""} `}
                    onClick={() => hasActivities && setSelectedDate(day.date)}
                  >
                    <div className="text-sm font-medium">
                      {day.date.getDate()}
                    </div>

                    {hasActivities && day.isCurrentMonth && (
                      <div className="absolute bottom-1 left-1 right-1 space-y-1">
                        {reviewedActivities.length > 0 && (
                          <div className="h-1 rounded-full bg-green-500" />
                        )}
                        {pendingActivities.length > 0 && (
                          <div className="h-1 rounded-full bg-amber-400" />
                        )}
                        <div className="text-center text-xs font-medium text-gray-600">
                          {dayActivities.length}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Leyenda */}
      <Card className="shadow-md">
        <CardContent className="p-4">
          <div className="flex w-full flex-col items-start justify-center gap-4 text-sm md:flex-row md:items-center md:justify-center">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span>Actividades revisadas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-amber-400" />
              <span>Pendientes de revisión</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full border-2 border-green-500 bg-green-100" />
              <span>Día actual</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de actividades del día seleccionado */}
      <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
        <DialogContent className="max-h-[80vh] max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-green-600" />
              Actividades del{" "}
              {selectedDate && formatDate(selectedDate.toISOString())}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] w-full overflow-auto p-2">
            <div className="w-[400px] space-y-4 overflow-auto pr-4 md:w-full">
              {selectedDateActivities.map((activity) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border-4 border-double border-green-200 bg-white p-4 shadow-sm"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-green-100 p-2">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {activity.title}
                        </h4>
                        {activity.description && (
                          <p className="mt-1 text-sm text-gray-600">
                            {activity.description}
                          </p>
                        )}
                      </div>
                    </div>
                    {activity.status === "REVIEWED" && activity.points > 0 && (
                      <div className="flex items-center gap-1 font-medium text-green-600">
                        <Image
                          src="/eco_points_logo.png"
                          alt="eco_points_logo"
                          width={20}
                          height={20}
                        />
                        <span>+{activity.points}</span>
                      </div>
                    )}
                  </div>

                  <div className="mb-3 grid grid-cols-2 gap-4 text-sm text-gray-700">
                    <span>
                      <span className="font-medium text-green-600">
                        Cantidad:
                      </span>{" "}
                      {activity.quantity} {activity.unit}
                    </span>
                    <span>
                      <span className="font-medium text-green-600">
                        Tipo de actividad:
                      </span>{" "}
                      {activity.type}
                    </span>
                  </div>

                  {activity.evidence && activity.evidence.length > 0 && (
                    <div className="mb-3">
                      <h5 className="mb-2 text-sm font-medium text-green-600">
                        Evidencia:
                      </h5>
                      <div className="flex gap-2 overflow-x-auto">
                        {activity.evidence.slice(0, 3).map((evidence) => (
                          <div
                            key={evidence.id}
                            className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-100"
                          >
                            {evidence.publicDisplayUrl &&
                            evidence.fileType === "image" ? (
                              <Image
                                src={
                                  evidence.publicDisplayUrl ||
                                  "/placeholder.svg"
                                }
                                alt={evidence.fileName || "Evidencia"}
                                width={64}
                                height={64}
                                objectFit="cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-100 to-cyan-100">
                                <Film className="h-16 w-16 text-blue-400 opacity-70" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-2">
                    {activity.status === "PENDING_REVIEW" ? (
                      <Badge
                        variant="outline"
                        className="flex w-max items-center gap-1.5 border-amber-500 bg-amber-50 text-amber-600"
                      >
                        <Clock className="h-3.5 w-3.5" />
                        Pendiente por revisar
                      </Badge>
                    ) : (
                      <Badge
                        variant="default"
                        className="flex w-max items-center gap-1.5 bg-green-600 text-white hover:bg-green-700"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Revisado - {activity.points} puntos
                      </Badge>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
