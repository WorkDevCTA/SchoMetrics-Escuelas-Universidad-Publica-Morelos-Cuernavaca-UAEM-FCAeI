"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Users, Filter, Loader2, Eye } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
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
import { Badge } from "@/components/ui/badge"; // Asegúrate que es el Badge correcto
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import GoToBackAdmin from "../components/GoToBackAdmin";
import AdminDeleteUser from "../components/AdminDeleteUser";
import { getInitials } from "@/hooks/getInitials";

// Definición de la interfaz para los datos de usuario en la tabla de scores
interface ScoreUser {
  id: string;
  name: string;
  matricula: string;
  userType: string;
  avatarUrl?: string | null;
  totalActivities: number;
  totalPoints: number;
  memberSince: string;
}

interface ApiResponse {
  users: ScoreUser[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const USER_TYPE_MAP: { [key: string]: string } = {
  STUDENT: "Estudiante",
  TEACHER: "Docente",
  ADMIN: "Administrador",
};

const ITEMS_PER_PAGE = 10;

export default function ScoresPage() {
  const [users, setUsers] = useState<ScoreUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const fetchScores = useCallback(
    async (page = 1, search = searchTerm, type = userTypeFilter) => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: ITEMS_PER_PAGE.toString(),
        });
        if (search) params.append("search", search);
        if (type !== "all") params.append("userType", type);

        const response = await fetch(
          `/api/admin/users/all-users?${params.toString()}`,
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error al obtener los usuarios");
        }
        const data: ApiResponse = await response.json();
        setUsers(data.users);
        setCurrentPage(data.pagination.page);
        setTotalPages(data.pagination.totalPages);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error ? err.message : "Ocurrió un error desconocido.",
        );
        setUsers([]); // Limpiar usuarios en caso de error
      } finally {
        setIsLoading(false);
      }
    },
    [searchTerm, userTypeFilter],
  ); // Dependencias actualizadas

  useEffect(() => {
    fetchScores(1); // Cargar la primera página al inicio o cuando cambian los filtros
  }, [fetchScores]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    // No llamar a fetchScores aquí directamente para evitar múltiples requests si el usuario escribe rápido.
    // Se podría implementar un debounce o llamar en el submit de un botón de búsqueda.
    // Por ahora, la búsqueda se activa al cambiar de página o filtro, o al llamar a fetchScores manualmente.
  };

  const handleSearchSubmit = (event?: React.FormEvent<HTMLFormElement>) => {
    if (event) event.preventDefault();
    setCurrentPage(1); // Resetear a la primera página en nueva búsqueda
    fetchScores(1, searchTerm, userTypeFilter);
  };

  const handleUserTypeChange = (value: string) => {
    setUserTypeFilter(value);
    setCurrentPage(1); // Resetear a la primera página
    fetchScores(1, searchTerm, value);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchScores(page);
    }
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxPagesToShow = 5; // Máximo de botones de página a mostrar (ej. 1 ... 3 4 5 ... 10)
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
      // Mostrar primera página y elipsis si es necesario
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

      // Calcular rango de páginas a mostrar alrededor de la actual
      let startPage = Math.max(2, currentPage - halfPagesToShow);
      let endPage = Math.min(totalPages - 1, currentPage + halfPagesToShow);

      if (currentPage <= halfPagesToShow + 1) {
        endPage = Math.min(totalPages - 1, maxPagesToShow - 1);
      }
      if (currentPage >= totalPages - halfPagesToShow) {
        startPage = Math.max(2, totalPages - maxPagesToShow + 2);
      }

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

      // Mostrar elipsis y última página si es necesario
      if (currentPage < totalPages - halfPagesToShow - 1) {
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

  return (
    <div className="m-5 flex flex-col gap-8 sm:m-10">
      <div className="mt-10 flex flex-col gap-2 rounded-xl bg-gradient-to-r from-rose-700 to-red-800 p-6 text-white shadow-lg lg:mt-0">
        <div className="flex flex-col items-center justify-center gap-2 lg:flex-row lg:justify-between">
          <div className="my-3">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8" />
              <h1 className="text-3xl font-bold tracking-tight">
                Eliminar Usuarios
              </h1>
            </div>
            <p className="text-purple-100">
              Elimina Usuarios que ya no tendrán participación en SchoMetrics.
            </p>
          </div>
          <GoToBackAdmin />
        </div>
      </div>

      <Card>
        <CardHeader>
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col gap-4 md:flex-row"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Buscar por Matricula"
                className="py-2 pl-10 text-base"
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
            <Select value={userTypeFilter} onValueChange={handleUserTypeChange}>
              <SelectTrigger className="w-full py-2 text-base md:w-[220px]">
                <Filter className="mr-2 h-5 w-5" />
                <SelectValue placeholder="Filtrar por Tipo de Usuario" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Tipos</SelectItem>
                <SelectItem value="STUDENT">Estudiante</SelectItem>
                <SelectItem value="TEACHER">Docente</SelectItem>
                <SelectItem value="ADMIN">Administrador</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="submit"
              className="bg-red-600 py-2 text-white hover:bg-red-700"
            >
              Buscar
            </Button>
          </form>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-red-600" />
            </div>
          ) : error ? (
            <div className="py-10 text-center text-red-500">
              <p>{error}</p>
              <Button
                onClick={() => fetchScores(currentPage)}
                variant="outline"
                className="mt-4"
              >
                Reintentar
              </Button>
            </div>
          ) : users.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Avatar</TableHead>
                      <TableHead className="text-center">Nombre</TableHead>
                      <TableHead className="text-center">Matricula</TableHead>
                      <TableHead className="text-center">Tipo</TableHead>
                      <TableHead className="text-center">Actividades</TableHead>
                      <TableHead className="text-center">EcoPoints</TableHead>
                      <TableHead className="text-center">
                        Miembro Desde
                      </TableHead>
                      <TableHead className="text-center">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="text-center">
                          <Avatar className="h-16 w-16">
                            <AvatarImage
                              src={user.avatarUrl || ""}
                              alt={user.name}
                            />
                            <AvatarFallback className="bg-purple-100 font-semibold text-purple-700">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="text-center text-[17px] font-bold uppercase text-sky-950">
                          {user.name}
                        </TableCell>
                        <TableCell className="text-center text-lg font-bold tracking-wider text-[#2e86c1]">
                          {user.matricula}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              user.userType === "STUDENT"
                                ? "secondary"
                                : user.userType === "TEACHER"
                                  ? "outline"
                                  : user.userType === "ADMIN"
                                    ? "outline" // Example: use outline for community
                                    : "default"
                            }
                            className={
                              user.userType === "STUDENT"
                                ? "border-sky-300 bg-sky-100 text-sky-700"
                                : user.userType === "TEACHER"
                                  ? "border-green-300 bg-green-100 text-green-700"
                                  : user.userType === "ADMIN"
                                    ? "bg-red-700 text-white"
                                    : "border-gray-300 bg-gray-100 text-gray-700"
                            }
                          >
                            {USER_TYPE_MAP[user.userType] || user.userType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center text-lg font-bold text-teal-600">
                          {user.totalActivities}
                        </TableCell>
                        <TableCell className="text-center text-lg font-bold text-[#53c932]">
                          {user.totalPoints}
                        </TableCell>
                        <TableCell className="text-center font-bold text-slate-800">
                          {format(new Date(user.memberSince), "dd MMM, yyyy", {
                            locale: es,
                          })}
                        </TableCell>
                        <TableCell className="flex flex-col gap-2 text-center">
                          <Link href={`/admin/lista-de-usuarios/${user.id}`}>
                            <Button
                              variant="default"
                              title={`Ver Información Completa de ${user.name} - ${user.matricula}`}
                              className="bg-slate-500 text-white hover:bg-slate-600"
                            >
                              <Eye className="mr-1 h-4 w-4" />
                              Ver Usuario
                            </Button>
                          </Link>
                          <AdminDeleteUser userId={user?.id} />
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
            <div className="py-10 text-center">
              <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-medium text-muted-foreground">
                No se encontraron usuarios.
              </p>
              <p className="text-sm text-muted-foreground">
                Intenta ajustar los filtros o el término de búsqueda.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
