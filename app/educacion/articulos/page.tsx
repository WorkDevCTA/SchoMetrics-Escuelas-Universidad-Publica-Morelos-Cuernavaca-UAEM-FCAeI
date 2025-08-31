"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  BookText,
  Search,
  Filter,
  PlusCircle,
  ThumbsUp,
  ThumbsDown,
  Edit,
  Trash2,
  Loader2,
  AlertTriangle,
  UserCircle,
  Eye,
} from "lucide-react";
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { ArticleTopic, UserType } from "@prisma/client";
import { formatDistanceToNowStrict } from "date-fns";
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
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/app/components/DashboardLayout";
import { FloatingNavEducation } from "../components/FloatingNavEducation";
import LoaderCircle from "@/app/components/LoaderCircle";

// Tipos para los artículos y la paginación
interface EducationalArticleItem {
  id: string;
  title: string;
  content: string; // Podría ser un extracto
  topic: ArticleTopic;
  authorName: string;
  authorInstitution: string;
  coverImageUrl?: string | null;
  userId: string; // Para verificar permisos de edición/eliminación
  user: {
    id: string;
    name: string;
    userType: UserType;
  };
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  likes: number;
  dislikes: number;
  currentUserRating: boolean | null; // true para like, false para dislike, null si no ha votado
}

interface ArticlesApiResponse {
  articles: EducationalArticleItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const ITEMS_PER_PAGE = 9; // Artículos por página

export default function ArticlesPage() {
  const router = useRouter();
  const { session, isLoadingSession } = useUserSession(); // Usando el hook de sesión
  const [articles, setArticles] = useState<EducationalArticleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [topicFilter, setTopicFilter] = useState<ArticleTopic | "ALL">("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [articleToDelete, setArticleToDelete] =
    useState<EducationalArticleItem | null>(null);

  const fetchArticles = useCallback(
    async (page = 1, search = searchTerm, topic = topicFilter) => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: ITEMS_PER_PAGE.toString(),
        });
        if (search) params.append("search", search);
        if (topic !== "ALL") params.append("topic", topic);

        const response = await fetch(
          `/api/education/articles?${params.toString()}`,
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Error al obtener los artículos educativos",
          );
        }
        const data: ArticlesApiResponse = await response.json();
        setArticles(data.articles);
        setCurrentPage(data.pagination.page);
        setTotalPages(data.pagination.totalPages);
      } catch (err) {
        console.error("Error al cargar artículos:", err);
        setError(
          err instanceof Error ? err.message : "Ocurrió un error desconocido.",
        );
        setArticles([]);
      } finally {
        setIsLoading(false);
      }
    },
    [searchTerm, topicFilter],
  ); // Dependencias actualizadas

  useEffect(() => {
    if (!isLoadingSession) {
      // Solo cargar artículos después de verificar la sesión
      fetchArticles(1);
    }
  }, [fetchArticles, isLoadingSession]);

  const handleSearchSubmit = (event?: React.FormEvent<HTMLFormElement>) => {
    if (event) event.preventDefault();
    setCurrentPage(1);
    fetchArticles(1, searchTerm, topicFilter);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchArticles(page, searchTerm, topicFilter);
    }
  };

  const handleRating = async (articleId: string, liked: boolean) => {
    if (!session?.id) {
      toast.error("Debes iniciar sesión para valorar.");
      return;
    }

    // Optimistic update
    const originalArticles = [...articles];
    setArticles((prevArticles) =>
      prevArticles.map((article) => {
        if (article.id === articleId) {
          let newLikes = article.likes;
          let newDislikes = article.dislikes;
          let newCurrentUserRating: boolean | null = liked;

          if (article.currentUserRating === liked) {
            // Toggle off
            newCurrentUserRating = null;
            if (liked) newLikes--;
            else newDislikes--;
          } else {
            // New vote or changed vote
            if (article.currentUserRating === true)
              newLikes--; // Votó like antes
            else if (article.currentUserRating === false) newDislikes--; // Votó dislike antes

            if (liked) newLikes++;
            else newDislikes++;
          }
          return {
            ...article,
            likes: newLikes,
            dislikes: newDislikes,
            currentUserRating: newCurrentUserRating,
          };
        }
        return article;
      }),
    );

    try {
      const response = await fetch(
        `/api/education/articles/${articleId}/rate`,
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
      // Actualizar con datos del servidor para asegurar consistencia (opcional si el optimistic update es fiable)
      setArticles((prevArticles) =>
        prevArticles.map((article) =>
          article.id === articleId
            ? {
                ...article,
                likes: result.likes,
                dislikes: result.dislikes,
                currentUserRating: result.newRatingStatus,
              }
            : article,
        ),
      );
      // toast.success(result.message); // Opcional: puede ser mucho feedback
    } catch (err) {
      console.error("Error valorando artículo:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "No se pudo registrar tu valoración.",
      );
      setArticles(originalArticles); // Revertir en caso de error
    }
  };

  const handleDeleteArticle = async () => {
    if (!articleToDelete || !session) return;

    if (
      articleToDelete.userId !== session.id ||
      (session.userType !== UserType.TEACHER &&
        session.userType !== UserType.ADMIN)
    ) {
      toast.error("No tienes permiso para eliminar este artículo.");
      setArticleToDelete(null);
      return;
    }

    setIsLoading(true); // Podrías usar un `isDeleting` específico
    try {
      const response = await fetch(
        `/api/education/articles/${articleToDelete.id}`,
        {
          method: "DELETE",
        },
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al eliminar el artículo.");
      }
      toast.success("Artículo eliminado correctamente.");
      setArticleToDelete(null);
      fetchArticles(currentPage); // Recargar artículos
      router.refresh();
    } catch (err) {
      console.error("Error eliminando artículo:", err);
      toast.error(
        err instanceof Error ? err.message : "No se pudo eliminar el artículo.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const articleTopicsArray = Object.values(ArticleTopic);

  const renderPaginationItems = () => {
    const items = [];
    const maxPagesToShow = 3;
    const halfPagesToShow = Math.floor(maxPagesToShow / 2);

    if (totalPages <= maxPagesToShow + 2) {
      // Mostrar todos los números si son pocos
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={`edu-page-${i}`}>
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
        <PaginationItem key="edu-page-1">
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
        items.push(
          <PaginationEllipsis
            key="edu-start-ellipsis"
            onClick={() =>
              handlePageChange(Math.max(1, currentPage - maxPagesToShow))
            }
          />,
        );
      }

      let startPage = Math.max(2, currentPage - halfPagesToShow);
      let endPage = Math.min(totalPages - 1, currentPage + halfPagesToShow);

      if (currentPage <= halfPagesToShow + 1) {
        endPage = Math.min(totalPages - 1, maxPagesToShow);
      }
      if (currentPage >= totalPages - halfPagesToShow) {
        startPage = Math.max(2, totalPages - maxPagesToShow + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        items.push(
          <PaginationItem key={`edu-page-${i}`}>
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

      if (currentPage < totalPages - (halfPagesToShow + 1)) {
        items.push(
          <PaginationEllipsis
            key="edu-end-ellipsis"
            onClick={() =>
              handlePageChange(
                Math.min(totalPages, currentPage + maxPagesToShow),
              )
            }
          />,
        );
      }

      items.push(
        <PaginationItem key={`edu-page-${totalPages}`}>
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

  return (
    <DashboardLayout>
      <FloatingNavEducation />
      <div className="m-5 flex flex-col gap-8">
        <div className="mt-16 flex flex-col gap-3 rounded-xl bg-gradient-to-br from-green-600 to-teal-600 p-8 text-white shadow-2xl lg:mt-0">
          <h1 className="flex flex-col items-center gap-3 text-center text-4xl font-bold tracking-tight md:flex-row">
            <BookText className="h-10 w-10 animate-bounce" />
            Artículos y Guías Ambientales
          </h1>
          <p className="text-center text-lg opacity-90 md:text-start">
            Aprende, comparte y explora artículos y guías para un futuro más
            sostenible
          </p>
        </div>
        {/* Filtros y botón de crear */}
        <Card className="shadow-md">
          <CardContent className="p-4">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <form
                onSubmit={handleSearchSubmit}
                className="flex w-full flex-grow flex-col gap-3 sm:flex-row md:w-auto"
              >
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="search-education"
                    type="search"
                    placeholder="Buscar artículos..."
                    className="w-full py-2 pl-10 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select
                  value={topicFilter}
                  onValueChange={(value) => {
                    setTopicFilter(value as ArticleTopic | "ALL");
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-full py-2 text-sm sm:w-auto">
                    <Filter className="mr-1.5 h-4 w-4" />
                    <SelectValue placeholder="Todos los temas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos los Temas</SelectItem>
                    {articleTopicsArray.map((topic) => (
                      <SelectItem key={topic} value={topic}>
                        {topic.replace(/_/g, " ").charAt(0).toUpperCase() +
                          topic.replace(/_/g, " ").slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="submit"
                  className="w-full bg-green-600 py-2 text-sm text-white hover:bg-green-700 sm:w-auto"
                >
                  Buscar
                </Button>
              </form>
              {(session?.userType === UserType.TEACHER ||
                session?.userType === UserType.ADMIN) && (
                <Link href="/educacion/articulos/nuevo">
                  <Button className="mt-3 w-full bg-teal-600 text-white hover:bg-teal-700 md:mt-0 md:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" /> Crear Artículo
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Listado de Artículos */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoaderCircle />
          </div>
        ) : error ? (
          <Card className="border-red-200 bg-red-50 py-10 text-center text-red-700">
            <AlertTriangle className="mx-auto mb-4 h-12 w-12" />
            <p className="text-xl font-semibold">Ocurrió un Error</p>
            <p>{error}</p>
            <Button
              onClick={() => fetchArticles(1, searchTerm, topicFilter)}
              variant="destructive"
              className="mt-4"
            >
              Reintentar
            </Button>
          </Card>
        ) : articles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {articles.map((article) => (
                <Card
                  key={article.id}
                  className="flex flex-col overflow-hidden rounded-lg shadow-lg transition-shadow duration-300 hover:shadow-xl"
                >
                  <Link href={`/educacion/articulos/${article.id}`}>
                    <CardHeader className="p-0">
                      <div className="relative h-48 w-full bg-gray-200">
                        {article.coverImageUrl ? (
                          <Image
                            src={article.coverImageUrl}
                            alt={article.title}
                            layout="fill"
                            objectFit="cover"
                            className="transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-green-100 to-teal-100">
                            <BookText className="h-16 w-16 text-green-400 opacity-70" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/10"></div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-grow flex-col p-4">
                      <Badge
                        variant="outline"
                        className="mb-2 self-start border-green-300 bg-green-50 text-xs text-green-700"
                      >
                        {article.topic
                          .replace(/_/g, " ")
                          .charAt(0)
                          .toUpperCase() +
                          article.topic
                            .replace(/_/g, " ")
                            .slice(1)
                            .toLowerCase()}
                      </Badge>
                      <CardTitle
                        className="mb-1 line-clamp-2 text-nowrap text-lg font-semibold text-gray-800 transition-colors group-hover:text-green-600"
                        title={article.title}
                      >
                        {article.title}
                      </CardTitle>
                      <CardDescription className="mb-2 line-clamp-3 flex-grow text-xs text-gray-500">
                        {/* Podríamos mostrar un extracto del contenido aquí */}
                        {article.content.substring(0, 100)}...
                      </CardDescription>
                      <div className="mt-auto text-xs text-gray-500">
                        <p className="flex items-center gap-1">
                          <UserCircle className="h-3.5 w-3.5" />{" "}
                          {article.authorName}
                        </p>
                        <p
                          className="truncate"
                          title={article.authorInstitution}
                        >
                          {article.authorInstitution}
                        </p>
                        <p>
                          {formatDistanceToNowStrict(
                            new Date(article.createdAt),
                            { locale: es, addSuffix: true },
                          )}
                        </p>
                      </div>
                    </CardContent>
                  </Link>
                  <CardFooter className="flex h-[50px] items-center justify-between border-t bg-gray-50 p-3">
                    <div className="flex w-full items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-auto px-2 py-1 text-xs ${article.currentUserRating === true ? "bg-green-100 text-green-600" : "text-muted-foreground hover:bg-green-50"}`}
                        onClick={() => handleRating(article.id, true)}
                        disabled={!session?.id}
                      >
                        <ThumbsUp className="mr-1 h-3.5 w-3.5" />{" "}
                        {article.likes}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-auto px-2 py-1 text-xs ${article.currentUserRating === false ? "bg-red-100 text-red-600" : "text-muted-foreground hover:bg-red-50"}`}
                        onClick={() => handleRating(article.id, false)}
                        disabled={!session?.id}
                      >
                        <ThumbsDown className="mr-1 h-3.5 w-3.5" />{" "}
                        {article.dislikes}
                      </Button>
                    </div>

                    {session &&
                      session.id === article.userId &&
                      (session.userType === UserType.TEACHER ||
                        session.userType === UserType.ADMIN) && (
                        <div className="flex gap-1">
                          <Link
                            href={`/educacion/articulos/editar/${article.id}`}
                          >
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7 border-gray-300 hover:border-blue-500 hover:text-blue-600"
                              title="Editar"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 border-gray-300 hover:border-red-500 hover:text-red-600"
                                title="Eliminar"
                                onClick={() => setArticleToDelete(article)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                          </AlertDialog>
                        </div>
                      )}
                  </CardFooter>
                  <div className="flex h-[40px] w-full items-center justify-center bg-gray-50">
                    <Link href={`/educacion/articulos/${article.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-auto border-lime-400 px-2 py-1 text-xs hover:border-lime-500 hover:text-lime-800"
                      >
                        <Eye className="mr-1 h-3.5 w-3.5" /> Ver Artículo
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
            {totalPages > 1 && (
              <Pagination className="mt-10">
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
          <div className="py-20 text-center">
            <BookText className="mx-auto mb-6 h-16 w-16 text-gray-400" />
            <h3 className="text-2xl font-semibold text-gray-700">
              No hay artículos educativos todavía.
            </h3>
            <p className="text-md mt-3 text-gray-500">
              {session?.userType === UserType.TEACHER ||
              session?.userType === UserType.ADMIN
                ? "¡Sé el primero en compartir tu conocimiento!"
                : "Vuelve más tarde para encontrar contenido útil."}
            </p>
            {(session?.userType === UserType.TEACHER ||
              session?.userType === UserType.ADMIN) && (
              <Button asChild className="mt-6 bg-teal-600 hover:bg-teal-700">
                <Link href="/educacion/articulos/nuevo">
                  <PlusCircle className="mr-2 h-4 w-4" /> Crear Nuevo Artículo
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
      <AlertDialog
        open={!!articleToDelete}
        onOpenChange={(open) => !open && setArticleToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar el artículo "
              {articleToDelete?.title}"? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setArticleToDelete(null)}
              disabled={isLoading}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteArticle}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
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
