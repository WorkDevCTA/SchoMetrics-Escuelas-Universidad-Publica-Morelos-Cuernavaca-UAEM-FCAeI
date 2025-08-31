"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { format, formatDistanceToNow } from "date-fns"; // Import formatDistanceToNow
import { es } from "date-fns/locale"; // Import es locale
import {
  User,
  Calendar as CalendarIconLucide,
  Award,
  Edit,
  Camera,
  Save,
  X,
  Trash2, // Renamed Calendar to CalendarIconLucide
  TrendingUp,
  Loader2, // Added Bell, CheckCircle, MailOpen
  MSquareIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge as UiBadge } from "@/components/ui/badge"; // Kept as UiBadge to avoid conflict if you use a 'Badge' component
import { UserStats, UserProfileData } from "@/types/types"; // Assuming UserProfileBadge is defined in types
import { validateAvatarFile } from "@/lib/supabase-service"; // Assuming this path is correct
import toast from "react-hot-toast"; // Using react-hot-toast as per your original code
import { useRouter } from "next/navigation";
import { ChangePasswordForm } from "./components/change-password-form";
import EcoPointsUserCard from "../components/EcoPointsUserCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { StickyBanner } from "@/components/ui/sticky-banner";
import DashboardLayout from "../components/DashboardLayout";
import LoaderCircle from "../components/LoaderCircle";
import { Label } from "@/components/ui/label";

// Definición para Notificaciones (puedes moverla a types/types.ts)
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

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profile, setProfile] = useState<UserProfileData | null>(null); // Initialize as null
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    city: "",
    state: "",
  });
  const [stats, setStats] = useState<UserStats>({
    totalPoints: 0,
    // level: 1,
    activityCount: 0,
    recentActivities: [],
  });

  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(
    null,
  );
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados para notificaciones
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState("info"); // Para manejar la pestaña activa

  const fetchProfileData = async () => {
    // setIsLoading(true) will be handled by the main isLoading state
    try {
      const response = await fetch("/api/profile");
      if (!response.ok) throw new Error("Error al obtener perfil");
      const data: UserProfileData = await response.json();
      setProfile(data);
      setFormData({
        name: data.name || "",
        email: data.profile?.email || "",
        bio: data.profile?.bio || "",
        city: data.profile?.city || "",
        state: data.profile?.state || "",
      });
      setAvatarPreviewUrl(null);
      setSelectedAvatarFile(null);
    } catch (error) {
      console.error("Error al cargar perfil:", error);
      toast.error("Error, No se pudo cargar el perfil");
    }
    // setIsLoading(false) will be handled by the main isLoading state
  };

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
      await Promise.all([fetchProfileData(), fetchNotifications()]);
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

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!profile?.id) return; // Asegurar que profile.id exista
      try {
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
        console.error("Error al cargar datos del dashboard:", error);
      }
    };
    fetchUserStats();
  }, [
    profile?.id,
    // profile?.level
  ]); // Dependencias correctas

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateAvatarFile(file); // Assuming validateAvatarFile is defined elsewhere
      if (!validation.valid) {
        toast.error(
          validation.error ||
          "Archivo inválido. Error de validación de archivo.",
        );
        setSelectedAvatarFile(null);
        setAvatarPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      } else {
        if (fileInputRef.current) fileInputRef.current.value = "";
        setSelectedAvatarFile(file);
        setAvatarPreviewUrl(URL.createObjectURL(file));
      }
      router.refresh();
    }
  };

  const triggerAvatarUpload = () => {
    fileInputRef.current?.click();
  };
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    const payload = new FormData();
    payload.append("name", formData.name);
    payload.append("email", formData.email);
    payload.append("bio", formData.bio);
    payload.append("city", formData.city);
    payload.append("state", formData.state);
    if (selectedAvatarFile) payload.append("avatarFile", selectedAvatarFile);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        body: payload,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar perfil");
      }
      const updatedProfile: UserProfileData = await response.json();
      setProfile(updatedProfile);
      // Actualizar formData con los datos del perfil actualizado
      setFormData({
        name: updatedProfile.name || "",
        email: updatedProfile.profile?.email || "",
        bio: updatedProfile.profile?.bio || "",
        city: updatedProfile.profile?.city || "",
        state: updatedProfile.profile?.state || "",
      });
      setSelectedAvatarFile(null);
      setAvatarPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setIsEditing(false);
      toast.success(
        "Perfil actualizado. Tu perfil ha sido actualizado correctamente.",
      );
      router.refresh();
      window.location.reload();
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error. No se pudo actualizar el perfil.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAvatar = async () => {
    // Usar profile.profile.avatarUrl (fileKey) para la comprobación, no publicAvatarDisplayUrl
    if (!profile?.profile?.publicAvatarDisplayUrl) {
      toast.error("No hay foto de perfil para eliminar.");
      return;
    }
    setIsSubmitting(true);
    const payload = new FormData();
    // Enviar los datos actuales del formulario para no perderlos si solo se borra el avatar
    Object.entries(formData).forEach(([key, value]) =>
      payload.append(key, value),
    );
    payload.append("deleteAvatar", "true");

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        body: payload,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Error al eliminar la foto de perfil",
        );
      }
      const updatedProfile: UserProfileData = await response.json();
      setProfile(updatedProfile);
      setSelectedAvatarFile(null);
      setAvatarPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success(
        "Foto de perfil eliminada. Tu foto de perfil ha sido eliminada.",
      );
      window.location.reload();
    } catch (error) {
      console.error("Error al eliminar avatar:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar la foto de perfil.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        email: profile.profile?.email || "",
        bio: profile.profile?.bio || "",
        city: profile.profile?.city || "",
        state: profile.profile?.state || "",
      });
    }
    setSelectedAvatarFile(null);
    setAvatarPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsEditing(false);
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
      return "hace un momento"; // Fallback
    }
  };

  const getInitials = (name: string = "") =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";
  const AvatarInput = () => (
    <input
      type="file"
      ref={fileInputRef}
      onChange={handleAvatarChange}
      accept=".jpg,.jpeg,.png,.webp"
      style={{ display: "none" }}
      disabled={isSubmitting}
    />
  );

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
      // toast.success("Notificación marcada como leída."); // Opcional
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

  if (isLoading) {
    return (
      <DashboardLayout>
        <LoaderCircle />
      </DashboardLayout>
    );
  }
  if (!profile) {
    return (
      <DashboardLayout>
        <div className="m-5 flex h-screen flex-col items-center justify-center gap-8 sm:m-10">
          <h3 className="text-lg font-medium">No se pudo cargar el perfil</h3>
          <p className="mt-1 text-muted-foreground">
            Intenta recargar la página.
          </p>
          <Button onClick={fetchProfileData}>Reintentar</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {AvatarInput()}
      <div className="m-5 flex flex-col gap-8 sm:m-10">
        <StickyBanner className="mt-16 bg-transparent lg:mt-0">
          <span className="mx-0 max-w-[90%] rounded-md border border-sky-200 bg-sky-100 p-3 text-[12px] text-sky-800 md:text-[13px] xl:text-[15px]">
            <p className="font-bold">Aviso importante:</p>
            Después del primer ingreso a la plataforma es necesario que cambies
            tu Correo Electrónico por el Institucional o en su defecto uno
            Personal. Así mismo es necesario que realices el cambio de tu
            contraseña para mantener tu cuenta segura.
            <br />
            En caso de algún inconveniente puedes comunicarte al correo:
            <span className="font-bold"> ecosoporte@SchoMetrics.com</span>
          </span>
        </StickyBanner>
        <div className="mt-16 flex flex-col gap-3 rounded-xl bg-gradient-to-br from-black to-slate-800 p-8 text-white shadow-2xl lg:mt-0">
          <h1 className="flex flex-col items-center gap-3 text-4xl font-bold tracking-tight md:flex-row">
            <User className="h-10 w-10 animate-bounce" />
            Mi Perfil
          </h1>
          <p className="text-center text-lg opacity-90 md:text-start">
            Gestiona tu información personal y mira tus logros obtenidos
          </p>
        </div>
        <div className="flex w-full flex-col items-center justify-center gap-6 lg:justify-between xl:flex-row xl:items-start">
          {" "}
          {/* Manteniendo xl:grid-cols-3 */}
          <Card className="w-full select-none md:col-span-1">
            {" "}
            {/* Ajustado para que el perfil ocupe 1 columna en md y más grandes */}
            <CardHeader className="relative">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <Avatar
                    className="pointer-events-none h-24 w-24 select-none"
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                  >
                    <AvatarImage
                      src={
                        avatarPreviewUrl ||
                        profile.profile?.publicAvatarDisplayUrl ||
                        ""
                      }
                      alt={profile.name || "Avatar"}
                    />
                    <AvatarFallback className="bg-baseColor/20 text-2xl uppercase text-baseColor">
                      {getInitials(profile.name)}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && ( // Mostrar botón de cámara solo en modo edición
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute bottom-0 right-0 rounded-full bg-background"
                      onClick={triggerAvatarUpload}
                      disabled={isSubmitting}
                      title="Cambiar foto"
                    >
                      <Camera className="h-4 w-4" />
                      <span className="sr-only">Cambiar foto</span>
                    </Button>
                  )}
                </div>
                {/* Mostrar botón de eliminar solo si hay avatar y está en modo edición */}
                {isEditing &&
                  profile.profile?.publicAvatarDisplayUrl &&
                  !avatarPreviewUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-red-500 hover:text-red-700"
                      onClick={handleDeleteAvatar}
                      disabled={isSubmitting}
                      title="Eliminar foto"
                    >
                      <Trash2 className="mr-1 h-4 w-4" />
                      Eliminar foto
                    </Button>
                  )}
                {avatarPreviewUrl && (
                  <p className="mt-1 text-xs text-sky-600">
                    Nueva foto seleccionada (Da clic en Guardar para aplicar)
                  </p>
                )}
                {!isEditing && (
                  <p className="mt-4 px-5 text-center text-xs text-muted-foreground lg:px-10">
                    Para cambiar la foto de Perfil da clic en "Editar
                    Información" y luego en "Guardar".
                  </p>
                )}
                <CardTitle className="mt-4 text-center text-xl uppercase">
                  {profile.name}
                </CardTitle>
                <div className="w-full overflow-auto text-center text-muted-foreground">
                  {profile.profile?.email}
                </div>
                <CardDescription>
                  Matricula:{" "}
                  <span className="font-bold text-baseColor">
                    {profile.matricula}
                  </span>
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <EcoPointsUserCard />
              </div>
              <div className="space-y-1">
                <div className="mt-10 flex items-center gap-2 text-sm">
                  <CalendarIconLucide className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Miembro desde:</span>
                  <span>{formatDate(profile.createdAt, false)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Tipo:</span>
                  <span>
                    {profile.userType === "STUDENT"
                      ? "ESTUDIANTE"
                      : profile.userType === "TEACHER"
                        ? "DOCENTE"
                        : profile.userType === "ADMIN"
                          ? "ADMINISTRADOR"
                          : "SIN TIPO"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MSquareIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Matricula:</span>
                  <span>{profile.matricula}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Actividades:</span>
                  <span>{stats.activityCount}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">EcoPoints:</span>
                  <span>{profile.points}</span>
                </div>
              </div>
              <div className="pt-4">
                <h3 className="mb-2 flex items-center gap-2 font-medium">
                  <Award className="h-4 w-4 text-muted-foreground" /> Insignias
                </h3>
                {profile.profile?.badges &&
                  profile.profile.badges.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.profile.badges.map((badge) => (
                      <UiBadge
                        key={badge.id}
                        variant="outline"
                        className="flex items-center gap-1 bg-green-50 px-2 py-1 text-green-800"
                      >
                        {/* Asumiendo que badge.imageUrl es una URL completa y pública */}
                        <img
                          src={badge.imageUrl || ""}
                          alt={badge.name}
                          className="h-4 w-4"
                        />
                        {badge.name}
                      </UiBadge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Aún no has obtenido insignias.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="md:col-span w-full">
            {" "}
            {/* Ajustado para que las pestañas ocupen 2 columnas en md y más grandes */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <CardHeader>
                <div className="flex flex-col items-center justify-between gap-2 pb-2">
                  {" "}
                  {/* Reducido mb */}
                  <CardTitle>Detalles de la Cuenta</CardTitle>
                  <CardDescription className="text-center">
                    Recuerda cambiar tu Correo Electronico y Contraseña después
                    del primer ingreso a la plataforma.
                  </CardDescription>
                  {activeTab === "info" && !isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      disabled={isSubmitting}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Editar Información
                    </Button>
                  )}
                  {activeTab === "info" && isEditing && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        className="bg-baseColor hover:bg-baseColor/80"
                        onClick={handleSave}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="mr-2 h-4 w-4" />
                        )}
                        Guardar
                      </Button>
                    </div>
                  )}
                </div>
                <TabsList className="grid w-max grid-cols-2" id="profile_tabs">
                  <TabsTrigger value="info">Información</TabsTrigger>
                  <TabsTrigger value="security">Seguridad</TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent>
                <TabsContent value="info" className="space-y-6">
                  {isEditing ? (
                    <>
                      <div className="grid gap-2">
                        <Label htmlFor="name" className="text-sm font-medium">
                          Nombre completo
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          disabled
                          className="uppercase"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="email" className="text-sm font-medium">
                          Correo electrónico (Institucional o Personal)
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="bio" className="text-sm font-medium">
                          Biografía
                        </Label>
                        <Textarea
                          id="bio"
                          name="bio"
                          value={formData.bio}
                          onChange={handleChange}
                          rows={3}
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                          <Label htmlFor="city" className="text-sm font-medium">
                            Ciudad
                          </Label>
                          <Input
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                          <Label
                            htmlFor="state"
                            className="text-sm font-medium"
                          >
                            Estado
                          </Label>
                          <Input
                            id="state"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-1">
                        <h3 className="flex items-center gap-2 font-medium">
                          <User className="h-4 w-4 text-muted-foreground" />
                          Nombre completo
                        </h3>
                        <p className="uppercase">{profile.name}</p>
                      </div>

                      {profile.profile?.email && (
                        <div className="space-y-1">
                          <h3 className="font-medium">Correo electrónico</h3>
                          <p className="overflow-auto text-muted-foreground">
                            {profile.profile.email}
                          </p>
                        </div>
                      )}
                      {profile.profile?.bio && (
                        <div className="space-y-1">
                          <h3 className="font-medium">Biografía</h3>
                          <p className="text-muted-foreground">
                            {profile.profile.bio}
                          </p>
                        </div>
                      )}
                      <div className="pt-2">
                        <h3 className="mb-2 font-medium">Ciudad y Estado</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                          {
                            <div className="flex items-start gap-2">
                              <div className="text-muted-foreground">
                                <p>{profile.profile?.city}</p>
                                <p>{profile.profile?.state}</p>
                              </div>
                            </div>
                          }
                        </div>
                      </div>
                    </>
                  )}
                </TabsContent>
                <TabsContent value="security">
                  <ChangePasswordForm />
                  {/* <div className="space-y-6"><div className="space-y-2"><h3 className="font-medium">Cambiar contraseña</h3><p className="text-sm text-muted-foreground">Actualiza tu contraseña para mantener tu cuenta segura</p></div><div className="grid gap-4"><div className="grid gap-2"><Label htmlFor="current-password">Contraseña actual</Label><Input id="current-password" type="password" /></div><div className="grid gap-2"><Label htmlFor="new-password">Nueva contraseña</Label><Input id="new-password" type="password" /></div><div className="grid gap-2"><Label htmlFor="confirm-password">Confirmar nueva</Label><Input id="confirm-password" type="password" /></div></div><Button className="bg-green-600 hover:bg-green-700">Actualizar contraseña</Button></div> */}
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
