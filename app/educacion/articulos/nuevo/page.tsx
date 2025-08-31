"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, Loader2, AlertCircle, Save, ArrowLeft } from "lucide-react";
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
import { ArticleTopic, UserType } from "@prisma/client";
import { z } from "zod";
import toast from "react-hot-toast";
import DashboardLayout from "@/app/components/DashboardLayout";
import { FloatingNavEducation } from "../../components/FloatingNavEducation";

// Esquema de validación Zod para el frontend
const articleFormSchema = z.object({
  title: z
    .string()
    .min(5, "El título debe tener al menos 5 caracteres.")
    .max(150, "Máximo 150 caracteres."),
  content: z
    .string()
    .min(50, "El contenido debe tener al menos 50 caracteres."),
  topic: z.nativeEnum(ArticleTopic, {
    errorMap: () => ({ message: "Selecciona un tema válido." }),
  }),
  authorName: z.string(),
  authorInstitution: z.string(),
  authorInfo: z
    .string()
    .max(300, "Máximo 300 caracteres.")
    .optional()
    .nullable(),
  coverImageUrl: z
    .string()
    .url("URL de imagen inválida.")
    .optional()
    .nullable(), // Temporalmente string, idealmente File
});

type ArticleFormData = z.infer<typeof articleFormSchema>;
type ArticleFormErrors = Partial<Record<keyof ArticleFormData, string>>;

// Hook simple para obtener la sesión del usuario (puedes adaptarlo o usar tu método existente)
function useUserSession() {
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
        const res = await fetch("/api/auth/session");
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

export default function NewEducationalArticlePage() {
  const router = useRouter();
  const { session, isLoadingSession } = useUserSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ArticleFormData>({
    title: "",
    content: "",
    topic: ArticleTopic.REDUCCION_RESIDUOS, // Valor por defecto
    authorName: "",
    authorInstitution: "",
    authorInfo: "",
    coverImageUrl: "",
  });
  const [errors, setErrors] = useState<ArticleFormErrors>({});
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    null,
  );
  const coverImageInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoadingSession && session) {
      // Pre-llenar autor e institución si es posible
      setFormData((prev) => ({
        ...prev,
        authorName: session.name || "",
        // Asumimos que la institución podría venir de algún campo del perfil,
        // o el usuario lo debe llenar. Aquí un placeholder.
        authorInstitution:
          session.userType === UserType.TEACHER ||
            session.userType === UserType.ADMIN
            ? "Facultad de Contaduría, Administración e Informática"
            : "Facultad de Contaduría, Administración e Informática",
      }));
    }
  }, [session, isLoadingSession]);

  if (isLoadingSession) {
    return (
      <DashboardLayout>
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (
    !session ||
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
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ArticleFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleTopicChange = (value: string) => {
    setFormData((prev) => ({ ...prev, topic: value as ArticleTopic }));
    if (errors.topic) {
      setErrors((prev) => ({ ...prev, topic: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    const dataToValidate: ArticleFormData = {
      ...formData,
      authorInfo: formData.authorInfo || null, // Asegurar null si está vacío
    };

    const validationResult = articleFormSchema.safeParse(dataToValidate);

    if (!validationResult.success) {
      const newErrors: ArticleFormErrors = {};
      validationResult.error.errors.forEach((err) => {
        newErrors[err.path[0] as keyof ArticleFormData] = err.message;
      });
      setErrors(newErrors);
      toast.error("Por favor, corrige los errores en el formulario.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/education/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validationResult.data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear el artículo");
      }

      toast.success("Artículo creado exitosamente!");
      router.push("/educacion"); // Redirigir a la página principal de educación
      router.refresh(); // Para asegurar que la lista se actualice
    } catch (error) {
      console.error("Error al enviar formulario:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error desconocido al crear el artículo.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const articleTopicsArray = Object.values(ArticleTopic);
  return (
    <DashboardLayout>
      <FloatingNavEducation />
      <div className="container mx-auto mt-16 px-4 py-8 lg:mt-0">
        <div className="mb-6">
          <Link
            href="/educacion/articulos/"
            className="flex items-center text-sm text-lime-600 hover:underline"
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Volver a todos los artículos
          </Link>
        </div>
        <Card className="mx-auto max-w-3xl">
          <CardHeader>
            <div className="mb-2 flex items-center gap-3">
              <BookOpen className="h-7 w-7 text-lime-600" />
              <CardTitle className="text-2xl font-semibold">
                Crear Nuevo Artículo o Guía
              </CardTitle>
            </div>
            <CardDescription>
              Comparte tu conocimiento sobre sostenibilidad. Completa los campos
              para publicar tu contenido.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {/* Título */}
              <div className="space-y-1">
                <Label htmlFor="title">
                  Título del Artículo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Ej: 10 Formas Sencillas de Reducir tu Huella de Carbono"
                  disabled={isSubmitting}
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title}</p>
                )}
              </div>

              {/* Contenido (Textarea) */}
              <div className="space-y-1">
                <Label htmlFor="content">
                  Contenido del Artículo <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Escribe aquí el contenido detallado de tu artículo o guía..."
                  rows={10}
                  disabled={isSubmitting}
                  className={errors.content ? "border-red-500" : ""}
                />
                {errors.content && (
                  <p className="text-sm text-red-500">{errors.content}</p>
                )}
              </div>

              {/* Tema */}
              <div className="space-y-1">
                <Label htmlFor="topic">
                  Tema Principal <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.topic}
                  onValueChange={handleTopicChange}
                  name="topic"
                  disabled={isSubmitting}
                >
                  <SelectTrigger
                    id="topic"
                    className={errors.topic ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Selecciona un tema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Temas de Sostenibilidad</SelectLabel>
                      {articleTopicsArray.map((topicValue) => (
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

              {/* Imagen de Portada */}
              <div className="space-y-1">
                <Label htmlFor="coverImageUrl">
                  Imagen de Portada (Opcional)
                </Label>
                <Input
                  id="coverImageUrl"
                  name="coverImageUrl"
                  value={formData.coverImageUrl || ""}
                  onChange={handleInputChange}
                  placeholder="Ingresa una URL de imagen existente"
                  disabled={isSubmitting || !!coverImageFile} // Deshabilitar si se subió un archivo
                  className={`mt-2 ${errors.coverImageUrl ? "border-red-500" : ""} ${!!coverImageFile ? "bg-gray-100" : ""}`}
                />
                {errors.coverImageUrl && (
                  <p className="text-sm text-red-500">{errors.coverImageUrl}</p>
                )}
              </div>

              {/* Información del Autor */}
              <div className="border-t pt-4">
                <h3 className="text-md mb-3 font-semibold">
                  Información del Autor
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="authorName">
                      Nombre del Autor (Usuario actual)
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="authorName"
                      name="authorName"
                      value={formData.authorName}
                      onChange={handleInputChange}
                      placeholder="Ej: Dra. Jane Goodall"
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
                    <Label htmlFor="authorInstitution">
                      Institución <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="authorInstitution"
                      name="authorInstitution"
                      value={formData.authorInstitution}
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
                    id="authorInfo"
                    name="authorInfo"
                    value={formData.authorInfo || ""}
                    onChange={handleInputChange}
                    placeholder="Ej: Bióloga con especialidad en ecosistemas forestales, Directora del Programa de Conservación..."
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
                className="bg-lime-600 hover:bg-lime-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Publicar Artículo
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
