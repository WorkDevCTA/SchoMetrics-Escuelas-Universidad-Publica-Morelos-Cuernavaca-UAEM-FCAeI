"use client";

import { Bell, Megaphone } from "lucide-react";
import SchometricsAnnoucementsCarousel from "../components/Announcements";
import DashboardLayout from "../components/DashboardLayout";
import ShowUserNotifications from "../components/UserNotifications";

export default function AvisosSchoMetrics() {
  return (
    <DashboardLayout>
      <div className="container mt-5 flex flex-col">
        <div className="mt-16 flex flex-col gap-3 rounded-xl bg-gradient-to-br from-blue-700 to-blue-500 p-8 text-white shadow-2xl lg:mt-0">
          <h1 className="flex flex-col items-center gap-3 text-center text-3xl font-bold tracking-tight md:flex-row">
            <Megaphone className="h-10 w-10 animate-bounce" />
            Avisos y Notificaciones
          </h1>
          <p className="text-center text-lg opacity-90 md:text-start">
            Visualiza tus Notificaciones y los Avisos de SchoMetrics
          </p>
        </div>
        <div className="my-5 h-[700px] overflow-auto rounded-xl border-2 border-green-100 bg-white p-3 shadow-md xl:p-10">
          <div className="mb-8 text-center">
            <div className="mb-4 flex flex-col items-center justify-center gap-3 pt-3 md:flex-row">
              <div className="rounded-full bg-gradient-to-br from-blue-700 to-violet-800 p-3">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <h2 className="bg-gradient-to-br from-blue-700 to-violet-800 bg-clip-text text-3xl font-bold text-transparent">
                Mis Notificaciones
              </h2>
            </div>
            <p className="text-lg text-slate-400">
              Aquí se mostrarán tus notificaciones recibidas.
            </p>
          </div>
          <ShowUserNotifications />
        </div>
        <div className="my-5 rounded-xl border-2 border-blue-100 bg-white shadow-md">
          <SchometricsAnnoucementsCarousel />
        </div>
      </div>
    </DashboardLayout>
  );
}
