// app/robots.ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://uaem-fcaei.schometrics.website";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/*?*", // URLs con parámetros de consulta
          "/search?*", // Páginas de búsqueda con parámetros
          "/*.pdf$", // Archivos PDF privados
          "/*.doc$", // Documentos privados
          "/*.xls$", // Hojas de cálculo privadas
        ],
        crawlDelay: 1, // Pausa de 1 segundo entre requests (opcional)
      },
      // Reglas específicas para bots problemáticos
      {
        userAgent: "GPTBot",
        disallow: "/", // Bloquear bots de IA si no quieres que entrenen con tu contenido
      },
      {
        userAgent: "ChatGPT-User",
        disallow: "/",
      },
      // Permitir específicamente a Google y Bing
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/admin/*", "/dashboard/*", "/api/*"],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: ["/admin/*", "/dashboard/*", "/api/*"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl, // Especifica el dominio preferido
  };
}
