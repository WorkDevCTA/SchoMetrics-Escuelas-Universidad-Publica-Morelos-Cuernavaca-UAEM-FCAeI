"use client";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Award,
  Leaf,
  MapPin,
  Loader2,
  CalendarCheck,
  User,
  MSquareIcon,
  Coins,
  QrCode,
  RefreshCw,
  Clock,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import type { UserProfileData, UserStats } from "@/types/types";
import toast from "react-hot-toast";
import QRCode from "qrcode";
import { AnimatedModalCarnet } from "./components/AnimatedModalCarnet";
import LoaderCircle from "../components/LoaderCircle";
import AvatarUser from "../components/AvatarUser";
import { formatDate } from "@/hooks/allHooks";

export default function MiCarnet() {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [validationLink, setValidationLink] = useState<string>("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [lastGenerationTime, setLastGenerationTime] = useState<number | null>(
    null,
  );
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [canGenerate, setCanGenerate] = useState<boolean>(true);
  const [stats, setStats] = useState<UserStats>({
    totalPoints: 0,
    activityCount: 0,
    recentActivities: [],
  });

  const COOLDOWN_MINUTES = 15;
  const COOLDOWN_MS = COOLDOWN_MINUTES * 60 * 1000;

  const formatTimeRemaining = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const saveQRDataToStorage = (link: string, qrDataUrl: string) => {
    localStorage.setItem("validation_link", link);
    localStorage.setItem("qr_code_data_url", qrDataUrl);
  };

  const loadQRDataFromStorage = () => {
    const savedLink = localStorage.getItem("validation_link");
    const savedQRDataUrl = localStorage.getItem("qr_code_data_url");

    if (savedLink && savedQRDataUrl) {
      setValidationLink(savedLink);
      setQrCodeDataUrl(savedQRDataUrl);
      return true;
    }
    return false;
  };

  const clearQRDataFromStorage = () => {
    localStorage.removeItem("validation_link");
    localStorage.removeItem("qr_code_data_url");
    localStorage.removeItem("qr_generation_time");
  };

  const checkCooldownStatus = () => {
    const stored = localStorage.getItem("qr_generation_time");
    if (!stored) {
      setCanGenerate(true);
      setTimeRemaining(0);
      return;
    }

    const lastTime = Number.parseInt(stored);
    const now = Date.now();
    const timePassed = now - lastTime;

    if (timePassed >= COOLDOWN_MS) {
      setCanGenerate(true);
      setTimeRemaining(0);
      clearQRDataFromStorage();
      setValidationLink("");
      setQrCodeDataUrl("");
    } else {
      setCanGenerate(false);
      const remaining = Math.ceil((COOLDOWN_MS - timePassed) / 1000);
      setTimeRemaining(remaining);
      setLastGenerationTime(lastTime);
      loadQRDataFromStorage();
    }
  };

  useEffect(() => {
    checkCooldownStatus();

    const interval = setInterval(() => {
      if (!canGenerate && timeRemaining > 0) {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setCanGenerate(true);
            clearQRDataFromStorage();
            setValidationLink("");
            setQrCodeDataUrl("");
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [canGenerate, timeRemaining]);

  const generateValidationLink = async () => {
    if (!profile?.id) return;

    if (!canGenerate) {
      toast.error(
        `Debes esperar ${formatTimeRemaining(timeRemaining)} para generar un nuevo código QR`,
      );
      return;
    }

    setIsGeneratingQR(true);
    try {
      const response = await fetch(
        "/api/validate-user/generate-validation-link",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: profile.id }),
        },
      );

      if (!response.ok) {
        toast.error("Error al generar link de validación");
        throw new Error("Error al generar link de validación");
      }

      const data = await response.json();
      setValidationLink(data.url);

      const qrDataUrl = await QRCode.toDataURL(data.url, {
        width: 200,
        margin: 2,
        color: {
          dark: "#059669",
          light: "#FFFFFF",
        },
      });
      setQrCodeDataUrl(qrDataUrl);

      const now = Date.now();
      localStorage.setItem("qr_generation_time", now.toString());
      saveQRDataToStorage(data.url, qrDataUrl);

      setLastGenerationTime(now);
      setCanGenerate(false);
      setTimeRemaining(COOLDOWN_MINUTES * 60);

      toast.success("Código QR generado exitosamente");
    } catch (error) {
      console.error("Error al generar código QR:", error);
      toast.error("Error al generar código QR");
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/profile");
      if (!response.ok) throw new Error("Error al obtener perfil");
      const data: UserProfileData = await response.json();
      setProfile(data);
    } catch (error) {
      console.error("Error al cargar perfil:", error);
      toast.error("Error, No se pudo cargar el perfil");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      await Promise.all([fetchProfileData()]);
      setIsLoading(false);
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if (profile?.id) {
      const hasExistingData = loadQRDataFromStorage();
      if (!hasExistingData && !validationLink && canGenerate) {
        generateValidationLink();
      }
    }
  }, [profile?.id, canGenerate]);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!profile?.id) return;
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
          activityCount: statsData.activityCount || 0,
          recentActivities: activitiesData.activities || [],
        });
      } catch (error) {
        console.error("Error al cargar datos del dashboard:", error);
      }
    };
    fetchUserStats();
  }, [profile?.id]);

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <LoaderCircle />
        <p className="text-center text-lg font-semibold text-baseColor">
          Cargando datos del Carnet...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="flex min-h-screen flex-col items-center justify-start gap-2 bg-slate-950 p-4 py-10">
        <Link
          href="/inicio"
          className="flex items-end justify-center gap-3 px-4 py-2 font-semibold"
        >
          <span className="flex items-center gap-2 border-b-2 border-slate-950 text-white hover:border-white">
            <ArrowLeft className="h-5 w-5 animate-heartbeat" />
            Regresar
          </span>
          <Image
            src="/logo-white.png"
            alt="logo"
            width={100}
            height={100}
            priority
          />
        </Link>
        <div className="flex flex-col items-center justify-center px-10 py-5 text-center">
          <h1 className="mx-auto max-w-full text-start text-2xl font-bold text-baseColor md:text-4xl lg:text-6xl">
            Mi Carnet
          </h1>
          <span className="my-2 text-gray-400">
            Aquí encontrarás tu Carnet y mediante el podrás validar tu identidad
            al momento de subir tus evidencias de actividades.
          </span>
          <AnimatedModalCarnet />
        </div>
        <Card className="relative h-[565px] w-80 overflow-hidden rounded-b-none rounded-t-lg border-0 bg-white shadow-2xl backdrop-blur-sm">
          <div className="relative z-10 bg-gradient-to-r from-baseColor via-baseColor/50 to-baseColor p-4">
            <div className="flex w-full justify-center">
              <div className="h-[25px] w-[25px] rounded-full border border-baseColor bg-slate-950"></div>
            </div>
            <div className="flex items-center justify-between">
              <Image
                src="/logo-white.png"
                alt="logo"
                width={70}
                height={70}
                priority
                objectFit="contain"
              />
              <div>
                <h1 className="text-lg font-bold text-white">SchoMetrics</h1>
                <p className="text-xs text-slate-100">Carnet de Identidad</p>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 backdrop-blur-sm">
                <Image
                  src="fcaei-logo.svg"
                  alt="fcaei-logo"
                  width={50}
                  height={50}
                  priority
                />
              </div>
            </div>
          </div>

          <div className="relative z-10 p-6">
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <AvatarUser />
                <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 shadow-md">
                  <Award className="h-3 w-3 text-white" />
                </div>
                <div className="absolute -bottom-1 -left-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md">
                  <Leaf className="h-3 w-3 text-white" />
                </div>
              </div>
            </div>

            <div className="text-center">
              <h2 className="mb-1 text-xl font-bold uppercase text-baseColor">
                {profile?.name}
              </h2>
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg text-baseColor">
                  Matricula: <b>{profile?.matricula}</b>
                </span>
              </div>
            </div>

            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Miembro desde:</span>
                <span className="font-bold text-baseColor">
                  {formatDate(profile?.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Tipo:</span>
                <span className="font-bold text-baseColor">
                  {profile?.userType === "STUDENT"
                    ? "ESTUDIANTE"
                    : profile?.userType === "TEACHER"
                      ? "DOCENTE"
                      : profile?.userType === "ADMIN"
                        ? "ADMINISTRADOR"
                        : "SIN TIPO"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MSquareIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Matricula:</span>
                <span className="font-bold text-baseColor">
                  {profile?.matricula}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Leaf className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Actividades:</span>
                <span className="font-bold text-baseColor">
                  {stats.activityCount}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Coins className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">EcoPoints:</span>
                <span className="font-bold text-baseColor">
                  {profile?.points}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Ciudad:</span>
                <span className="font-bold text-baseColor">
                  {profile?.profile?.city} - {profile?.profile?.state}
                </span>
              </div>
            </div>
            <div className="mt-6 border-t pt-4">
              <div className="flex items-center justify-center gap-3">
                <div className="flex gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-baseColor/70"></div>
                  <div className="h-1.5 w-1.5 rounded-full bg-baseColor/70"></div>
                  <div className="h-1.5 w-1.5 rounded-full bg-baseColor/70"></div>
                </div>
                <p className="text-basbg-baseColor/70 text-xs font-medium">
                  Impacto Positivo Certificado
                </p>
                <div className="flex gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-baseColor/70"></div>
                  <div className="h-1.5 w-1.5 rounded-full bg-baseColor/70"></div>
                  <div className="h-1.5 w-1.5 rounded-full bg-baseColor/70"></div>
                </div>
              </div>
            </div>
          </div>
        </Card>
        <Card className="relative h-[600px] w-80 overflow-hidden rounded-b-lg rounded-t-none border-0 bg-white shadow-2xl backdrop-blur-sm">
          <div className="mt-6">
            <div className="text-center">
              <div className="mb-3 flex items-center justify-center gap-2">
                <QrCode className="h-4 w-4 text-baseColor" />
                <span className="text-sm font-semibold text-baseColor">
                  Código de Validación de tu Cuenta
                </span>
              </div>

              {!canGenerate && timeRemaining > 0 && (
                <div className="mb-4 rounded-lg border border-orange-200 bg-orange-50 p-3">
                  <div className="mb-2 flex items-center justify-center gap-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-800">
                      Tiempo de espera
                    </span>
                  </div>
                  <div className="mb-1 text-2xl font-bold text-orange-600">
                    {formatTimeRemaining(timeRemaining)}
                  </div>
                  <p className="text-xs text-orange-700">
                    Podrás generar un nuevo código QR cuando termine el tiempo
                  </p>
                </div>
              )}

              {qrCodeDataUrl ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="rounded-lg border-2 border-baseColor/30 bg-white p-3 shadow-md">
                    <Image
                      src={qrCodeDataUrl || "/placeholder.svg"}
                      alt="Código QR de validación"
                      width={150}
                      height={150}
                      className="rounded"
                    />
                  </div>

                  <Button
                    onClick={generateValidationLink}
                    disabled={isGeneratingQR || !canGenerate}
                    className={`h-8 px-3 py-2 text-xs text-white ${canGenerate
                      ? "bg-gradient-to-r from-baseColor/80 via-baseColor/90 to-baseColor/80 hover:bg-baseColor"
                      : "cursor-not-allowed bg-gray-400"
                      }`}
                  >
                    {isGeneratingQR ? (
                      <>
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        Generando...
                      </>
                    ) : !canGenerate ? (
                      <>
                        <Clock className="mr-1 h-3 w-3" />
                        Espera {formatTimeRemaining(timeRemaining)}
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-1 h-3 w-3" />
                        Volver a generar
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-[150px] w-[150px] items-center justify-center rounded-lg bg-gray-100">
                    {isGeneratingQR ? (
                      <Loader2 className="h-8 w-8 animate-spin text-baseColor" />
                    ) : (
                      <QrCode className="h-8 w-8 text-gray-400" />
                    )}
                  </div>

                  <Button
                    onClick={generateValidationLink}
                    disabled={isGeneratingQR || !canGenerate}
                    className={`h-8 px-3 py-2 text-xs text-white ${canGenerate
                      ? "bg-gradient-to-r from-baseColor/80 via-baseColor/90 to-baseColor/80 hover:bg-baseColor"
                      : "cursor-not-allowed bg-gray-400"
                      }`}
                  >
                    {isGeneratingQR ? (
                      <>
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        Generando...
                      </>
                    ) : !canGenerate ? (
                      <>
                        <Clock className="mr-1 h-3 w-3" />
                        Espera {formatTimeRemaining(timeRemaining)}
                      </>
                    ) : (
                      <>
                        <QrCode className="mr-1 h-3 w-3" />
                        Generar QR
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {validationLink && (
            <div className="mx-3 mt-4 rounded-lg border border-baseColor/20 bg-baseColor/5 p-3">
              <p className="mb-1 text-xs font-medium text-baseColor">
                Link de validación:
              </p>
              <p className="break-all rounded border bg-white p-2 font-mono text-xs text-baseColor/80">
                <a href={validationLink} target="_blank" rel="noreferrer">
                  {validationLink}
                </a>
              </p>
              <p className="mt-1 text-xs text-baseColor/80">
                ⏱️ Válido por 15 minutos
              </p>
            </div>
          )}
        </Card>
      </div>
      <footer className="w-full bg-slate-950 py-4">
        <div className="container mx-auto flex flex-col items-center justify-between gap-2 px-4 md:flex-row">
          <p className="text-center text-xs text-gray-400 md:text-left">
            © {new Date().getFullYear()} SchoMetrics. Todos los derechos
            reservados.
          </p>
          <div className="flex gap-3">
            <Link
              href="https://schometrics.website/terminos"
              className="text-xs text-gray-400"
            >
              Términos
            </Link>
            <Link
              href="https://schometrics.website/privacidad"
              className="text-xs text-gray-400"
            >
              Privacidad
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
