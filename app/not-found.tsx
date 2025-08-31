import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  Home,
  BookOpen,
  Leaf,
  Gift,
  Trophy,
} from "lucide-react";
import Image from "next/image";
export default function NotFound() {
  return (
    <div className="not-found flex min-h-screen items-center justify-center p-4">
      <div className="mx-auto max-w-2xl space-y-8 text-center">
        {/* Header with Logo */}
        <div className="space-y-4">
          <div className="flex items-end justify-center space-x-3 text-center">
            <Image
              src="/logo-white.png"
              alt="schometrics-logo"
              width={150}
              height={150}
              priority
            />

            <h1 className="text-xl font-bold text-white md:text-2xl lg:text-3xl">
              SchoMetrics
            </h1>
          </div>
          <div className="space-y-2">
            <h2 className="animate-pulse text-8xl font-bold text-blue-500">
              404
            </h2>
            <h3 className="text-2xl font-semibold text-white">
              ¡Ups! No pudimos encontrar esa página
            </h3>
            <p className="text-lg text-slate-300">
              Pero podemos ayudarte a explorar nuestras secciones ambientales
            </p>
          </div>
        </div>

        {/* Environmental Illustration */}
        <div className="relative">
          <div className="mx-auto flex h-64 w-64 items-center justify-center rounded-full bg-gradient-to-br from-primary/40 to-accent/30">
            <div className="relative">
              {/* Tree illustration using CSS */}
              <div className="relative h-32 w-32">
                {/* Tree trunk */}
                <div className="absolute bottom-0 left-1/2 h-12 w-4 -translate-x-1/2 transform rounded-sm bg-amber-600"></div>
                {/* Tree foliage */}
                <div className="absolute bottom-8 left-1/2 h-24 w-24 -translate-x-1/2 transform rounded-full bg-primary opacity-80"></div>
                <div className="absolute bottom-12 left-1/2 h-20 w-20 -translate-x-1/2 transform rounded-full bg-accent opacity-70"></div>
                <div className="absolute bottom-12 left-1/2 h-20 w-20 -translate-x-1/2 transform rounded-full bg-secondary opacity-70"></div>
                {/* Leaves floating */}
                <div
                  className="absolute -right-4 -top-2 h-3 w-3 animate-bounce rounded-full bg-primary"
                  style={{ animationDelay: "0s" }}
                ></div>
                <div
                  className="absolute -left-2 -top-4 h-2 w-2 animate-bounce rounded-full bg-accent"
                  style={{ animationDelay: "0.5s" }}
                ></div>
                <div
                  className="absolute -top-1 right-8 h-2 w-2 animate-bounce rounded-full bg-secondary"
                  style={{ animationDelay: "1s" }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="mx-auto grid max-w-lg grid-cols-1 gap-4 md:grid-cols-2">
          <Card className="group cursor-pointer transition-shadow hover:shadow-lg">
            <Link href="/inicio">
              <CardContent className="space-y-3 p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <Home className="h-6 w-6 text-schoMetricsBaseColor" />
                </div>
                <h4 className="font-semibold text-schoMetricsBaseColor">
                  Inicio
                </h4>
                <p className="text-sm text-muted-foreground">
                  Volver a la página principal
                </p>
              </CardContent>
            </Link>
          </Card>
          <Card className="group cursor-pointer transition-shadow hover:shadow-lg">
            <Link href="/educacion">
              <CardContent className="space-y-3 p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <BookOpen className="h-6 w-6 text-blue-800" />
                </div>
                <h4 className="font-semibold text-blue-800">Educación</h4>
                <p className="text-sm text-muted-foreground">
                  Explorar materiales educativos
                </p>
              </CardContent>
            </Link>
          </Card>

          <Card className="group cursor-pointer transition-shadow hover:shadow-lg">
            <Link href="/actividades">
              <CardContent className="space-y-3 p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <Leaf className="h-6 w-6 text-green-500 text-primary" />
                </div>
                <h4 className="font-semibold text-green-500">Actividades</h4>
                <p className="text-sm text-muted-foreground">
                  Sube una actividad ambiental
                </p>
              </CardContent>
            </Link>
          </Card>

          <Card className="group cursor-pointer transition-shadow hover:shadow-lg">
            <Link href="/recompensas">
              <CardContent className="space-y-3 p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <Gift className="h-6 w-6 text-orange-400 text-primary" />
                </div>
                <h4 className="font-semibold text-orange-400">Recompensas</h4>
                <p className="text-sm text-muted-foreground">
                  Canjea increíbles recompensas
                </p>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/inicio"
            className="flex items-center justify-center gap-2 rounded-md bg-schoMetricsBaseColor/80 px-4 py-2 text-white hover:bg-schoMetricsBaseColor"
          >
            <Home className="mr-2 h-5 w-5" />
            Volver al Inicio
          </Link>
          <Link
            href="/marcadores"
            className="flex items-center justify-center gap-2 rounded-md bg-purple-800 px-4 py-2 text-white hover:bg-purple-900"
          >
            <Trophy className="mr-2 h-4 w-4" />
            Ver Tabla de Líderes
          </Link>
        </div>

        {/* Footer Message */}
        <div className="border-t border-border pt-8">
          <p className="text-slate-300">
            <span className="font-semibold text-schoMetricsBaseColor">
              SchoMetrics
            </span>{" "}
            - Transformación educativa hacia la sostenibilidad ambiental
          </p>
          <div className="mt-4 flex justify-center space-x-4">
            <div className="flex h-8 w-8 animate-heartbeat cursor-pointer items-center justify-center rounded-full bg-primary/10 transition-colors hover:bg-primary/20">
              <Leaf className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
