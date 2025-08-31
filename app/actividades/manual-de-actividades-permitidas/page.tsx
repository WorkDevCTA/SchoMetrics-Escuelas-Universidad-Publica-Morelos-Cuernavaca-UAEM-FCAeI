"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Trees,
  Recycle,
  Droplet,
  Sun,
  BookOpen,
  FileText,
  ArrowLeftCircleIcon,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import DashboardLayout from "@/app/components/DashboardLayout";

export default function ActivitiesManual() {
  return (
    <DashboardLayout>
      <div className="mt-20 flex justify-center lg:mt-6">
        <Link href="/actividades">
          <Button className="rounded-md bg-green-600 shadow-md hover:bg-green-700">
            <ArrowLeftCircleIcon className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>
      </div>
      <div className="container mx-auto mt-6 px-4 py-8">
        {/* Sección de Actividades Permitidas */}
        <Card className="mx-auto mb-8 max-w-4xl">
          <CardHeader>
            <div className="mb-2 flex flex-col items-center justify-center gap-3 text-center lg:flex-row lg:items-center lg:justify-start">
              <CheckCircle2 className="h-7 w-7 text-green-600" />
              <CardTitle className="text-2xl font-semibold">
                Manual de Actividades Permitidas
              </CardTitle>
            </div>
            <CardDescription className="text-sm text-gray-500">
              Consulta aquí los tipos de actividades permitidas y cómo los
              Administradores asignarán los EcoPoints.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <h2 className="text-xl font-semibold text-gray-800">
              Tipos de Actividades Ambientales Permitidas
            </h2>
            <ul className="mt-4 space-y-4 text-gray-600">
              <li className="flex items-center gap-3">
                <Recycle className="h-5 w-5 text-green-600" />
                <span>Reciclaje</span>
              </li>
              <li className="flex items-center gap-3">
                <Trees className="h-5 w-5 text-green-600" />
                <span>Plantación de Árboles</span>
              </li>
              <li className="flex items-center gap-3">
                <Droplet className="h-5 w-5 text-blue-600" />
                <span>Ahorro de Agua</span>
              </li>
              <li className="flex items-center gap-3">
                <Sun className="h-5 w-5 text-yellow-600" />
                <span>Ahorro de Energía</span>
              </li>
              <li className="flex items-center gap-3">
                <Recycle className="h-5 w-5 text-green-600" />
                <span>Compostaje</span>
              </li>
              <li className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-orange-600" />
                <span>Educación Ambiental</span>
              </li>
              <li className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-gray-600" />
                <span>Otros</span>
              </li>
            </ul>
          </CardContent>
        </Card>
        {/* Sección de Asignación de EcoPoints */}
        <Card className="mx-auto mb-8 max-w-4xl">
          <CardHeader>
            <div className="mb-2 flex items-center gap-3">
              <Image
                src="/eco_points_logo.png"
                alt="eco_points_logo"
                width={30}
                height={30}
                priority
                className="transition-all duration-700 ease-linear hover:-rotate-[360deg]"
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
              />
              <CardTitle className="text-2xl font-semibold">
                Asignación de EcoPoints
              </CardTitle>
            </div>
            <CardDescription className="text-sm text-gray-500">
              Los Administradores asignarán EcoPoints según varios factores.
              Aquí te explicamos cómo se realiza el proceso.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <h3 className="text-lg font-semibold text-gray-800">
              Criterios para Asignar EcoPoints
            </h3>
            <ul className="mt-4 space-y-4 text-gray-600">
              <li>
                <strong>Impacto Ambiental:</strong> Las actividades con mayor
                impacto ecológico, como plantar árboles o reciclar grandes
                cantidades de material, recibirán más puntos.
              </li>
              <li>
                <strong>Cantidad Realizada:</strong> La cantidad de la actividad
                realizada, por ejemplo, si se plantan más árboles o se recicla
                más material, influirá en la cantidad de EcoPoints asignados.
              </li>
              <li>
                <strong>Calidad de Evidencia:</strong> Actividades con
                evidencias visuales claras (como fotos y videos) tienen más
                probabilidades de recibir la máxima cantidad de puntos.
              </li>
              <li>
                <strong>Frecuencia de la Actividad:</strong> Actividades
                regulares como campañas de ahorro de energía o agua, que se
                repiten a lo largo del tiempo, también pueden recibir más
                EcoPoints.
              </li>
            </ul>
          </CardContent>
        </Card>
        {/* Sección de Actividades No Permitidas y Prohibidas */}
        <Card className="mx-auto mb-8 max-w-4xl">
          <CardHeader>
            <div className="mb-2 flex flex-col items-center justify-center gap-3 text-center lg:flex-row lg:items-center lg:justify-start">
              <AlertCircle className="h-7 w-7 text-red-600" />
              <CardTitle className="text-2xl font-semibold">
                Actividades No Permitidas en SchoMetrics
              </CardTitle>
            </div>
            <CardDescription className="text-sm text-gray-500">
              Consulta aquí las acciones que no se permitirán en la plataforma.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <h2 className="text-xl font-semibold text-gray-800">
              Actividades No Permitidas
            </h2>
            <ul className="mt-4 space-y-4 text-gray-600">
              <li className="flex items-center gap-3">
                <p className="font-extrabold text-red-600">X</p>
                <span>
                  Uso de palabras altisonantes o inadecuadas en el Título y/o
                  Descripción de las Actividades.
                </span>
              </li>
              <li className="flex items-center gap-3">
                <p className="font-extrabold text-red-600">X</p>
                <span>
                  Uso de imágenes sensibles, violencia, desnudo, prohibidas o
                  sin relación alguna con Actividades Ambientales.
                </span>
              </li>
              <li className="flex items-center gap-3">
                <p className="font-extrabold text-red-600">X</p>
                <span>
                  Se prohibe la reutilización de Imágenes o Videos que hayan
                  sido publicadas como Evidencia en Actividades anteriores.
                </span>
              </li>
              <li className="flex items-center gap-3">
                <p className="font-extrabold text-red-600">X</p>
                <span>
                  Uso de palabras altisonantes o inadecuadas en el Correo
                  Electrónico.
                </span>
              </li>
              <li className="flex items-center gap-3">
                <p className="font-extrabold text-red-600">X</p>
                <span>
                  Uso de imágenes sensibles, violencia, desnudo, prohibidas o no
                  autorizadas para la Foto de Perfil.
                </span>
              </li>
              <li className="flex items-center gap-3">
                <p className="font-extrabold text-red-600">X</p>
                <span>
                  Cualquier tipo de violencia o comportamiento inadecuado dentro
                  de la Plataforma.
                </span>
              </li>
              <li className="mb-2 flex flex-col items-center justify-center gap-3 rounded-sm border-2 border-red-700 p-2 font-bold text-red-900 lg:flex-row lg:items-center lg:justify-start">
                <AlertCircle className="h-7 w-7" />
                <span>
                  Toda Actividad enviada será revisada por un Administrador de
                  SchoMetrics para validar su aprobación.
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
        {/* Sección de Ejemplos de Actividades y EcoPoints */}
        <Card className="mx-auto max-w-4xl">
          <CardHeader>
            <div className="mb-2 flex flex-col items-center justify-center gap-3 text-center lg:flex-row lg:items-center lg:justify-start">
              <Trees className="h-7 w-7 text-green-600" />
              <CardTitle className="text-2xl font-semibold">
                Ejemplos de Actividades y EcoPoints Asignados
              </CardTitle>
            </div>
            <CardDescription className="text-sm text-gray-500">
              A continuación, algunos ejemplos de actividades y cómo los
              Administradores asignarán EcoPoints.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <h3 className="text-lg font-semibold text-gray-800">Ejemplos</h3>
            <ul className="mt-4 space-y-6 text-gray-600">
              <li>
                <strong>Ejemplo 1: Reciclaje de Plástico</strong>
                <p>
                  Un grupo de estudiantes recolecta 200 kg de plástico
                  reciclable y presenta evidencia en video de la actividad.
                </p>
                <p className="font-semibold text-[#53c932]">
                  EcoPoints Asignados: 50
                </p>
              </li>
              <li>
                <strong>Ejemplo 2: Plantación de Árboles</strong>
                <p>
                  Se plantan 50 árboles en el patio de la escuela y se presenta
                  una serie de fotos del evento con detalles sobre el proceso.
                </p>
                <p className="font-semibold text-[#53c932]">
                  EcoPoints Asignados: 75
                </p>
              </li>
              <li>
                <strong>Ejemplo 3: Ahorro de Agua</strong>
                <p>
                  Un grupo implementa un sistema de recolección de agua de
                  lluvia en la escuela y presenta un informe con fotos del
                  sistema instalado.
                </p>
                <p className="font-semibold text-[#53c932]">
                  EcoPoints Asignados: 30
                </p>
              </li>
              <li>
                <strong>Ejemplo 4: Educación Ambiental</strong>
                <p>
                  Un docente realiza un taller sobre reciclaje con 50
                  estudiantes, y la actividad se documenta con fotos y
                  testimonios de los participantes.
                </p>
                <p className="font-semibold text-[#53c932]">
                  EcoPoints Asignados: 20
                </p>
              </li>
              <li>
                <strong>Ejemplo 5: Ahorro de Energía</strong>
                <p>
                  La escuela instala luces LED en todo el edificio y presenta un
                  video que muestra cómo se ha reducido el consumo energético.
                </p>
                <p className="font-semibold text-[#53c932]">
                  EcoPoints Asignados: 50
                </p>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
