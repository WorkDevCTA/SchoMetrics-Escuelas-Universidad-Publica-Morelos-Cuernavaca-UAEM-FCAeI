// components/product-lightbox-viewer.tsx
"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"; //
import { X, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button"; //
import Image from "next/legacy/image";

interface ProductImage {
  id: string;
  url: string | null;
}

interface ProductLightboxViewerProps {
  images: ProductImage[];
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  initialImageId?: string | null; // Para establecer la imagen inicial en el carrusel
  productName?: string;
}

export const ProductLightboxViewer: React.FC<ProductLightboxViewerProps> = ({
  images,
  isOpen,
  onOpenChange,
  initialImageId,
  productName,
}) => {
  if (!images || images.length === 0) {
    return null;
  }

  const validImages = images.filter((img) => img.url);
  const initialImageIndex = initialImageId
    ? validImages.findIndex((img) => img.id === initialImageId)
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col border-none bg-black/80 p-2 shadow-2xl backdrop-blur-sm sm:p-4">
        <div className="mb-2 flex items-center justify-between px-2 pt-1">
          {productName && (
            <span className="truncate text-sm text-white">{productName}</span>
          )}
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20 hover:text-white"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Cerrar</span>
            </Button>
          </DialogClose>
          <DialogTitle>Cerrar</DialogTitle>
        </div>
        {validImages.length > 0 ? (
          <Carousel
            opts={{
              align: "start",
              loop: validImages.length > 1,
              startIndex: initialImageIndex >= 0 ? initialImageIndex : 0,
            }}
            className="flex h-full w-full flex-grow items-center justify-center"
          >
            <CarouselContent className="-ml-2">
              {" "}
              {/* Ajuste para espaciado si es necesario */}
              {validImages.map((image, index) => (
                <CarouselItem key={image.id || index} className="w-full pl-2">
                  {" "}
                  {/* Ajuste para espaciado */}
                  <div className="relative flex h-[75vh] items-center justify-center">
                    {image.url ? (
                      <Image
                        src={image.url}
                        alt={`${productName || "Imagen de producto"} ${index + 1}`}
                        width={500}
                        height={500}
                        objectFit="cover"
                        className="rounded-md"
                        priority={index === initialImageIndex}
                        onError={(e) => {
                          console.warn(
                            `Error al cargar imagen en lightbox: ${image.url}`,
                          );
                          e.currentTarget.style.display = "none"; // Ocultar si falla
                          // Podrías mostrar un placeholder aquí dentro del div
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center rounded-md bg-gray-700">
                        <ImageOff className="h-16 w-16 text-gray-400" />
                        <p className="mt-2 text-gray-400">
                          Imagen no disponible
                        </p>
                      </div>
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {validImages.length > 1 && (
              <>
                <CarouselPrevious className="absolute left-2 top-1/2 z-10 h-10 w-10 -translate-y-1/2 border-none bg-black/50 text-white hover:bg-black/70 sm:left-4 sm:h-12 sm:w-12" />
                <CarouselNext className="absolute right-2 top-1/2 z-10 h-10 w-10 -translate-y-1/2 border-none bg-black/50 text-white hover:bg-black/70 sm:right-4 sm:h-12 sm:w-12" />
              </>
            )}
          </Carousel>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-white">
            <ImageOff className="h-24 w-24 text-gray-500" />
            <p className="mt-4">No hay imágenes válidas para mostrar.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
