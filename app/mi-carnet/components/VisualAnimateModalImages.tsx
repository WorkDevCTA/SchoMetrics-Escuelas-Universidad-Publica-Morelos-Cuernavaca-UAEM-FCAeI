import { X } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/legacy/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ZoomableImage } from "@/app/components/ZoomableImage";

export const VisualAnimateModelImages = () => {
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);

  const handleImageClick = (url: string) => {
    setSelectedMedia(url);
  };

  const handleCloseModal = () => {
    setSelectedMedia(null);
  };

  const images = [
    "https://img.freepik.com/free-photo/closeup-scarlet-macaw-from-side-view-scarlet-macaw-closeup-head_488145-3540.jpg?semt=ais_hybrid&w=740&q=80",
    "https://schometrics.s3.us-east-2.amazonaws.com/schometrics-for-schools/morelos/cuernavaca/publica/escuela-secundaria-general-99/ADMIN/00000000/visual-material-images/Test%2011/dd8b1257-aa52-4914-8a0c-94be62eac1d4.webp",
    "/logo.png",
    "/logo.png",
    "/logo.png",
  ];

  return (
    <div className="mt-2">
      <div className="relative flex gap-4">
        {images.map((images, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
            className="relative h-24 w-24 cursor-pointer overflow-hidden rounded-md bg-gray-100 shadow-sm xl:h-48 xl:w-48"
            onClick={() => {
              // Asegurarse de que publicDisplayUrl exista y sea una imagen
              if (images) {
                handleImageClick(images);
              }
            }}
          >
            <Image
              src={images}
              alt={images || "tutorial_carnet_images"}
              layout="fill"
              objectFit="cover" // cover puede ser mejor para miniaturas
              priority={false} // No todas necesitan ser priority
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder.svg"; // Placeholder genérico
                target.alt = "Error al cargar imagen";
              }}
            />
            )
          </motion.div>
        ))}
        {selectedMedia && (
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
              {selectedMedia && (
                <ZoomableImage
                  src={selectedMedia}
                  alt="Tutorial Carnet Image ampliada"
                />
              )}
            </motion.div>
            <Button
              variant="outline"
              onClick={handleCloseModal}
              className="absolute top-0 mt-3 border-none bg-baseSecondColor text-white"
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
