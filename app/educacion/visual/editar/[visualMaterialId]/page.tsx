"use client";

import React, { useState, useEffect, FormEvent, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Loader2,
  ImagePlus,
  Save,
  X,
  Trash2,
  RotateCcw,
  ArrowLeft,
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VisualMaterialTopic, UserType } from "@prisma/client";
import { z } from "zod";
import toast from "react-hot-toast";
import Image from "next/legacy/image";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_FILES,
  MIN_FILES,
  MAX_FILE_SIZE,
} from "@/types/types-supabase-service";
import { type VisualMaterialItem as VisualMaterialDetailType } from "@/types/types"; // Para el tipo del artículo original
import DashboardLayout from "@/app/components/DashboardLayout";
import { FloatingNavEducation } from "@/app/educacion/components/FloatingNavEducation";

// Esquema Zod para el formulario de edición de material visual
const visualMaterialUpdateFormSchemaClient = z.object({
  title: z
    .string()
    .min(5, "El título debe tener al menos 5 caracteres.")
    .max(150, "Máximo 150 caracteres."),
  description: z
    .string()
    .max(1000, "Máximo 1000 caracteres.")
    .optional()
    .nullable(),
  topic: z.nativeEnum(VisualMaterialTopic, {
    errorMap: () => ({ message: "Selecciona un tema válido." }),
  }),
  authorName: z.string(),
  authorInstitution: z.string(),
  authorInfo: z
    .string()
    .max(500, "Máximo 500 caracteres.")
    .optional()
    .nullable(),
  // 'images' se manejará por separado (nuevos archivos y gestión de existentes)
});

type VisualMaterialUpdateFormClientData = z.infer<
  typeof visualMaterialUpdateFormSchemaClient
>;
type VisualMaterialUpdateFormErrors = Partial<
  Record<keyof VisualMaterialUpdateFormClientData, string>
> & { images?: string };

function useUserSession() {
  // ... (código del hook useUserSession como en la página de detalle)
  const [session, setSession] = useState<{
    id: string;
    userType: UserType;
    role: string;
    name: string;
    email: string;
  } | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch("/api/auth/session"); //
        if (res.ok) {
          const data = await res.json();
          setSession(data.user);
        } else {
          setSession(null);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
        setSession(null);
      } finally {
        setIsLoadingSession(false);
      }
    }
    fetchSession();
  }, []);
  return { session, isLoadingSession };
}

export default function EditVisualMaterialPage() {
  const router = useRouter();
  const params = useParams();
  const visualMaterialId = params.visualMaterialId as string;
  const { session, isLoadingSession } = useUserSession();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [formData, setFormDataState] = useState<
    Partial<VisualMaterialUpdateFormClientData>
  >({});
  const [errors, setErrors] = useState<VisualMaterialUpdateFormErrors>({});

  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<
    { id: string; url: string; s3Key: string; order: number }[]
  >([]);
  const [imagesToDeleteS3Keys, setImagesToDeleteS3Keys] = useState<string[]>(
    [],
  ); // S3 keys de imágenes a eliminar
  const [imagePreviews, setImagePreviews] = useState<string[]>([]); // Para nuevos archivos

  const imageInputRef = useRef<HTMLInputElement>(null);
  const [originalMaterialUserId, setOriginalMaterialUserId] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (!visualMaterialId) {
      toast.error("ID de material visual no especificado.");
      router.push("/educacion?tab=visual");
      return;
    }
    async function fetchMaterialData() {
      setIsLoadingData(true);
      try {
        const res = await fetch(
          `/api/education/visual-materials/${visualMaterialId}`,
        );
        if (res.status === 404) {
          toast.error("Material no encontrado.");
          router.push("/educacion?tab=visual");
          return;
        }
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Error al cargar datos");
        }
        const data: VisualMaterialDetailType = await res.json();

        setFormDataState({
          title: data.title,
          description: data.description || "",
          topic: data.topic,
          authorName: data.authorName,
          authorInstitution: data.authorInstitution,
          authorInfo: data.authorInfo || "",
        });
        setExistingImages(
          data.images.map((img) => ({
            id: img.id,
            url: img.url,
            s3Key: img.s3Key || "",
            order: img.order,
          })),
        );
        setOriginalMaterialUserId(data.userId);
      } catch (error) {
        console.error("Error cargando material para editar:", error);
        toast.error(
          error instanceof Error ? error.message : "Error al cargar material",
        );
        router.push("/educacion?tab=visual");
      } finally {
        setIsLoadingData(false);
      }
    }
    if (!isLoadingSession) fetchMaterialData();
  }, [visualMaterialId, router, isLoadingSession]);

  if (isLoadingSession || isLoadingData) {
    return (
      <DashboardLayout>
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />{" "}
          Cargando...
        </div>
      </DashboardLayout>
    );
  }
  if (
    !session ||
    session.id !== originalMaterialUserId ||
    (session.userType !== UserType.TEACHER &&
      session.userType !== UserType.ADMIN)
  ) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-4 text-center">
          Acceso Denegado.
        </div>
      </DashboardLayout>
    );
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormDataState((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof VisualMaterialUpdateFormClientData])
      setErrors((prev) => ({ ...prev, [name]: undefined }));
  };
  const handleTopicChange = (value: string) => {
    setFormDataState((prev) => ({
      ...prev,
      topic: value as VisualMaterialTopic,
    }));
    if (errors.topic) setErrors((prev) => ({ ...prev, topic: undefined }));
  };

  const handleNewImageFilesChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const filesArray = Array.from(e.target.files || []);
    if (filesArray.length === 0) return;

    const totalCurrentImages =
      existingImages.filter((img) => !imagesToDeleteS3Keys.includes(img.s3Key))
        .length +
      newImageFiles.length +
      filesArray.length;
    if (totalCurrentImages > MAX_FILES) {
      setErrors((prev) => ({
        ...prev,
        images: `No puedes tener más de ${MAX_FILES} imágenes en total.`,
      }));
      if (imageInputRef.current) imageInputRef.current.value = "";
      return;
    }

    const validatedNewFiles = filesArray.filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`Archivo ${file.name} excede 5MB.`);
        return false;
      }
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast.error(`Archivo ${file.name} tiene tipo no permitido.`);
        return false;
      }
      return true;
    });

    setNewImageFiles((prev) => [...prev, ...validatedNewFiles]);
    setImagePreviews((prev) => [
      ...prev,
      ...validatedNewFiles.map((f) => URL.createObjectURL(f)),
    ]);
    setErrors((prev) => ({ ...prev, images: undefined }));
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const removeNewImageFile = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const markExistingImageForDeletion = (s3Key: string) => {
    setImagesToDeleteS3Keys((prev) => [...prev, s3Key]);
    // Validar si al eliminar nos quedamos con menos del mínimo
    const remainingImages =
      existingImages.filter(
        (img) => ![...imagesToDeleteS3Keys, s3Key].includes(img.s3Key),
      ).length + newImageFiles.length;
    if (remainingImages < MIN_FILES) {
      setErrors((prev) => ({
        ...prev,
        images: `Debes tener al menos ${MIN_FILES} imagen.`,
      }));
    } else if (errors.images?.includes("al menos")) {
      setErrors((prev) => ({ ...prev, images: undefined }));
    }
  };

  const unmarkExistingImageForDeletion = (s3Key: string) => {
    setImagesToDeleteS3Keys((prev) => prev.filter((key) => key !== s3Key));
    if (errors.images?.includes("al menos")) {
      // Si había un error por pocas imágenes, revalidar
      const remainingImages =
        existingImages.filter(
          (img) =>
            !imagesToDeleteS3Keys
              .filter((key) => key !== s3Key)
              .includes(img.s3Key),
        ).length + newImageFiles.length;
      if (remainingImages >= MIN_FILES) {
        setErrors((prev) => ({ ...prev, images: undefined }));
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    const currentVisibleExistingImages = existingImages.filter(
      (img) => !imagesToDeleteS3Keys.includes(img.s3Key),
    );
    if (
      currentVisibleExistingImages.length + newImageFiles.length <
      MIN_FILES
    ) {
      setErrors((prev) => ({
        ...prev,
        images: `Debes tener al menos ${MIN_FILES} imagen.`,
      }));
      toast.error(`Se requiere al menos ${MIN_FILES} imagen.`);
      return;
    }
    if (
      currentVisibleExistingImages.length + newImageFiles.length >
      MAX_FILES
    ) {
      setErrors((prev) => ({
        ...prev,
        images: `No puedes exceder ${MAX_FILES} imágenes.`,
      }));
      toast.error(`Máximo ${MAX_FILES} imágenes permitidas.`);
      return;
    }

    setIsSubmitting(true);
    const validationResult =
      visualMaterialUpdateFormSchemaClient.safeParse(formData);
    if (!validationResult.success) {
      const newErrors: VisualMaterialUpdateFormErrors = {};
      validationResult.error.errors.forEach((err) => {
        newErrors[err.path[0] as keyof VisualMaterialUpdateFormClientData] =
          err.message;
      });
      setErrors(newErrors);
      toast.error("Por favor, corrige los errores en el formulario.");
      setIsSubmitting(false);
      return;
    }

    const apiFormData = new FormData();
    Object.entries(validationResult.data).forEach(([key, value]) => {
      if (value !== undefined && value !== null)
        apiFormData.append(key, String(value));
    });
    newImageFiles.forEach((file, index) => {
      apiFormData.append(`images[${index}]`, file);
    });
    apiFormData.append("imagesToDelete", JSON.stringify(imagesToDeleteS3Keys));
    // Enviar IDs, s3Keys y order actual de las imágenes existentes que se conservan
    const keptExistingImagesData = existingImages
      .filter((img) => !imagesToDeleteS3Keys.includes(img.s3Key))
      .map((img) => ({ id: img.id, s3Key: img.s3Key, order: img.order }));
    apiFormData.append(
      "existingImageS3Keys",
      JSON.stringify(keptExistingImagesData),
    );

    try {
      const response = await fetch(
        `/api/education/visual-materials/${visualMaterialId}`,
        {
          method: "PUT",
          body: apiFormData,
        },
      );
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Error al actualizar");
      }
      toast.success("Material visual actualizado!");
      router.push(`/educacion/visual/${visualMaterialId}`);
      router.refresh();
    } catch (error) {
      console.error("Error actualizando:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al actualizar.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const visualMaterialTopicsArray = Object.values(VisualMaterialTopic);

  return (
    <DashboardLayout>
      <FloatingNavEducation />
      <div className="container mx-auto mt-10 px-4 py-8 md:mt-2">
        <div className="mb-6 mt-10 md:mt-2">
          <Link
            href="/educacion/visual/"
            className="flex items-center text-sm text-purple-600 hover:underline"
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Volver a Material Visual
          </Link>
        </div>
        <Card className="mx-auto max-w-3xl">
          <CardHeader>
            <div className="mb-2 flex items-center gap-3">
              <BookOpen className="h-7 w-7 text-purple-600" />
              <CardTitle className="text-2xl font-semibold">
                Editar Material Visual
              </CardTitle>
            </div>
            <CardDescription>
              Modifica los detalles de tu material visual.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {/* Campos del formulario (Título, Descripción, Tema, etc.) */}
              <div className="space-y-1">
                <Label htmlFor="title">
                  Título <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title || ""}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description || ""}
                  onChange={handleInputChange}
                  rows={3}
                  disabled={isSubmitting}
                  className={errors.description ? "border-red-500" : ""}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="topic-visual-edit">
                  Tema <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.topic || ""}
                  onValueChange={handleTopicChange}
                  name="topic"
                  disabled={isSubmitting}
                >
                  <SelectTrigger
                    id="topic-visual-edit"
                    className={errors.topic ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Selecciona un tema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Temas</SelectLabel>
                      {visualMaterialTopicsArray.map((topicValue) => (
                        <SelectItem key={topicValue} value={topicValue}>
                          {topicValue
                            .replace(/_/g, " ")
                            .charAt(0)
                            .toUpperCase() +
                            topicValue
                              .replace(/_/g, " ")
                              .slice(1)
                              .toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors.topic && (
                  <p className="text-sm text-red-500">{errors.topic}</p>
                )}
              </div>

              {/* Gestión de Imágenes */}
              <div className="space-y-2">
                <Label>
                  Imágenes (Mín. {MIN_FILES}, Máx. {MAX_FILES}){" "}
                  <span className="text-red-500">*</span>
                </Label>
                {/* Imágenes Existentes */}
                {existingImages.length > 0 && (
                  <div className="mb-2">
                    <p className="mb-1 text-xs text-muted-foreground">
                      Imágenes actuales:
                    </p>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {existingImages.map((img, index) => (
                        <div
                          key={img.id}
                          className={`group relative aspect-square overflow-hidden rounded-md border ${imagesToDeleteS3Keys.includes(img.s3Key) ? "opacity-40 ring-2 ring-red-500 ring-offset-2" : ""}`}
                        >
                          <Image
                            src={img.url}
                            alt={`Imagen existente ${index + 1}`}
                            layout="fill"
                            objectFit="cover"
                          />
                          {imagesToDeleteS3Keys.includes(img.s3Key) ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="absolute right-1 top-1 z-10 h-6 w-6 bg-yellow-400 p-0.5 text-black hover:bg-yellow-500"
                              onClick={() =>
                                unmarkExistingImageForDeletion(img.s3Key)
                              }
                              disabled={isSubmitting}
                              title="Restaurar imagen"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute right-1 top-1 z-10 h-6 w-6 p-0.5 opacity-0 transition-opacity group-hover:opacity-100"
                              onClick={() =>
                                markExistingImageForDeletion(img.s3Key)
                              }
                              disabled={isSubmitting}
                              title="Marcar para eliminar"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Subir Nuevas Imágenes */}
                <div
                  className={`border-2 p-3 ${errors.images ? "border-red-500" : "border-gray-300"} rounded-lg border-dashed`}
                >
                  <div
                    className="flex w-full cursor-pointer items-center justify-center rounded-md bg-gray-50 py-2 transition-colors hover:bg-gray-100"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      id="newImages"
                      ref={imageInputRef}
                      onChange={handleNewImageFilesChange}
                      className="hidden"
                      accept={ALLOWED_IMAGE_TYPES.join(",")}
                      multiple
                      disabled={
                        isSubmitting ||
                        existingImages.filter(
                          (img) => !imagesToDeleteS3Keys.includes(img.s3Key),
                        ).length +
                          newImageFiles.length >=
                          MAX_FILES
                      }
                    />
                    <ImagePlus className="mr-1.5 h-4 w-4 text-gray-500" />
                    <span className="text-xs text-gray-600">
                      Añadir nuevas imágenes (
                      {existingImages.filter(
                        (img) => !imagesToDeleteS3Keys.includes(img.s3Key),
                      ).length + newImageFiles.length}
                      /{MAX_FILES})
                    </span>
                  </div>
                  {imagePreviews.length > 0 && (
                    <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {imagePreviews.map((previewUrl, index) => (
                        <div
                          key={`new-${index}`}
                          className="group relative aspect-square"
                        >
                          <Image
                            src={previewUrl}
                            alt={`Nueva imagen ${index + 1}`}
                            layout="fill"
                            objectFit="cover"
                            className="rounded"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute right-1 top-1 h-5 w-5 p-0.5 opacity-0 transition-opacity group-hover:opacity-100"
                            onClick={() => removeNewImageFile(index)}
                            disabled={isSubmitting}
                            title="Eliminar nueva imagen"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {errors.images && (
                  <p className="mt-1 text-sm text-red-500">{errors.images}</p>
                )}
              </div>

              {/* Info del Autor */}
              <div className="border-t pt-4">
                <h3 className="text-md mb-3 font-semibold">
                  Información del Autor
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="authorName-edit">
                      Nombre del Autor (Usuario actual)
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="authorName-edit"
                      name="authorName"
                      value={formData.authorName || ""}
                      onChange={handleInputChange}
                      disabled
                      className={
                        errors.authorName ? "border-red-500" : "uppercase"
                      }
                    />
                    {errors.authorName && (
                      <p className="text-sm text-red-500">
                        {errors.authorName}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="authorInstitution-edit">
                      Institución <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="authorInstitution-edit"
                      name="authorInstitution"
                      value={formData.authorInstitution || ""}
                      onChange={handleInputChange}
                      disabled
                      className={
                        errors.authorInstitution ? "border-red-500" : ""
                      }
                    />
                    {errors.authorInstitution && (
                      <p className="text-sm text-red-500">
                        {errors.authorInstitution}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4 space-y-1">
                  <Label htmlFor="authorInfo">
                    Información Adicional del Autor (Usuario actual)
                    <p className="text-xs text-muted-foreground">
                      Si el recurso es de terceros, añade toda la información
                      necesaria referenciando al autor(es) original.
                    </p>
                  </Label>
                  <Textarea
                    id="authorInfo-edit"
                    name="authorInfo"
                    value={formData.authorInfo || ""}
                    onChange={handleInputChange}
                    rows={2}
                    disabled={isSubmitting}
                    className={errors.authorInfo ? "border-red-500" : ""}
                  />
                  {errors.authorInfo && (
                    <p className="text-sm text-red-500">{errors.authorInfo}</p>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col justify-center gap-3 sm:flex-row sm:items-start sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Guardar Cambios
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
