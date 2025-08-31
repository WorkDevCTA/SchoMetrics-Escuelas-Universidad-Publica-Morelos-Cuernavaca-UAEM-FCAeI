"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  CalendarIcon,
  Check,
  Loader2,
  Gift,
  ArrowLeftCircleIcon,
} from "lucide-react"; // Añadir Building y PlusCircle
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import Link from "next/link";
import GoToBackAdmin from "../../components/GoToBackAdmin";
import { FloatingNavAdmin } from "../../components/FloatingNavAdmin";

export default function CrearRecompensa() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    pointsCost: 100,
    category: "PRODUCT",
    available: true,
    hasQuantity: true,
    quantity: 10,
    hasExpiration: false,
    expiresAt: null as Date | null,
  });
  useEffect(() => {
    const checkAdmin = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/auth/session");
        const data = await response.json();
        if (!data.user || data.user.role !== "ADMIN") {
          toast.error("Acceso denegado.");
          router.push("/dashboard");
          return;
        }
        setIsAdmin(true);
      } catch (error) {
        console.error("Error al verificar permisos:", error);
        toast.error("Error al verificar permisos.");
        router.push("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };
    checkAdmin();
  }, [router]);

  useEffect(() => {
    const checkAdmin = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/auth/session");
        const data = await response.json();
        if (!data.user || data.user.role !== "ADMIN") {
          toast.error("Acceso denegado.");
          router.push("/dashboard");
          return;
        }
        setIsAdmin(true);
      } catch (error) {
        console.error("Error al verificar permisos:", error);
        toast.error("Error al verificar permisos.");
        router.push("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };
    checkAdmin();
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "pointsCost" || name === "quantity"
          ? Number.parseInt(value) || 10
          : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleDateChange = (date: Date | null) => {
    setFormData((prev) => ({ ...prev, expiresAt: date }));
  };

  const handleSubmitReward = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const rewardData = {
        title: formData.title,
        description: formData.description,
        pointsCost: formData.pointsCost,
        category: formData.category,
        available: formData.available,
        quantity: formData.hasQuantity ? formData.quantity : null,
        expiresAt: formData.hasExpiration ? formData.expiresAt : null,
      };
      const response = await fetch("/api/admin/rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rewardData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al crear la recompensa");
      }
      toast.success("Recompensa creada correctamente.");
      setFormData({
        title: "",
        description: "",
        pointsCost: 100,
        category: "PRODUCT",
        available: true,
        hasQuantity: true,
        quantity: 10,
        hasExpiration: false,
        expiresAt: null,
      });
    } catch (error) {
      console.error("Error al crear recompensa:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al crear la recompensa",
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="m-5 flex flex-col gap-8 sm:m-10">
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 p-6 text-white shadow-lg lg:flex-row lg:justify-between">
        <div className="my-3">
          <div className="flex items-center gap-3">
            <Gift className="h-8 w-8" />
            <h1 className="text-3xl font-bold tracking-tight">
              Añadir Nueva Recompensa
            </h1>
          </div>
          <p className="text-amber-50">
            Registra una nueva recompensa en la plataforma.
          </p>
        </div>
        <GoToBackAdmin />
      </div>
      <FloatingNavAdmin />
      {/* Tarjeta para Crear Nueva Recompensa */}
      <div className="my-10 flex w-full flex-col items-center justify-center">
        <Link href="/admin/crear-recompensa/" className="mb-5">
          <Button className="bg-green-600 hover:bg-green-700">
            <ArrowLeftCircleIcon className="mr-2 h-4 w-4" />
            <span className="font-bold text-amber-50">Regresar</span>
          </Button>
        </Link>
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Gift className="h-6 w-6 text-amber-500" />
              <CardTitle>Crear Nueva Recompensa</CardTitle>
            </div>
            <CardDescription>
              Completa el formulario para añadir una nueva recompensa para los
              usuarios.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmitReward}>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="title-reward">Título</Label>
                <Input
                  id="title-reward"
                  name="title"
                  placeholder="Ej: Descuento en tienda"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="description-reward">Descripción</Label>
                <Textarea
                  id="description-reward"
                  name="description"
                  placeholder="Detalles de la recompensa"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="pointsCost-reward">Costo (Puntos)</Label>
                  <Input
                    id="pointsCost-reward"
                    name="pointsCost"
                    type="number"
                    min={1}
                    value={formData.pointsCost}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="category-reward">Categoría</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      handleSelectChange("category", value)
                    }
                  >
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
                </div>
              </div>
              {/* Switches para cantidad y expiración */}
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="available-reward"
                  checked={formData.available}
                  onCheckedChange={(checked) =>
                    handleSwitchChange("available", checked)
                  }
                  disabled
                />
                <Label htmlFor="available-reward">Disponible</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="hasQuantity-reward"
                  checked={formData.hasQuantity}
                  onCheckedChange={(checked) =>
                    handleSwitchChange("hasQuantity", checked)
                  }
                />
                <Label htmlFor="hasQuantity-reward">Cantidad limitada</Label>
              </div>
              {formData.hasQuantity && (
                <div className="space-y-1 pl-6">
                  <Label htmlFor="quantity-reward">Cantidad</Label>
                  <Input
                    id="quantity-reward"
                    name="quantity"
                    type="number"
                    min={1}
                    value={formData.quantity}
                    onChange={handleChange}
                    required={formData.hasQuantity}
                  />
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Switch
                  id="hasExpiration-reward"
                  checked={formData.hasExpiration}
                  onCheckedChange={(checked) =>
                    handleSwitchChange("hasExpiration", checked)
                  }
                />
                <Label htmlFor="hasExpiration-reward">Tiene expiración</Label>
              </div>
              {formData.hasExpiration && (
                <div className="space-y-1 pl-6">
                  <Label htmlFor="expiresAt-reward">Fecha de Expiración</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.expiresAt && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.expiresAt ? (
                          format(formData.expiresAt, "PPP", { locale: es })
                        ) : (
                          <span>Selecciona fecha</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.expiresAt || undefined}
                        onSelect={handleDateChange as any}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
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
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" /> Crear Recompensa
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
