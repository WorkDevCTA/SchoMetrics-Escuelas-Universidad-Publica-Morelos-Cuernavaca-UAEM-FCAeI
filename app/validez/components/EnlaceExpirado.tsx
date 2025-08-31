"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Leaf, RefreshCw, AlertCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function EnlaceExpirado() {
  const [isVisible, setIsVisible] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-background via-card to-muted p-4">
      {/* Animated background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-leaf-sway absolute left-10 top-20 opacity-20">
          <Leaf className="h-16 w-16 text-primary" />
        </div>
        <div
          className="animate-float absolute right-20 top-40 opacity-15"
          style={{ animationDelay: "1s" }}
        >
          <Leaf className="h-12 w-12 text-accent" />
        </div>
        <div
          className="animate-leaf-sway absolute bottom-32 left-1/4 opacity-10"
          style={{ animationDelay: "2s" }}
        >
          <Leaf className="h-20 w-20 text-primary" />
        </div>
        <div
          className="animate-float absolute bottom-20 right-1/3 opacity-20"
          style={{ animationDelay: "0.5s" }}
        >
          <Leaf className="h-14 w-14 text-accent" />
        </div>
      </div>

      <div
        className={`w-full max-w-md transform transition-all duration-1000 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
      >
        {/* Notification Banner */}
        <div className="animate-pulse-glow mb-6">
          <Card className="border-2 border-destructive/20 bg-destructive/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-6 w-6 animate-pulse text-destructive" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-destructive">
                    ¡Enlace Expirado!
                  </h3>
                  <p className="mt-1 text-xs text-destructive/80">
                    Tu enlace de verificación ya no es válido
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Card */}
        <Card className="border-0 bg-card/80 shadow-2xl backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            {/* Icon */}
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="animate-float flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <Clock className="h-10 w-10 animate-spin text-primary" />
                </div>
                <div className="absolute -right-2 -top-2 flex h-6 w-6 animate-ping items-center justify-center rounded-full bg-destructive">
                  <span className="text-xs font-bold text-destructive-foreground">
                    !
                  </span>
                </div>
              </div>
            </div>

            {/* Title */}
            <h1 className="mb-3 font-sans text-2xl font-bold text-foreground">
              Enlace de Validación Expirado
            </h1>

            {/* Description */}
            <p className="mb-6 leading-relaxed text-muted-foreground">
              Tu enlace de verificación ha caducado por motivos de seguridad. No
              te preocupes, puedes solicitar uno nuevo fácilmente descargando el{" "}
              <span className="font-bold text-baseColor">
                Reporte de Trayectoria
              </span>{" "}
              o visita la sección{" "}
              <b>
                <a
                  href="https://uaem-fcaei.schometrics.website/mi-carnet"
                  className="text-blue-400 hover:text-blue-500 hover:underline"
                >
                  "Mi Carnet"
                </a>
              </b>{" "}
              para generar uno nuevo.
            </p>

            {/* Sustainability Message */}
            <div className="mb-8 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <div className="mb-2 flex items-center justify-center gap-2">
                <ShieldCheck className="animate-leaf-sway h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-primary">
                  Compromiso y Seguridad
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Validamos enlaces por tiempo limitado para mantener la seguridad
                en la visibilidad de tus datos.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-3">
              {/* Añadir aquí al enlace correspondiente */}
              <Link href="https://uaem-fcaei.schometrics.website/estadisticas">
                <Button
                  disabled={isResending}
                  className="w-full bg-primary py-3 font-medium text-primary-foreground transition-all duration-200 hover:scale-105 hover:bg-primary/90"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Enviando nuevo enlace...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Solicitar Nuevo Enlace
                    </>
                  )}
                </Button>
              </Link>

              <Link href="https://uaem-fcaei.schometrics.website/">
                <Button
                  variant="outline"
                  className="w-full border-border font-bold text-schoMetricsBaseColor/80 transition-all duration-200 hover:bg-muted hover:text-schoMetricsBaseColor"
                >
                  <Image
                    src="/logo.png"
                    alt="logo.png"
                    width={25}
                    height={25}
                    priority
                  />
                  Ir a SchoMetrics
                </Button>
              </Link>
            </div>

            {/* Help Text */}
            <p className="mt-6 text-xs text-muted-foreground">
              ¿Necesitas ayuda? Contacta a nuestro equipo de soporte
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
