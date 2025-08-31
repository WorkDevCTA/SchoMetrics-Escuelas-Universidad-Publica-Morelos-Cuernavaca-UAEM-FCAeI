"use client";

import { FileDown } from "lucide-react";
import { useEffect, useState } from "react";

interface Archivo {
  nombre: string | undefined;
  url: string;
}

const ArchivosPage = () => {
  const [archivos, setArchivos] = useState<Archivo[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchArchivos = async () => {
      setCargando(true);
      setIsGenerating(true);
      try {
        const res = await fetch("/api/admin/auth/example-files-download");
        const data = await res.json();
        setArchivos(data);
        setIsGenerating(false);
      } catch (error) {
        console.error("Error al obtener los archivos:", error);
      } finally {
        setCargando(false);
        setIsGenerating(false);
      }
    };

    fetchArchivos();
  }, []);

  if (cargando || isGenerating) return <div>Cargando archivos...</div>;

  return (
    <div className="space-y-4">
      {archivos.map((archivo) => (
        <div key={archivo.nombre}>
          <a
            href={archivo.url}
            download={archivo.nombre}
            className="inline-block rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            <span className="flex items-center gap-2 overflow-auto">
              <FileDown className="mr-2 h-4 w-4" />
              {archivo.nombre}
            </span>
          </a>
        </div>
      ))}
    </div>
  );
};

export default ArchivosPage;
