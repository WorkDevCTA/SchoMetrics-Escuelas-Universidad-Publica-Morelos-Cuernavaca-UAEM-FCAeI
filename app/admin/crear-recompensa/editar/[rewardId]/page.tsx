"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Gift, CalendarIcon, Loader2, Check } from "lucide-react";

import { useForm, Controller } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import Link from "next/link";
import AdminRewardDelete from "../../components/AdminRewardDelete";

interface RewardForm {
  title: string;
  description: string;
  pointsCost: number;
  category: string;
  available: boolean;
  hasQuantity: boolean;
  quantity?: number;
  hasExpiration: boolean;
  expiresAt?: Date | null;
}

export default function EditarRecompensa() {
  const params = useParams();
  const rewardId = params.rewardId;
  const router = useRouter();
  const [reward, setReward] = useState<RewardForm | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<RewardForm>({
    defaultValues: {
      title: "",
      description: "",
      pointsCost: 100,
      category: "PRODUCT",
      available: true,
      hasQuantity: false,
      quantity: 1,
      hasExpiration: false,
      expiresAt: null,
    },
  });

  const hasQuantity = watch("hasQuantity");
  const hasExpiration = watch("hasExpiration");

  useEffect(() => {
    const fetchReward = async () => {
      try {
        const res = await fetch(`/api/admin/rewards/${rewardId}`);
        if (!res.ok) throw new Error("Error al obtener la recompensa");
        const data = await res.json();
        setReward(data);

        reset({
          title: data.title,
          description: data.description,
          pointsCost: data.pointsCost || 100,
          category: data.category,
          available: data.available,
          hasQuantity: !!data.quantity,
          quantity: data.quantity || 1,
          hasExpiration: !!data.expiresAt,
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        });
      } catch (err) {
        toast.error("No se pudo cargar la recompensa.");
        router.push("/admin/crear-recompensa");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReward();
  }, [rewardId, reset, router]);

  const onSubmit = async (data: RewardForm) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        quantity: data.hasQuantity ? data.quantity : undefined,
        expiresAt: data.hasExpiration ? data.expiresAt : null,
      };

      const res = await fetch(`/api/admin/rewards/${rewardId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al actualizar");
      }

      toast.success("Recompensa actualizada correctamente.");
      router.push("/admin/crear-recompensa");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-4 text-amber-400">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
        Cargando los nuevos datos de la recompensa...
      </div>
    );
  }

  return (
    <div className="m-5 flex flex-col gap-8 sm:m-10">
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 p-6 text-white shadow-lg lg:flex-row lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Gift className="h-8 w-8" />
            <h1 className="text-3xl font-bold tracking-tight">
              Eliminar o Editar Recompensa
            </h1>
          </div>
          <p className="text-amber-50">
            Elimina o Modifica los datos de la recompensa.
          </p>
        </div>
      </div>
      <div className="flex w-full items-center justify-center">
        <Link href="/admin/crear-recompensa/" className="">
          <Button className="bg-green-600 hover:bg-green-700">
            <span className="font-bold text-amber-50">Regresar</span>
          </Button>
        </Link>
      </div>
      <Card className="mx-auto w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>Formulario de Edición</CardTitle>
          <CardDescription>Actualiza los datos necesarios</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div>
              <Label>Título</Label>
              <Input {...register("title", { required: true })} />
              {errors.title && (
                <p className="text-sm text-red-500">Campo requerido</p>
              )}
            </div>

            <div>
              <Label>Descripción</Label>
              <Textarea
                rows={3}
                {...register("description", { required: true })}
              />
              {errors.description && (
                <p className="text-sm text-red-500">Campo requerido</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Costo (Puntos)</Label>
                <Input type="number" {...register("pointsCost", { min: 1 })} />
              </div>
              <div>
                <Label>Categoría</Label>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      {/* <SelectTrigger>
                                                <SelectValue placeholder="Categoría" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {["DISCOUNT", "WORKSHOP", "PRODUCT", "RECOGNITION", "EXPERIENCE", "OTHER"].map((cat) => (
                                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                ))}
                                            </SelectContent> */}
                      <SelectTrigger id="category-reward">
                        <SelectValue placeholder="Categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DISCOUNT">Descuento</SelectItem>
                        <SelectItem value="WORKSHOP">Taller</SelectItem>
                        <SelectItem value="PRODUCT">Producto</SelectItem>
                        <SelectItem value="RECOGNITION">
                          Reconocimiento
                        </SelectItem>
                        <SelectItem value="EXPERIENCE">Experiencia</SelectItem>
                        <SelectItem value="OTHER">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={watch("available")}
                onCheckedChange={(checked) => setValue("available", checked)}
              />
              <Label>Disponible</Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={hasQuantity}
                onCheckedChange={(checked) => setValue("hasQuantity", checked)}
              />
              <Label>Cantidad limitada</Label>
            </div>

            {hasQuantity && (
              <div>
                <Label>Cantidad</Label>
                <Input type="number" {...register("quantity", { min: 1 })} />
              </div>
            )}

            <div className="flex items-center gap-2">
              <Switch
                checked={hasExpiration}
                onCheckedChange={(checked) =>
                  setValue("hasExpiration", checked)
                }
              />
              <Label>Fecha de expiración</Label>
            </div>

            {hasExpiration && (
              <div>
                <Label>Fecha</Label>
                <Controller
                  name="expiresAt"
                  control={control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value
                            ? format(field.value, "PPP", { locale: es })
                            : "Selecciona fecha"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
      <div className="flex w-full items-center justify-center">
        <AdminRewardDelete rewardId={rewardId as string} />
      </div>
    </div>
  );
}
