"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnnouncementTopic, UserType, type Announcement } from "@prisma/client";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  Megaphone,
  Save,
  Trash2,
} from "lucide-react";
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
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import z from "zod";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Esquema de validación Zod para el frontend
const announcementFormSchema = z.object({
  title: z
    .string()
    .min(5, "El título debe tener al menos 5 caracteres.")
    .max(150, "Máximo 150 caracteres."),
  content: z
    .string()
    .min(50, "El contenido debe tener al menos 50 caracteres.")
    .max(2000, "Máximo 2000 caracteres."),
  topic: z.nativeEnum(AnnouncementTopic, {
    errorMap: () => ({ message: "Selecciona un tema válido." }),
  }),
});

type AnnouncementFormData = z.infer<typeof announcementFormSchema>;
type AnnouncementFormErrors = Partial<
  Record<keyof AnnouncementFormData, string>
>;

// Hook simple para obtener la sesión del usuario
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

export function EditAnnouncementForm({
  announcement,
}: {
  announcement: Announcement;
}) {
  const { session, isLoadingSession } = useUserSession();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<AnnouncementFormData>>({
    title: announcement.title,
    content: announcement.content,
    topic: announcement.topic,
  }); // Partial para datos iniciales
  const [errors, setErrors] = useState<AnnouncementFormErrors>({});

  interface ArticleDetailForEdit {
    id: string;
    title: string;
    content: string;
    topic: AnnouncementTopic;
    userId: string;
  }
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof AnnouncementFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleTopicChange = (value: string) => {
    setFormData((prev) => ({ ...prev, topic: value as AnnouncementTopic }));
    if (errors.topic) {
      setErrors((prev) => ({ ...prev, topic: undefined }));
    }
  };

  // Manejar la actualización
  const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const validationResult = announcementFormSchema.safeParse(formData);

    if (!validationResult.success) {
      const newErrors: AnnouncementFormErrors = {};
      validationResult.error.errors.forEach((err) => {
        newErrors[err.path[0] as keyof AnnouncementFormData] = err.message;
      });
      setErrors(newErrors);
      toast.error("Por favor, corrige los errores en el formulario.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/announcements/${announcement.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(validationResult.data),
        },
      );

      if (response.status === 404) {
        toast.error("Aviso no encontrado.");
        router.push("/admin/avisos");
        return;
      }
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Error al cargar datos del artículo",
        );
      }

      setIsLoading(false);

      const articleData: ArticleDetailForEdit = await response.json();

      setFormData({
        title: articleData.title,
        content: articleData.content,
        topic: articleData.topic,
      });

      if (response.ok) {
        toast.success("Aviso actualizado con éxito");
        router.push("/admin/avisos");
        router.refresh();
      } else {
        const errorData = await response.json();
        setError(
          errorData.message || "Error al actualizar. Verifica los campos.",
        );
        toast.error("Error al actualizar. Verifica los campos.");
      }
    } catch (error) {
      console.error("Error al enviar formulario de edición:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error desconocido al actualizar.",
      );
      setError("Error desconocido al actualizar.");
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingSession || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-lime-400">
        <Loader2 className="h-8 w-8 animate-spin text-lime-400" />
        Cargando los nuevos datos del aviso...
      </div>
    );
  }

  // Permisos: El usuario debe ser el creador Y ser ADMIN
  if (!session || session.role !== UserType.ADMIN) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
        <h1 className="text-2xl font-semibold">Acceso Denegado</h1>
        <p className="mt-2 text-muted-foreground">
          No tienes permisos para editar este contenido educativo.
        </p>
        <Button asChild className="mt-6 bg-red-600 hover:bg-red-700">
          <Link href="/admin/avisos">Volver</Link>
        </Button>
      </div>
    );
  }

  const canEditOrDelete =
    session && session.id && session.userType === UserType.ADMIN;

  // Manejar la eliminación
  const handleDelete = async () => {
    if (!announcement || !session) return;
    if (
      announcement.userId !== session.id ||
      session.userType !== UserType.ADMIN
    ) {
      toast.error("No tienes permiso para eliminar este artículo.");
      return;
    }

    setIsLoading(true);
    const response = await fetch(
      `/api/admin/announcements/${announcement.id}`,
      {
        method: "DELETE",
      },
    );
    setIsLoading(false);

    if (response.ok) {
      toast.success("Aviso eliminado con éxito");
      router.push("/admin/avisos");
      router.refresh();
    } else {
      toast.error("No se pudo eliminar el aviso.");
      setError("No se pudo eliminar el aviso.");
      setIsLoading(false);
    }
  };

  const announcementTopicsArray = Object.values(AnnouncementTopic);

  return (
    <div className="container mx-auto mt-2 px-4 py-8 lg:mt-0">
      <div className="mb-6">
        <Link
          href="/admin/avisos"
          className="flex items-center text-sm text-lime-600 hover:underline"
        >
          <ArrowLeft className="mr-1 h-4 w-4" /> Volver a todos los avisos
        </Link>
      </div>
      <Card className="mx-auto max-w-3xl">
        <CardHeader>
          <div className="mb-2 flex items-center gap-3">
            <Megaphone className="h-7 w-7 text-lime-600" />
            <CardTitle className="text-2xl font-semibold">
              Crear Nuevo Aviso
            </CardTitle>
          </div>
          <CardDescription>
            Crea nuevos avisos para los usuarios de SchoMetrics.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleUpdate}>
          <CardContent className="space-y-6">
            {/* Título */}
            <div className="space-y-1">
              <Label htmlFor="title">
                Título del Aviso <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title || ""}
                onChange={handleInputChange}
                placeholder="Ej: Aviso importante para los estudiantes de la plataforma"
                disabled={isLoading}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            {/* Contenido (Textarea) */}
            <div className="space-y-1">
              <Label htmlFor="content">
                Contenido del Aviso <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="content"
                name="content"
                value={formData.content || ""}
                onChange={handleInputChange}
                placeholder="Escribe aquí el contenido detallado de tu aviso..."
                disabled={isLoading}
                className={errors.content ? "border-red-500" : ""}
              />
              {errors.content && (
                <p className="text-sm text-red-500">{errors.content}</p>
              )}
            </div>

            {/* Tema */}
            <div className="w-min space-y-1">
              <Label htmlFor="topic">
                Tema Principal <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.topic || announcement.topic}
                onValueChange={handleTopicChange}
                name="topic"
                disabled={isLoading}
              >
                <SelectTrigger id="topic" className={"uppercase"}>
                  <SelectValue placeholder="Selecciona un tema" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Temas de Sostenibilidad</SelectLabel>
                    {announcementTopicsArray.map((topicValue) => (
                      <SelectItem key={topicValue} value={topicValue}>
                        {topicValue.replace(/_/g, " ").charAt(0).toUpperCase() +
                          topicValue.replace(/_/g, " ").slice(1).toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {/* {errors.topic && <p className="text-sm text-red-500">{errors.topic}</p>} */}
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}

            <CardFooter className="flex flex-col justify-center gap-3 sm:flex-row sm:items-start sm:justify-end">
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
                disabled={isLoading}
                className="inline-flex justify-center rounded-md border border-transparent bg-lime-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-lime-700 disabled:bg-gray-400"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Actualizar Aviso
              </Button>
              {canEditOrDelete && (
                <div className="flex gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" disabled={isLoading}>
                        <Trash2 className="mr-1.5 h-4 w-4" /> Eliminar
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          ¿Estás absolutamente seguro?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. Esto eliminará
                          permanentemente el aviso.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isLoading}>
                          Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          disabled={isLoading}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {isLoading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </CardFooter>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
