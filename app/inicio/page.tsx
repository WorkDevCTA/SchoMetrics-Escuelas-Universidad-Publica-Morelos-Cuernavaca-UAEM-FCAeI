"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Gift,
  Leaf,
  User,
  BookOpen,
  Activity,
  Award,
  CheckCircle,
  BarChart2,
  GraduationCap,
  Trophy,
  Map,
  BarChart2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserProfileData } from "@/types/types";
import Image from "next/legacy/image";
import toast from "react-hot-toast";
import DashboardLayout from "../components/DashboardLayout";
import { Badge } from "@/components/ui/badge";

export default function Inicio() {
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfileData | null>(null); // Inicializar como null para manejar mejor el estado de carga
  const [greeting, setGreeting] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setGreeting(getGreeting());
    const timeout = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(timeout);
  }, []);

  function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "¡Buenos días!";
    if (hour >= 12 && hour < 19) return "¡Buenas tardes!";
    return "¡Buenas noches!";
  }

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true); // Iniciar carga
      try {
        const userDataResponse = await fetch("/api/profile");
        if (!userDataResponse.ok) {
          if (userDataResponse.status === 401) {
            // Manejar caso de no autorizado
            toast.error("Sesión inválida. Por favor, inicia sesión de nuevo.");
            return; // Salir temprano si no está autorizado
          }
          throw new Error("Error al obtener perfil de usuario");
        }
        const userData: UserProfileData = await userDataResponse.json();
        setProfile(userData); // Establecer perfil
      } catch (error) {
        console.error("Error al cargar datos iniciales en layout:", error);
        // No redirigir aquí para evitar bucles si la página de login también usa este layout
        // o si hay errores intermitentes. El estado !profile se usará para mostrar un loader.
      } finally {
        setIsLoading(false); // Finalizar carga
      }
    };
    fetchInitialData();
  }, []); // Dependencia en pathname para re-fetch notificaciones al navegar (opcional)

  const features = [
    {
      icon: Leaf,
      title: "Actividades",
      description: "Registra tus actividades ambientales para ganar EcoPoints",
      color: "bg-green-100 text-emerald-700",
      url: "/actividades",
    },
    {
      icon: BarChart2,
      title: "Estadísticas",
      description:
        "Visualiza tu progreso y el impacto positivo ambiental generado",
      color: "bg-teal-100 text-teal-700",
      url: "/estadisticas",
    },
    {
      icon: GraduationCap,
      title: "Educación",
      description:
        "Aprende sobre sostenibilidad con contenido educativo diverso",
      color: "bg-blue-100 text-blue-700",
      url: "/educacion",
    },
    {
      icon: Gift,
      title: "Recompensas",
      description: "Canjea tus EcoPoints por increíbles recompensas",
      color: "bg-amber-100 text-amber-700",
      url: "/recompensas",
    },
    {
      icon: Award,
      title: "Insignias",
      description: "Desbloquea insignias especiales por tus logros ambientales",
      color: "bg-yellow-100 text-yellow-700",
      url: "/insignias",
    },
    {
      icon: Trophy,
      title: "Marcadores",
      description: "Compite sanamente con otros participantes de SchoMetrics",
      color: "bg-purple-100 text-indigo-700",
      url: "/marcadores",
    },
    {
      icon: Map,
      title: "Centros de Acopio",
      description:
        "Encuentra centros de reciclaje y acopio cercanos a tu ubicación",
      color: "bg-cyan-100 text-cyan-700",
      url: "/centros-de-acopio",
    },
    {
      icon: User,
      title: "Perfil",
      description: "Personaliza tu perfil y gestiona tu información personal",
      color: "bg-gray-100 text-gray-700",
      url: "/perfil",
    },
  ];

  const benefits = [
    "Gamificación con sistema de EcoPoints",
    "Seguimiento de impacto ambiental real",
    "Contenido educativo especializado",
    "Comunidad estudiantil comprometida",
    "Recompensas por acciones sostenibles",
    "Herramientas de medición y análisis",
  ];

  return (
    <DashboardLayout>
      <div className="mt-28 w-full rounded-xl bg-white shadow-md md:mt-20 lg:mt-8">
        <div className="flex w-full items-center justify-end gap-4 rounded-xl bg-white px-4 py-2 pt-5">
          <div className="mb-5 flex w-full items-center justify-between bg-white">
            <Link
              href="/"
              className="flex flex-col items-center justify-center gap-2"
            >
              <Image
                src="/logo.png"
                alt="logo"
                width={150}
                height={70}
                priority
              />
              <span className="text-md font-bold text-schoMetricsBaseColor">
                SchoMetrics
              </span>
            </Link>
            <Image
              src="/fcaei-logo.svg"
              alt="fcaei-logo"
              width={100}
              height={100}
              priority
            />
          </div>
        </div>
        <div className="flex w-full items-center justify-start gap-4 rounded-md bg-white px-4 py-2 pt-5">
          <div className="mb-4 flex flex-col gap-2 pl-5 text-lg font-bold text-gray-600">
            {greeting}
            <span className="font-semibold uppercase text-baseColor">
              {profile?.name}
            </span>
            <span className="font-normal text-gray-600">
              Nos alegra verte aquí.
            </span>
          </div>
        </div>

        {/* Platform Overview */}
        <section className="rounded-lg bg-white px-4 py-20">
          <div className="container mx-auto px-4">
            <div className="mb-16 space-y-6 text-center">
              <h2 className="text-3xl font-bold text-gray-600 lg:text-5xl">
                ¿Cómo funciona{" "}
                <span className="text-schoMetricsBaseColor">SchoMetrics</span>?
              </h2>
              <p className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-600">
                Nuestra plataforma integra gamificación, educación y medición de
                impacto para crear una experiencia completa de aprendizaje
                ambiental en el entorno escolar.
              </p>
            </div>

            <div className="mb-16 grid gap-8 lg:grid-cols-2 xl:grid-cols-4">
              <Card className="border-2 border-[#00B38C]/20 transition-colors hover:border-[#00B38C]/40">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#00B38C]/10">
                    <Leaf className="h-8 w-8 text-green-500" />
                  </div>
                  <CardTitle className="text-green-500">
                    1. Registra Actividades
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-600">
                    Los estudiantes registran sus actividades ambientales
                    siguiendo nuestro manual de actividades permitidas y ganan
                    EcoPoints por cada acción positiva.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-200 transition-colors hover:border-blue-400">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                    <BookOpen className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-blue-600">
                    2. Aprende sobre Sostenibilidad Ambiental
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-600">
                    Visita la sección Educación y aprende sobre temas
                    relacionados al medio ambiente y a la sostenibilidad.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2 border-teal-200 transition-colors hover:border-teal-400">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
                    <BarChart2Icon className="h-8 w-8 text-teal-600" />
                  </div>
                  <CardTitle className="text-teal-600">
                    2. Mide tu Impacto
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-600">
                    Visualiza estadísticas detalladas de tu progreso personal y
                    el impacto ambiental colectivo generado por toda la
                    comunidad escolar.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-amber-200 transition-colors hover:border-amber-400">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                    <Gift className="h-8 w-8 text-amber-500" />
                  </div>
                  <CardTitle className="text-amber-500">
                    3. Obtén Recompensas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-600">
                    Canjea tus EcoPoints por recompensas increíbles, desbloquea
                    insignias especiales y compite sanamente con otros
                    estudiantes.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col items-center justify-center rounded-lg bg-gradient-to-r from-baseColor/5 to-sky-50 p-4 lg:p-12">
              <div className="grid items-center gap-12 lg:grid-cols-2">
                <div className="space-y-6">
                  <h3 className="text-start text-xl font-bold text-gray-600 lg:text-3xl">
                    Beneficios de usar SchoMetrics
                  </h3>
                  <div className="space-y-4">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <CheckCircle className="h-6 w-6 flex-shrink-0 text-baseColor" />
                        <span className="font-medium text-gray-500">
                          {benefit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900">
                        Tu Progreso Semanal
                      </h4>
                      <Badge className="bg-[#00B38C]/10 text-[#00B38C] hover:bg-teal-100">
                        +15 EcoPoints
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Reciclaje</span>
                        <div className="h-2 w-24 rounded-full bg-gray-200">
                          <div className="h-2 w-20 rounded-full bg-[#00B38C]"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Ahorro de Agua
                        </span>
                        <div className="h-2 w-24 rounded-full bg-gray-200">
                          <div className="h-2 w-16 rounded-full bg-blue-500"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Educación</span>
                        <div className="h-2 w-24 rounded-full bg-gray-200">
                          <div className="w-18 h-2 rounded-full bg-purple-500"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="px-4 py-20">
          <div className="container mx-auto px-4">
            <div className="mb-16 space-y-6 text-center">
              <Badge className="border-baseColor/20 bg-baseColor/10 text-baseColor hover:bg-white">
                <Activity className="mr-2 h-4 w-4" />
                Funcionalidades
              </Badge>
              <h2 className="text-3xl font-bold text-gray-600 lg:text-5xl">
                Explora todas las{" "}
                <span className="text-baseColor">secciones</span>
              </h2>
              <p className="mx-auto max-w-3xl text-xl text-gray-600">
                Descubre cada una de las herramientas y secciones que
                SchoMetrics pone a tu disposición para maximizar tu impacto
                ambiental positivo.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {features.map((feature, index) => (
                <Link key={index} href={feature.url}>
                  <Card
                    key={index}
                    className="group border-0 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                  >
                    <CardHeader className="pb-4 text-center">
                      <div
                        className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${feature.color} transition-transform group-hover:scale-110`}
                      >
                        <feature.icon className="h-8 w-8" />
                      </div>
                      <CardTitle className="text-lg font-bold text-gray-600">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <CardDescription className="text-center leading-relaxed text-gray-600">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="flex flex-col items-center justify-center rounded-b-xl bg-gradient-to-tl from-baseColor via-blue-600 to-sky-500 py-20 text-white">
          <div className="p-4 text-center">
            <div className="mx-auto max-w-4xl space-y-8">
              <h2 className="text-3xl font-bold lg:text-5xl">
                ¿Listo para hacer la diferencia?
              </h2>
              <p className="text-xl leading-relaxed text-teal-100 lg:text-2xl">
                Registra tus actividades ambientales, obtén EcoPoints y canjea
                increíbles recompensas
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link href="/actividades">
                  <Button
                    size="lg"
                    className="bg-white font-semibold text-baseColor hover:bg-blue-50"
                  >
                    <Leaf className="mr-2 h-5 w-5" />
                    Comenzar mi Impacto
                  </Button>
                </Link>
                <Link href="/actividades/manual-de-actividades-permitidas">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white bg-transparent font-semibold text-white hover:bg-emerald-50 hover:text-baseColor"
                  >
                    <BookOpen className="mr-2 h-5 w-5" />
                    Ver Manual de Actividades
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
