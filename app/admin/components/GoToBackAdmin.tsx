import { Button } from "@/components/ui/button";
import { DoorOpen } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import toast from "react-hot-toast";

export default function GoToBackAdmin() {
  const router = useRouter();
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Sesión cerrada exitosamente.");
        router.push("/admin/auth/login-admin");
      } else {
        toast.error("Error al cerrar sesión.");
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      toast.error("Error al cerrar sesión.");
    }
  };
  return (
    <div className="flex w-min flex-col items-center justify-center gap-4 rounded-md bg-slate-100 p-3 lg:flex-row lg:items-center">
      <Link href="/admin">
        <Button className="mt-5 bg-sky-600 p-2 hover:bg-sky-700 md:mt-0">
          Volver a Inicio
        </Button>
      </Link>
      <Button
        className="mt-5 bg-red-600 p-2 hover:bg-red-700 md:mt-0"
        onClick={handleLogout}
      >
        <DoorOpen className="h-7 w-7" />
        Cerrar Sesión
      </Button>
    </div>
  );
}
