"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toZonedTime } from "date-fns-tz"
import { Tag, Calendar, ShoppingBag, Award, Ticket, Gift } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import LoaderCircle from "@/app/components/LoaderCircle"

interface Redemption {
  id: string
  rewardId: string
  userId: string
  createdAt: string
  redeemedAt: string
  rewardFolio: string
  rewardTitle: string
  rewardDesc: string
  rewardPoints: number
  rewardQuantity: number
  rewardExpiresAt: Date
  rewardCategory: string
  rewardCreatedAt: string
  rewardLimitToUse: Date
}

interface RedeemedRewardsProps {
  userId: string
}

const ListaDeRecompensas: React.FC<RedeemedRewardsProps> = ({ userId }) => {
  const [redeemedRewards, setRedeemedRewards] = useState<Redemption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const fetchRedeemedRewards = useCallback(async () => {
    if (!userId) return
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/validate-user/rewards/redeemed/${userId}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al cargar recompensas canjeadas")
      }
      const data: Redemption[] = await response.json()
      setRedeemedRewards(data)
      // console.log("Recompensas canjeadas cargadas:", data);
    } catch (error) {
      console.error("Error al cargar recompensas canjeadas:", error)
      setError(error instanceof Error ? error.message : "Ocurrió un error desconocido.")
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchRedeemedRewards()
  }, [fetchRedeemedRewards])

  const formatDate = (dateString: string | undefined, includeTime = true) => {
    if (!dateString) return "Fecha no disponible"
    const date = new Date(dateString)
    if (includeTime) {
      return format(date, "dd MMM, yyyy 'a las' HH:mm", { locale: es })
    }
    return format(date, "dd MMM, yyyy", { locale: es })
  }

  // Función para obtener el icono según la categoría
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "DISCOUNT":
        return <Tag className="h-5 w-5 text-blue-600" />
      case "WORKSHOP":
        return <Calendar className="h-5 w-5 text-amber-600" />
      case "PRODUCT":
        return <ShoppingBag className="h-5 w-5 text-green-600" />
      case "RECOGNITION":
        return <Award className="h-5 w-5 text-purple-600" />
      case "EXPERIENCE":
        return <Ticket className="h-5 w-5 text-pink-600" />
      default:
        return <Gift className="h-5 w-5 text-green-600" />
    }
  }

  const REWARD_CATEGORY_MAP: { [category: string]: string } = {
    DISCOUNT: "DESCUENTO",
    WORKSHOP: "TALLER",
    PRODUCT: "PRODUCTO",
    RECOGNITION: "RECONOCIMIENTO",
    EXPERIENCE: "EXPERIENCIA",
    OTHER: "OTRO",
  }

  const isRewardAvailable = (limitDate: Date): boolean => {
    const mexicoCityTimezone = "America/Mexico_City"
    const now = new Date()
    const nowInMexico = toZonedTime(now, mexicoCityTimezone)
    const limitInMexico = toZonedTime(limitDate, mexicoCityTimezone)

    return nowInMexico <= limitInMexico
  }

  const getAvailabilityText = (limitDate: Date): string => {
    return isRewardAvailable(limitDate) ? "Disponible" : "No Disponible"
  }

  const getRowStyling = (limitDate: Date): string => {
    return isRewardAvailable(limitDate) ? "bg-white hover:bg-green-50" : "bg-red-50 hover:bg-red-100"
  }

  const getLimitDateStyling = (limitDate: Date): string => {
    return isRewardAvailable(limitDate) ? "text-green-600 font-bold" : "text-red-600 font-bold"
  }

  return (
    <div className="">
      {/* Sección de Recompensas Canjeadas */}
      <div className="flex flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 pt-5">
          <Gift className="h-6 w-6 text-amber-400" />
          <span className="mb-5 text-sm font-medium text-gray-500">Recompensas Canjeadas:</span>
        </div>
        {/*  */}
        <Card className="w-full p-2">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <LoaderCircle />
            </div>
          ) : error ? (
            <div className="py-10 text-center text-red-500">
              <p>{error}</p>
              <Button onClick={() => router.push(`/validez/${userId}`)} variant="outline" className="mt-4">
                Reintentar
              </Button>
            </div>
          ) : redeemedRewards.length > 0 ? (
            <>
              <div className="h-[400px] w-full overflow-auto p-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center font-bold text-baseColor">Recompensa Cajeada el:</TableHead>
                      <TableHead className="text-center font-bold text-baseColor">Folio de Recompensa</TableHead>
                      <TableHead className="text-center font-bold text-baseColor">
                        Fecha Límite Para Usar Recompensa
                      </TableHead>
                      <TableHead className="text-center font-bold text-baseColor">Disponibilidad de Uso</TableHead>
                      <TableHead className="text-center font-bold text-baseColor">Recompensa</TableHead>
                      <TableHead className="text-center font-bold text-baseColor">Costo en EcoPoints</TableHead>
                      <TableHead className="text-center font-bold text-baseColor">Descripción</TableHead>
                      <TableHead className="text-center font-bold text-baseColor">Tipo de Recompensa</TableHead>
                      <TableHead className="text-center font-bold text-baseColor">Recompensa Creada</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {redeemedRewards.map((redemption) => (
                      <TableRow key={redemption.id} className={getRowStyling(redemption.rewardLimitToUse)}>
                        <TableCell className="w-[100px] text-center font-bold text-gray-500">
                          {format(new Date(redemption.redeemedAt), "dd MMM, yyyy", { locale: es })}
                        </TableCell>
                        <TableCell className="w-[100px] text-center font-bold text-gray-500">
                          <p className="font-bold text-black uppercase">{redemption.rewardFolio}</p>
                        </TableCell>
                        <TableCell
                          className={`w-[100px] text-center ${getLimitDateStyling(redemption.rewardLimitToUse)}`}
                        >
                          {format(new Date(redemption.rewardLimitToUse), "dd MMM, yyyy", { locale: es })}
                        </TableCell>
                        <TableCell className="w-[100px] text-center font-bold">
                          <span
                            className={
                              isRewardAvailable(redemption.rewardLimitToUse) ? "text-green-600 uppercase" : "text-red-600 uppercase"
                            }
                          >
                            {getAvailabilityText(redemption.rewardLimitToUse)}
                          </span>
                        </TableCell>
                        <TableCell className="text-center font-bold text-amber-500">
                          <p
                            className="flex flex-col justify-center items-center gap-4 "
                            title={`Recompensa de tipo: ${REWARD_CATEGORY_MAP[redemption.rewardCategory] || redemption.rewardCategory}`}
                          >
                            {getCategoryIcon(redemption.rewardCategory)}
                          </p>
                          {redemption.rewardTitle}
                        </TableCell>
                        <TableCell className="text-center text-xl font-bold text-[#17d627]">
                          {redemption.rewardPoints}
                        </TableCell>
                        <TableCell className="text-start font-semibold text-gray-400">
                          <span className="p-1 h-[150px] w-[200px] flex overflow-auto">{redemption.rewardDesc}</span>
                        </TableCell>
                        <TableCell className="text-center font-semibold text-gray-400">
                          {REWARD_CATEGORY_MAP[redemption.rewardCategory] || redemption.rewardCategory}
                        </TableCell>
                        <TableCell className="w-[100px] text-center font-bold text-gray-500">
                          {format(new Date(redemption.rewardCreatedAt), "dd MMM, yyyy", { locale: es })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : (
            <div className="py-10 text-center">
              <p className="text-3xl font-bold text-gray-400">No hay recompensas canjeadas.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default ListaDeRecompensas