import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserProfileData } from "@/types/types";
import { Loader2, MessageSquare } from "lucide-react";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";

const AdminSendNotifications = () => {
  const params = useParams();
  const userId = params.userId as string;
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [user, setUser] = useState<UserProfileData | null>(null); // Initialize as null
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);

  const fetchProfileData = async () => {
    // setIsLoading(true) will be handled by the main isLoading state
    try {
      const response = await fetch(`/api/admin/users/profiles/${userId}`);
      if (!response.ok) throw new Error("Error al obtener perfil");
      const data: UserProfileData = await response.json();
      setUser(data);
    } catch (error) {
      console.error("Error al cargar perfil:", error);
      toast.error("Error, No se pudo cargar el perfil");
    }
  };
  useEffect(() => {
    fetchProfileData();
  }, [userId]);

  const openNotifyModal = async () => {
    await fetchProfileData();
    setNotificationTitle(`Mensaje para el usuario: ${user?.name}`);
    setNotificationMessage("");
    setIsNotifyModalOpen(true);
  };

  const handleSendNotification = async (e: FormEvent) => {
    e.preventDefault();
    if (!notificationMessage.trim() || !notificationTitle.trim()) {
      toast.error(
        "Atención. El título y el mensaje de la notificación son requeridos.",
      );
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch(
        `/api/admin/users/profiles/notifications/${userId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userId,
            title: notificationTitle,
            message: notificationMessage,
          }),
        },
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al enviar notificación.");
      }
      toast.success(`Notificación Enviada. Mensaje enviado a ${user?.name}.`);
      setIsNotifyModalOpen(false);
    } catch (err) {
      console.error("Error enviando notificación:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Error. No se pudo enviar la notificación.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="flex w-full flex-col items-center justify-center">
      <Button
        className="bg-green-500 text-muted-foreground text-white hover:bg-green-600"
        title={`Enviar Notificación al Usuario: ${user?.name}`}
        onClick={async () => await openNotifyModal()}
      >
        <MessageSquare className="h-4 w-4" />
        Enviar Notificación
      </Button>
      {/* Modal de Notificación Manual */}
      <Dialog open={isNotifyModalOpen} onOpenChange={setIsNotifyModalOpen}>
        <DialogContent className="w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2 text-center">
              Enviar Notificación a{" "}
              <p className="font-bold text-green-500">{user?.name}</p>
            </DialogTitle>
            <DialogDescription>
              Redacta un mensaje para el usuario sobre alguna modificación en su
              perfil, anomalía o cualquier otro asunto relacionado únicamente
              con SchoMetrics.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSendNotification} className="space-y-4 py-2">
            <div>
              <Label htmlFor="notify-title">Título del Mensaje</Label>
              <Input
                id="notify-title"
                value={notificationTitle}
                onChange={(e) => setNotificationTitle(e.target.value)}
                placeholder="Ej: Revisión de actividad"
                disabled={isSubmitting}
                className="uppercase"
              />
            </div>
            <div>
              <Label htmlFor="notify-message">Mensaje</Label>
              <Textarea
                id="notify-message"
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
                placeholder="Escribe tu mensaje aquí..."
                rows={4}
                disabled={isSubmitting}
              />
            </div>
            <DialogFooter className="flex flex-col gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Cancelar
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-green-500 hover:bg-green-600"
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Enviar Mensaje
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSendNotifications;
