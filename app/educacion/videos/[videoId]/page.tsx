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
  Film,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button"; //
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; //
import { Badge } from "@/components/ui/badge"; //
import { VideoTopic, UserType } from "@prisma/client";
import { format } from "date-fns";
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
} from "@/components/ui/alert-dialog"; //
import { type ShortVideoItem } from "@/types/types"; //
import DashboardLayout from "@/app/components/DashboardLayout";
import { FloatingNavEducation } from "../../components/FloatingNavEducation";

// Hook para sesión de usuario (reutilizado)
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

// Helper para determinar el tipo de video y obtener la URL de incrustación
const getVideoEmbedDetails = (
  url: string,
): {
  type: "youtube" | "vimeo" | "direct" | "unknown";
  embedUrl?: string;
  originalUrl: string;
} => {
  if (url.match(/^(https?:)?(\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+/)) {
    const videoId = url.split("v=")[1]?.split("&")[0] || url.split("/").pop();
    return {
      type: "youtube",
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      originalUrl: url,
    };
  }
  if (url.match(/^(https?:)?(\/\/)?(www\.)?(vimeo\.com)\/.+/)) {
    const videoId = url.split("/").pop()?.split("?")[0];
    return {
      type: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${videoId}`,
      originalUrl: url,
    };
  }
  if (url.match(/\.(mp4|webm|ogg)(\?.*)?$/i)) {
    return { type: "direct", embedUrl: url, originalUrl: url };
  }
  return { type: "unknown", originalUrl: url };
};

export default function ShortVideoDetailPage() {
  const router = useRouter();
  const params = useParams();
  const videoId = params.videoId as string;
  const { session, isLoadingSession } = useUserSession();

  const [video, setVideo] = useState<ShortVideoItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchShortVideo = useCallback(async () => {
    if (!videoId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/education/short-videos/${videoId}`);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Video no encontrado.");
      }
      const data: ShortVideoItem = await response.json();
      setVideo(data);
    } catch (err) {
      console.error("Error cargando video:", err);
      setError(err instanceof Error ? err.message : "Error.");
    } finally {
      setIsLoading(false);
    }
  }, [videoId]);

  useEffect(() => {
    if (!isLoadingSession) fetchShortVideo();
  }, [fetchShortVideo, isLoadingSession]);

  const handleRating = async (liked: boolean) => {
    // ... (lógica de handleRating sin cambios, como en la respuesta anterior)
    if (!video || !session?.id) {
      toast.error("Debes iniciar sesión para valorar.");
      return;
    }
    const originalRating = video.currentUserRating;
    const originalLikes = video.likes;
    const originalDislikes = video.dislikes;
    setVideo((prev) => {
      if (!prev) return null;
      let nL = prev.likes,
        nD = prev.dislikes,
        nCR: boolean | null = liked;
      if (prev.currentUserRating === liked) {
        nCR = null;
        if (liked) nL--;
        else nD--;
      } else {
        if (prev.currentUserRating === true) nL--;
        else if (prev.currentUserRating === false) nD--;
        if (liked) nL++;
        else nD++;
      }
      return { ...prev, likes: nL, dislikes: nD, currentUserRating: nCR };
    });
    try {
      const response = await fetch(
        `/api/education/short-videos/${video.id}/rate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ liked }),
        },
      );
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error);
      }
      const result = await response.json();
      setVideo((prev) =>
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
      toast.error(err instanceof Error ? err.message : "No se pudo valorar.");
      setVideo((prev) =>
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
    // ... (lógica de handleDelete sin cambios, como en la respuesta anterior)
    if (!video || !session) return;
    if (
      video.userId !== session.id ||
      (session.userType !== UserType.TEACHER &&
        session.userType !== UserType.ADMIN)
    ) {
      toast.error("No tienes permiso para eliminar este video.");
      return;
    }
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/education/short-videos/${video.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error);
      }
      toast.success("Video eliminado.");
      router.push("/educacion?tab=videos");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo eliminar.");
    } finally {
      setIsDeleting(false);
    }
  };

  const topicDisplayName = (topic: VideoTopic | undefined) =>
    topic
      ? topic.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
      : "Desconocido";

  const renderVideoPlayer = () => {
    if (!video)
      return (
        <div className="flex aspect-video items-center justify-center bg-gray-200">
          <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
        </div>
      );

    const videoSourceUrl = video.externalVideoUrl || video.videoUrl; // Prioriza URL externa si existe

    if (!videoSourceUrl) {
      return (
        <div className="flex aspect-video flex-col items-center justify-center bg-gray-100 text-gray-500">
          <Film className="mb-2 h-16 w-16" />
          Video no disponible.
        </div>
      );
    }

    const videoDetails = getVideoEmbedDetails(videoSourceUrl);

    if (videoDetails.type === "youtube" || videoDetails.type === "vimeo") {
      return (
        <iframe
          src={videoDetails.embedUrl}
          title={video.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="aspect-video h-full w-full"
        ></iframe>
      );
    } else if (videoDetails.type === "direct") {
      return (
        <video
          src={videoDetails.embedUrl}
          controls
          poster={video.thumbnailUrl || undefined}
          className="aspect-video h-full w-full bg-black"
        >
          Tu navegador no soporta la etiqueta de video.
          <a
            href={videoDetails.embedUrl}
            download
            className="text-blue-400 hover:underline"
          >
            Descarga el video
          </a>
          .
        </video>
      );
    } else {
      // type === 'unknown'
      return (
        <div className="flex aspect-video flex-col items-center justify-center bg-gray-100 p-4 text-gray-500">
          <AlertTriangle className="mb-3 h-12 w-12 text-yellow-500" />
          <p className="mb-2 text-center">
            No se puede reproducir este video directamente.
          </p>
          <Button asChild variant="outline" size="sm">
            <a
              href={videoDetails.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-2 h-4 w-4" /> Ver en fuente original
            </a>
          </Button>
        </div>
      );
    }
  };

  if (isLoading || isLoadingSession)
    return (
      <DashboardLayout>
        <div className="flex h-[calc(100vh-150px)] items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  if (error)
    return (
      <DashboardLayout>
        <div className="container p-8 text-center">
          <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <h1 className="text-2xl font-semibold text-red-700">Error</h1>
          <p className="mt-2">{error}</p>
          <Button onClick={fetchShortVideo} className="mt-6 bg-red-600">
            Reintentar
          </Button>
        </div>
      </DashboardLayout>
    );
  if (!video)
    return (
      <DashboardLayout>
        <div className="container p-8 text-center">Video no encontrado.</div>
      </DashboardLayout>
    );

  const canEditOrDelete =
    session &&
    video.userId === session.id &&
    (session.userType === UserType.TEACHER ||
      session.userType === UserType.ADMIN);

  return (
    <DashboardLayout>
      <FloatingNavEducation />
      <div className="container mx-auto mt-10 max-w-4xl px-2 py-8 sm:px-4 lg:mt-0">
        <div className="mb-6 mt-10 md:mt-2">
          <Link
            href="/educacion/videos"
            className="flex items-center text-sm text-blue-600 hover:underline"
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Volver a Videos
          </Link>
        </div>
        <Card className="overflow-hidden shadow-lg">
          <div className="relative aspect-video w-full bg-black">
            {renderVideoPlayer()}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Loader2 className="h-10 w-10 animate-spin text-white" />
              </div>
            )}
          </div>
          <CardHeader className="p-6">
            <Badge
              variant="outline"
              className="mb-2 self-start border-blue-300 bg-blue-50 text-xs text-blue-700"
            >
              <Tag className="mr-1 h-3 w-3" /> {topicDisplayName(video.topic)}
            </Badge>
            <CardTitle className="break-words text-3xl font-bold text-gray-800 md:text-4xl">
              {video.title}
            </CardTitle>
            <div className="mt-2 space-y-1 text-xs text-gray-500 md:flex md:items-center md:gap-4">
              <div className="flex items-center gap-1.5">
                <UserCircle className="h-4 w-4" />
                <span>
                  Por: {video.authorName} ({video.authorInstitution})
                </span>
              </div>
              <span className="hidden md:inline">•</span>
              <div className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                <span>
                  Publicado:{" "}
                  {format(new Date(video.createdAt), "dd MMMM, yyyy", {
                    locale: es,
                  })}
                </span>
              </div>
            </div>
            <div className="mt-3 w-full rounded-md border bg-gray-50 p-3">
              {video.authorInfo && (
                <p className="overflow-auto text-balance text-xs italic text-gray-500">
                  {video.authorInfo}
                </p>
              )}
            </div>
          </CardHeader>
          {video.description && (
            <CardContent className="prose prose-sm sm:prose-base max-w-none whitespace-pre-line break-words px-6 pb-4 pt-0 text-gray-700">
              {video.description}
            </CardContent>
          )}
          <CardFooter className="flex flex-col items-center justify-between gap-4 border-t px-6 py-4 sm:flex-row">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className={`h-auto px-2.5 py-1.5 text-sm ${video.currentUserRating === true ? "bg-blue-100 text-blue-600 hover:bg-blue-200" : "text-muted-foreground hover:bg-blue-50 hover:text-blue-700"}`}
                onClick={() => handleRating(true)}
                disabled={!session?.id || isDeleting}
              >
                <ThumbsUp className="mr-1.5 h-4 w-4" /> {video.likes}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-auto px-2.5 py-1.5 text-sm ${video.currentUserRating === false ? "bg-red-100 text-red-600 hover:bg-red-200" : "text-muted-foreground hover:bg-red-50 hover:text-red-700"}`}
                onClick={() => handleRating(false)}
                disabled={!session?.id || isDeleting}
              >
                <ThumbsDown className="mr-1.5 h-4 w-4" /> {video.dislikes}
              </Button>
            </div>
            {canEditOrDelete && (
              <div className="flex gap-2">
                <Link href={`/educacion/videos/editar/${video.id}`}>
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
                      <AlertDialogTitle>¿Seguro?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción eliminará el video permanentemente.
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
                        )}
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </CardFooter>
        </Card>
        <div className="mt-8 text-center">
          <Button asChild variant="link" className="text-blue-600">
            <Link href="/educacion">
              <Home className="mr-2 h-4 w-4" />
              Volver a la página principal
            </Link>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
