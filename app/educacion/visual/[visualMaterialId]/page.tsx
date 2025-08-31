"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  UserCircle,
  CalendarDays,
  Tag,
  ThumbsUp,
  ThumbsDown,
  Edit,
  Trash2,
  Loader2,
  AlertTriangle,
  ArrowLeft,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VisualMaterialTopic, UserType } from "@prisma/client"; // Asumiendo que VisualMaterialTopic se genera en el cliente Prisma
import { format, formatDistanceToNowStrict } from "date-fns";
import { es } from "date-fns/locale";
import toast from "react-hot-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { type VisualMaterialItem } from "@/types/types"; // Importar tipos actualizados
import DashboardLayout from "@/app/components/DashboardLayout";
import { VisualContentImages } from "@/app/components/VisualContentImages";
import { FloatingNavEducation } from "../../components/FloatingNavEducation";
import { ProductLightboxViewer } from "@/app/components/ProductLightBoxViewer";

// Hook para sesión de usuario (reutilizado de /app/educacion/articulos/nuevo/page.tsx)
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
        const res = await fetch("/api/auth/session"); //
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

export default function VisualMaterialDetailPage() {
  const router = useRouter();
  const params = useParams();
  const visualMaterialId = params.visualMaterialId as string;
  const { session, isLoadingSession } = useUserSession();

  const [material, setMaterial] = useState<VisualMaterialItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Estado para el lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxInitialImageId, setLightboxInitialImageId] = useState<
    string | null
  >(null);
  const [lightboxImages, setLightboxImages] = useState<string | null>(null);
  const [lightboxProductName, setLightboxProductName] = useState<string | null>(
    null,
  );

  const fetchVisualMaterial = useCallback(async () => {
    if (!visualMaterialId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/education/visual-materials/${visualMaterialId}`,
      ); // API a crear
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Material visual no encontrado o error al cargar.",
        );
      }
      const data: VisualMaterialItem = await response.json();
      setMaterial(data);
    } catch (err) {
      console.error("Error cargando material visual:", err);
      setError(
        err instanceof Error ? err.message : "Ocurrió un error desconocido.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [visualMaterialId]);

  useEffect(() => {
    if (!isLoadingSession) {
      // Solo cargar después de obtener la sesión
      fetchVisualMaterial();
    }
  }, [fetchVisualMaterial, isLoadingSession]);

  const handleRating = async (liked: boolean) => {
    if (!material || !session?.id) {
      toast.error("Debes iniciar sesión para valorar.");
      return;
    }

    const originalRating = material.currentUserRating;
    const originalLikes = material.likes;
    const originalDislikes = material.dislikes;

    setMaterial((prev) => {
      if (!prev) return null;
      let newLikes = prev.likes;
      let newDislikes = prev.dislikes;
      let newCurrentUserRating: boolean | null = liked;

      if (prev.currentUserRating === liked) {
        newCurrentUserRating = null;
        if (liked) newLikes--;
        else newDislikes--;
      } else {
        if (prev.currentUserRating === true) newLikes--;
        else if (prev.currentUserRating === false) newDislikes--;
        if (liked) newLikes++;
        else newDislikes++;
      }
      return {
        ...prev,
        likes: newLikes,
        dislikes: newDislikes,
        currentUserRating: newCurrentUserRating,
      };
    });

    try {
      const response = await fetch(
        `/api/education/visual-materials/${material.id}/rate`,
        {
          // API a crear
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ liked }),
        },
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al registrar valoración");
      }
      const result = await response.json();
      setMaterial((prev) =>
        prev
          ? {
              ...prev,
              likes: result.likes,
              dislikes: result.dislikes,
              currentUserRating: result.newRatingStatus,
            }
          : null,
      );
    } catch (err) {
      console.error("Error valorando material:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "No se pudo registrar tu valoración.",
      );
      setMaterial((prev) =>
        prev
          ? {
              ...prev,
              currentUserRating: originalRating,
              likes: originalLikes,
              dislikes: originalDislikes,
            }
          : null,
      );
    }
  };

  const handleDelete = async () => {
    if (!material || !session) return;
    if (
      material.userId !== session.id ||
      (session.userType !== UserType.TEACHER &&
        session.userType !== UserType.ADMIN)
    ) {
      toast.error("No tienes permiso para eliminar este material.");
      return;
    }
    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/education/visual-materials/${material.id}`,
        { method: "DELETE" },
      ); // API a crear
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al eliminar el material.");
      }
      toast.success("Material visual eliminado correctamente.");
      router.push("/educacion?tab=visual");
      router.refresh();
    } catch (err) {
      console.error("Error eliminando material:", err);
      toast.error(
        err instanceof Error ? err.message : "No se pudo eliminar el material.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const openLightboxForMaterial = (initialImageId?: string) => {
    if (material && material.images.length > 0) {
      const imagesForLightbox = material.images.map((img) => ({
        id: img.id,
        url: img.url,
      }));
      setLightboxImages(imagesForLightbox as any);
      setLightboxInitialImageId(
        initialImageId || imagesForLightbox[0]?.id || null,
      );
      setLightboxProductName(material.title);
      setLightboxOpen(true);
    }
  };

  const topicDisplayName = (topic: VisualMaterialTopic | undefined) => {
    if (!topic) return "Desconocido";
    return (
      topic.replace(/_/g, " ").charAt(0).toUpperCase() +
      topic.replace(/_/g, " ").slice(1).toLowerCase()
    );
  };

  if (isLoading || isLoadingSession) {
    return (
      <DashboardLayout>
        <div className="flex h-[calc(100vh-150px)] items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
        </div>
      </DashboardLayout>
    );
  }
  if (error) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <h1 className="text-2xl font-semibold text-red-700">
            Error al Cargar
          </h1>
          <p className="mt-2 text-muted-foreground">{error}</p>
          <Button
            onClick={fetchVisualMaterial}
            className="mt-6 bg-red-600 hover:bg-red-700"
          >
            Reintentar
          </Button>
          <Button asChild variant="outline" className="ml-2 mt-6">
            <Link href="/educacion/visual/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Material Visual
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }
  if (!material) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <p>Material visual no encontrado.</p>
        </div>
      </DashboardLayout>
    );
  }

  const canEditOrDelete =
    session &&
    material.userId === session.id &&
    (session.userType === UserType.TEACHER ||
      session.userType === UserType.ADMIN);

  return (
    <DashboardLayout>
      <FloatingNavEducation />
      <div className="m-5 flex flex-col gap-8">
        <div className="mb-6 mt-16 md:mt-2">
          <Link
            href="/educacion/visual/"
            className="flex items-center text-sm text-purple-600 hover:underline"
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Volver a Material Visual
          </Link>
        </div>

        <Card className="overflow shadow-lg">
          <CardHeader className="p-6">
            <Badge
              variant="outline"
              className="mb-2 self-start border-purple-300 bg-purple-50 text-xs text-purple-700"
            >
              <Tag className="mr-1 h-3 w-3" />{" "}
              {topicDisplayName(material.topic)}
            </Badge>
            <CardTitle className="break-words text-3xl font-bold text-gray-800 md:text-4xl">
              {material.title}
            </CardTitle>
            <div className="mt-2 space-y-1 text-xs text-gray-500 md:flex md:items-center md:gap-4">
              <div className="flex items-center gap-1.5">
                <UserCircle className="h-4 w-4" />
                <span>
                  Por: {material.authorName} ({material.authorInstitution})
                </span>
              </div>
              <span className="hidden md:inline">•</span>
              <div className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                <span>
                  Publicado:{" "}
                  {format(new Date(material.createdAt), "dd MMMM, yyyy", {
                    locale: es,
                  })}
                </span>
                {material.createdAt !== material.updatedAt && (
                  <span className="text-gray-400">
                    (Actualizado:{" "}
                    {formatDistanceToNowStrict(new Date(material.updatedAt), {
                      locale: es,
                      addSuffix: true,
                    })}
                    )
                  </span>
                )}
              </div>
            </div>
            {material.authorInfo && (
              <p className="mt-3 overflow-auto rounded-md border bg-gray-50 p-3 text-xs italic text-gray-500">
                {material.authorInfo}
              </p>
            )}
          </CardHeader>

          <CardContent className="">
            {material.description && (
              <div className="prose prose-sm sm:prose-base mb-6 max-w-none whitespace-pre-line break-words text-gray-700">
                <h3 className="mb-1 text-lg font-semibold text-gray-800">
                  Descripción:
                </h3>
                {material.description}
              </div>
            )}

            <h3 className="mb-5 text-lg font-semibold text-gray-800">
              Imágenes:
            </h3>
            {material.images && material.images.length > 0 ? (
              <VisualContentImages visualContent={material.images} />
            ) : (
              <p className="text-sm text-gray-500">
                No hay imágenes adjuntas para este material.
              </p>
            )}
          </CardContent>

          <CardFooter className="flex flex-col items-center justify-between gap-4 border-t px-6 py-4 sm:flex-row">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className={`h-auto px-2.5 py-1.5 text-sm ${material.currentUserRating === true ? "bg-purple-100 text-purple-600 hover:bg-purple-200" : "text-muted-foreground hover:bg-purple-50 hover:text-purple-700"}`}
                onClick={() => handleRating(true)}
                disabled={!session?.id || isDeleting}
              >
                <ThumbsUp className="mr-1.5 h-4 w-4" /> {material.likes}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-auto px-2.5 py-1.5 text-sm ${material.currentUserRating === false ? "bg-red-100 text-red-600 hover:bg-red-200" : "text-muted-foreground hover:bg-red-50 hover:text-red-700"}`}
                onClick={() => handleRating(false)}
                disabled={!session?.id || isDeleting}
              >
                <ThumbsDown className="mr-1.5 h-4 w-4" /> {material.dislikes}
              </Button>
            </div>
            {canEditOrDelete && (
              <div className="flex gap-2">
                <Link href={`/educacion/visual/editar/${material.id}`}>
                  <Button variant="outline" size="sm" disabled={isDeleting}>
                    <Edit className="mr-1.5 h-4 w-4" /> Editar
                  </Button>
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={isDeleting}
                    >
                      <Trash2 className="mr-1.5 h-4 w-4" /> Eliminar
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Esto eliminará
                        permanentemente el material visual.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isDeleting}>
                        Cancelar
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {isDeleting && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}{" "}
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </CardFooter>
        </Card>

        <ProductLightboxViewer
          images={lightboxImages as any}
          isOpen={lightboxOpen}
          onOpenChange={setLightboxOpen}
          initialImageId={lightboxInitialImageId}
          productName={lightboxProductName as any}
        />

        <div className="mt-8 text-center">
          <Button asChild variant="link" className="text-purple-600">
            <Link href="/educacion">
              <Home className="mr-2 h-4 w-4" /> Volver a la página principal
            </Link>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
