"use client";

import { useState, useEffect } from "react";
import { Award, Loader2, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; //
import { Button } from "@/components/ui/button"; //
import BadgeCard from "./components/BadgeCard"; // Importar el nuevo componente
import { type BadgeApiResponseItem } from "@/app/api/badges/route"; //
import DashboardLayout from "../components/DashboardLayout";
import LoaderCircle from "../components/LoaderCircle";

export default function BadgesPage() {
  const [badges, setBadges] = useState<BadgeApiResponseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBadges = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/badges");
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error al obtener las insignias");
        }
        const data: BadgeApiResponseItem[] = await response.json();
        setBadges(data);
      } catch (err) {
        console.error("Error al cargar insignias:", err);
        setError(
          err instanceof Error ? err.message : "Ocurrió un error desconocido.",
        );
        setBadges([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBadges();
  }, []);

  return (
    <DashboardLayout>
      <div className="m-5 flex flex-col gap-8">
        <div className="mt-16 flex flex-col gap-3 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 p-8 text-white shadow-2xl lg:mt-0">
          <h1 className="flex flex-col items-center gap-3 text-center text-4xl font-bold tracking-tight md:flex-row">
            <Award className="h-10 w-10 animate-bounce" />
            Galería de Insignias
          </h1>
          <p className="text-center text-lg opacity-90 md:text-start">
            {" "}
            Descubre todas las insignias que puedes obtener y sigue
            contribuyendo al medio ambiente
          </p>
        </div>
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <LoaderCircle />
          </div>
        ) : error ? (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <ShieldAlert className="h-6 w-6" /> Error al Cargar Insignias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="mt-4 bg-red-600 hover:bg-red-700"
              >
                Reintentar
              </Button>
            </CardContent>
          </Card>
        ) : badges.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {badges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-10 text-center">
              <Award className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-medium text-muted-foreground">
                No hay insignias disponibles por el momento.
              </p>
              <p className="text-sm text-muted-foreground">
                Vuelve más tarde para ver nuevas insignias.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
