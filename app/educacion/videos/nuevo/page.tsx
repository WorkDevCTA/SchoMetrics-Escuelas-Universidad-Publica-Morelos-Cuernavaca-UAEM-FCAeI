"use client";

import React, { useState, useEffect, FormEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Video,
  Loader2,
  ImagePlus,
  Upload,
  Save,
  X,
  ArrowLeft,
} from "lucide-react"; // Agregado Link2
import { Button } from "@/components/ui/button"; //
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; //
import { Input } from "@/components/ui/input"; //
import { Label } from "@/components/ui/label"; //
import { Textarea } from "@/components/ui/textarea"; //
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; //
import { VideoTopic, UserType } from "@prisma/client";
import { z } from "zod";
import toast from "react-hot-toast";
import Image from "next/image";
import {
  ALLOWED_VIDEO_TYPES,
  MAX_SHORT_VIDEO_SIZE,
  ALLOWED_IMAGE_TYPES,
  MAX_THUMBNAIL_SIZE,
} from "@/types/types-supabase-service"; //
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; //
import DashboardLayout from "@/app/components/DashboardLayout";
import { FloatingNavEducation } from "../../components/FloatingNavEducation";

const shortVideoFormSchemaClient = z
  .object({
    title: z
      .string()
      .min(5, "Título: min 5 caracteres.")
      .max(150, "Título: max 150 caracteres."),
    description: z
      .string()
      .max(1000, "Descripción: max 1000 caracteres.")
      .optional()
      .nullable(),
    topic: z.nativeEnum(VideoTopic, {
      errorMap: () => ({ message: "Selecciona un tema." }),
    }),
    authorName: z.string(),
    authorInstitution: z.string(),
    authorInfo: z
      .string()
      .max(500, "Info. autor: max 500 caracteres.")
      .optional()
      .nullable(),
    duration: z
      .string()
      .optional()
      .nullable()
      .refine(
        (val) => !val || /^\d+$/.test(val),
        "Duración: solo números (segundos).",
      ),
    videoSourceType: z.enum(["upload", "url"], {
      required_error: "Debes seleccionar una fuente para el video.",
    }),
    videoFile: z.instanceof(File).optional().nullable(),
    // externalVideoUrl: z.string().url("URL de video externa inválida.").optional().nullable(),
    externalVideoUrl: z.preprocess(
      (val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
      z.string().url("URL de video externa inválida.").optional(),
    ),
    thumbnailFile: z
      .instanceof(File)
      .optional()
      .nullable()
      .refine(
        (file) => !file || file.size <= MAX_THUMBNAIL_SIZE,
        `Miniatura: max ${MAX_THUMBNAIL_SIZE / (1024 * 1024)}MB.`,
      )
      .refine(
        (file) => !file || ALLOWED_IMAGE_TYPES.includes(file.type),
        "Miniatura: tipo no permitido.",
      ),
  })
  .superRefine((data, ctx) => {
    if (data.videoSourceType === "upload" && !data.videoFile) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Debes subir un archivo de video.",
        path: ["videoFile"],
      });
    } else if (data.videoSourceType === "upload" && data.videoFile) {
      if (data.videoFile.size > MAX_SHORT_VIDEO_SIZE)
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Video: max ${MAX_SHORT_VIDEO_SIZE / (1024 * 1024)}MB.`,
          path: ["videoFile"],
        });
      if (
        !ALLOWED_VIDEO_TYPES.filter((t) => t !== "image/gif").includes(
          data.videoFile.type,
        )
      )
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Video: tipo no permitido.",
          path: ["videoFile"],
        });
    }
    if (
      data.videoSourceType === "url" &&
      (!data.externalVideoUrl || data.externalVideoUrl.trim() === "")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Debes ingresar una URL para el video.",
        path: ["externalVideoUrl"],
      });
    }
  });

type ShortVideoFormClientData = z.infer<typeof shortVideoFormSchemaClient>;
type ShortVideoFormErrors = Partial<
  Record<keyof ShortVideoFormClientData, string>
>;

function useUserSession() {
  /* ... (Hook de sesión existente) ... */
  const [session, setSession] = useState<{
    id: string;
    userType: UserType;
    role: string;
    name: string;
    matricula: string;
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

export default function NewShortVideoPage() {
  const router = useRouter();
  const { session, isLoadingSession } = useUserSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formDataState, setFormDataState] = useState<ShortVideoFormClientData>({
    title: "",
    description: "",
    topic: VideoTopic.TUTORIAL_PRACTICO,
    authorName: "",
    authorInstitution: "",
    authorInfo: "",
    duration: "",
    videoSourceType: "upload",
    videoFile: null,
    externalVideoUrl: "",
    thumbnailFile: null,
  });
  const [errors, setErrors] = useState<ShortVideoFormErrors>({});
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoadingSession && session) {
      setFormDataState((prev) => ({
        ...prev,
        authorName: session.name || "",
        authorInstitution:
          session.userType === UserType.TEACHER ||
            session.userType === UserType.ADMIN
            ? "Facultad de Contaduría, Administración e Informática"
            : "Facultad de Contaduría, Administración e Informática",
      }));
    }
  }, [session, isLoadingSession]);

  if (isLoadingSession)
    return (
      <DashboardLayout>
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
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
    setFormDataState((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ShortVideoFormErrors])
      setErrors((prev) => ({ ...prev, [name]: undefined }));
  };
  const handleTopicChange = (value: string) => {
    setFormDataState((prev) => ({ ...prev, topic: value as VideoTopic }));
    if (errors.topic) setErrors((prev) => ({ ...prev, topic: undefined }));
  };
  const handleVideoSourceTypeChange = (value: "upload" | "url") => {
    setFormDataState((prev) => ({
      ...prev,
      videoSourceType: value,
      videoFile: null,
      externalVideoUrl: "" /* Clear other source */,
    }));
    setVideoPreview(null);
    if (videoInputRef.current) videoInputRef.current.value = "";
    setErrors((prev) => ({
      ...prev,
      videoFile: undefined,
      externalVideoUrl: undefined,
    }));
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFormDataState((prev) => ({ ...prev, videoFile: file || null }));
    if (file) setVideoPreview(URL.createObjectURL(file));
    else setVideoPreview(null);
    if (errors.videoFile)
      setErrors((prev) => ({ ...prev, videoFile: undefined }));
  };
  const removeVideoFile = () => {
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setFormDataState((prev) => ({ ...prev, videoFile: null }));
    setVideoPreview(null);
    if (videoInputRef.current) videoInputRef.current.value = "";
  };
  const handleThumbnailFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    setFormDataState((prev) => ({ ...prev, thumbnailFile: file || null }));
    if (file) setThumbnailPreview(URL.createObjectURL(file));
    else setThumbnailPreview(null);
    if (errors.thumbnailFile)
      setErrors((prev) => ({ ...prev, thumbnailFile: undefined }));
  };
  const removeThumbnailFile = () => {
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    setFormDataState((prev) => ({ ...prev, thumbnailFile: null }));
    setThumbnailPreview(null);
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    const validationResult =
      shortVideoFormSchemaClient.safeParse(formDataState);
    if (!validationResult.success) {
      const newErrors: ShortVideoFormErrors = {};
      validationResult.error.errors.forEach((err) => {
        newErrors[err.path[0] as keyof ShortVideoFormClientData] = err.message;
      });
      setErrors(newErrors);
      toast.error("Por favor, corrige los errores.");
      console.log(newErrors);
      return;
    }
    setIsSubmitting(true);
    const apiFormData = new FormData();
    const dataToSend = validationResult.data;

    Object.entries(dataToSend).forEach(([key, value]) => {
      if (key === "videoFile" && value instanceof File)
        apiFormData.append(key, value);
      else if (key === "thumbnailFile" && value instanceof File)
        apiFormData.append(key, value);
      else if (value !== null && value !== undefined)
        apiFormData.append(key, String(value));
    });

    try {
      const response = await fetch("/api/education/short-videos", {
        method: "POST",
        body: apiFormData,
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Error al crear video");
      }
      toast.success("Video corto creado!");
      router.push("/educacion/videos");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const videoTopicsArray = Object.values(VideoTopic);

  return (
    <DashboardLayout>
      <FloatingNavEducation />
      <div className="container mx-auto mt-16 px-4 py-8 lg:mt-0">
        <div className="mb-6">
          <Link
            href="/educacion/videos"
            className="flex items-center text-sm text-blue-600 hover:underline"
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Volver a Videos
          </Link>
        </div>
        <Card className="mx-auto max-w-3xl">
          <CardHeader>
            <div className="mb-2 flex items-center gap-3">
              <Video className="h-7 w-7 text-blue-600" />
              <CardTitle className="text-2xl font-semibold">
                Subir Nuevo Video Corto
              </CardTitle>
            </div>
            <CardDescription>
              Comparte videos educativos sobre prácticas sostenibles y medio
              ambiente.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {/* ... Título, Descripción, Tema, Autor, Institución, Info. Autor ... */}
              <div className="space-y-1">
                <Label htmlFor="title">
                  Título <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="Añade un Título"
                  name="title"
                  value={formDataState.title}
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
                  placeholder="Añade una breve descripción del video..."
                  name="description"
                  value={formDataState.description || ""}
                  onChange={handleInputChange}
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="topic-video-new">
                    Tema <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formDataState.topic}
                    onValueChange={handleTopicChange}
                    name="topic"
                    disabled={isSubmitting}
                  >
                    <SelectTrigger
                      id="topic-video-new"
                      className={errors.topic ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Tema" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Temas</SelectLabel>
                        {videoTopicsArray.map((topicValue) => (
                          <SelectItem key={topicValue} value={topicValue}>
                            {topicValue.replace(/_/g, " ")}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.topic && (
                    <p className="text-sm text-red-500">{errors.topic}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="duration">Duración (segundos)</Label>
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    value={formDataState.duration || ""}
                    onChange={handleInputChange}
                    placeholder="Ej: 180"
                    disabled={isSubmitting}
                  />
                  {errors.duration && (
                    <p className="text-sm text-red-500">{errors.duration}</p>
                  )}
                </div>
              </div>

              {/* Selección de Fuente de Video */}
              <div className="space-y-2">
                <Label>
                  Fuente del Video <span className="text-red-500">*</span>
                </Label>
                <RadioGroup
                  value={formDataState.videoSourceType}
                  onValueChange={(val) =>
                    handleVideoSourceTypeChange(val as "upload" | "url")
                  }
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="upload" id="video-upload" />
                    <Label htmlFor="video-upload">Subir archivo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="url" id="video-url" />
                    <Label htmlFor="video-url">Usar URL externa</Label>
                  </div>
                </RadioGroup>
                {errors.videoSourceType && (
                  <p className="text-sm text-red-500">
                    {errors.videoSourceType}
                  </p>
                )}
              </div>

              {/* Input para Video (Archivo o URL) */}
              {formDataState.videoSourceType === "upload" && (
                <div className="space-y-1">
                  <Label htmlFor="videoFile">
                    Archivo de Video <span className="text-red-500">*</span>
                  </Label>
                  <div
                    className={`border-2 p-3 ${errors.videoFile ? "border-red-500" : "border-gray-300"} rounded-lg border-dashed`}
                  >
                    <div
                      className="flex w-full cursor-pointer items-center justify-center rounded-md bg-gray-50 py-2 hover:bg-gray-100"
                      onClick={() => videoInputRef.current?.click()}
                    >
                      <input
                        type="file"
                        id="videoFile"
                        name="videoFile"
                        ref={videoInputRef}
                        onChange={handleVideoFileChange}
                        className="hidden"
                        accept={ALLOWED_VIDEO_TYPES.filter(
                          (t) => t !== "image/gif",
                        ).join(",")}
                        disabled={isSubmitting}
                      />
                      <Upload className="mr-1.5 h-4 w-4 text-gray-500" />
                      <span className="text-xs text-gray-600">
                        {formDataState.videoFile
                          ? formDataState.videoFile.name
                          : `Subir video (MP4, etc. - Máx. ${MAX_SHORT_VIDEO_SIZE / (1024 * 1024)}MB)`}
                      </span>
                    </div>
                    {videoPreview && (
                      <div className="relative mt-2 aspect-video overflow-hidden rounded bg-black">
                        <video
                          src={videoPreview}
                          controls
                          className="h-full w-full object-contain"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute right-1 top-1 z-10 h-6 w-6 p-0.5"
                          onClick={removeVideoFile}
                          disabled={isSubmitting}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                  {errors.videoFile && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.videoFile}
                    </p>
                  )}
                </div>
              )}
              {formDataState.videoSourceType === "url" && (
                <div className="space-y-1">
                  <Label htmlFor="externalVideoUrl">
                    URL del Video Externo{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="externalVideoUrl"
                    name="externalVideoUrl"
                    type="url"
                    value={formDataState.externalVideoUrl || ""}
                    onChange={handleInputChange}
                    placeholder="https://www.youtube.com/watch?v=..."
                    disabled={isSubmitting}
                    className={errors.externalVideoUrl ? "border-red-500" : ""}
                  />
                  {errors.externalVideoUrl && (
                    <p className="text-sm text-red-500">
                      {errors.externalVideoUrl}
                    </p>
                  )}
                </div>
              )}

              {/* Input para Miniatura (Opcional) */}
              <div className="space-y-1">
                <Label htmlFor="thumbnailFile">Miniatura (Opcional)</Label>
                <div
                  className={`border-2 p-3 ${errors.thumbnailFile ? "border-red-500" : "border-gray-300"} rounded-lg border-dashed`}
                >
                  <div
                    className="flex w-full cursor-pointer items-center justify-center rounded-md bg-gray-50 py-2 hover:bg-gray-100"
                    onClick={() => thumbnailInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      id="thumbnailFile"
                      ref={thumbnailInputRef}
                      onChange={handleThumbnailFileChange}
                      className="hidden"
                      accept={ALLOWED_IMAGE_TYPES.join(",")}
                      disabled={isSubmitting}
                    />
                    <ImagePlus className="mr-1.5 h-4 w-4 text-gray-500" />
                    <span className="text-xs text-gray-600">
                      {formDataState.thumbnailFile
                        ? formDataState.thumbnailFile.name
                        : `Subir miniatura (Max ${MAX_THUMBNAIL_SIZE / (1024 * 1024)}MB)`}
                    </span>
                  </div>
                  {thumbnailPreview && (
                    <div className="group relative mt-2 aspect-video h-20 w-32 overflow-hidden rounded bg-gray-100">
                      <Image
                        src={thumbnailPreview}
                        alt="Miniatura"
                        layout="fill"
                        objectFit="cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute right-0.5 top-0.5 z-10 h-5 w-5 p-0.5 opacity-0 group-hover:opacity-100"
                        onClick={removeThumbnailFile}
                        disabled={isSubmitting}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
                {errors.thumbnailFile && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.thumbnailFile}
                  </p>
                )}
              </div>
              {/* Info del Autor */}
              <div className="border-t pt-4">
                <h3 className="text-md mb-3 font-semibold">
                  Información del Autor
                </h3>
                {/* ... campos de autor como antes ... */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="authorName">
                      Nombre del Autor <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="authorName"
                      name="authorName"
                      value={formDataState.authorName}
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
                    <Label htmlFor="authorInstitution">
                      Institución <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="authorInstitution"
                      name="authorInstitution"
                      value={formDataState.authorInstitution}
                      onChange={handleInputChange}
                      disabled={
                        isSubmitting ||
                        !!(
                          session?.userType === UserType.TEACHER ||
                          session?.userType === UserType.ADMIN
                        )
                      }
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
                <div className="mt-4 flex flex-col space-y-1">
                  <Label htmlFor="authorInfo">
                    Información Adicional del Autor (Usuario actual)
                    <p className="text-xs text-muted-foreground">
                      Si el video es de terceros (YouTube, etc.), añade toda la
                      información necesaria referenciando al autor(es) original.
                    </p>
                  </Label>
                  <Textarea
                    id="authorInfo"
                    name="authorInfo"
                    placeholder="Añade más detalles o información..."
                    value={formDataState.authorInfo || ""}
                    onChange={handleInputChange}
                    rows={2}
                    disabled={isSubmitting}
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
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Publicar Video
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
