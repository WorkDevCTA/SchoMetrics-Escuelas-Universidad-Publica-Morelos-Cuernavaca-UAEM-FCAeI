"use client";

import { useState, useEffect } from "react";
import {
  Gift,
  Search,
  Filter,
  Tag,
  Award,
  Ticket,
  ShoppingBag,
  Calendar,
  Sparkles,
  Star,
  Zap,
  Crown,
  Heart,
  FileDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import Image from "next/legacy/image";
import DashboardLayout from "../components/DashboardLayout";
import Link from "next/link";
import { luckiestGuy } from "@/fonts/fonts";
import ListaDeRecompensas from "../components/ListaDeRecompensas";
import useUserSession from "@/hooks/useUserSession";
import { RewardAnimation } from "./components/RewardAnimation";

interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  available: boolean;
  quantity?: number;
  expiresAt?: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

interface Redemption {
  id: string;
  rewardId: string;
  userId: string;
  rewardTitle: string;
  rewardDesc: string;
  rewardPoints: number;
  rewardQuantity: number;
  rewardExpiresAt: Date;
  rewardCategory: string;
  rewardCreatAt: Date,
  createdAt: string;
}

export const redeemedDate = new Date();
export const rewardLimitDate = new Date();
rewardLimitDate.setDate(rewardLimitDate.getDate() + 15); // Disponible durante 15 días para usar la recompensa canjeada con respecto a la Fecha en que fue canjeada.

export default function RewardsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redeemedRewards, setRedeemedRewards] = useState<Redemption[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const user = useUserSession();
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Estados para la animación
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationData, setAnimationData] = useState<{
    category: string;
    rewardTitle: string;
    pointsCost: number;
  } | null>(null);

  // Cargar datos del usuario y recompensas
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Obtener puntos del usuario desde la sesión
        const sessionRes = await fetch("/api/auth/session");
        const sessionData = await sessionRes.json();
        if (sessionData && sessionData.user) {
          setUserPoints(sessionData.user.points || 0);
        }

        // Obtener recompensas disponibles
        const rewardsRes = await fetch("/api/rewards");
        const rewardsData = await rewardsRes.json();
        if (rewardsData) {
          setRewards(rewardsData);
        }

        // Obtener recompensas canjeadas por el usuario
        const redeemedRes = await fetch("/api/rewards/redeemed");
        const redeemedData = await redeemedRes.json();
        if (redeemedData) {
          setRedeemedRewards(redeemedData);
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
        toast.error(
          "No se pudieron cargar los datos. Intenta de nuevo más tarde",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Función para obtener el diseño según la categoría
  const getCategoryDesign = (category: string) => {
    switch (category) {
      case "discount":
        return {
          icon: <Tag className="h-6 w-6" />,
          gradient: "from-blue-500 via-blue-600 to-indigo-700",
          bgPattern: "bg-gradient-to-br from-blue-50 to-indigo-100",
          iconBg: "bg-gradient-to-r from-blue-500 to-indigo-600",
          textColor: "text-blue-700",
          badgeColor: "bg-blue-100 text-blue-800",
          glowColor: "shadow-blue-500/25",
          decorativeIcon: <Sparkles className="h-4 w-4" />,
        };
      case "workshop":
        return {
          icon: <Calendar className="h-6 w-6" />,
          gradient: "from-amber-500 via-orange-500 to-red-500",
          bgPattern: "bg-gradient-to-br from-amber-50 to-orange-100",
          iconBg: "bg-gradient-to-r from-amber-500 to-orange-600",
          textColor: "text-amber-700",
          badgeColor: "bg-amber-100 text-amber-800",
          glowColor: "shadow-amber-500/25",
          decorativeIcon: <Star className="h-4 w-4" />,
        };
      case "product":
        return {
          icon: <ShoppingBag className="h-6 w-6" />,
          gradient: "from-emerald-500 via-green-600 to-teal-700",
          bgPattern: "bg-gradient-to-br from-emerald-50 to-green-100",
          iconBg: "bg-gradient-to-r from-emerald-500 to-green-600",
          textColor: "text-emerald-700",
          badgeColor: "bg-emerald-100 text-emerald-800",
          glowColor: "shadow-emerald-500/25",
          decorativeIcon: <Gift className="h-4 w-4" />,
        };
      case "recognition":
        return {
          icon: <Award className="h-6 w-6" />,
          gradient: "from-purple-500 via-violet-600 to-purple-700",
          bgPattern: "bg-gradient-to-br from-purple-50 to-violet-100",
          iconBg: "bg-gradient-to-r from-purple-500 to-violet-600",
          textColor: "text-purple-700",
          badgeColor: "bg-purple-100 text-purple-800",
          glowColor: "shadow-purple-500/25",
          decorativeIcon: <Crown className="h-4 w-4" />,
        };
      case "experience":
        return {
          icon: <Ticket className="h-6 w-6" />,
          gradient: "from-pink-500 via-rose-500 to-red-500",
          bgPattern: "bg-gradient-to-br from-pink-50 to-rose-100",
          iconBg: "bg-gradient-to-r from-pink-500 to-rose-600",
          textColor: "text-pink-700",
          badgeColor: "bg-pink-100 text-pink-800",
          glowColor: "shadow-pink-500/25",
          decorativeIcon: <Heart className="h-4 w-4" />,
        };
      default:
        return {
          icon: <Gift className="h-6 w-6" />,
          gradient: "from-green-500 via-emerald-600 to-teal-700",
          bgPattern: "bg-gradient-to-br from-green-50 to-emerald-100",
          iconBg: "bg-gradient-to-r from-green-500 to-emerald-600",
          textColor: "text-green-700",
          badgeColor: "bg-green-100 text-green-800",
          glowColor: "shadow-green-500/25",
          decorativeIcon: <Zap className="h-4 w-4" />,
        };
    }
  };

  // Función para formatear la fecha
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-MX", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  // Filtrar recompensas
  const filteredRewards = rewards.filter((reward) => {
    const matchesSearch =
      reward.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reward.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "available" && reward.available) ||
      (filter === "affordable" && reward.pointsCost <= userPoints) ||
      reward.category === filter;

    return matchesSearch && matchesFilter;
  });

  const handleRedeem = async (reward: Reward) => {
    if (userPoints < reward.pointsCost) {
      toast.error("Puntos insuficientes");
      toast.error(
        `Necesitas ${reward.pointsCost - userPoints} puntos más para canjear esta recompensa`,
      );
      return;
    }

    try {
      // Llamar a la API para canjear la recompensa
      const response = await fetch("/api/rewards/redeem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rewardId: reward.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al canjear la recompensa");
      }



      // Actualizar los puntos del usuario
      setUserPoints((prev) => prev - reward.pointsCost);

      // Actualizar la lista de recompensas canjeadas
      setRedeemedRewards((prev) => [
        {
          id: data.id,
          rewardId: reward.id,
          userId: data.userId,
          rewardTitle: reward.title,
          rewardDesc: reward.description,
          rewardPoints: reward.pointsCost,
          rewardQuantity: reward.quantity || 1,
          rewardExpiresAt: reward.expiresAt ? new Date(reward.expiresAt) : null,
          rewardCategory: reward.category,
          rewardCreatAt: reward.createdAt,
          createdAt: new Date().toISOString(),
          redeemedAt: redeemedDate.toISOString(),
          rewardLimitToUse: rewardLimitDate.toISOString(),
          ...data,
        },
        ...prev,
      ]);

      // Actualizar la disponibilidad de la recompensa si es necesario
      if (reward.quantity !== null) {
        setRewards((prev) =>
          prev.map((r) =>
            r.id === reward.id ? { ...r, available: false, quantity: 0 } : r,
          ),
        );
      } else if (reward.quantity !== null) {
        setRewards((prev) =>
          prev.map((r) =>
            r.id === reward.id ? { ...r, quantity: (r.quantity || 0) - 1 } : r,
          ),
        );
      }

      // ¡MOSTRAR LA ANIMACIÓN!
      setAnimationData({
        category: reward.category,
        rewardTitle: reward.title,
        pointsCost: reward.pointsCost,
      });
      setShowAnimation(true);

      // Toast de éxito (opcional, ya que la animación es más atractiva)
      toast.success("¡Recompensa canjeada exitosamente!");
    } catch (error) {
      console.error("Error al canjear recompensa:", error);
      toast.error("Error al canjear la recompensa");
    }
  };

  const handleCloseAnimation = () => {
    setShowAnimation(false);
    setAnimationData(null);
  };

  return (
    <DashboardLayout>
      <div className="m-5 flex flex-col gap-8">
        {/* Header mejorado */}
        <div className="mt-16 flex flex-col gap-3 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-8 text-white shadow-2xl lg:mt-0">
          <h1 className="flex flex-col items-center gap-3 text-3xl font-bold tracking-tight md:flex-row">
            <Gift className="h-10 w-10 animate-bounce" />
            Recompensas
          </h1>
          <p className="text-center text-lg opacity-90 md:text-start">
            Canjea tus puntos por recompensas exclusivas
          </p>
        </div>

        <div className="flex flex-col justify-between gap-4 md:flex-row">
          <div className="flex flex-1 flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar recompensas..."
                className="rounded-lg border-2 pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full rounded-lg bg-white md:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filtrar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="available">Disponibles</SelectItem>
                <SelectItem value="affordable">Puedo canjear</SelectItem>
                <SelectItem value="discount">Descuentos</SelectItem>
                <SelectItem value="workshop">Talleres</SelectItem>
                <SelectItem value="product">Productos</SelectItem>
                <SelectItem value="recognition">Reconocimientos</SelectItem>
                <SelectItem value="experience">Experiencias</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Points display mejorado */}
          <div
            className="relative h-[44px] w-[140px] bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage:
                "url('https://zibiwzddvrpjapmmgyeu.supabase.co/storage/v1/object/public/schometrics-for-schools/schometrics-resources/media/ecopoints-badge.svg')",
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="text-md ml-10 animate-heartbeat pt-1 font-bold tracking-wide text-white"
                style={{
                  textShadow: "2px 2px 4px rgba(0,0,0,0.9)",
                }}
              >
                {userPoints.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <Tabs defaultValue="available" className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-2 rounded-xl bg-gray-100 p-1">
            <TabsTrigger
              value="available"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              Disponibles
            </TabsTrigger>
            <TabsTrigger
              value="redeemed"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              Canjeadas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-6">
            {isLoading ? (
              <div className="flex h-40 items-center justify-center">
                <div className="relative">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-baseColor/30 border-t-baseColor"></div>
                  <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full border-4 border-baseColor/40 opacity-20"></div>
                </div>
              </div>
            ) : filteredRewards.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                {filteredRewards.map((reward) => {
                  const design = getCategoryDesign(reward.category);
                  const canAfford = userPoints >= reward.pointsCost;
                  const isHovering = hoveredCard === reward.id;

                  return (
                    <Card
                      key={reward.id}
                      className={`group relative transform overflow-hidden border-0 shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${design.bgPattern} ${isHovering ? `${design.glowColor} shadow-2xl` : ""}`}
                      onMouseEnter={() => setHoveredCard(reward.id)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      {/* Decorative background elements */}
                      <div className="absolute right-0 top-0 h-32 w-32 opacity-10">
                        <div
                          className={`h-full w-full bg-gradient-to-br ${design.gradient} -translate-y-16 translate-x-16 transform rounded-full transition-transform duration-700 group-hover:scale-150`}
                        ></div>
                      </div>

                      {/* Availability badge */}
                      {!reward.available && (
                        <div className="absolute right-4 top-4 z-10">
                          <Badge
                            variant="secondary"
                            className="bg-gray-500 text-white"
                          >
                            Canjeado
                          </Badge>
                        </div>
                      )}

                      {/* Affordable indicator */}
                      {canAfford && reward.available && (
                        <div className="flex justify-end p-4 pb-0">
                          <Badge
                            className={`${design.badgeColor} animate-pulse hover:bg-transparent`}
                          >
                            ¡Puedes canjearlo!
                          </Badge>
                        </div>
                      )}

                      <CardHeader className="relative z-10 pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div
                              className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-r ${design.iconBg} text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}
                            >
                              {design.icon}
                            </div>
                            <div className="flex-1">
                              <CardTitle
                                className={`text-xl font-bold ${design.textColor} transition-colors group-hover:text-opacity-80`}
                              >
                                {reward.title}
                              </CardTitle>
                              <div className="mt-1 flex items-center gap-1 opacity-60">
                                {design.decorativeIcon}
                                <span className="text-sm font-medium capitalize">
                                  {reward.category === "discount"
                                    ? "Descuento"
                                    : reward.category === "workshop"
                                      ? "Taller"
                                      : reward.category === "product"
                                        ? "Producto"
                                        : reward.category === "recognition"
                                          ? "Reconocimiento"
                                          : reward.category === "experience"
                                            ? "Experiencia"
                                            : "Recompensa"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="relative z-10 pb-6">
                        <div className="my-2 h-[100px] flex overflow-auto bg-white/50 p-2 rounded-md">
                          <p className="mb-4 leading-relaxed text-gray-700 font-bold">
                            {reward.description}
                          </p>
                        </div>
                        <div className="space-y-2">
                          {reward.quantity && (
                            <div className="flex items-center justify-between rounded-lg bg-white/50 p-2">
                              <span className="text-sm font-medium text-gray-600">
                                Disponibles:
                              </span>
                              <Badge variant="outline" className="font-bold">
                                {reward.quantity}
                              </Badge>
                            </div>
                          )}

                          {reward.expiresAt && (
                            <div className="flex items-center justify-between rounded-lg bg-white/50 p-2">
                              <span className="text-sm font-medium text-gray-600">
                                Válido hasta:
                              </span>
                              <Badge variant="outline" className="font-bold">
                                {formatDate(reward.expiresAt)}
                              </Badge>
                            </div>
                          )}
                          <div className="flex items-center justify-between rounded-lg bg-white/50 p-2">
                            <span className="text-sm font-medium text-gray-600">
                              Creada el:
                            </span>
                            <Badge variant="outline" className="font-bold">
                              {formatDate(reward.createdAt)}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>

                      <CardFooter className="relative z-10 flex flex-col gap-4 border-t border-white/20 bg-white/30 pt-6 backdrop-blur-sm">
                        {/* Points cost display */}
                        <div className="flex w-full items-center justify-center gap-3 rounded-xl bg-white/70 p-3 shadow-sm">
                          <Image
                            src="/eco_points_logo.png"
                            alt="eco_points_logo"
                            width={30}
                            height={30}
                            priority
                            draggable={false}
                          />
                          <span className="font-bold text-[#17d627]">
                            EcoPoints:
                          </span>
                          <span
                            className={`${luckiestGuy.className} text-2xl font-bold ${design.textColor}`}
                          >
                            {reward.pointsCost.toLocaleString()}
                          </span>
                        </div>

                        {/* Redeem button */}
                        <Button
                          onClick={() => handleRedeem(reward)}
                          disabled={
                            userPoints < reward.pointsCost || !reward.available
                          }
                          className={`w-full transform rounded-xl py-3 text-lg font-bold transition-all duration-300 hover:scale-105 ${canAfford && reward.available
                            ? `bg-gradient-to-r ${design.gradient} text-white shadow-lg hover:shadow-xl`
                            : "cursor-not-allowed bg-gray-400 text-gray-600"
                            }`}
                        >
                          {!reward.available
                            ? "Canjeado"
                            : userPoints < reward.pointsCost
                              ? "Puntos insuficientes"
                              : "🎁 Canjear Ahora"}
                        </Button>

                        {/* Points needed indicator */}
                        {userPoints < reward.pointsCost && reward.available && (
                          <div className="text-center">
                            <p className="text-sm text-gray-600">
                              Te faltan{" "}
                              <span className="font-bold text-red-600">
                                {(
                                  reward.pointsCost - userPoints
                                ).toLocaleString()}
                              </span>{" "}
                              puntos
                            </p>
                          </div>
                        )}
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center">
                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
                  <Search className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-700">
                  No se encontraron recompensas
                </h3>
                <p className="text-gray-500">
                  Intenta cambiar los filtros o vuelve más tarde
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="redeemed">
            <div className="flex w-full flex-col items-center justify-center gap-6">
              <div className="flex w-full flex-col items-center justify-center">
                <div className="flex w-full flex-col items-center justify-center rounded-xl bg-gradient-to-br from-baseColor/20 via-white to-baseColor/20 p-6 text-center shadow-lg md:w-[500px] lg:w-[700px]">
                  <div className="mb-4 rounded-full bg-baseColor p-3">
                    <FileDown className="h-8 w-8 text-white" />
                  </div>
                  <p className="mb-4 leading-relaxed text-gray-700">
                    Recuerda que al descargar el
                    <span className="font-semibold text-baseColor">
                      {" "}
                      Reporte de Trayectoria{" "}
                    </span>
                    puedes ver tu historial completo de recompensas
                  </p>
                  <Link href="/estadisticas#reporte">
                    <Button className="transform rounded-xl bg-baseColor/80 px-6 py-3 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:to-baseColor hover:shadow-xl">
                      <FileDown className="mr-2 h-5 w-5 animate-bounce" />
                      Obtener Reporte
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="w-full">
                <ListaDeRecompensas userId={user?.session?.id as string} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Componente de animación */}
      {animationData && (
        <RewardAnimation
          isVisible={showAnimation}
          category={animationData.category}
          rewardTitle={animationData.rewardTitle}
          pointsCost={animationData.pointsCost}
          onClose={handleCloseAnimation}
        />
      )}
    </DashboardLayout>
  );
}
