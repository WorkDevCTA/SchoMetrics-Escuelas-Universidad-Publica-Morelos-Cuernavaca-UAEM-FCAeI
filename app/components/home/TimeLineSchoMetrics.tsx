import React from "react";
import { Timeline } from "@/components/ui/timeline";
import Image from "next/image";

const actividadesAmbientalesHomeImages = [
  {
    src: "https://mltorvndjppviqivdysl.supabase.co/storage/v1/object/public/schometrics-for-schools-uaem-fcaei-cuernavaca-morelos/resources/images/home-images/formulario-de-actividades-schometrics.svg",
    alt: "formulario-de-actividades-schometrics",
  },
  {
    src: "https://mltorvndjppviqivdysl.supabase.co/storage/v1/object/public/schometrics-for-schools-uaem-fcaei-cuernavaca-morelos/resources/images/home-images/lista-de-actividades-schometrics.svg",
    alt: "lista-de-actividades-schometrics",
  },
  {
    src: "https://mltorvndjppviqivdysl.supabase.co/storage/v1/object/public/schometrics-for-schools-uaem-fcaei-cuernavaca-morelos/resources/images/home-images/calendario-actividades-schometrics.svg",
    alt: "calendario-actividades-schometrics",
  },
  {
    src: "https://mltorvndjppviqivdysl.supabase.co/storage/v1/object/public/schometrics-for-schools-uaem-fcaei-cuernavaca-morelos/resources/images/home-images/manual-de-actividades-permitidas-schometrics.svg",
    alt: "manual-de-actividades-permitidas-schometrics",
  },
]
const estadisticasHomeImages = [
  {
    src: "https://mltorvndjppviqivdysl.supabase.co/storage/v1/object/public/schometrics-for-schools-uaem-fcaei-cuernavaca-morelos/resources/images/home-images/estadisticas-1-schometrics.svg",
    alt: "estadisticas-1-schometrics",
  },
  {
    src: "https://mltorvndjppviqivdysl.supabase.co/storage/v1/object/public/schometrics-for-schools-uaem-fcaei-cuernavaca-morelos/resources/images/home-images/estadisticas-2-schometrics.svg",
    alt: "estadisticas-2-schometrics",
  },
]
const educacionHomeImages = [
  {
    src: "https://mltorvndjppviqivdysl.supabase.co/storage/v1/object/public/schometrics-for-schools-uaem-fcaei-cuernavaca-morelos/resources/images/home-images/articulos-schometrics.svg",
    alt: "articulos-schometrics",
  },
  {
    src: "https://mltorvndjppviqivdysl.supabase.co/storage/v1/object/public/schometrics-for-schools-uaem-fcaei-cuernavaca-morelos/resources/images/home-images/material-visual-schometrics.svg",
    alt: "material-visual-schometrics",
  },
  {
    src: "https://mltorvndjppviqivdysl.supabase.co/storage/v1/object/public/schometrics-for-schools-uaem-fcaei-cuernavaca-morelos/resources/images/home-images/videos-cortos-schometrics.svg",
    alt: "videos-cortos-schometrics",
  },
  {
    src: "https://mltorvndjppviqivdysl.supabase.co/storage/v1/object/public/schometrics-for-schools-uaem-fcaei-cuernavaca-morelos/resources/images/home-images/directorio-schometrics.svg",
    alt: "directorio-schometrics",
  },
]
// const recompensasHomeImages = [
//   {
//     src: "/logo.png",
//     alt: "hero-1",
//   },
// ]
const insigniasHomeImages = [
  {
    src: "https://mltorvndjppviqivdysl.supabase.co/storage/v1/object/public/schometrics-for-schools-uaem-fcaei-cuernavaca-morelos/resources/images/home-images/insignias-schometrics.svg",
    alt: "insignias-schometrics",
  },
]
const marcadoresHomeImages = [
  {
    src: "https://mltorvndjppviqivdysl.supabase.co/storage/v1/object/public/schometrics-for-schools-uaem-fcaei-cuernavaca-morelos/resources/images/home-images/marcadores-schometrics.svg",
    alt: "marcadores-schometrics",
  },
]
const perfilHomeImages = [
  {
    src: "https://mltorvndjppviqivdysl.supabase.co/storage/v1/object/public/schometrics-for-schools-uaem-fcaei-cuernavaca-morelos/resources/images/home-images/perfil-schometrics.svg",
    alt: "perfil-schometrics",
  },
]

export function TimelineSchoMetrics() {
  const data = [
    {
      title: "Actividades Ambientales",
      content: (
        <div>
          <div className="mb-8 flex flex-col text-xs font-normal text-slate-500 md:text-lg">
            <p>• Accede al formulario y sube tu Actividad Ambiental.</p>
            <p>
              • Visualiza tus Actividades enviadas y la cantidad de "EcoPoints"
              que recibiste.
            </p>
            <p>
              • Accede al Calendario Interactivo para conocer las fechas de tus
              Actividades enviadas y calificadas.
            </p>
            <p>
              • Revisa el "Manual de Actividades Permitidas" para saber más
              sobre las Actividades que se permiten y como son calificadas por
              los Administradores.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {actividadesAmbientalesHomeImages.map((image, index) => (
              <Image
                key={index}
                src={image.src}
                alt={image.alt}
                width={500}
                height={500}
                priority
                className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60"
              />
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "Estadísticas",
      content: (
        <div>
          <div className="mb-8 flex flex-col text-xs font-normal text-slate-500 md:text-lg">
            <p>
              • Visualiza las principales estadísticas de tu progreso en
              SchoMetrics.
            </p>
            <p>
              • Tus EcoPonts, Reporte de Trayectoria Descargable, Insignias
              obtenidas.
            </p>
            <p>
              • Actividades recientes, Línea de Tiempo, Distribución de
              Actividades.
            </p>
            <p>
              • Observa tus Métricas de Impacto Ambiental, calculadas en base a
              tus Actividades enviadas.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {estadisticasHomeImages.map((image, index) => (
              <Image
                key={index}
                src={image.src}
                alt={image.alt}
                width={500}
                height={500}
                priority
                className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60"
              />
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "Educación",
      content: (
        <div>
          <div className="mb-8 flex flex-col text-xs font-normal text-slate-500 md:text-lg">
            <p>• Explora las secciones de Educación Ambiental.</p>
            <p>• Artículos y Guías.</p>
            <p>• Material Visual.</p>
            <p>• Videos Cortos.</p>
            <p>• Directorio Ambiental.</p>
            <p className="text-orange-900">
              - La subida de Material Educativo es exclusivo para Docentes y
              Administradores.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {educacionHomeImages.map((image, index) => (
              <Image
                key={index}
                src={image.src}
                alt={image.alt}
                width={500}
                height={500}
                priority
                className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60"
              />
            ))}
          </div>
        </div>
      ),
    },
    // {
    //   title: "Increíbles Recompensas",
    //   content: (
    //     <div>
    //       <div className="mb-8 flex flex-col text-xs font-normal text-slate-500 md:text-lg">
    //         <p>• Explora las increíbles Recompensas que puedes canjear.</p>
    //         <p>• Usa tus "EcoPoints" para canjear las Recompensas.</p>
    //         <p>
    //           • Las Recompensas suelen ser límitadas, aumenta tus "EcoPoints"
    //           subiento nuevas Actividades con frecuencía.
    //         </p>
    //         <p>
    //           • No te pierdas la oportunidad de recibir asombrosos beneficos por
    //           convertirte en una persona más sostenible.
    //         </p>
    //       </div>
    //       <div className="mb-8">
    //         <div className="flex items-center gap-2 text-xs font-semibold text-green-500 md:text-lg">
    //           🎁 Productos.
    //         </div>
    //         <div className="flex items-center gap-2 text-xs font-semibold text-green-500 md:text-lg">
    //           🎁 Descuentos.
    //         </div>
    //         <div className="flex items-center gap-2 text-xs font-semibold text-green-500 md:text-lg">
    //           🎁 Puntos de Calificación en tus materias.
    //         </div>
    //         <div className="flex items-center gap-2 text-xs font-semibold text-green-500 md:text-lg">
    //           🎁 Talleres.
    //         </div>
    //         <div className="flex items-center gap-2 text-xs font-semibold text-green-500 md:text-lg">
    //           🎁 Reconocimientos.
    //         </div>
    //         <div className="flex items-center gap-2 text-xs font-semibold text-green-500 md:text-lg">
    //           🎁 Experiencias.
    //         </div>
    //       </div>
    //       <div className="grid grid-cols-2 gap-4">
    //         {recompensasHomeImages.map((image, index) => (
    //           <Image
    //             key={index}
    //             src={image.src}
    //             alt={image.alt}
    //             width={500}
    //             height={500}
    //             priority
    //             className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60"
    //           />
    //         ))}
    //       </div>
    //     </div>
    //   ),
    // },
    {
      title: "Insignias",
      content: (
        <div>
          <div className="mb-8 flex flex-col text-xs font-normal text-slate-500 md:text-lg">
            <p>• Visita la Galería de Insignias.</p>
            <p>
              • Revisa las Insignias que has optenido y las que puedes obtener.
            </p>
            <p>
              • Demuéstrales a todos que eres el mejor y consigue todas las
              Insignias.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {insigniasHomeImages.map((image, index) => (
              <Image
                key={index}
                src={image.src}
                alt={image.alt}
                width={500}
                height={500}
                priority
                className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60"
              />
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "Marcadores",
      content: (
        <div>
          <div className="mb-8 flex flex-col text-xs font-normal text-slate-500 md:text-lg">
            <p>
              • Visita la sección de Marcadores pasa saber en que
              posicionamiento te encuentras actualmente.
            </p>
            <p>• Intenta llegar a la primera posición y mantenerte.</p>
            <p>
              • Demuéstrales a todos que eres el{" "}
              <b className="text-xl font-extrabold text-green-500">#1</b>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {marcadoresHomeImages.map((image, index) => (
              <Image
                key={index}
                src={image.src}
                alt={image.alt}
                width={500}
                height={500}
                priority
                className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60"
              />
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "Perfil",
      content: (
        <div>
          <div className="mb-8 flex flex-col text-xs font-normal text-slate-500 md:text-lg">
            <p>• Explora la sección Perfil.</p>
            <p>• Sube una Foto de Perfil.</p>
            <p>• Edita o agrega informácion básica sobre ti.</p>
            <p>
              • Visualiza algunos datos generales de tu progreso en SchoMetrics.
            </p>
            <p>• Mira tus Notificaciones.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {perfilHomeImages.map((image, index) => (
              <Image
                key={index}
                src={image.src}
                alt={image.alt}
                width={500}
                height={500}
                priority
                className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60"
              />
            ))}
          </div>
        </div>
      ),
    },
  ];
  return (
    <div className="relative w-full overflow-clip">
      <Timeline data={data} />
    </div>
  );
}
