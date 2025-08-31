import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { UserProfileData } from "@/types/types";
import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

type AdminDeleteUserProps = {
  userId: string;
};

const AdminDeleteUser: React.FC<AdminDeleteUserProps> = ({ userId }) => {
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const fetchUser = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/users/profiles/${userId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Usuario no encontrado o error al cargar.",
        );
      }
      const data: UserProfileData = await response.json();
      setUser(data);
    } catch (err) {
      console.error("Error cargando usuario:", err);
      setError(
        err instanceof Error ? err.message : "Ocurrió un error desconocido.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleDeleteUser = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/users/profiles/${user?.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al eliminar el usuario.");
      }
      toast.success("Usuario eliminado correctamente.");
      router.refresh();
      router.push("/admin/lista-de-usuarios/");
    } catch (err) {
      console.error("Error eliminando usuario:", err);
      toast.error(
        err instanceof Error ? err.message : "No se pudo eliminar el usuario.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex w-full items-center justify-center gap-2">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="destructive"
            size="sm"
            disabled={isDeleting}
            title={"Eliminar Usuario: " + user?.name + " - " + user?.matricula}
          >
            <Trash2 className="mr-1.5 h-4 w-4" /> Eliminar Usuario
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="w-full">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              al Usuario:
              <br />
              <span className="font-bold uppercase text-black">
                {user?.name}
              </span>
              <br />
              <span className="font-bold text-sky-800">
                Matricula: {user?.matricula}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Eliminar Usuario
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDeleteUser;
