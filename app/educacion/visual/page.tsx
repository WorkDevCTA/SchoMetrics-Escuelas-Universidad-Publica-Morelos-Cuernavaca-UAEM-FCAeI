"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  PlusCircle,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  AlertTriangle,
  UserCircle,
  BookOpenText,
  Tag,
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
import { VisualMaterialTopic, UserType } from "@prisma/client";
import { formatDistanceToNowStrict } from "date-fns";
import { es } from "date-fns/locale";
import Image from "next/legacy/image";
import toast from "react-hot-toast";
import {
  type VisualMaterialItem,
  type VisualMaterialsApiResponse,
} from "@/types/types";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/app/components/DashboardLayout";
import { FloatingNavEducation } from "../components/FloatingNavEducation";

const ITEMS_PER_PAGE = 9;

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

export default function VisualMaterialsPage() {
  const router = useRouter();
  const { session, isLoadingSession } = useUserSession();
  const [visualMaterials, setVisualMaterials] = useState<VisualMaterialItem[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [topicFilter, setTopicFilter] = useState<VisualMaterialTopic | "ALL">(
    "ALL",
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchVisualMaterials = useCallback(
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
          `/api/education/visual-materials?${params.toString()}`,
        ); // API creada en paso anterior
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Error al obtener los materiales visuales",
          );
        }
        const data: VisualMaterialsApiResponse = await response.json();
        setVisualMaterials(data.visualMaterials);
        setCurrentPage(data.pagination.page);
        setTotalPages(data.pagination.totalPages);
      } catch (err) {
        console.error("Error al cargar material visual:", err);
        setError(
          err instanceof Error ? err.message : "Ocurrió un error desconocido.",
        );
        setVisualMaterials([]);
      } finally {
        setIsLoading(false);
      }
    },
    [searchTerm, topicFilter],
  );

  useEffect(() => {
    if (!isLoadingSession) {
      fetchVisualMaterials(1);
    }
  }, [fetchVisualMaterials, isLoadingSession]);

  const handleSearchSubmit = (event?: React.FormEvent<HTMLFormElement>) => {
    if (event) event.preventDefault();
    setCurrentPage(1);
    fetchVisualMaterials(1, searchTerm, topicFilter);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchVisualMaterials(page, searchTerm, topicFilter);
    }
  };

  const handleRatingUpdateOnList = (
    materialId: string,
    newLikes: number,
    newDislikes: number,
    newCurrentUserRating: boolean | null,
  ) => {
    setVisualMaterials((prevMaterials) =>
      prevMaterials.map((material) =>
        material.id === materialId
          ? {
              ...material,
              likes: newLikes,
              dislikes: newDislikes,
              currentUserRating: newCurrentUserRating,
            }
          : material,
      ),
    );
  };

  const handleRating = async (materialId: string, liked: boolean) => {
    if (!session?.id) {
      toast.error("Debes iniciar sesión para valorar.");
      return;
    }
    const originalMaterial = visualMaterials.find((m) => m.id === materialId);
    if (!originalMaterial) return;

    // Optimistic update
    const originalRating = originalMaterial.currentUserRating;
    const originalLikes = originalMaterial.likes;
    const originalDislikes = originalMaterial.dislikes;

    handleRatingUpdateOnList(
      materialId,
      liked
        ? originalRating === true
          ? originalLikes - 1
          : originalLikes +
            (originalRating === false ? 1 : 0) +
            (originalRating === null ? 1 : 0)
        : originalLikes - (originalRating === true ? 1 : 0),
      !liked
        ? originalRating === false
          ? originalDislikes - 1
          : originalDislikes +
            (originalRating === true ? 1 : 0) +
            (originalRating === null ? 1 : 0)
        : originalDislikes - (originalRating === false ? 1 : 0),
      originalRating === liked ? null : liked,
    );

    try {
      const response = await fetch(
        `/api/education/visual-materials/${materialId}/rate`,
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
      handleRatingUpdateOnList(
        materialId,
        result.likes,
        result.dislikes,
        result.newRatingStatus,
      );
      // toast.success(result.message); // Opcional
    } catch (err) {
      console.error("Error valorando material:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "No se pudo registrar tu valoración.",
      );
      // Revert
      handleRatingUpdateOnList(
        materialId,
        originalLikes,
        originalDislikes,
        originalRating as any,
      );
    }
  };

  const visualMaterialTopicsArray = Object.values(VisualMaterialTopic);
  const topicDisplayName = (topic: VisualMaterialTopic | undefined) => {
    if (!topic) return "Desconocido";
    return (
      topic.replace(/_/g, " ").charAt(0).toUpperCase() +
      topic.replace(/_/g, " ").slice(1).toLowerCase()
    );
  };

  const renderPaginationItems = () => {
    // ... (Lógica de paginación como en app/educacion/page.tsx o app/admin/view-act/page.tsx)
    const items = [];
    const maxPagesToShow = 3;
    const halfPagesToShow = Math.floor(maxPagesToShow / 2);

    if (totalPages <= maxPagesToShow + 2) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={`vm-page-${i}`}>
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
        <PaginationItem key="vm-page-1">
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
            key="vm-start-ellipsis"
            onClick={() =>
              handlePageChange(Math.max(1, currentPage - maxPagesToShow))
            }
          />,
        );
      }
      let startPage = Math.max(2, currentPage - halfPagesToShow);
      let endPage = Math.min(totalPages - 1, currentPage + halfPagesToShow);
      if (currentPage <= halfPagesToShow + 1)
        endPage = Math.min(totalPages - 1, maxPagesToShow);
      if (currentPage >= totalPages - halfPagesToShow)
        startPage = Math.max(2, totalPages - maxPagesToShow + 1);

      for (let i = startPage; i <= endPage; i++) {
        items.push(
          <PaginationItem key={`vm-page-${i}`}>
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
            key="vm-end-ellipsis"
            onClick={() =>
              handlePageChange(
                Math.min(totalPages, currentPage + maxPagesToShow),
              )
            }
          />,
        );
      }
      items.push(
        <PaginationItem key={`vm-page-${totalPages}`}>
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

  // Este componente puede ser parte de app/education/page.tsx si se maneja con Tabs,
  // o ser el contenido principal si /app/education/visual/page.tsx es una ruta independiente.
  // Aquí lo desarrollo como si fuera una página independiente por claridad.
  // El Layout general se asume que es el DashboardLayout.
  // Si se integra en app/education/page.tsx, se quitaría el DashboardLayout de aquí.

  return (
    <DashboardLayout>
      <FloatingNavEducation />
      <div className="m-5 flex flex-col gap-8">
        <div className="mt-16 flex flex-col gap-3 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 p-8 text-white shadow-2xl lg:mt-0">
          <h1 className="flex flex-col items-center gap-3 text-center text-4xl font-bold tracking-tight md:flex-row">
            <BookOpenText className="h-10 w-10 animate-bounce" />
            Material Visual
          </h1>
          <p className="text-center text-lg opacity-90 md:text-start">
            Explora infografías, videos y más recursos visuales sobre
            sostenibilidad
          </p>
        </div>
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
                    id="search-visual-material"
                    type="search"
                    placeholder="Buscar material..."
                    className="w-full py-2 pl-10 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select
                  value={topicFilter}
                  onValueChange={(value) => {
                    setTopicFilter(value as VisualMaterialTopic | "ALL");
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-full py-2 text-sm sm:w-auto">
                    <Filter className="mr-1.5 h-4 w-4" />
                    <SelectValue placeholder="Todos los temas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos los Temas</SelectItem>
                    {visualMaterialTopicsArray.map((topic) => (
                      <SelectItem key={topic} value={topic}>
                        {topicDisplayName(topic)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="submit"
                  className="w-full bg-purple-600 py-2 text-sm text-white hover:bg-purple-700 sm:w-auto"
                >
                  Buscar
                </Button>
              </form>
              {(session?.userType === UserType.TEACHER ||
                session?.userType === UserType.ADMIN) && (
                <Link href="/educacion/visual/nuevo">
                  <Button className="mt-3 w-full bg-indigo-600 text-white hover:bg-indigo-700 md:mt-0 md:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" /> Crear Material
                    Visual
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {isLoading || isLoadingSession ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
          </div>
        ) : error ? (
          <Card className="border-red-200 bg-red-50 py-10 text-center text-red-700">
            <AlertTriangle className="mx-auto mb-4 h-12 w-12" />
            <p className="text-xl font-semibold">Ocurrió un Error</p>
            <p>{error}</p>
            <Button
              onClick={() => fetchVisualMaterials(1, searchTerm, topicFilter)}
              variant="destructive"
              className="mt-4"
            >
              Reintentar
            </Button>
          </Card>
        ) : visualMaterials.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {visualMaterials.map((material) => (
                <Card
                  key={material.id}
                  className="flex flex-col overflow-hidden rounded-lg shadow-lg transition-shadow duration-300 hover:shadow-xl"
                >
                  <Link href={`/educacion/visual/${material.id}`}>
                    <CardHeader className="p-0">
                      <div className="relative h-48 w-full bg-gray-200">
                        {material.images &&
                        material.images.length > 0 &&
                        material.images[0].url ? (
                          <Image
                            src={material.images[0].url}
                            alt={material.title}
                            layout="fill"
                            objectFit="cover"
                            className="transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-100 to-indigo-100">
                            <BookOpenText className="h-16 w-16 text-purple-400 opacity-70" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/10"></div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-grow flex-col p-4">
                      <Badge
                        variant="outline"
                        className="mb-2 self-start border-purple-300 bg-purple-50 text-xs text-purple-700"
                      >
                        <Tag className="mr-1 h-3 w-3" />{" "}
                        {topicDisplayName(material.topic)}
                      </Badge>
                      <CardTitle
                        className="mb-1 line-clamp-2 text-lg font-semibold text-gray-800 transition-colors group-hover:text-purple-600"
                        title={material.title}
                      >
                        {material.title}
                      </CardTitle>
                      <CardDescription className="mb-2 line-clamp-3 flex-grow text-xs text-gray-500">
                        {material.description || "Sin descripción adicional."}
                      </CardDescription>
                      <div className="mt-auto text-xs text-gray-500">
                        <p className="flex items-center gap-1">
                          <UserCircle className="h-3.5 w-3.5" />{" "}
                          {material.authorName}
                        </p>
                        <p
                          className="truncate"
                          title={material.authorInstitution}
                        >
                          {material.authorInstitution}
                        </p>
                        <p>
                          {formatDistanceToNowStrict(
                            new Date(material.createdAt),
                            { locale: es, addSuffix: true },
                          )}
                        </p>
                      </div>
                    </CardContent>
                  </Link>
                  <CardFooter className="flex items-center justify-between border-t bg-gray-50 p-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-auto px-2 py-1 text-xs ${material.currentUserRating === true ? "bg-purple-100 text-purple-600" : "text-muted-foreground hover:bg-purple-50"}`}
                        onClick={() => handleRating(material.id, true)}
                        disabled={!session?.id}
                      >
                        <ThumbsUp className="mr-1 h-3.5 w-3.5" />{" "}
                        {material.likes}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-auto px-2 py-1 text-xs ${material.currentUserRating === false ? "bg-red-100 text-red-600" : "text-muted-foreground hover:bg-red-50"}`}
                        onClick={() => handleRating(material.id, false)}
                        disabled={!session?.id}
                      >
                        <ThumbsDown className="mr-1 h-3.5 w-3.5" />{" "}
                        {material.dislikes}
                      </Button>
                    </div>
                    <Link href={`/educacion/visual/${material.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-auto border-purple-300 px-2 py-1 text-xs hover:border-purple-500 hover:text-purple-600"
                      >
                        <Eye className="mr-1 h-3.5 w-3.5" /> Ver Contenido
                      </Button>
                    </Link>
                  </CardFooter>
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
            <BookOpenText className="mx-auto mb-6 h-16 w-16 text-gray-400" />
            <h3 className="text-2xl font-semibold text-gray-700">
              No hay Material Visual disponible.
            </h3>
            <p className="text-md mt-3 text-gray-500">
              {session?.userType === UserType.TEACHER ||
              session?.userType === UserType.ADMIN
                ? "¡Anímate a ser el primero en compartir algo!"
                : "Vuelve más tarde para encontrar recursos visuales."}
            </p>
            {(session?.userType === UserType.TEACHER ||
              session?.userType === UserType.ADMIN) && (
              <Button
                asChild
                className="mt-6 bg-indigo-600 hover:bg-indigo-700"
              >
                <Link href="/educacion/visual/nuevo">
                  <PlusCircle className="mr-2 h-4 w-4" /> Crear Nuevo Material
                  Visual
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
