import { NextRequest, NextResponse } from "next/server";
import { supabaseClient } from "@/types/types-supabase-service";

export async function GET(req: NextRequest) {
  const bucketName = "schometrics-for-schools-uaem-fcaei-cuernavaca-morelos";
  const archivos = [
    "csv-archivo-valido-ejemplo.csv",
    "xlsx-archivo-valido-ejemplo.xlsx",
  ];

  try {
    const urls = await Promise.all(
      archivos.map(async (archivo) => {
        const filePath = `downloadable-files/example-users-register-structure/${archivo}`;

        const { data, error } = await supabaseClient.storage
          .from(bucketName)
          .createSignedUrl(filePath, 3600); // 1 hora

        if (error || !data?.signedUrl) {
          console.error(
            `Error al generar URL para ${archivo}:`,
            error?.message
          );
          throw new Error(`No se pudo generar la URL para ${archivo}`);
        }

        return { nombre: archivo, url: data.signedUrl };
      })
    );

    return NextResponse.json(urls);
  } catch (error) {
    console.error("Error al generar URLs firmadas:", error);
    return NextResponse.json(
      { error: "Error al generar URLs firmadas" },
      { status: 500 }
    );
  }
}
