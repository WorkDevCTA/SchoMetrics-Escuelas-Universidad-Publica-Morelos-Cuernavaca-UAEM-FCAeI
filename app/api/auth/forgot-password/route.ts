import { type NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Resend } from "resend";
import prisma from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "El correo electrónico es requerido" },
        { status: 400 }
      );
    }

    // Verificar si existe un perfil con este email
    const profile = await prisma.profile.findUnique({
      where: { email },
      include: { user: true },
    });

    if (!profile) {
      return NextResponse.json(
        {
          error: "No se encontró una cuenta asociada a este correo electrónico",
        },
        { status: 404 }
      );
    }

    // Generar token único
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 hora

    // Eliminar tokens anteriores para este email
    await prisma.passwordResetToken.deleteMany({
      where: { email },
    });

    // Crear nuevo token
    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expires,
      },
    });

    // Enviar email
    const resetUrl = `${process.env.BASE_URL}/login/reset-password?token=${token}`;

    await resend.emails.send({
      from: "SchoMetrics <noreply@schometrics.website>", // put here the same domain existing in Resend
      to: email,
      subject: "Restablecer contraseña - SchoMetrics",
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin-bottom: 10px;">SchoMetrics</h1>
            <p style="color: #6b7280;">Sistema de Gestión Ambiental Educativa</p>
          </div>

          <div style="background-color: #f9fafb; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Restablecer Contraseña</h2>
            <p style="color: #4b5563; margin-bottom: 20px;">
              Hola <strong>${profile.user.name}</strong>,
            </p>
            <p style="color: #4b5563; margin-bottom: 20px;">
              Recibimos una solicitud para restablecer la contraseña de tu cuenta.
              Haz clic en el botón de abajo para crear una nueva contraseña:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}"
                 style="background-color: #2563eb; color: white; padding: 12px 24px;
                        text-decoration: none; border-radius: 6px; display: inline-block;">
                Restablecer Contraseña
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 10px;">
              O copia y pega este enlace en tu navegador:
            </p>
            <p style="color: #2563eb; font-size: 14px; word-break: break-all;">
              ${resetUrl}
            </p>
          </div>

          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px;">
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 10px;">
              <strong>Información importante:</strong>
            </p>
            <ul style="color: #6b7280; font-size: 14px; margin-left: 20px;">
              <li>Este enlace expirará en 1 hora</li>
              <li>Si no solicitaste este cambio, puedes ignorar este correo</li>
              <li>Tu contraseña actual seguirá siendo válida hasta que la cambies</li>
            </ul>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px;">
              © 2025 SchoMetrics. Todos los derechos reservados.
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({
      message:
        "Se ha enviado un enlace de recuperación a tu correo electrónico",
    });
  } catch (error) {
    console.error("Error en forgot-password:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
