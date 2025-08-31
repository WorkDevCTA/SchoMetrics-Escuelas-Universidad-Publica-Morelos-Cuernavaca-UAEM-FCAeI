"use client";

import { useState, useEffect, useCallback, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Search,
  Filter,
  Edit3,
  Trash2,
  Loader2,
  AlertTriangle,
  MessageSquare,
  ListChecks,
  UserCog,
  Award,
  CalendarIcon as CalendarIconLucide,
  CheckCircle,
  Clock,
  BadgeInfo,
} from "lucide-react"; // Renombrado CalendarIcon
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar"; // El componente Calendar de Shadcn
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import toast from "react-hot-toast";
import { ActivityStatus } from "@prisma/client";
import { ActivityForAdmin, AdminActivitiesApiResponse } from "@/types/types";
import { FloatingNavAdmin } from "../components/FloatingNavAdmin";
import { EvidenceThumbnailsAdmin } from "@/app/components/EvidenceThumbnailsAdmin";
import GoToBackAdmin from "../components/GoToBackAdmin";
import { formatDate } from "@/hooks/allHooks";

const USER_TYPE_MAP: { [key: string]: string } = {
  STUDENT: "Estudiante",
  TEACHER: "Docente",
  ADMIN: "Administrador",
};
const ACTIVITY_TYPE_MAP: { [key: string]: string } = {
  RECYCLING: "Reciclaje",
  TREE_PLANTING: "Plantación",
  WATER_SAVING: "Ahorro Agua",
  ENERGY_SAVING: "Ahorro Energía",
  COMPOSTING: "Compostaje",
  EDUCATION: "Educación",
  OTHER: "Otro",
};

const ITEMS_PER_PAGE = 10;
const QUALIFICATION_POINTS = ["10", "30", "50", "75", "100"];

export default function AdminActivitiesManagementPage() {
  const router = useRouter();
  const [activities, setActivities] = useState<ActivityForAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [activityStatusFilter, setActivityStatusFilter] = useState<
    ActivityStatus | "all"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [isQualifyModalOpen, setIsQualifyModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] =
    useState<ActivityForAdmin | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    type: "OTHER",
    quantity: "1",
    unit: "",
    date: new Date().toISOString().split("T")[0],
  });
  // Al abrir el modal de calificar, pre-seleccionar los puntos actuales si ya fue calificada
  const [qualificationData, setQualificationData] = useState({
    points: QUALIFICATION_POINTS[0],
  });
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAdminActivities = useCallback(
    async (
      page = 1,
      search = searchTerm,
      uType = userTypeFilter,
      actStatus = activityStatusFilter,
    ) => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: ITEMS_PER_PAGE.toString(),
        });
        if (search) params.append("search", search);
        if (uType !== "all") params.append("userType", uType);
        if (actStatus !== "all") params.append("status", actStatus);

        const response = await fetch(
          `/api/admin/activities?${params.toString()}`,
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Error al obtener las actividades",
          );
        }
        const data: AdminActivitiesApiResponse = await response.json();
        setActivities(data.activities);
        setCurrentPage(data.pagination.page);
        setTotalPages(data.pagination.totalPages);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error ? err.message : "Ocurrió un error desconocido.",
        );
        setActivities([]);
      } finally {
        setIsLoading(false);
      }
    },
    [searchTerm, userTypeFilter, activityStatusFilter],
  ); // Añadidas dependencias que afectan la query

  useEffect(() => {
    fetchAdminActivities(
      currentPage,
      searchTerm,
      userTypeFilter,
      activityStatusFilter,
    );
  }, [
    fetchAdminActivities,
    currentPage,
    searchTerm,
    userTypeFilter,
    activityStatusFilter,
  ]);

  const handleSearchSubmit = (event?: React.FormEvent<HTMLFormElement>) => {
    if (event) event.preventDefault();
    setCurrentPage(1); // Reset page to 1 on new search/filter
    // fetchAdminActivities se llamará automáticamente por el useEffect debido al cambio de currentPage o filtros
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page); // El useEffect se encargará de llamar a fetchAdminActivities
    }
  };

  const openEditModal = (activity: ActivityForAdmin) => {
    setSelectedActivity(activity);
    setEditFormData({
      title: activity.title,
      description: activity.description || "",
      type: activity.type,
      quantity: activity.quantity.toString(),
      unit: activity.unit,
      date: activity.date,
    });
    setIsEditModalOpen(true);
  };
  const handleEditFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleEditDateChange = (date: Date | undefined) => {
    if (date) {
      setEditFormData((prev) => ({ ...prev, date }) as any);
    }
  };

  const handleUpdateActivity = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedActivity) return;
    setIsSubmitting(true);
    try {
      const dataToUpdate: any = {
        title: editFormData.title,
        description: editFormData.description,
        type: editFormData.type,
        quantity: parseFloat(editFormData.quantity),
        unit: editFormData.unit,
        date: editFormData.date,
      };
      // Si la actividad ya está revisada, el admin aún puede querer cambiarle los puntos otorgados.
      // Si el admin desea cambiar los puntos de una actividad ya calificada, usará el modal de "Calificar".
      // Este modal de "Editar" se enfoca en los detalles de la actividad, no en los puntos.

      const response = await fetch(
        `/api/admin/activities/${selectedActivity.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToUpdate),
        },
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar actividad");
      }
      toast.success("Detalles de la actividad actualizados correctamente.");
      setIsEditModalOpen(false);
      fetchAdminActivities(
        currentPage,
        searchTerm,
        userTypeFilter,
        activityStatusFilter,
      );
      router.refresh();
    } catch (err) {
      console.error("Error actualizando actividad:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Error. No se pudo actualizar la actividad",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteModal = (activity: ActivityForAdmin) => {
    setSelectedActivity(activity);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteActivity = async () => {
    if (!selectedActivity) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(
        `/api/admin/activities/${selectedActivity.id}`,
        {
          method: "DELETE",
        },
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al eliminar actividad");
      }
      toast.success(
        "Actividad eliminada. Puntos del usuario ajustados y notificación enviada.",
      );
      setIsDeleteModalOpen(false);
      fetchAdminActivities(
        currentPage,
        searchTerm,
        userTypeFilter,
        activityStatusFilter,
      );
      router.refresh();
    } catch (err) {
      console.error("Error eliminando actividad:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Error. No se pudo eliminar la actividad.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const openNotifyModal = (activity: ActivityForAdmin) => {
    setSelectedActivity(activity);
    setNotificationTitle(`Sobre tu actividad: ${activity.title}`);
    setNotificationMessage("");
    setIsNotifyModalOpen(true);
  };

  const handleSendNotification = async (e: FormEvent) => {
    e.preventDefault();
    if (
      !selectedActivity ||
      !notificationMessage.trim() ||
      !notificationTitle.trim()
    ) {
      toast.error(
        "Atención. El título y el mensaje de la notificación son requeridos.",
      );
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedActivity.user.id,
          title: notificationTitle,
          message: notificationMessage,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al enviar notificación.");
      }
      toast.success(
        `Notificación Enviada. Mensaje enviado a ${selectedActivity.user.name}.`,
      );
      setIsNotifyModalOpen(false);
    } catch (err) {
      console.error("Error enviando notificación:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Error. No se pudo enviar la notificación.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const openQualifyModal = (activity: ActivityForAdmin) => {
    setSelectedActivity(activity);
    // Si la actividad ya tiene puntos, preseleccionar ese valor si existe en QUALIFICATION_POINTS
    const currentPointsStr = activity.points.toString();
    if (QUALIFICATION_POINTS.includes(currentPointsStr)) {
      setQualificationData({ points: currentPointsStr });
    } else {
      setQualificationData({ points: QUALIFICATION_POINTS[0] }); // Default al primer valor
    }
    setIsQualifyModalOpen(true);
  };

  const handleQualifyActivity = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedActivity || !qualificationData.points) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(
        `/api/admin/activities/${selectedActivity.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ awardedPoints: qualificationData.points }), // Solo se envía awardedPoints
        },
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al calificar actividad");
      }
      const updatedActivity = await response.json();
      toast.success(
        `Actividad "${updatedActivity.title}" ${selectedActivity.status === ActivityStatus.PENDING_REVIEW ? "calificada" : "recalificada"} con ${updatedActivity.points} puntos. Notificación enviada.`,
      );
      setIsQualifyModalOpen(false);
      fetchAdminActivities(
        currentPage,
        searchTerm,
        userTypeFilter,
        activityStatusFilter,
      );
      router.refresh();
    } catch (err) {
      console.error("Error calificando actividad:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Error. No se pudo calificar la actividad.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name: string = "") =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  const renderPaginationItems = () => {
    const items = [];
    const maxPagesToShow = 5;
    const halfPagesToShow = Math.floor(maxPagesToShow / 2);

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(i);
              }}
              isActive={currentPage === i}
            >
              {i}
            </PaginationLink>
          </PaginationItem>,
        );
      }
    } else {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(1);
            }}
            isActive={currentPage === 1}
          >
            1
          </PaginationLink>
        </PaginationItem>,
      );
      if (currentPage > halfPagesToShow + 2) {
        items.push(<PaginationEllipsis key="start-ellipsis" />);
      }
      let startPage = Math.max(2, currentPage - halfPagesToShow);
      let endPage = Math.min(totalPages - 1, currentPage + halfPagesToShow);
      if (currentPage <= halfPagesToShow + 1)
        endPage = Math.min(totalPages - 1, maxPagesToShow - 2); // Ajuste para evitar solapamiento con elipsis y última página
      if (currentPage >= totalPages - halfPagesToShow - 1)
        startPage = Math.max(2, totalPages - maxPagesToShow + 2); // Ajuste similar

      for (let i = startPage; i <= endPage; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(i);
              }}
              isActive={currentPage === i}
            >
              {i}
            </PaginationLink>
          </PaginationItem>,
        );
      }
      if (currentPage < totalPages - halfPagesToShow - 1) {
        // Ajuste para mostrar elipsis correctamente
        items.push(<PaginationEllipsis key="end-ellipsis" />);
      }
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(totalPages);
            }}
            isActive={currentPage === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>,
      );
    }
    return items;
  };

  // Añadir aquí la funcionalidad para refrescar y actualizar los datos de la Tabla
  const handleRefresh = () => {
    toast.success("Tabla actualizada con los últimos datos.");
    fetchAdminActivities(
      currentPage,
      searchTerm,
      userTypeFilter,
      activityStatusFilter,
    );
  };
  return (
    <div className="m-5 flex flex-col gap-8 sm:m-10">
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-700 p-6 text-white shadow-lg lg:mt-0 lg:flex-row lg:justify-between">
        <div className="my-3">
          <div className="flex items-center gap-3">
            <UserCog className="h-8 w-8" />
            <h1 className="text-3xl font-bold tracking-tight">
              Gestión de Actividades
            </h1>
          </div>
          <p className="text-purple-100">
            Visualiza, califica, modifica y elimina actividades de todos los
            usuarios.
          </p>
        </div>
        <GoToBackAdmin />
      </div>
      <FloatingNavAdmin />
      <Card className="shadow-md">
        <CardHeader className="p-4">
          <form
            onSubmit={handleSearchSubmit}
            className="grid grid-cols-1 items-end gap-3 md:grid-cols-2 lg:grid-cols-4"
          >
            <div className="relative md:col-span-1 lg:col-span-1">
              <Label htmlFor="search-term-admin-act" className="sr-only">
                Buscar
              </Label>
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              {/* <Input id="search-term-admin-act" type="number" placeholder="Buscar Matricula" className="pl-9 py-2 text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /> */}
              <Input
                id="search-term-admin-act"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Buscar Matrícula"
                className="py-2 pl-9 text-sm"
                value={searchTerm}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {
                    setSearchTerm(value);
                  }
                }}
                onKeyDown={(e) => {
                  if (
                    !/[0-9]/.test(e.key) &&
                    e.key !== "Backspace" &&
                    e.key !== "Delete"
                  ) {
                    e.preventDefault();
                  }
                }}
              />
            </div>
            <div>
              <Label htmlFor="user-type-filter-admin-act" className="sr-only">
                Tipo de Usuario
              </Label>
              <Select
                value={userTypeFilter}
                onValueChange={(value) => {
                  setUserTypeFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger
                  id="user-type-filter-admin-act"
                  className="py-2 text-sm"
                >
                  <Filter className="mr-1.5 h-4 w-4" />
                  <SelectValue placeholder="Tipo de Usuario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Tipos</SelectItem>
                  <SelectItem value="STUDENT">Estudiantes</SelectItem>
                  <SelectItem value="TEACHER">Profesores</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="activity-status-filter" className="sr-only">
                Estado Calificación
              </Label>
              <Select
                value={activityStatusFilter}
                onValueChange={(value) => {
                  setActivityStatusFilter(value as ActivityStatus | "all");
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger
                  id="activity-status-filter"
                  className="py-2 text-sm"
                >
                  <ListChecks className="mr-1.5 h-4 w-4" />
                  <SelectValue placeholder="Estado Calificación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Estados</SelectItem>
                  <SelectItem value={ActivityStatus.PENDING_REVIEW}>
                    Por Calificar
                  </SelectItem>
                  <SelectItem value={ActivityStatus.REVIEWED}>
                    Calificadas
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Integrar funcionalidad para refrescar datos y Actualizar Tabla */}
            <Button
              type="button"
              onClick={handleRefresh}
              className="flex w-full items-center justify-center gap-2 bg-indigo-600 py-2 text-sm text-white hover:bg-indigo-700 lg:w-auto"
            >
              Actualizar Tabla
            </Button>
          </form>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
            </div>
          ) : error ? (
            <div className="rounded-md bg-red-50 p-4 py-10 text-center text-red-600">
              <AlertTriangle className="mx-auto mb-2 h-10 w-10" />
              <p>{error}</p>
              <Button
                onClick={() =>
                  fetchAdminActivities(
                    currentPage,
                    searchTerm,
                    userTypeFilter,
                    activityStatusFilter,
                  )
                }
                variant="outline"
                className="mt-4 border-red-600 text-red-600 hover:bg-red-100"
              >
                Reintentar
              </Button>
            </div>
          ) : activities.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">Avatar</TableHead>
                      <TableHead className="text-center">Nombre</TableHead>
                      <TableHead className="text-center">Matricula</TableHead>
                      <TableHead className="text-center">
                        Tipo Usuario
                      </TableHead>
                      <TableHead className="text-center">Actividad</TableHead>
                      <TableHead className="text-center">Tipo</TableHead>
                      <TableHead className="text-center">Estado</TableHead>
                      <TableHead className="text-center">EcoPoints</TableHead>
                      <TableHead className="text-center">Fecha Reg.</TableHead>
                      <TableHead className="text-center">Acciones</TableHead>
                      <TableHead className="text-center">Evidencias</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activities.map((activity) => (
                      <TableRow
                        key={activity.id}
                        className={`hover:bg-gray-50 ${activity.status === ActivityStatus.PENDING_REVIEW ? "bg-amber-50" : ""}`}
                      >
                        <TableCell>
                          <Avatar className="h-16 w-16">
                            <AvatarImage
                              src={activity.user.profile?.avatarPublicUrl || ""}
                              alt={activity.user.name}
                            />
                            <AvatarFallback className="bg-indigo-100 text-xs font-semibold text-indigo-700">
                              {getInitials(activity.user.name)}
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="text-center text-sm font-medium uppercase">
                          {activity.user.name}
                        </TableCell>
                        <TableCell className="text-center text-lg font-bold text-[#2e86c1]">
                          {activity.user.matricula}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              activity.user.userType === "STUDENT"
                                ? "secondary"
                                : activity.user.userType === "TEACHER"
                                  ? "outline"
                                  : activity.user.userType === "ADMIN"
                                    ? "outline" // Example: use outline for community
                                    : "default"
                            }
                            className={
                              activity.user.userType === "STUDENT"
                                ? "border-sky-300 bg-sky-100 text-sky-700"
                                : activity.user.userType === "TEACHER"
                                  ? "border-green-300 bg-green-100 text-green-700"
                                  : activity.user.userType === "ADMIN"
                                    ? "bg-red-950 text-white"
                                    : "border-gray-300 bg-gray-100 text-gray-700"
                            }
                          >
                            {USER_TYPE_MAP[activity.user.userType] ||
                              activity.user.userType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center text-sm">
                          {activity.title}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="whitespace-nowrap bg-sky-800 text-xs text-white">
                            {ACTIVITY_TYPE_MAP[activity.type] || activity.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {activity.status === ActivityStatus.PENDING_REVIEW ? (
                            <Badge
                              variant="destructive"
                              className="whitespace-nowrap bg-amber-500 text-xs hover:bg-amber-600"
                            >
                              <Clock className="mr-1 h-3 w-3" />
                              Por Calificar
                            </Badge>
                          ) : (
                            <Badge
                              variant="default"
                              className="whitespace-nowrap bg-green-600 text-xs hover:bg-green-700"
                            >
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Calificada
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center text-lg font-extrabold text-green-500">
                          {activity.points}
                        </TableCell>
                        <TableCell className="text-center text-xs text-muted-foreground">
                          {format(new Date(activity.createdAt), "dd MMM, yy", {
                            locale: es,
                          })}
                        </TableCell>
                        <TableCell className="space-x-0.5 text-center">
                          {/* Botón para Calificar/Recalificar */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-green-600"
                            title={
                              activity.status === ActivityStatus.PENDING_REVIEW
                                ? "Calificar Actividad"
                                : "Recalificar Actividad"
                            }
                            onClick={() => openQualifyModal(activity)}
                          >
                            <Award className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-blue-600"
                            title="Editar Detalles"
                            onClick={() => openEditModal(activity)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-red-600"
                            title="Eliminar Actividad"
                            onClick={() => openDeleteModal(activity)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-orange-500"
                            title="Enviar Notificación Manual"
                            onClick={() => openNotifyModal(activity)}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </TableCell>
                        <TableCell className="flex items-center justify-center text-center">
                          {activity.evidence && activity.evidence.length > 0 ? (
                            <EvidenceThumbnailsAdmin
                              evidence={activity.evidence}
                            />
                          ) : (
                            <p className="py-4 text-sm text-muted-foreground">
                              No hay evidencia adjunta para esta actividad.
                            </p>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {totalPages > 1 && (
                <Pagination className="mt-6">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(currentPage - 1);
                        }}
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>
                    {renderPaginationItems()}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(currentPage + 1);
                        }}
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          ) : (
            <div className="py-16 text-center">
              <ListChecks className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="text-xl font-semibold text-gray-700">
                No hay actividades para mostrar.
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Intenta ajustar los filtros o espera a que los usuarios
                registren actividades.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Calificación/Recalificación */}
      <Dialog open={isQualifyModalOpen} onOpenChange={setIsQualifyModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedActivity?.status === ActivityStatus.PENDING_REVIEW
                ? "Calificar"
                : "Recalificar"}{" "}
              Actividad: {selectedActivity?.title}
            </DialogTitle>
            <DialogDescription>
              Usuario: {selectedActivity?.user.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleQualifyActivity} className="space-y-6 py-2">
            <div>
              <Label className="text-base font-medium">
                Selecciona los Puntos a Otorgar:
              </Label>
              <RadioGroup
                value={qualificationData.points}
                onValueChange={(value) =>
                  setQualificationData({ points: value })
                }
                className="mt-2 grid grid-cols-3 gap-3"
              >
                {QUALIFICATION_POINTS.map((points) => (
                  <div key={points} className="flex items-center">
                    <RadioGroupItem
                      value={points}
                      id={`qualify-${points}`}
                      disabled={isSubmitting}
                    />
                    <Label
                      htmlFor={`qualify-${points}`}
                      className="ml-2 cursor-pointer text-sm"
                    >
                      {points} pts
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Cancelar
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {selectedActivity?.status === ActivityStatus.PENDING_REVIEW
                  ? "Otorgar Puntos"
                  : "Actualizar Puntos"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Edición */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>
              Editar Detalles de Actividad: {selectedActivity?.title}
            </DialogTitle>
            <DialogDescription>
              Usuario: {selectedActivity?.user.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateActivity} className="space-y-4 py-2">
            <div>
              <div className="my-1 flex flex-col items-center justify-center gap-2 sm:flex-row sm:justify-start">
                <BadgeInfo className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Si el <b>Título</b> es inadecuado, la actividad no es válidad
                  y debe ser eliminada.
                </span>
              </div>
              <Label htmlFor="edit-title" className="font-bold text-indigo-600">
                Título
              </Label>
              <Input
                id="edit-title"
                name="title"
                value={editFormData.title}
                onChange={handleEditFormChange}
                disabled
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Descripción</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={editFormData.description}
                onChange={handleEditFormChange}
                disabled={isSubmitting}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-type">Tipo</Label>
                <Select
                  name="type"
                  value={editFormData.type}
                  onValueChange={(value) =>
                    setEditFormData((prev) => ({ ...prev, type: value }))
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="edit-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ACTIVITY_TYPE_MAP).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-quantity">Cantidad</Label>
                <Input
                  id="edit-quantity"
                  name="quantity"
                  type="number"
                  value={editFormData.quantity}
                  onChange={handleEditFormChange}
                  disabled={isSubmitting}
                  min="1"
                  max="500"
                  step="0.01"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-unit">Unidad</Label>
                <Input
                  id="edit-unit"
                  name="unit"
                  value={editFormData.unit}
                  onChange={handleEditFormChange}
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="edit-date">Fecha</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start overflow-auto text-left font-normal",
                        !editFormData.date && "text-muted-foreground",
                      )}
                      disabled={isSubmitting}
                    >
                      <CalendarIconLucide className="mr-2 h-4 w-4" />
                      {editFormData.date ? (
                        formatDate(editFormData.date as any)
                      ) : (
                        <span>Selecciona fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={editFormData.date as any}
                      onSelect={handleEditDateChange as any}
                      initialFocus
                      disabled={(date: Date) =>
                        date > new Date() || isSubmitting
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <DialogFooter className="flex-col items-center justify-center gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Cancelar
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Guardar Cambios
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Eliminación */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar la actividad{" "}
              <span className="font-semibold">"{selectedActivity?.title}"</span>{" "}
              del usuario{" "}
              <span className="font-semibold">
                {selectedActivity?.user.name}
              </span>
              ?
              {selectedActivity &&
                selectedActivity.points > 0 &&
                ` Esta acción descontará ${selectedActivity?.points} puntos al usuario.`}{" "}
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteActivity}
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Eliminar Actividad
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Notificación Manual */}
      <Dialog open={isNotifyModalOpen} onOpenChange={setIsNotifyModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Enviar Notificación a {selectedActivity?.user.name}
            </DialogTitle>
            <DialogDescription>
              Redacta un mensaje para el usuario sobre su actividad o cualquier
              otro asunto.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSendNotification} className="space-y-4 py-2">
            <div>
              <Label htmlFor="notify-title">Título del Mensaje</Label>
              <Input
                id="notify-title"
                value={notificationTitle}
                onChange={(e) => setNotificationTitle(e.target.value)}
                placeholder="Ej: Revisión de actividad"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label htmlFor="notify-message">Mensaje</Label>
              <Textarea
                id="notify-message"
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
                placeholder="Escribe tu mensaje aquí..."
                rows={4}
                disabled={isSubmitting}
              />
            </div>
            <DialogFooter className="flex-col items-center justify-center gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Cancelar
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-green-500 hover:bg-green-600"
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Enviar Mensaje
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
