"use client";

import { useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/button";
import { Loader2, Download } from "lucide-react";
import type { UserReportData } from "@/app/api/user/report/route";
import toast from "react-hot-toast";
import QRCode from "qrcode";

interface jsPDFWithPlugin extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
}

export const ReportDownloadButton = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  async function fetchValidationLink(userId: string) {
    const res = await fetch("/api/validate-user/generate-validation-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    const { url } = await res.json();
    return url;
  }

  const generatePDFReport = async (data: UserReportData) => {
    const doc = new jsPDF() as jsPDFWithPlugin;
    let y = 20;

    // Logo de SchoMetrics en la parte superior
    try {
      // Placeholder para el logo - reemplaza con la URL real de tu logo
      const logoUrl = "/placeholder.svg?height=60&width=200";
      const logoImg = new Image();
      logoImg.crossOrigin = "anonymous";

      await new Promise((resolve, reject) => {
        logoImg.onload = resolve;
        logoImg.onerror = reject;
        logoImg.src = logoUrl;
      });

      // Añadir logo centrado
      const logoWidth = 50;
      const logoHeight = 15;
      const logoX = (doc.internal.pageSize.width - logoWidth) / 2;

      doc.addImage(logoImg, "PNG", logoX, y, logoWidth, logoHeight);
      y += logoHeight + 10;
    } catch (error) {
      console.warn("No se pudo cargar el logo:", error);
      // Continuar sin logo si hay error
    }

    // Título del reporte
    doc.setFontSize(22);
    doc.text("Reporte de Trayectoria - SchoMetrics", 105, y, {
      align: "center",
    });
    y += 15;

    // Sección 1: Datos Generales
    doc.setFontSize(16);
    doc.text("1. Datos Generales", 14, y);
    y += 8;
    doc.setFontSize(12);
    doc.text(`Nombre: ${data.user.name?.toUpperCase()}`, 14, y);
    // doc.text(`Nivel Actual: ${data.user.level}`, 105, y)
    y += 7;
    doc.text(`Matricula: ${data.user.matricula}`, 14, y);
    doc.text(`EcoPoints Totales: ${data.user.totalPoints}`, 105, y);
    y += 7;
    doc.text(`Miembro Desde: ${data.user.memberSince}`, 14, y);
    doc.text(
      `Tipo de Cuenta: ${data.user.userType === "STUDENT" ? "ESTUDIANTE" : data.user.userType === "TEACHER" ? "DOCENTE" : data.user.userType === "ADMIN" ? "ADMINISTRADOR" : "Sin Tipo"}`,
      105,
      y,
    );
    y += 15;

    // Sección 2: Actividades Registradas
    doc.setFontSize(16);
    doc.text("2. Actividades Registradas", 14, y);
    y += 8;
    autoTable(doc, {
      startY: y,
      head: [["Fecha", "Título", "Tipo", "Cantidad", "Puntos", "Estado"]],
      body: data.activities.map((act) => [
        new Date(act.date).toLocaleDateString("es-MX"),
        act.title,
        act.type,
        `${act.quantity} ${act.unit}`,
        act.points,
        act.status === "PENDING_REVIEW" ? "Pendiente" : "Revisada",
      ]),
      theme: "grid",
      headStyles: { fillColor: [14, 165, 233] },
    });

    y = doc.lastAutoTable.finalY + 15;
    if (y > doc.internal.pageSize.height - 40) {
      doc.addPage();
      y = 20;
    }

    // Sección 3: Impacto Ambiental Acumulado
    doc.setFontSize(16);
    doc.text("3. Impacto Ambiental Acumulado", 14, y);
    y += 8;
    autoTable(doc, {
      startY: y,
      head: [["Métrica de Impacto", "Valor Ahorrado"]],
      body: [
        [
          "Dióxido de Carbono (CO₂)",
          `${data.environmentalImpact.impact.co2Saved.toFixed(2)} kg`,
        ],
        [
          "Agua",
          `${data.environmentalImpact.impact.waterSaved.toFixed(2)} litros`,
        ],
        [
          "Energía",
          `${data.environmentalImpact.impact.energySaved.toFixed(2)} kWh`,
        ],
      ],
      theme: "striped",
      headStyles: { fillColor: [14, 165, 233] },
    });

    y = doc.lastAutoTable.finalY + 10;
    if (data.environmentalImpact.materialsRecycled.length > 0) {
      doc.setFontSize(12);
      doc.text("Desglose de Actividades de Impacto:", 14, y);
      y += 7;
      autoTable(doc, {
        startY: y,
        head: [["Actividad de Impacto", "Cantidad Total"]],
        body: data.environmentalImpact.materialsRecycled.map((material) => [
          material.name,
          `${material.quantity.toFixed(2)} ${material.unit}`,
        ]),
        theme: "grid",
        headStyles: { fillColor: [75, 85, 99] },
      });
      y = doc.lastAutoTable.finalY + 15;
    }

    if (y > doc.internal.pageSize.height - 40) {
      doc.addPage();
      y = 20;
    }

    // Sección 4: Recompensas Canjeadas
    doc.setFontSize(16);
    doc.text("4. Recompensas Canjeadas", 14, y);
    y += 8;
    autoTable(doc, {
      startY: y,
      head: [
        ["Fecha de Canje", "Recompensa", "Descripción", "Costo en Puntos"],
      ],
      body: data.redeemedRewards.map((redemption) => [
        new Date(redemption.redeemedAt).toLocaleDateString("es-MX"),
        redemption.rewardTitle,
        redemption.rewardDesc,
        redemption.rewardPoints,
      ]),
      theme: "grid",
      headStyles: { fillColor: [14, 165, 233] },
    });

    y = doc.lastAutoTable.finalY + 15;
    if (y > doc.internal.pageSize.height - 40) {
      doc.addPage();
      y = 20;
    }

    // Sección 5: Insignias Obtenidas
    doc.setFontSize(16);
    doc.text("5. Insignias Obtenidas", 14, y);
    y += 8;
    autoTable(doc, {
      startY: y,
      head: [["Insignia", "Descripción"]],
      body: data.obtainedBadges.map((badge) => [badge.name, badge.description]),
      theme: "grid",
      headStyles: { fillColor: [14, 165, 233] },
    });

    y = doc.lastAutoTable.finalY + 20;

    // Sección de Seguridad y Validez
    if (y > doc.internal.pageSize.height - 80) {
      doc.addPage();
      y = 20;
    }

    // Generar código QR para validez
    try {
      // const validationUrl = `${window.location.origin}/validez/${data.user.id}`
      const validationUrl = await fetchValidationLink(data.user.id);
      const qrCodeDataUrl = await QRCode.toDataURL(validationUrl, {
        width: 100,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      // Sección de validez
      doc.setFontSize(14);
      doc.text("Validez y Autenticidad del Documento", 14, y);
      y += 10;

      doc.setFontSize(10);
      doc.text(
        "Este documento ha sido generado automáticamente por SchoMetrics.",
        14,
        y,
      );
      y += 5;
      doc.text(
        `Fecha de generación: ${new Date().toLocaleDateString("es-MX")} ${new Date().toLocaleTimeString("es-MX")}`,
        14,
        y,
      );
      y += 5;
      doc.text(`ID del Usuario: ${data.user.id}`, 14, y);
      y += 5;
      doc.text(`Matricula Escolar del Usuario: ${data.user.matricula}`, 14, y);
      y += 7;
      // Sección de normativa y prohibición de modificar esté documento
      doc.setTextColor(255, 0, 0);
      doc.text(
        `Queda estrictamente prohibido la modificación parcial o total de esté documento.`,
        14,
        y,
      );
      y += 5;
      doc.text(
        `Así como de la información existente en el mismo, con el fin de obtener beneficios adicionales.`,
        14,
        y,
      );
      y += 5;
      doc.text(
        `En caso de realizar un incumplimiento se tomarán las medidas correspondientes establecidas en el Reglamento Escolar`,
        14,
        y,
      );
      y += 5;
      doc.text(`de la Institución Educativa perteneciente.`, 14, y);
      y += 10;

      // Añadir código QR
      const qrSize = 25;
      doc.addImage(qrCodeDataUrl, "PNG", 14, y, qrSize, qrSize);

      // Texto explicativo del QR
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text("Escanea este código QR para", 45, y + 8);
      doc.text("verificar la autenticidad del", 45, y + 12);
      doc.text("documento y ver los datos", 45, y + 16);
      doc.text("básicos del usuario.", 45, y + 20);

      // Información adicional de seguridad
      y += qrSize + 10;
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        "Para verificar la autenticidad de este documento, visite:",
        14,
        y,
      );
      y += 4;
      doc.text(validationUrl, 14, y);
      y += 8;
      doc.text(
        `© ${new Date().getFullYear()} SchoMetrics. Todos los derechos reservados.`,
        14,
        y,
      );
    } catch (error) {
      console.error("Error generando código QR:", error);
      // Continuar sin QR si hay error
      doc.setFontSize(10);
      doc.text("Error al generar código de validación.", 14, y);
    }

    doc.save(
      `reporte_schometrics_${data.user.name?.replace(/\s/g, "_") || "usuario"}.pdf`,
    );
  };

  const handleDownloadReport = async () => {
    setIsGenerating(true);
    try {
      toast.loading(
        "Estamos recopilando tu información. Esto puede tardar un momento.",
      );
      const response = await axios.get<UserReportData>("/api/user/report");
      await generatePDFReport(response.data);
      toast.success("¡Reporte generado! Tu descarga comenzará en breve.");
    } catch (error) {
      console.error("Error al descargar el reporte", error);
      toast.error(
        "Hubo un problema al generar tu reporte. Por favor, inténtalo de nuevo.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleDownloadReport}
      disabled={isGenerating}
      className="bg-baseColor hover:bg-baseColor/80"
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generando Reporte...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Descargar Ahora
        </>
      )}
    </Button>
  );
};
