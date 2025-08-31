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
import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

type AdminRewardDeleteProps = {
  rewardId: string;
};

interface RewardForm {
  title: string;
  description: string;
  pointsCost: number;
  category: string;
  available: boolean;
  hasQuantity: boolean;
  quantity?: number;
  hasExpiration: boolean;
  expiresAt?: Date | null;
}

const AdminRewardDelete: React.FC<AdminRewardDeleteProps> = ({
  rewardId: rewardId,
}) => {
  const [reward, setReward] = useState<RewardForm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const fetchReward = useCallback(async () => {
    if (!rewardId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/rewards/${rewardId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Recompensa no encontrada o error al cargar.",
        );
      }
      const data: RewardForm = await response.json();
      setReward(data);
    } catch (err) {
      console.error("Error cargando recompensa:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error desconocido al cargar la recompensa.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [rewardId]);

  useEffect(() => {
    fetchReward();
  }, [fetchReward]);

  const handleDeleteReward = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/rewards/${rewardId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al eliminar la recompensa.");
      }
      toast.success("Recompensa eliminada correctamente.");
      router.refresh();
      router.push("/admin/crear-recompensa/");
    } catch (err) {
      console.error("Error eliminando recompensa:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "No se pudo eliminar la recompensa.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex gap-2">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="destructive"
            size="sm"
            disabled={isDeleting}
            title={"Eliminar Recompensa: " + reward?.title + " - " + rewardId}
          >
            <Trash2 className="mr-1.5 h-4 w-4" /> Eliminar Recompensa
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              la Recompensa:
              <br />
              <span className="font-bold uppercase text-amber-600">
                {reward?.title}
              </span>
              <br />
              <span className="font-bold text-teal-600">ID: {rewardId}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReward}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Eliminar Recompensa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminRewardDelete;
