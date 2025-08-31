"use client";

import type React from "react";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Users,
  Filter,
  Trophy,
  Medal,
  Award,
  Leaf,
  Crown,
  Star,
} from "lucide-react";
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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import DashboardLayout from "../components/DashboardLayout";
import Image from "next/image";
import LoaderCircle from "../components/LoaderCircle";

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
};

const ITEMS_PER_PAGE = 10;

export default function ScoresPage() {
  const [users, setUsers] = useState<ScoreUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isHovered, setIsHovered] = useState(false);

  const getInitials = (name = "") => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "U"
    );
  };

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

        const response = await fetch(`/api/scores?${params.toString()}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error al obtener los scores");
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
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    },
    [searchTerm, userTypeFilter],
  );

  useEffect(() => {
    fetchScores(1);
  }, [fetchScores]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event?: React.FormEvent<HTMLFormElement>) => {
    if (event) event.preventDefault();
    setCurrentPage(1);
    fetchScores(1, searchTerm, userTypeFilter);
  };

  const handleUserTypeChange = (value: string) => {
    setUserTypeFilter(value);
    setCurrentPage(1);
    fetchScores(1, searchTerm, value);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchScores(page);
    }
  };

  const getPodiumPosition = (index: number) => {
    if (currentPage === 1) {
      return index + 1;
    }
    return null;
  };

  const renderTopThree = () => {
    if (currentPage !== 1 || users.length === 0) return null;

    const topThree = users.slice(0, 3);
    const [first, second, third] = topThree;

    return (
      <div className="mb-12">
        <div className="py-5 pb-16 text-center">
          <h2 className="mb-2 text-3xl font-bold text-gray-500">
            🏆 Podio SchoChampions
          </h2>
          <p className="text-purple-500">
            Los líderes en sostenibilidad ambiental
          </p>
        </div>

        <div className="mb-8 flex flex-col items-end justify-center gap-6 pb-16 sm:flex-row xl:gap-10">
          {/* Segundo Lugar */}
          {second && (
            <div className="group relative order-2 lg:order-1">
              <div className="transform rounded-3xl border-4 border-gray-300 bg-gradient-to-br from-gray-100 to-gray-200 p-6 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-gray-400 to-gray-500 text-lg font-bold text-white shadow-lg">
                    2
                  </div>
                </div>
                <div className="pt-4 text-center">
                  <div className="relative mb-4">
                    <Avatar className="mx-auto h-20 w-20 border-4 border-gray-400 shadow-lg">
                      <AvatarImage
                        src={second.avatarUrl || ""}
                        alt={second.name}
                      />
                      <AvatarFallback className="bg-gray-100 text-xl font-bold text-gray-700">
                        {getInitials(second.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2">
                      <Medal className="h-8 w-8 text-gray-500" />
                    </div>
                  </div>
                  <h3 className="mb-1 text-lg font-bold text-gray-800">
                    {second.name}
                  </h3>
                  <p className="mb-3 text-sm text-gray-600">
                    {second.matricula}
                  </p>
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="flex w-max items-center justify-center gap-2 rounded-full bg-[#17d627]/10 px-6 py-3 text-center">
                      <Image
                        src="/eco_points_logo.png"
                        alt="eco_points_logo"
                        width={30}
                        height={30}
                        priority
                        draggable={false}
                        onDragStart={(e) => e.preventDefault()}
                        className={`pointer-events-none mx-auto select-none transition-transform duration-1000 ${isHovered ? "animate-heartbeat" : "animate-heartbeat"}`}
                      />
                      <span className="font-bold text-[#17d627]">
                        {second.totalPoints}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-green-500">
                      <Leaf className="h-4 w-4" />
                      <span className="text-[10px] font-normal xl:text-[18px]">
                        {second.totalActivities} Actividades
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Primer Lugar */}
          {first && (
            <div className="group relative order-1 lg:order-2">
              <div className="hover:shadow-3xl transform rounded-3xl border-4 border-double border-[#1aaf27] bg-gradient-to-br from-green-100 via-green-50 to-green-200 p-8 shadow-2xl transition-all duration-500 hover:-translate-y-3 lg:scale-110">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 transform">
                  <div className="flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-lime-500 text-2xl font-bold text-white shadow-xl">
                    <Crown className="h-8 w-8" />
                  </div>
                </div>
                <div className="pt-6 text-center">
                  <div className="relative mb-6">
                    <Avatar className="mx-auto h-24 w-24 border-4 border-[#17d627] shadow-xl">
                      <AvatarImage
                        src={first.avatarUrl || ""}
                        alt={first.name}
                      />
                      <AvatarFallback className="bg-green-100 text-2xl font-bold text-[#1ab827]">
                        {getInitials(first.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2">
                      <Trophy className="h-10 w-10 text-yellow-400" />
                    </div>
                    <div className="absolute -left-2 -top-2 animate-bounce">
                      <Star className="h-6 w-6 fill-current text-yellow-300" />
                    </div>
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-orange-700">
                    {first.name}
                  </h3>
                  <p className="mb-4 font-medium text-amber-500">
                    {first.matricula}
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 rounded-full bg-[#17d627]/10 px-6 py-3">
                      <Image
                        src="/eco_points_logo.png"
                        alt="eco_points_logo"
                        width={30}
                        height={30}
                        priority
                        draggable={false}
                        onDragStart={(e) => e.preventDefault()}
                        className={`pointer-events-none mx-auto select-none transition-transform duration-1000 ${isHovered ? "animate-heartbeat" : "animate-heartbeat"}`}
                      />
                      <span className="text-lg font-bold text-[#2cbe38]">
                        {first.totalPoints}{" "}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <Leaf className="h-5 w-5" />
                      <span className="text-[10px] font-bold xl:text-[18px]">
                        {first.totalActivities} Actividades
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tercer Lugar */}
          {third && (
            <div className="group relative order-3">
              <div className="transform rounded-3xl border-4 border-amber-300 bg-gradient-to-br from-amber-100 to-orange-200 p-6 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-lg font-bold text-white shadow-lg">
                    3
                  </div>
                </div>
                <div className="pt-4 text-center">
                  <div className="relative mb-4">
                    <Avatar className="mx-auto h-20 w-20 border-4 border-amber-400 shadow-lg">
                      <AvatarImage
                        src={third.avatarUrl || ""}
                        alt={third.name}
                      />
                      <AvatarFallback className="bg-amber-100 text-xl font-bold text-amber-700">
                        {getInitials(third.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2">
                      <Award className="h-8 w-8 text-amber-600" />
                    </div>
                  </div>
                  <h3 className="mb-1 text-lg font-bold text-gray-800">
                    {third.name}
                  </h3>
                  <p className="mb-3 text-sm text-gray-600">
                    {third.matricula}
                  </p>
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="flex items-center justify-center gap-2 rounded-full bg-[#00B38C]/10 px-4 py-2">
                      <Image
                        src="/eco_points_logo.png"
                        alt="eco_points_logo"
                        width={30}
                        height={30}
                        priority
                        draggable={false}
                        onDragStart={(e) => e.preventDefault()}
                        className={`pointer-events-none mx-auto select-none transition-transform duration-1000 ${isHovered ? "animate-heartbeat" : "animate-heartbeat"}`}
                      />
                      <span className="font-bold text-[#17d627]">
                        {third.totalPoints}{" "}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-green-500">
                      <Leaf className="h-4 w-4" />
                      <span className="text-[10px] font-normal xl:text-[18px]">
                        {third.totalActivities} Actividades
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

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
    <DashboardLayout>
      <div className="m-5 flex select-none flex-col gap-8 sm:m-10">
        {/* Header */}
        <div className="relative mt-16 flex flex-col gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-purple-700 via-purple-600 to-purple-950 p-8 text-white shadow-2xl lg:mt-0">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="mb-2 flex flex-col items-center justify-center gap-4 md:flex-row md:items-center md:justify-start">
              <div className="rounded-xl bg-white/20 p-3">
                <Trophy className="h-8 w-8 animate-bounce" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight">SchoLíderes</h1>
            </div>
            <p className="text-lg text-white">
              Ranking de los SchoChampions más comprometidos con la
              sostenibilidad ambiental
            </p>
          </div>
          <div className="absolute right-4 top-4 opacity-20">
            <Leaf className="h-24 w-24 animate-pulse text-white" />
          </div>
        </div>

        {/* Podio Top 3 */}
        {renderTopThree()}

        {/* Filtros y Búsqueda */}
        <Card className="border-0 bg-white shadow-xl">
          <CardHeader className="pb-6">
            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-col gap-4 md:flex-row"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  type="number"
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
              <Select
                value={userTypeFilter}
                onValueChange={handleUserTypeChange}
              >
                <SelectTrigger className="w-full rounded-xl border-2 border-purple-200 py-3 text-base focus:border-purple-600 md:w-[240px]">
                  <Filter className="mr-2 h-5 w-5 text-gray-400" />
                  <SelectValue placeholder="Filtrar por Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Tipos</SelectItem>
                  <SelectItem value="STUDENT">Estudiante</SelectItem>
                  <SelectItem value="TEACHER">Docente</SelectItem>
                </SelectContent>
              </Select>
              <Button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 px-8 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:from-purple-600 hover:to-purple-700 hover:shadow-xl"
              >
                <Search className="mr-2 h-5 w-5" />
                Buscar
              </Button>
            </form>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="flex h-64 flex-col items-center justify-center space-y-4">
                <LoaderCircle />
                <p className="font-medium text-gray-600">
                  Cargando Tabla de Marcadores
                </p>
              </div>
            ) : error ? (
              <div className="space-y-4 py-12 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                  <Users className="h-8 w-8 text-red-500" />
                </div>
                <p className="font-medium text-red-600">{error}</p>
                <Button
                  onClick={() => fetchScores(currentPage)}
                  variant="outline"
                  className="border-2 border-red-200 hover:border-red-300"
                >
                  Reintentar
                </Button>
              </div>
            ) : users.length > 0 ? (
              <>
                <div className="overflow-x-auto rounded-xl border border-purple-200">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b-2 border-purple-200">
                        <TableHead className="py-4 text-left font-bold text-gray-700">
                          Posición
                        </TableHead>
                        <TableHead className="text-left font-bold text-gray-700">
                          Participante
                        </TableHead>
                        <TableHead className="text-center font-bold text-gray-700">
                          Matrícula
                        </TableHead>
                        <TableHead className="text-center font-bold text-gray-700">
                          Tipo
                        </TableHead>
                        <TableHead className="text-center font-bold text-gray-700">
                          Actividades
                        </TableHead>
                        <TableHead className="text-center font-bold text-gray-700">
                          EcoPoints
                        </TableHead>
                        <TableHead className="text-center font-bold text-gray-700">
                          Miembro Desde
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user, index) => {
                        const position =
                          (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
                        const isTopThree = currentPage === 1 && index < 3;

                        return (
                          <TableRow
                            key={user.id}
                            className={`border-b border-purple-100 transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-rose-50 ${isTopThree ? "bg-gradient-to-r from-green-100 to-emerald-50" : ""} `}
                          >
                            <TableCell className="py-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold ${position === 1
                                      ? "bg-gradient-to-r from-green-400 to-lime-500 text-white shadow-lg"
                                      : position === 2
                                        ? "bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg"
                                        : position === 3
                                          ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg"
                                          : "bg-gradient-to-r from-[#00B38C] to-emerald-600 text-white"
                                    } `}
                                >
                                  {position <= 3 ? (
                                    position === 1 ? (
                                      <Crown className="h-5 w-5" />
                                    ) : position === 2 ? (
                                      <Medal className="h-5 w-5" />
                                    ) : (
                                      <Award className="h-5 w-5" />
                                    )
                                  ) : (
                                    position
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="flex items-center gap-4">
                                <Avatar
                                  className={`pointer-events-none h-12 w-12 border-2 shadow-md ${position === 1
                                      ? "border-[#17d627]"
                                      : position === 2
                                        ? "border-gray-400"
                                        : position === 3
                                          ? "border-amber-400"
                                          : "border-[#00B38C]"
                                    }`}
                                  draggable={false}
                                  onDragStart={(e) => e.preventDefault()}
                                >
                                  <AvatarImage
                                    src={user.avatarUrl || ""}
                                    alt={user.name}
                                  />
                                  <AvatarFallback
                                    className={`font-bold ${position === 1
                                        ? "bg-green-100 text-green-700"
                                        : position === 2
                                          ? "bg-gray-100 text-gray-700"
                                          : position === 3
                                            ? "bg-amber-100 text-amber-700"
                                            : "bg-green-100 text-green-700"
                                      }`}
                                  >
                                    {getInitials(user.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-lg font-semibold text-gray-900">
                                    {user.name}
                                  </p>
                                  {isTopThree && (
                                    <div className="mt-1 flex items-center gap-1">
                                      <Trophy className="h-4 w-4 fill-current text-yellow-400" />
                                      <span className="text-sm font-medium text-yellow-500">
                                        EcoChampion
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 text-center">
                              <span className="rounded-full bg-blue-50 px-3 py-1 font-bold text-blue-600">
                                {user.matricula}
                              </span>
                            </TableCell>
                            <TableCell className="py-4 text-center">
                              <Badge
                                variant="secondary"
                                className={
                                  user.userType === "STUDENT"
                                    ? "border-sky-300 bg-sky-100 font-medium text-sky-700"
                                    : user.userType === "TEACHER"
                                      ? "border-green-300 bg-green-100 font-medium text-green-700"
                                      : "border-gray-300 bg-gray-100 font-medium text-gray-700"
                                }
                              >
                                {USER_TYPE_MAP[user.userType] || user.userType}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Leaf className="h-4 w-4 text-[#00B38C]" />
                                <span className="font-semibold text-[#00B38C]">
                                  {user.totalActivities}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 text-center">
                              <div className="pointer-events-none flex select-none items-center justify-center gap-2">
                                <Image
                                  src="/eco_points_logo.png"
                                  alt="eco_points_logo"
                                  width={30}
                                  height={20}
                                  priority
                                  draggable={false}
                                  onDragStart={(e) => e.preventDefault()}
                                  className={`transition-transform duration-1000 ${isHovered ? "animate-heartbeat" : "animate-heartbeat"}`}
                                />
                                <span className="font-bold text-[#17d627]">
                                  {user.totalPoints}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 text-center text-gray-600">
                              {format(
                                new Date(user.memberSince),
                                "dd MMM, yyyy",
                                { locale: es },
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <Pagination className="mt-8">
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
                              : "hover:bg-[#00B38C]/10"
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
                              : "hover:bg-[#00B38C]/10"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            ) : (
              <div className="space-y-4 py-16 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                  <Users className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700">
                  No se encontraron participantes
                </h3>
                <p className="text-gray-500">
                  Intenta ajustar los filtros o el término de búsqueda.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
