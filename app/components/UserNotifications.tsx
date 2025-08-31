"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Bell,
  CheckCircle,
  Loader2,
  MailOpen,
  MessageCircle,
  Clock,
  MessageCircleWarningIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

// Definición para Notificaciones
interface NotificationItem {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string; // ISO string
}

interface NotificationsApiResponse {
  notifications: NotificationItem[];
  unreadCount: number;
}

const ShowUserNotifications = () => {
  // Estados para notificaciones
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("info");

  const fetchNotifications = async () => {
    setIsLoadingNotifications(true);
    try {
      const response = await fetch("/api/notifications");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al obtener notificaciones");
      }
      const data: NotificationsApiResponse = await response.json();
      setNotifications(data.notifications);
      setUnreadNotificationsCount(data.unreadCount);
    } catch (error) {
      console.error("Error cargando notificaciones:", error);
      toast.error("No se pudieron cargar tus notificaciones.");
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      await Promise.all([fetchNotifications()]);
      setIsLoading(false);
    };
    loadInitialData();
  }, []);

  // Efecto para manejar el anclaje a la pestaña de notificaciones
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.location.hash === "#notifications_tab"
    ) {
      setActiveTab("notifications");
    }
  }, []);

  const markNotificationAsRead = async (
    notificationId: string,
    currentIsRead: boolean,
  ) => {
    if (currentIsRead) return;

    const previousNotifications = [...notifications];
    const previousUnreadCount = unreadNotificationsCount;

    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)),
    );
    setUnreadNotificationsCount((prev) => Math.max(0, prev - 1));

    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        setNotifications(previousNotifications);
        setUnreadNotificationsCount(previousUnreadCount);
        throw new Error(
          errorData.error || "Error al marcar notificación como leída",
        );
      }
    } catch (error) {
      console.error("Error marcando notificación como leída:", error);
      setNotifications(previousNotifications);
      setUnreadNotificationsCount(previousUnreadCount);
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la notificación.",
      );
    }
  };

  const formatDate = (dateString: string | undefined, includeTime = true) => {
    if (!dateString) return "Fecha no disponible";
    const date = new Date(dateString);
    if (includeTime) {
      return format(date, "dd MMM, yyyy 'a las' HH:mm", { locale: es });
    }
    return format(date, "dd MMM, yyyy", { locale: es });
  };

  const formatRelativeDate = (dateString: string | undefined) => {
    if (!dateString) return "";
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: es,
      });
    } catch (e) {
      console.warn("Error formatting relative date:", e);
      return "hace un momento";
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl p-4 sm:p-6">
      {/* Header con contador de notificaciones */}
      <div className="mb-8 w-full rounded-md bg-gradient-to-br from-blue-700 to-violet-800 p-2 px-5 text-center sm:w-max md:rounded-full md:text-left">
        <div className="mb-2 flex items-center justify-between pt-2">
          <div className="flex flex-col items-center justify-center gap-3 md:flex-row md:items-start">
            <div className="relative">
              <Bell className="h-7 w-7 text-purple-200" />
              {unreadNotificationsCount > 0 && (
                <div className="absolute -right-2 -top-2 flex h-5 w-5 animate-pulse items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-xs font-bold text-white">
                  {unreadNotificationsCount > 9
                    ? "9+"
                    : unreadNotificationsCount}
                </div>
              )}
            </div>
            <div>
              <p className="text-md pl-2 text-purple-50">
                {unreadNotificationsCount > 0
                  ? `Tienes ${unreadNotificationsCount} notificación${unreadNotificationsCount > 1 ? "es" : ""} sin leer`
                  : "Todas las notificaciones están al día"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de Notificaciones */}
      <div className="space-y-4">
        {isLoadingNotifications ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-16">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full bg-blue-600/20"></div>
            </div>
            <p className="animate-pulse text-muted-foreground">
              Cargando notificaciones...
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="space-y-4 py-16 text-center">
            <div className="relative mx-auto mb-6 h-24 w-24">
              <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-blue-100 to-purple-100"></div>
              <Bell className="absolute inset-0 m-auto h-12 w-12 text-blue-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-800">
                No tienes notificaciones
              </h3>
              <p className="mx-auto max-w-md text-muted-foreground">
                Cuando recibas mensajes del administrador, aparecerán aquí con
                un diseño hermoso y fácil de leer.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {notifications.map((notif, index) => (
              <Card
                key={notif.id}
                className={cn(
                  "group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl",
                  "border-l-4 animate-in fade-in-0 slide-in-from-left-5",
                  !notif.isRead
                    ? "border-l-blue-500 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 shadow-lg shadow-blue-100/50"
                    : "border-l-gray-300 bg-gradient-to-r from-gray-50 to-slate-50 hover:shadow-md",
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Efecto de brillo para notificaciones no leídas */}
                {!notif.isRead && (
                  <div className="animate-shimmer absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                )}

                <CardHeader className="pb-3">
                  <div className="flex flex-col items-start justify-between gap-4">
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <div
                        className={cn(
                          "flex-shrink-0 rounded-full p-2 transition-all duration-300",
                          !notif.isRead
                            ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg"
                            : "bg-gray-200 text-gray-600",
                        )}
                      >
                        {!notif.isRead ? (
                          <MessageCircle className="h-4 w-4" />
                        ) : (
                          <MailOpen className="h-4 w-4" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <CardTitle
                          className={cn(
                            "mb-1 text-base font-semibold leading-tight transition-colors duration-300 sm:text-lg",
                            !notif.isRead ? "text-gray-900" : "text-gray-700",
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {notif.title}
                            {!notif.isRead && (
                              <MessageCircleWarningIcon className="h-4 w-4 animate-bounce text-green-500" />
                            )}
                          </div>
                        </CardTitle>

                        <CardDescription className="flex items-center gap-2 text-xs sm:text-sm">
                          <Clock className="h-3 w-3 flex-shrink-0" />
                          <span className="font-medium">
                            {formatRelativeDate(notif.createdAt)}
                          </span>
                          <span className="hidden text-muted-foreground sm:inline">
                            • {formatDate(notif.createdAt)}
                          </span>
                        </CardDescription>
                      </div>
                    </div>

                    {!notif.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "z-50 h-8 flex-shrink-0 px-3 text-xs font-medium transition-all duration-300",
                          "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600",
                          "shadow-md hover:scale-105 hover:text-white hover:shadow-lg",
                        )}
                        onClick={() =>
                          markNotificationAsRead(notif.id, notif.isRead)
                        }
                      >
                        <CheckCircle className="mr-1.5 h-3.5 w-3.5 animate-heartbeat" />
                        Marcar leída
                      </Button>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div
                    className={cn(
                      "rounded-lg p-4 transition-all duration-300",
                      !notif.isRead
                        ? "border border-blue-100 bg-white/70"
                        : "border border-gray-200 bg-white/50",
                    )}
                  >
                    <p className="mb-2 text-sm font-medium text-muted-foreground">
                      Contenido del mensaje:
                    </p>
                    <p
                      className={cn(
                        "z-500 flex overflow-auto whitespace-pre-wrap leading-relaxed transition-colors duration-300",
                        !notif.isRead
                          ? "font-medium text-gray-800"
                          : "text-gray-600",
                      )}
                    >
                      {notif.message}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowUserNotifications;
