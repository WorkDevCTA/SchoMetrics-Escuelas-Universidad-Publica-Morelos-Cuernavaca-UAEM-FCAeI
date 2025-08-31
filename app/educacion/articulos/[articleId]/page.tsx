"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpenText,
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
import { ArticleTopic, UserType } from "@prisma/client";
import { format, formatDistanceToNowStrict } from "date-fns";
import { es } from "date-fns/locale";
import Image from "next/legacy/image";
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
import DashboardLayout from "@/app/components/DashboardLayout";
import { FloatingNavEducation } from "../../components/FloatingNavEducation";
import LoaderCircle from "@/app/components/LoaderCircle";

interface ArticleDetailType {
  id: string;
  title: string;
  content: string;
  topic: ArticleTopic;
  authorName: string;
  authorInstitution: string;
  authorInfo?: string | null;
  coverImageUrl?: string | null;
  userId: string;
  user: {
    id: string;
    name: string;
    userType: UserType;
  };
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  likes: number;
  dislikes: number;
  currentUserRating: boolean | null; // true for like, false for dislike, null if not rated
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

export default function EducationalArticlePage() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.articleId as string;
  const { session, isLoadingSession } = useUserSession();

  const [article, setArticle] = useState<ArticleDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchArticle = useCallback(async () => {
    if (!articleId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/education/articles/${articleId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Artículo no encontrado o error al cargar.",
        );
      }
      const data: ArticleDetailType = await response.json();
      setArticle(data);
    } catch (err) {
      console.error("Error cargando artículo:", err);
      setError(
        err instanceof Error ? err.message : "Ocurrió un error desconocido.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  const handleRating = async (liked: boolean) => {
    if (!article || !session?.id) {
      toast.error("Debes iniciar sesión para valorar.");
      return;
    }

    // Optimistic update
    const originalRating = article.currentUserRating;
    const originalLikes = article.likes;
    const originalDislikes = article.dislikes;

    setArticle((prev) => {
      if (!prev) return null;
      let newLikes = prev.likes;
      let newDislikes = prev.dislikes;
      let newCurrentUserRating: boolean | null = liked;

      if (prev.currentUserRating === liked) {
        // Toggle off
        newCurrentUserRating = null;
        if (liked) newLikes--;
        else newDislikes--;
      } else {
        // New vote or changed vote
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
        `/api/education/articles/${article.id}/rate`,
        {
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
      // Actualizar con datos del servidor para asegurar consistencia
      setArticle((prev) =>
        prev
          ? {
              ...prev,
              likes: result.likes,
              dislikes: result.dislikes,
              currentUserRating: result.newRatingStatus,
            }
          : null,
      );
      // toast.success(result.message);
    } catch (err) {
      console.error("Error valorando artículo:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "No se pudo registrar tu valoración.",
      );
      // Revertir en caso de error
      setArticle((prev) =>
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
    if (!article || !session) return;
    if (
      article.userId !== session.id ||
      (session.userType !== UserType.TEACHER &&
        session.userType !== UserType.ADMIN)
    ) {
      toast.error("No tienes permiso para eliminar este artículo.");
      return;
    }
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/education/articles/${article.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al eliminar el artículo.");
      }
      toast.success("Artículo eliminado correctamente.");
      router.push("/educacion");
      router.refresh();
    } catch (err) {
      console.error("Error eliminando artículo:", err);
      toast.error(
        err instanceof Error ? err.message : "No se pudo eliminar el artículo.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const topicDisplayName = (topic: ArticleTopic | undefined) => {
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
          <LoaderCircle />
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
            Error al Cargar el Artículo
          </h1>
          <p className="mt-2 text-muted-foreground">{error}</p>
          <Button
            onClick={fetchArticle}
            className="mt-6 bg-red-600 hover:bg-red-700"
          >
            Reintentar
          </Button>
          <Button asChild variant="outline" className="ml-2 mt-6">
            <Link href="/educacion">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Educación
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  if (!article) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <p>Artículo no encontrado.</p>
        </div>
      </DashboardLayout>
    );
  }

  const canEditOrDelete =
    session &&
    article.userId === session.id &&
    (session.userType === UserType.TEACHER ||
      session.userType === UserType.ADMIN);

  return (
    <DashboardLayout>
      <FloatingNavEducation />
      <div className="container mx-auto mt-10 max-w-4xl select-none px-2 py-8 sm:px-4 lg:mt-0">
        <div className="mb-6 mt-10 md:mt-2">
          <Link
            href="/educacion/articulos/"
            className="flex items-center text-sm text-green-600 hover:underline"
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Volver a todos los artículos
          </Link>
        </div>

        <Card className="overflow-hidden shadow-lg">
          {article.coverImageUrl ? (
            <div className="relative h-64 w-full md:h-80">
              <Image
                src={article.coverImageUrl}
                alt={article.title}
                layout="fill"
                objectFit="cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          ) : (
            <div className="flex h-40 w-full items-center justify-center bg-gradient-to-br from-green-100 to-teal-100">
              <BookOpenText className="h-20 w-20 text-green-400 opacity-70" />
            </div>
          )}

          <CardHeader className="p-6">
            <Badge
              variant="outline"
              className="mb-2 self-start border-green-300 bg-green-50 text-xs text-green-700"
            >
              <Tag className="mr-1 h-3 w-3" /> {topicDisplayName(article.topic)}
            </Badge>
            <CardTitle className="break-words text-3xl font-bold text-gray-800 md:text-4xl">
              {article.title}
            </CardTitle>
            <div className="mt-2 space-y-1 text-xs text-gray-500 md:flex md:items-center md:gap-4">
              <div className="flex items-center gap-1.5">
                <UserCircle className="h-4 w-4" />
                <span>
                  Por: {article.authorName} ({article.authorInstitution})
                </span>
              </div>
              <span className="hidden md:inline">•</span>
              <div className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                <span>
                  Publicado:{" "}
                  {format(new Date(article.createdAt), "dd MMMM, yyyy", {
                    locale: es,
                  })}
                </span>
                {article.createdAt !== article.updatedAt && (
                  <span className="text-gray-400">
                    (Actualizado:{" "}
                    {formatDistanceToNowStrict(new Date(article.updatedAt), {
                      locale: es,
                      addSuffix: true,
                    })}
                    )
                  </span>
                )}
              </div>
            </div>
            {article.authorInfo && (
              <p className="mt-2 overflow-auto rounded-md border bg-gray-50 p-2 text-xs italic text-gray-500">
                {article.authorInfo}
              </p>
            )}
          </CardHeader>

          <CardContent className="prose prose-sm sm:prose-base lg:prose-lg max-w-none whitespace-pre-line break-words px-6 py-4 text-gray-700">
            {article.content}
          </CardContent>

          <CardFooter className="flex flex-col items-center justify-between gap-4 border-t px-6 py-4 sm:flex-row">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className={`h-auto px-2.5 py-1.5 text-sm ${article.currentUserRating === true ? "bg-green-100 text-green-600 hover:bg-green-200" : "text-muted-foreground hover:bg-green-50 hover:text-green-700"}`}
                onClick={() => handleRating(true)}
                disabled={!session?.id || isDeleting}
              >
                <ThumbsUp className="mr-1.5 h-4 w-4" /> {article.likes}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-auto px-2.5 py-1.5 text-sm ${article.currentUserRating === false ? "bg-red-100 text-red-600 hover:bg-red-200" : "text-muted-foreground hover:bg-red-50 hover:text-red-700"}`}
                onClick={() => handleRating(false)}
                disabled={!session?.id || isDeleting}
              >
                <ThumbsDown className="mr-1.5 h-4 w-4" /> {article.dislikes}
              </Button>
            </div>
            {canEditOrDelete && (
              <div className="flex gap-2">
                <Link href={`/educacion/articulos/editar/${article.id}`}>
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
                      <AlertDialogTitle>
                        ¿Estás absolutamente seguro?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Esto eliminará
                        permanentemente el artículo.
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
          <Button asChild variant="link" className="text-green-600">
            <Link href="/educacion">
              <Home className="mr-2 h-4 w-4" /> Volver a la página principal
            </Link>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
