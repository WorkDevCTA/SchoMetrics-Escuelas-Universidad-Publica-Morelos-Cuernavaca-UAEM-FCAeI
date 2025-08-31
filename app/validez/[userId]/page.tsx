"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getInitials } from "@/hooks/getInitials";
import type { UserProfileData } from "@/types/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowRightLeftIcon,
  CalendarCheckIcon,
  CheckCircle,
  Shield,
  User,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import ListaDeRecompensas from "../components/ListaDeRecompensas";
import EnlaceExpirado from "../components/EnlaceExpirado";

const ValidezPage = () => {
  const params = useParams();
  const userId = params.userId as string;
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [user, setUser] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

  useEffect(() => {
    if (token && userId) {
      validateToken();
    } else {
      setIsValidToken(false);
    }
  }, [token, userId]);

  const validateToken = async () => {
    try {
      const response = await fetch("/api/validate-user/validate-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, userId }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsValidToken(data.valid === true);
      } else {
        setIsValidToken(false);
      }
    } catch (error) {
      console.error("Error validando token:", error);
      setIsValidToken(false);
    }
  };

  const fetchUser = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/validate-user/${userId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Usuario no encontrado o error al cargar.",
        );
      }
      const data: UserProfileData = await response.json();
      setUser(data);
    } catch (err) {
      console.error("Error cargando usuario:", err);
      setError(
        err instanceof Error ? err.message : "Ocurrió un error desconocido.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isValidToken === true) {
      fetchUser();
    }
  }, [isValidToken, fetchUser]);

  const formatDate = (dateString: string | undefined, includeTime = true) => {
    if (!dateString) return "Fecha no disponible";
    const date = new Date(dateString);
    if (includeTime) {
      return format(date, "dd MMM, yyyy 'a las' HH:mm", { locale: es });
    }
    return format(date, "dd MMM, yyyy", { locale: es });
  };

  const USER_TYPE_MAP: { [key: string]: string } = {
    STUDENT: "Estudiante",
    TEACHER: "Docente",
    ADMIN: "Administrador",
  };

  if (isValidToken === null || (isValidToken === true && isLoading)) {
    return (
      <Card className="mx-auto w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">
              {isValidToken === null
                ? "Validando enlace..."
                : "Cargando datos del usuario..."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isValidToken === false) {
    return <EnlaceExpirado />;
  }

  if (error) {
    return (
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-800">
            Error
          </CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/mi-carnet" className="w-full">
            <Button className="w-full">Volver</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-green-50 p-4 py-10 lg:pt-16">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="ftext-center mb-8 text-center">
          <div className="mb-4 flex flex-col items-center justify-center md:flex-row">
            <Shield className="mr-3 h-12 w-12 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">SchoMetrics</h1>
          </div>
          <p className="text-lg text-gray-600">
            Validación de Documento Oficial
          </p>
        </div>

        {/* Status Badge */}
        <div className="mb-6 flex justify-center">
          <Badge className="bg-green-100 px-4 py-2 text-sm text-green-800 hover:bg-green-200">
            <CheckCircle className="mr-2 h-4 w-4" />
            La información ha sido validada.
          </Badge>
        </div>

        {/* Main Card */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-teal-950 to-sky-950 text-white">
            <div className="flex flex-col items-center justify-between p-4 md:flex-row">
              <div className="flex flex-col text-sky-50">
                <CardTitle className="flex items-center text-center text-xl">
                  <User className="mr-2 h-6 w-6" />
                  Información del Usuario
                </CardTitle>
                <CardDescription className="text-center text-green-200">
                  Datos básicos verificados del sistema SchoMetrics.
                </CardDescription>
              </div>
              <div className="mt-5 rounded-full bg-white p-1">
                <Avatar className="h-[80px] w-[80px]">
                  <AvatarImage
                    src={user?.profile?.publicAvatarDisplayUrl || ""}
                    alt={user?.name || "Avatar"}
                  />
                  <AvatarFallback className="bg-teal-100 text-[25px] font-semibold text-teal-600">
                    {getInitials(user?.name)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Información Personal */}
              <div className="space-y-4">
                <h3 className="border-b pb-2 text-lg font-semibold text-gray-900">
                  Datos Personales
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Nombre Completo
                    </label>
                    <p className="text-lg font-medium uppercase text-gray-900">
                      {user?.name}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      ID de Usuario
                    </label>
                    <p className="rounded bg-gray-100 px-2 py-1 font-mono text-sm">
                      {user?.id}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Matrícula
                    </label>
                    <p className="text-lg font-bold text-sky-800">
                      {user?.matricula}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Tipo de Cuenta:{" "}
                    </label>
                    <Badge
                      variant={
                        user?.userType === "STUDENT"
                          ? "secondary"
                          : user?.userType === "TEACHER"
                            ? "outline"
                            : user?.userType === "ADMIN"
                              ? "outline"
                              : "default"
                      }
                      className={
                        user?.userType === "STUDENT"
                          ? "border-sky-300 bg-sky-100 text-sky-700"
                          : user?.userType === "TEACHER"
                            ? "border-green-300 bg-green-100 text-green-700"
                            : user?.userType === "ADMIN"
                              ? "bg-red-950 text-white"
                              : "border-gray-300 bg-gray-100 text-gray-700"
                      }
                    >
                      {USER_TYPE_MAP[user?.userType as string] ||
                        user?.userType}
                    </Badge>
                  </div>
                  <div className="flex flex-col items-start gap-2 text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <CalendarCheckIcon className="h-6 w-6 text-muted-foreground" />
                      <span className="text-sm font-medium text-gray-500">
                        Miembro desde:
                      </span>
                    </div>
                    <span className="font-semibold">
                      {formatDate(user?.createdAt, false)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Información Académica */}
              <div className="space-y-4">
                <h3 className="border-b pb-2 text-lg font-semibold text-gray-900">
                  Información de Trayectoria
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      EcoPoint Totales
                    </label>
                    <div className="mt-2 flex items-center justify-start gap-2">
                      <Image
                        src="/eco_points_logo.png"
                        alt="eco_points_logo"
                        width={60}
                        height={40}
                        priority
                      />
                      <p className="text-2xl font-bold text-[#17d627]">
                        {user?.points}
                      </p>
                    </div>
                  </div>
                  {/* Datos del Usuario */}
                  <div className="flex w-full flex-col items-start justify-center gap-4">
                    {user?.profile?.badges && user.profile.badges.length > 0 ? (
                      <div className="flex flex-col flex-wrap gap-2">
                        <div className="flex items-center gap-2 text-center text-slate-500 md:flex-row">
                          Insignias:{" "}
                        </div>
                        <div className="flex h-[100px] flex-col gap-3 overflow-auto">
                          {user.profile.badges.map((badge) => (
                            <Badge
                              key={badge.id}
                              variant="outline"
                              className="flex items-center gap-4 border-none bg-amber-50 px-2 py-1 text-amber-600"
                            >
                              <img
                                src={badge.imageUrl || ""}
                                alt={badge.name}
                                className="h-4 w-4"
                              />
                              {badge.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-start justify-center gap-2 text-slate-500 md:flex-row">
                        <div className="flex items-center gap-2 text-slate-500 md:flex-row">
                          <CheckCircle className="h-6 w-6" />
                          Insignias:{" "}
                        </div>
                        <p className="font-bold text-sky-800">
                          Sin Insignias obtenidas.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-6" />
            <ListaDeRecompensas userId={user?.id as string} />

            <Separator className="my-6" />

            {/* Footer Information */}
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="grid gap-4 text-sm text-gray-600 md:grid-cols-2">
                <div>
                  <p>
                    <strong>Verificación de la cuenta realizada el:</strong>{" "}
                    {formatDate(new Date().toISOString())}
                  </p>
                </div>
              </div>
              <div className="mt-3 border-t border-gray-200 pt-3">
                <p className="text-center text-xs text-gray-500">
                  Este documento ha sido verificado automáticamente por el
                  sistema SchoMetrics.
                  <br />
                  Para más información, contacte al administrador del sistema.
                </p>
              </div>
            </div>
            <div className="my-5 flex w-full items-center justify-center">
              <Link href="https://uaem-fcaei.schometrics.website/inicio">
                <Button className="w-max bg-schoMetricsBaseColor/80 text-white hover:bg-schoMetricsBaseColor">
                  <ArrowRightLeftIcon className="mr-2 h-4 w-4" />
                  Ir a SchoMetrics
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} SchoMetrics. Documento oficial
            verificado.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ValidezPage;
