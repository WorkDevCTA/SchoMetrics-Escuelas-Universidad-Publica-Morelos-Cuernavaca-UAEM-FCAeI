"use client";

import type React from "react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Recycle,
  TreePine,
  Droplets,
  Lightbulb,
  Leaf,
  BookOpen,
  HelpCircle,
  Upload,
  ArrowLeft,
  BadgeInfo,
} from "lucide-react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import toast from "react-hot-toast";
import { MAX_FILES, MIN_FILES } from "@/types/types-supabase-service";
import Link from "next/link";
import DashboardLayout from "@/app/components/DashboardLayout";

// Definimos el esquema de validación con Zod
const activitySchema = z.object({
  title: z
    .string()
    .min(10, { message: "El título debe tener al menos 10 caracteres" })
    .max(100, { message: "El título no puede tener más de 100 caracteres" }),
  description: z
    .string()
    .min(50, { message: "La descripción debe tener al menos 50 caracteres" })
    .max(1000, {
      message: "La descripción no puede tener más de 1000 caracteres",
    }),
  type: z.enum(
    [
      "RECYCLING",
      "TREE_PLANTING",
      "WATER_SAVING",
      "ENERGY_SAVING",
      "COMPOSTING",
      "EDUCATION",
      "OTHER",
    ],
    {
      message: "Selecciona un tipo de actividad válido",
    },
  ),
  quantity: z
    .number({ invalid_type_error: "La cantidad debe ser un número" })
    .positive({ message: "La cantidad debe ser mayor a 0" })
    .min(1, { message: "La cantidad mínima es 1" })
    .max(500, { message: "La cantidad máxima permitida es 500" }),
  unit: z.string().min(1, { message: "La unidad es requerida" }),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Fecha inválida",
  }),
});

type FormErrors = {
  [K in keyof z.infer<typeof activitySchema>]?: string;
};

export default function NewActivityPage() {
  const [evidenceError, setEvidenceError] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState("");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "RECYCLING",
    quantity: "",
    unit: "kg",
    date: new Date().toISOString().split("T")[0],
    // date: new Date().toLocaleDateString('es-MX'), // Formato YYYY-MM-DD
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (selectedFiles.length + files.length > MAX_FILES) {
      setEvidenceError(`No puedes subir más de ${MAX_FILES} archivos.`);
      if (e.target) e.target.value = "";
      return;
    }

    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    for (const file of files) {
      if (file.size > maxSizeInBytes) {
        setEvidenceError(
          `El archivo "${file.name}" excede el tamaño máximo de 5MB.`,
        );
        if (e.target) e.target.value = "";
        return;
      }
    }
    setEvidenceError("");
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setSelectedFiles((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...newPreviews]);
    if (e.target) e.target.value = "";
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setSelectedFiles((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
    setPreviews((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });

    if (
      selectedFiles.length - 1 < MAX_FILES &&
      evidenceError.includes(`más de ${MAX_FILES} archivos`)
    ) {
      setEvidenceError("");
    }
    if (
      selectedFiles.length - 1 === 0 &&
      evidenceError.includes(`al menos ${MIN_FILES}`)
    ) {
      setEvidenceError("");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleTypeChange = (value: string) => {
    let defaultUnit = "";
    switch (value) {
      case "RECYCLING":
      case "COMPOSTING":
        defaultUnit = "kg";
        break;
      case "TREE_PLANTING":
        defaultUnit = "árboles";
        break;
      case "WATER_SAVING":
        defaultUnit = "litros";
        break;
      case "ENERGY_SAVING":
        defaultUnit = "kWh";
        break;
      case "EDUCATION":
        defaultUnit = "horas";
        break;
      default:
        defaultUnit = "unidades";
    }
    setFormData((prev) => ({
      ...prev,
      type: value,
      unit: defaultUnit,
    }));
  };

  const validateForm = () => {
    try {
      const dataToValidate = {
        ...formData,
        quantity: formData.quantity ? Number(formData.quantity) : 0,
      };
      activitySchema.parse(dataToValidate);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: FormErrors = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as keyof FormErrors;
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
        const firstError = error.errors[0]?.message;
        if (firstError) {
          toast.error("Error de validación, verifica los datos ingresados");
        }
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setEvidenceError("");

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    if (selectedFiles.length < MIN_FILES) {
      setEvidenceError(
        `Debes subir al menos ${MIN_FILES} archivo como evidencia.`,
      );
      setIsLoading(false);
      return;
    }
    if (selectedFiles.length > MAX_FILES) {
      setEvidenceError(`No puedes subir más de ${MAX_FILES} archivos.`);
      setIsLoading(false);
      return;
    }

    try {
      const quantity = Number.parseFloat(formData.quantity);
      // const pointsPerUnit = ACTIVITY_POINTS[formData.type as keyof typeof ACTIVITY_POINTS] || ACTIVITY_POINTS.OTHER
      // const points = Math.floor(quantity * pointsPerUnit) // SE ELIMINA CÁLCULO DE PUNTOS AQUÍ

      const apiFormData = new FormData();
      apiFormData.append("title", formData.title);
      apiFormData.append("description", formData.description);
      apiFormData.append("type", formData.type);
      apiFormData.append("quantity", quantity.toString());
      apiFormData.append("unit", formData.unit);
      apiFormData.append("date", formData.date);
      // No se envían 'points'

      selectedFiles.forEach((file) => {
        apiFormData.append("evidence", file);
      });

      console.log(
        "Enviando formulario con archivos:",
        selectedFiles.map((f) => f.name),
      );

      const response = await fetch("/api/activities", {
        method: "POST",
        body: apiFormData,
      });

      if (!response.ok) {
        let errorData = {
          error: "Error al registrar actividad. Intenta de nuevo.",
        };
        try {
          errorData = await response.json();
        } catch (jsonError) {
          console.error(
            "La respuesta de error no es JSON:",
            await response.text(),
          );
        }
        throw new Error(
          errorData.error || "Error desconocido al registrar actividad",
        );
      } else {
        // Mensaje de éxito ajustado
        toast.success(
          `Tu actividad ha sido registrada y está pendiente de revisión.`,
        );
        router.push("/actividades");
        router.refresh();
      }
    } catch (err: any) {
      console.error("Error al registrar actividad:", err);
      setError(err.message || "Ocurrió un error inesperado.");
      toast.error(err.message || "Error al registrar actividad");
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "RECYCLING":
        return <Recycle className="h-5 w-5" />;
      case "TREE_PLANTING":
        return <TreePine className="h-5 w-5" />;
      case "WATER_SAVING":
        return <Droplets className="h-5 w-5" />;
      case "ENERGY_SAVING":
        return <Lightbulb className="h-5 w-5" />;
      case "COMPOSTING":
        return <Leaf className="h-5 w-5" />;
      case "EDUCATION":
        return <BookOpen className="h-5 w-5" />;
      default:
        return <HelpCircle className="h-5 w-5" />;
    }
  };

  // Se elimina la función calculateEstimatedPoints y su uso
  // const calculateEstimatedPoints = () => { ... }

  return (
    <DashboardLayout>
      <div className="m-5 flex flex-col gap-8">
        <div className="mt-16 flex flex-col gap-3 rounded-xl bg-gradient-to-br from-green-500 via-emerald-600 to-green-600 p-8 text-white shadow-2xl lg:mt-0">
          <h1 className="flex flex-col items-center gap-3 text-4xl font-bold tracking-tight md:flex-row">
            <Leaf className="h-10 w-10 animate-bounce" />
            Nueva Actividad
          </h1>
          <p className="text-center text-lg opacity-90 md:text-start">
            Registra una nueva actividad ecológica para obtener EcoPoints. Será
            revisada por un administrador
          </p>
        </div>
        <div className="mt-3">
          <Link
            href="/actividades"
            className="flex items-center text-sm text-green-600 hover:underline"
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Volver
          </Link>
        </div>
        <div className="flex w-auto items-center justify-center">
          <Link
            href="/actividades/manual-de-actividades-permitidas"
            title="Revisa el Manual de Actividades Permitidas"
          >
            <Button
              variant={"outline"}
              className="w-auto border-none bg-rose-500 font-bold text-rose-50 transition-all duration-300 ease-linear hover:bg-red-600 hover:text-white"
            >
              <BadgeInfo className="h-7 w-7" />
              Ver Manual de Actividades Permitidas
            </Button>
          </Link>
        </div>
        <Card>
          <form onSubmit={handleSubmit} ref={formRef}>
            <CardHeader>
              <CardTitle>Detalles de la actividad</CardTitle>
              <CardDescription>
                Ingresa la información sobre la actividad que realizaste
              </CardDescription>
              <CardDescription>
                Considera lo siguiente:
                <p>
                  Cantidad mínima de caracteres para el Título: 10 - máxima:
                  100.
                </p>
                <p>
                  Cantidad mínima de caracteres para la Descripción: 50 -
                  máxima: 500.
                </p>
                <p>
                  Cantidad máxima de acuerdo al Tipo de actividad: 20. ejemplo:
                  20 árboles - 20 kg
                </p>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Ej. Reciclaje de papel"
                  value={formData.title}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe brevemente la actividad realizada"
                  value={formData.description}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={errors.description ? "border-red-500" : ""}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label>Tipo de actividad</Label>
                <RadioGroup
                  value={formData.type}
                  onValueChange={handleTypeChange}
                  className="flex w-max flex-col gap-4 sm:grid sm:grid-cols-2 md:grid md:grid-cols-3 xl:grid xl:grid-cols-4"
                >
                  {[
                    { value: "RECYCLING", label: "Reciclaje" },
                    { value: "TREE_PLANTING", label: "Plantación" },
                    { value: "WATER_SAVING", label: "Ahorro de agua" },
                    { value: "ENERGY_SAVING", label: "Ahorro de energía" },
                    { value: "COMPOSTING", label: "Compostaje" },
                    { value: "EDUCATION", label: "Educación" },
                    { value: "OTHER", label: "Otro" },
                  ].map((type) => (
                    <div
                      key={type.value}
                      className="flex cursor-pointer items-center space-x-1 rounded-lg border p-3 hover:bg-muted/50 sm:space-x-2"
                    >
                      <RadioGroupItem
                        value={type.value}
                        id={type.value}
                        className="sr-only"
                      />
                      <Label
                        htmlFor={type.value}
                        className="flex w-full cursor-pointer items-center gap-2"
                      >
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full ${formData.type === type.value ? "bg-green-100 text-green-600" : "bg-muted"}`}
                        >
                          {getActivityIcon(type.value)}
                        </div>
                        <span>{type.label}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                {errors.type && (
                  <p className="text-sm text-red-500">{errors.type}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="quantity">
                    Cantidad{" "}
                    <span className="text-xs text-muted-foreground">
                      (máx. 20)
                    </span>
                  </Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    max="500"
                    step="1"
                    placeholder="Ejemplo: 10"
                    value={formData.quantity}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={errors.quantity ? "border-red-500" : ""}
                  />
                  {errors.quantity && (
                    <p className="text-sm text-red-500">{errors.quantity}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="unit">Unidad</Label>
                  <Input
                    id="unit"
                    name="unit"
                    placeholder="Ej. kg, litros, árboles"
                    value={formData.unit}
                    onChange={handleChange}
                    disabled
                    className={errors.unit ? "border-red-500" : ""}
                  />
                  {errors.unit && (
                    <p className="text-sm text-red-500">{errors.unit}</p>
                  )}
                </div>
              </div>

              <div className="grid w-max gap-2">
                <Label htmlFor="date">Fecha</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={errors.date ? "border-red-500" : ""}
                  max={new Date().toISOString().split("T")[0]}
                />
                {errors.date && (
                  <p className="text-sm text-red-500">{errors.date}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Evidencia <span className="text-red-500">*</span>{" "}
                  <span className="text-xs text-muted-foreground">
                    (al menos {MIN_FILES}, máximo {MAX_FILES})
                  </span>
                </label>
                <div
                  className={`cursor-pointer rounded-lg border-2 border-dashed p-4 text-center transition-colors hover:bg-gray-50 ${evidenceError ? "border-red-500" : "border-gray-300"}`}
                  onClick={() =>
                    document.getElementById("evidence-input")?.click()
                  }
                >
                  <input
                    type="file"
                    id="evidence-input"
                    name="evidence"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.webp,.mp4,.gif"
                    multiple
                    disabled={isLoading}
                  />
                  <div className="mx-auto h-12 w-12 text-gray-400">
                    <Upload className="h-full w-full" />
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    Haz clic para seleccionar archivos o arrastra y suelta aquí
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    JPG, PNG, JPEG, WEBP, MP4, GIF • Máximo {MAX_FILES} archivos
                    • 5MB por archivo
                  </p>
                </div>
                {evidenceError && (
                  <div className="mt-2 text-sm text-red-500">
                    {evidenceError}
                  </div>
                )}
                {selectedFiles.length > 0 && (
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="relative overflow-hidden rounded-lg border"
                      >
                        <div className="flex aspect-video items-center justify-center bg-gray-100">
                          {file.type.startsWith("image/") ? (
                            <img
                              src={previews[index]}
                              alt={`Vista previa ${index + 1}`}
                              className="h-full w-full object-contain"
                            />
                          ) : file.type.startsWith("video/") ? (
                            <video
                              src={previews[index]}
                              controls
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center p-2">
                              <HelpCircle className="h-12 w-12 text-gray-400" />
                              <span className="mt-2 truncate text-sm text-gray-500">
                                {file.name}
                              </span>
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white transition-colors hover:bg-red-600"
                          aria-label="Eliminar archivo"
                          disabled={isLoading}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                        <div className="truncate bg-white p-2 text-sm">
                          Tamaño: ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {error && (
                <p className="mt-4 text-center text-sm text-red-500">{error}</p>
              )}
            </CardContent>
            <CardFooter className="flex flex-col justify-center gap-4 md:flex-row md:items-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                {isLoading ? "Guardando..." : "Guardar actividad"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
