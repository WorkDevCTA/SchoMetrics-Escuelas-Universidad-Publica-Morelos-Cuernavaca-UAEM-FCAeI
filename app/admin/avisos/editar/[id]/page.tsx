import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EditAnnouncementForm } from "../../components/EditForm";
import { FloatingNavAdmin } from "@/app/admin/components/FloatingNavAdmin";

export default async function EditAnnouncementPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const announcement = await prisma.announcement.findUnique({
    where: { id },
  });

  if (!announcement) {
    notFound();
  }

  return (
    <div>
      <FloatingNavAdmin />
      <EditAnnouncementForm announcement={announcement} />
    </div>
  );
}
