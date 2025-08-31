import { ActivityForAdmin } from "@/types/types";
import { Film, ImageOff, X } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { ZoomableImage } from "./ZoomableImage";
import { Button } from "@/components/ui/button";

export const EvidenceThumbnailsAdmin = ({
  evidence,
}: {
  evidence: ActivityForAdmin["evidence"];
}) => {
  const [showAll, setShowAll] = useState(false);
  // Asegurarse de que 'evidence' sea un array antes de usar slice o length
  const validEvidence = Array.isArray(evidence) ? evidence : [];
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | "gif" | null>(
    null,
  );
  const visibleEvidence = showAll ? validEvidence : validEvidence.slice(0, 3);

  const handleMediaClick = (url: string, type: "image" | "video" | "gif") => {
    setSelectedMedia(url);
    setMediaType(type);
  };

  const handleCloseModal = () => {
    setSelectedMedia(null);
    setMediaType(null);
  };

  if (validEvidence.length === 0) {
    return (
      <p className="mt-2 text-xs text-muted-foreground">
        Sin evidencia adjunta.
      </p>
    );
  }

  return (
    <div className="mt-2">
      <div className="relative flex items-center gap-2">
        {visibleEvidence.map((ev) => (
          <motion.div
            key={ev.id}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
            className="relative h-16 w-16 cursor-pointer overflow-hidden rounded-md bg-gray-100 shadow-sm"
            onClick={() => {
              if (ev.fileType === "image" && ev.publicDisplayUrl) {
                handleMediaClick(ev.publicDisplayUrl, "image");
              } else if (ev.fileType === "video" && ev.publicDisplayUrl) {
                handleMediaClick(ev.publicDisplayUrl, "video");
              } else if (ev.fileType === "gif" && ev.publicDisplayUrl) {
                handleMediaClick(ev.publicDisplayUrl, "gif");
              } else {
                // Manejar otros tipos si es necesario
              }
            }}
          >
            {ev.publicDisplayUrl ? (
              ev.fileType === "image" ? (
                <Image
                  src={ev.publicDisplayUrl}
                  alt={ev.fileName || "Evidencia"}
                  layout="fill"
                  objectFit="cover" // cover puede ser mejor para miniaturas
                  priority={false} // No todas necesitan ser priority
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg"; // Placeholder genérico
                    target.alt = "Error al cargar imagen";
                  }}
                />
              ) : ev.fileType === "video" ? (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-100 to-cyan-100">
                  <Film className="h-16 w-16 text-blue-400 opacity-70" />
                </div>
              ) : ev.fileType === "gif" ? (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-100 to-cyan-100">
                  <Film className="h-16 w-16 text-blue-400 opacity-70" />
                </div>
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-100 to-cyan-100">
                  <Film className="h-16 w-16 text-blue-400 opacity-70" />
                </div>
              )
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center bg-gray-200 p-1 text-center text-gray-500">
                <ImageOff className="mb-0.5 h-6 w-6" />
                <span className="text-xs">No disponible</span>
              </div>
            )}
          </motion.div>
        ))}
        {validEvidence.length > 3 && !showAll && (
          <button
            onClick={() => setShowAll(true)}
            className="self-end text-xs text-blue-500 hover:underline"
          >
            Ver más ({validEvidence.length - 3})
          </button>
        )}
        {validEvidence.length > 3 && showAll && (
          <button
            onClick={() => setShowAll(false)}
            className="self-end text-xs text-blue-500 hover:underline"
          >
            Ver menos
          </button>
        )}

        {/* Modal para imagen, video o gif */}
        {selectedMedia && mediaType && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed left-0 top-0 z-[5000] flex min-h-screen w-full cursor-pointer items-center justify-center bg-black/80 p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              className="relative flex min-h-screen max-w-full items-center justify-center p-10"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              {mediaType === "image" && (
                <ZoomableImage src={selectedMedia} alt="Evidencia ampliada" />
              )}
              {mediaType === "video" && (
                <video
                  src={selectedMedia}
                  controls
                  autoPlay
                  className="max-h-full max-w-full rounded-md object-contain"
                />
              )}
              {mediaType === "gif" && (
                <img
                  src={selectedMedia}
                  alt="GIF"
                  className="max-h-full max-w-full rounded-md object-contain"
                />
              )}
            </motion.div>
            <Button
              variant="outline"
              onClick={handleCloseModal}
              className="absolute top-0 mt-3 border-none bg-teal-400 text-white"
            >
              <X className="h-5 w-5 font-bold" />
              Cerrar
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};
