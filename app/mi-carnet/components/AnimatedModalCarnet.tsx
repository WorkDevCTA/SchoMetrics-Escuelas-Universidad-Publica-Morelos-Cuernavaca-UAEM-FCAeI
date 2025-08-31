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
    {
      content:
        "🔘 Puedes visualizar las imágenes de ejemplo que se muestran arriba para usar de manera correcta tu Carnet.",
    },
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
            <div className="flex h-[100px] w-full items-center justify-start gap-4 overflow-y-hidden overflow-x-scroll px-2 py-20 md:h-[700px] xl:h-[400px]">
              {/*  */}
              <VisualAnimateModelImages />
            </div>
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

const PlaneIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M16 10h4a2 2 0 0 1 0 4h-4l-4 7h-3l2 -7h-4l-2 2h-3l2 -4l-2 -4h3l2 2h4l-2 -7h3z" />
    </svg>
  );
};

const VacationIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M17.553 16.75a7.5 7.5 0 0 0 -10.606 0" />
      <path d="M18 3.804a6 6 0 0 0 -8.196 2.196l10.392 6a6 6 0 0 0 -2.196 -8.196z" />
      <path d="M16.732 10c1.658 -2.87 2.225 -5.644 1.268 -6.196c-.957 -.552 -3.075 1.326 -4.732 4.196" />
      <path d="M15 9l-3 5.196" />
      <path d="M3 19.25a2.4 2.4 0 0 1 1 -.25a2.4 2.4 0 0 1 2 1a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1a2.4 2.4 0 0 1 2 -1a2.4 2.4 0 0 1 2 1a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1a2.4 2.4 0 0 1 2 -1a2.4 2.4 0 0 1 1 .25" />
    </svg>
  );
};

const ElevatorIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M5 4m0 1a1 1 0 0 1 1 -1h12a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-12a1 1 0 0 1 -1 -1z" />
      <path d="M10 10l2 -2l2 2" />
      <path d="M10 14l2 2l2 -2" />
    </svg>
  );
};

const FoodIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M20 20c0 -3.952 -.966 -16 -4.038 -16s-3.962 9.087 -3.962 14.756c0 -5.669 -.896 -14.756 -3.962 -14.756c-3.065 0 -4.038 12.048 -4.038 16" />
    </svg>
  );
};

const MicIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M15 12.9a5 5 0 1 0 -3.902 -3.9" />
      <path d="M15 12.9l-3.902 -3.899l-7.513 8.584a2 2 0 1 0 2.827 2.83l8.588 -7.515z" />
    </svg>
  );
};

const ParachuteIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M22 12a10 10 0 1 0 -20 0" />
      <path d="M22 12c0 -1.66 -1.46 -3 -3.25 -3c-1.8 0 -3.25 1.34 -3.25 3c0 -1.66 -1.57 -3 -3.5 -3s-3.5 1.34 -3.5 3c0 -1.66 -1.46 -3 -3.25 -3c-1.8 0 -3.25 1.34 -3.25 3" />
      <path d="M2 12l10 10l-3.5 -10" />
      <path d="M15.5 12l-3.5 10l10 -10" />
    </svg>
  );
};
