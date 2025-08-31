"use client";
import React from "react";

import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalTrigger,
} from "@/components/ui/animated-modal";
import { BadgeQuestionMarkIcon } from "lucide-react";
import { VisualAnimateModelImages } from "./VisualAnimateModalImages";

export function AnimatedModalCarnet() {
  const tutorialExplainContent = [
    {
      content: "✅ Revisa el Manual de Actividades Permitidas.",
    },
    {
      content: "✅ Realiza una Actividad Ambiental Válida.",
    },
    {
      content:
        '✅ Completa de manera correcta el formulario "Nueva Actividad".',
    },
    {
      content:
        "✅ Debes agregar mínimo 1 y máximo 3 evidencias (fotos o videos) de la actividad realizada.",
    },
    {
      content:
        "✅ Es OBLIGATORIO tu presencia en mínimo 1 de las 3 evidencias que hayas agregado.",
    },
    {
      content:
        '✅ Es OBLIGATORIO mostrar tu "Carnet de Identidad" de SchoMetrics en todas las evidencias que hayas agregado.',
    },
    {
      content:
        "⚠️ La forma correcta de usar el Carnet de Identidad es la siguiente:",
    },
    {
      content:
        "✔️ Accede a la sección Mi Carnet, realiza un zoom para que el Carnet ocupe toda la pantalla de tu dispositivo y muéstralo de frente a la cámara, asegúrate de estar en el lugar donde realizaste la Actividad o que se pueda visualizar la acción que realizaste, ejemplo: Frente a tu Composta o entregando materiales en un Centro de Acopio/Reciclaje.",
    },
    // {
    //   content:
    //     "🔘 Puedes visualizar las imágenes de ejemplo que se muestran arriba para usar de manera correcta tu Carnet.",
    // },
    {
      content:
        "🔘 El Carnet es tu herramienta de identificación en la Plataforma SchoMetrics y con el puedes validar tus evidencias ambientales.",
    },
    {
      content:
        "❌ Incumplir en alguna de las anteriores indicaciones, puede generar la invalidez y eliminación de tu Actividad Ambiental.",
    },
  ];
  return (
    <div className="flex items-center justify-center">
      <Modal>
        <ModalTrigger className="group/modal-btn flex items-center justify-center bg-white text-center font-semibold text-baseColor">
          <BadgeQuestionMarkIcon className="mx-2 h-5 w-5 animate-heartbeat text-baseColor" />
          <span className="text-center transition duration-500 group-hover/modal-btn:translate-x-40">
            ¿Cómo usarlo?
          </span>
          <div className="absolute inset-0 z-20 flex -translate-x-40 items-center justify-center text-baseColor transition duration-500 group-hover/modal-btn:translate-x-0">
            <p className="ml-5">¡ Click aquí !</p>
          </div>
        </ModalTrigger>
        <ModalBody>
          <ModalContent className="overflow-auto">
            <h4 className="mb-8 text-center text-lg font-bold text-neutral-600 md:text-2xl">
              ¿Cómo usar mi{" "}
              <span className="rounded-md bg-baseColor px-1 py-0.5 text-white">
                Carnet
              </span>{" "}
              De SchoMetrics?
            </h4>
            {/* <div className="flex h-[100px] w-full items-center justify-start gap-4 overflow-y-hidden overflow-x-scroll px-2 py-20 md:h-[700px] xl:h-[400px]">
              <VisualAnimateModelImages />
            </div> */}
            <div className="mb-10 mt-5 flex w-full flex-col items-start justify-start gap-x-4 gap-y-6 overflow-auto rounded-md bg-gray-100 p-10 text-start">
              {tutorialExplainContent.map((content, index) => (
                <div key={index}>
                  <span className="text-sm text-neutral-700">
                    {content.content}
                  </span>
                </div>
              ))}
            </div>
          </ModalContent>
          <ModalFooter className="gap-4"></ModalFooter>
        </ModalBody>
      </Modal>
    </div>
  );
}




