import {
  ALLOWED_AVATAR_TYPES,
  ALLOWED_FILE_TYPES,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  bucketName,
  MAX_AVATAR_SIZE,
  MAX_FILE_SIZE,
  supabaseClient,
  supabaseStorageUrl,
} from "@/types/types-supabase-service";
import { v4 as uuidv4 } from "uuid";

export const generateUniqueFileName = (originalName: string): string => {
  const extension = originalName.split(".").pop()?.toLowerCase();
  return `${uuidv4()}.${extension}`;
};

export const sanitizeForStorageKey = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD") // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, "") // Remove accent marks
    .replace(/[^a-z0-9\s-]/g, "") // Keep only alphanumeric, spaces, and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, "") // Remove leading/trailing hyphens
    .substring(0, 50); // Limit length to 50 characters
};

const basePrefix = "morelos/cuernavaca/universidad/publica/uaem-fcaei/";

export const uploadAvatarToSupabase = async (
  buffer: Buffer,
  originalFileName: string,
  mimeType: string,
  userTypePrefix: string,
  matricula: string,
  folderPrefix = "img-profile/"
): Promise<{
  fileKey: string;
  publicUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  format: string;
}> => {
  const uniqueFileName = generateUniqueFileName(originalFileName);
  const fileKey = `${basePrefix}${userTypePrefix}/${matricula}/${folderPrefix}${uniqueFileName}`;
  const format = originalFileName.split(".").pop()?.toLowerCase() || "";

  try {
    const { data, error } = await supabaseClient.storage
      .from(bucketName)
      .upload(fileKey, buffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      console.error("Error uploading avatar to Supabase:", error);
      throw new Error("Error al subir el archivo de avatar");
    }

    const publicUrl = `${supabaseStorageUrl}/${fileKey}`;
    console.log("Avatar subido a Supabase Storage. Key:", fileKey);

    return {
      fileKey,
      publicUrl,
      fileName: originalFileName,
      fileType: mimeType,
      fileSize: buffer.byteLength,
      format,
    };
  } catch (error) {
    console.error(
      "Error al subir buffer(archivo) optimizado a Supabase:",
      error
    );
    throw new Error("Error al subir el archivo de avatar");
  }
};

export const uploadFileEvidenceToSupabase = async (
  file: File,
  userTypePrefix: string,
  matricula: string,
  titleActivity: string,
  folderPrefix = "activity-evidence/"
): Promise<{
  fileKey: string;
  publicUrl: string;
  originalFileName: string;
  fileType: string;
  determinedType: string;
  fileSize: number;
  format: string;
}> => {
  const uniqueFileName = generateUniqueFileName(file.name);
  const sanitizedTitle = sanitizeForStorageKey(titleActivity);
  const fileKey = `${basePrefix}${userTypePrefix}/${matricula}/${folderPrefix}${sanitizedTitle}/${uniqueFileName}`;
  const fileBuffer = await file.arrayBuffer();
  const format = file.name.split(".").pop()?.toLowerCase() || "";

  try {
    const { data, error } = await supabaseClient.storage
      .from(bucketName)
      .upload(fileKey, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Error uploading evidence to Supabase:", error);
      throw new Error("Error al subir el archivo de evidencia");
    }

    const publicUrl = `${supabaseStorageUrl}/${fileKey}`;

    // Determinar el tipo de archivo (imagen o video)
    const determinedType = ALLOWED_IMAGE_TYPES.includes(file.type)
      ? "image"
      : ALLOWED_VIDEO_TYPES.includes(file.type)
      ? "video"
      : "other";

    console.log(
      "Archivo de evidencia subido a Supabase Storage. Key:",
      fileKey
    );

    return {
      fileKey,
      publicUrl,
      originalFileName: file.name,
      fileType: file.type,
      determinedType,
      fileSize: file.size,
      format,
    };
  } catch (error) {
    console.error("Error al subir archivo de evidencia a Supabase:", error);
    throw new Error("Error al subir el archivo de evidencia");
  }
};

export const uploadVisualMaterialImageToSupabase = async (
  buffer: Buffer,
  originalFileName: string,
  mimeType: string,
  userTypePrefix: string,
  matricula: string,
  titleResourceEducation: string,
  folderPrefix = "visual-material-images/"
): Promise<{
  fileKey: string;
  publicUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  format: string;
}> => {
  const uniqueFileName = generateUniqueFileName(originalFileName);
  const sanitizedTitle = sanitizeForStorageKey(titleResourceEducation);
  const fileKey = `${basePrefix}${userTypePrefix}/${matricula}/${folderPrefix}${sanitizedTitle}/${uniqueFileName}`;
  const format = originalFileName.split(".").pop()?.toLowerCase() || "";

  try {
    const { data, error } = await supabaseClient.storage
      .from(bucketName)
      .upload(fileKey, buffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      console.error("Error uploading visual material to Supabase:", error);
      throw new Error("Error al subir la imagen del material visual");
    }

    const publicUrl = `${supabaseStorageUrl}/${fileKey}`;
    console.log(
      "Imagen de Material Visual subida a Supabase Storage. Key:",
      fileKey
    );

    return {
      fileKey,
      publicUrl,
      fileName: originalFileName,
      fileType: mimeType,
      fileSize: buffer.byteLength,
      format,
    };
  } catch (error) {
    console.error(
      "Error al subir imagen de material visual a Supabase:",
      error
    );
    throw new Error("Error al subir la imagen del material visual");
  }
};

export const uploadShortVideoFileToSupabase = async (
  file: File,
  userTypePrefix: string,
  matricula: string,
  titleResourceEducation: string,
  folderPrefix = "short-videos/"
): Promise<{
  fileKey: string;
  publicUrl: string;
  originalFileName: string;
  fileType: string;
  fileSize: number;
  format: string;
}> => {
  const uniqueFileName = generateUniqueFileName(file.name);
  const sanitizedTitle = sanitizeForStorageKey(titleResourceEducation);
  const fileKey = `${basePrefix}${userTypePrefix}/${matricula}/${folderPrefix}${sanitizedTitle}/${uniqueFileName}`;
  const fileBuffer = await file.arrayBuffer();
  const format = file.name.split(".").pop()?.toLowerCase() || "";

  try {
    const { data, error } = await supabaseClient.storage
      .from(bucketName)
      .upload(fileKey, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Error uploading short video to Supabase:", error);
      throw new Error("Error al subir el video corto");
    }

    const publicUrl = `${supabaseStorageUrl}/${fileKey}`;
    console.log("Video corto subido a Supabase Storage. Key:", fileKey);

    return {
      fileKey,
      publicUrl,
      originalFileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      format,
    };
  } catch (error) {
    console.error("Error al subir video corto a Supabase:", error);
    throw new Error("Error al subir el video corto");
  }
};

export const uploadVideoThumbnailToSupabase = async (
  buffer: Buffer,
  originalFileName: string,
  mimeType: string,
  userTypePrefix: string,
  matricula: string,
  titleResourceEducation: string,
  folderPrefix = "video-thumbnails/"
): Promise<{
  fileKey: string;
  publicUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  format: string;
}> => {
  const uniqueFileName = generateUniqueFileName(originalFileName);
  const sanitizedTitle = sanitizeForStorageKey(titleResourceEducation);
  const fileKey = `${basePrefix}${userTypePrefix}/${matricula}/${folderPrefix}${sanitizedTitle}/${uniqueFileName}`;
  const format = originalFileName.split(".").pop()?.toLowerCase() || "";

  try {
    const { data, error } = await supabaseClient.storage
      .from(bucketName)
      .upload(fileKey, buffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      console.error("Error uploading video thumbnail to Supabase:", error);
      throw new Error("Error al subir la miniatura del video");
    }

    const publicUrl = `${supabaseStorageUrl}/${fileKey}`;
    console.log("Miniatura de video subida a Supabase Storage. Key:", fileKey);

    return {
      fileKey,
      publicUrl,
      fileName: originalFileName,
      fileType: mimeType,
      fileSize: buffer.byteLength,
      format,
    };
  } catch (error) {
    console.error("Error al subir miniatura de video a Supabase:", error);
    throw new Error("Error al subir la miniatura del video");
  }
};

// Función para obtener la URL firmada de un archivo PRIVADO en Supabase Storage
export const getSignedFileUrl = async (
  bucketName: string,
  filePath: string,
  expiresIn: number = 3600 // segundos
): Promise<string> => {
  try {
    const { data, error } = await supabaseClient.storage
      .from(bucketName)
      .createSignedUrl(filePath, expiresIn);

    if (error || !data?.signedUrl) {
      console.error("Error al obtener URL firmada:", error?.message);
      throw new Error("No se pudo generar la URL firmada");
    }

    return data.signedUrl;
  } catch (err) {
    console.error("Error inesperado:", err);
    throw new Error("Error al obtener la URL del archivo");
  }
};

export const getPublicSupabaseUrl = (fileKey: string): string | null => {
  if (fileKey) {
    return `${supabaseStorageUrl}/${fileKey}`;
  }
  return null;
};

export const deleteFileFromSupabase = async (
  fileKey: string
): Promise<void> => {
  try {
    const { error } = await supabaseClient.storage
      .from(bucketName)
      .remove([fileKey]);

    if (error) {
      console.error("Error deleting file from Supabase:", error);
      throw new Error("Error al eliminar el archivo");
    }

    console.log("Archivo eliminado de Supabase Storage");
  } catch (error) {
    console.error("Error al eliminar archivo de Supabase:", error);
  }
};

export const deleteUserFolderFromSupabase = async (
  userTypePrefix: string,
  matricula: string
): Promise<void> => {
  const folderPrefix = `${basePrefix}${userTypePrefix}/${matricula}/`;

  try {
    // List all files with the folder prefix
    const { data: files, error: listError } = await supabaseClient.storage
      .from(bucketName)
      .list(folderPrefix, {
        limit: 1000,
        offset: 0,
      });

    if (listError) {
      console.error("Error listing files in user folder:", listError);
      throw new Error("Error al listar archivos del usuario");
    }

    if (!files || files.length === 0) {
      console.log(
        `No se encontraron archivos en la carpeta del usuario '${folderPrefix}'`
      );
      return;
    }

    // Delete all files in the folder
    const filePaths = files.map((file) => `${folderPrefix}${file.name}`);
    const { error: deleteError } = await supabaseClient.storage
      .from(bucketName)
      .remove(filePaths);

    if (deleteError) {
      console.error("Error deleting user folder:", deleteError);
      throw new Error("Error al eliminar los archivos del usuario");
    }

    console.log(
      `Carpeta del usuario '${folderPrefix}' y su contenido fueron eliminados.`
    );
  } catch (error) {
    console.error(
      `Error al eliminar la carpeta del usuario '${folderPrefix}':`,
      error
    );
    throw new Error(
      "Error al eliminar los archivos del usuario en Supabase Storage"
    );
  }
};

export const validateVideoFile = (
  file: File,
  maxSizeMB = 10
): { valid: boolean; error?: string } => {
  const MAX_VIDEO_SIZE = maxSizeMB * 1024 * 1024;
  const currentAllowedVideoTypes = ALLOWED_VIDEO_TYPES.filter(
    (type) => type !== "image/gif"
  );

  if (!currentAllowedVideoTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Tipo de archivo no permitido para video. Solo se permiten: ${currentAllowedVideoTypes
        .map((t) => t.split("/")[1])
        .join(", ")}.`,
    };
  }
  if (file.size > MAX_VIDEO_SIZE) {
    return {
      valid: false,
      error: `El video excede el tamaño máximo de ${maxSizeMB}MB.`,
    };
  }
  return { valid: true };
};

export const validateAvatarFile = (
  file: File
): { valid: boolean; error?: string } => {
  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
    return {
      valid: false,
      error:
        "Tipo de archivo no permitido para avatar. Solo se permiten JPG, PNG, JPEG, WEBP.",
    };
  }
  if (file.size > MAX_AVATAR_SIZE) {
    return {
      valid: false,
      error: "El archivo de avatar excede el tamaño máximo permitido de 5MB.",
    };
  }
  return { valid: true };
};

export const validateFile = (
  file: File
): { valid: boolean; error?: string } => {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error:
        "Tipo de archivo no permitido. Solo se permiten JPG, PNG, JPEG, WEBP, MP4 y GIF.",
    };
  }
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: "El archivo excede el tamaño máximo permitido de 5MB.",
    };
  }
  return { valid: true };
};

export const moveFileInSupabase = async (
  oldFileKey: string,
  newFileKey: string
): Promise<void> => {
  try {
    // Download the file from the old location
    const { data: fileData, error: downloadError } =
      await supabaseClient.storage.from(bucketName).download(oldFileKey);

    if (downloadError) {
      console.error(
        "Error downloading file for move operation:",
        downloadError
      );
      throw new Error("Error al descargar el archivo para mover");
    }

    // Upload the file to the new location
    const { error: uploadError } = await supabaseClient.storage
      .from(bucketName)
      .upload(newFileKey, fileData, {
        upsert: false,
      });

    if (uploadError) {
      console.error("Error uploading file to new location:", uploadError);
      throw new Error("Error al subir el archivo a la nueva ubicación");
    }

    // Delete the file from the old location
    const { error: deleteError } = await supabaseClient.storage
      .from(bucketName)
      .remove([oldFileKey]);

    if (deleteError) {
      console.error("Error deleting file from old location:", deleteError);
      throw new Error("Error al eliminar el archivo de la ubicación anterior");
    }

    console.log(`Archivo movido de ${oldFileKey} a ${newFileKey}`);
  } catch (error) {
    console.error("Error moving file in Supabase:", error);
    throw new Error("Error al mover el archivo en Supabase Storage");
  }
};
