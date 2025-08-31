import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "./lib/auth";

// This Routes required general autentication of user
const protectedUserRoutes = [
  "/inicio", //
  "/actividades", //
  "/estadisticas", //
  "/educacion", //
  "/recompensas", //
  "/insignias", //
  "/marcadores", //
  "/avisos", //
  "/mi-carnet",
  "/perfil", //
];

// Routes for CREATE/EDIT Education Content (Required UserType TEACHER OR ADMIN)
const educationCreatorRoutes = [
  "/educacion/articulos/nuevo", //
  "/educacion/articulos/editar", // Cubrirá /editar/[id] con startsWith
  "/educacion/visual/nuevo",
  "/educacion/visual/editar", // Cubrirá /editar/[id] con startsWith
  "/educacion/videos/nuevo", //
  "/educacion/videos/editar", //
];

// Routes for unauthenticated users
const authRoutes = ["/login"];

// Routes for ADMINS
const adminRoutes = [
  "/admin/:path*",
  "/admin/auth/registro-admin",
  "/admin/auth/recuperar",
  "/admin/auth/registro-usuario",
];

// Routes for authentication ADMINS
const adminAuthRoutes = [
  "/admin/",
  "/admin/auth/login",
  "/admin/auth/registro-admin",
  "/admin/auth/recuperar",
  "/admin/auth/registro-usuario",
  "/admin/avisos",
  "/admin/avisos/nuevo",
  "/admin/avisos/editar",
];

const adminRoutesProtected = [
  "/admin/avisos",
  "/admin/crear-recompensa",
  "/admin/lista-de-usuarios",
  "/admin/nuevo-centro",
  "/admin/validar-actividades",
];

// If an ADMIN is Authenticate
const adminAuthLogin = ["/admin/auth/login-admin", "/login"];

export async function middleware(request: NextRequest) {
  const session = await getSession();
  const { pathname } = request.nextUrl;

  // Verificar si la ruta requiere autenticación
  const isProtectedRoute = protectedUserRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Verificar si la ruta es para usuarios no autenticados
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Verificar si la ruta es de administración
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  // Verificar si la ruta es de autenticación de administradores
  const isAdminAuthRoute = adminAuthRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Verificar si la ruta es de autenticación de administradores
  const isAdminAuthRouteReady = adminAuthLogin.some((route) =>
    pathname.startsWith(route)
  );

  // Redirigir según el estado de autenticación
  if (isProtectedRoute && !session) {
    // Redirigir a login si intenta acceder a ruta protegida sin sesión
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // 3. Proteger rutas de creación/edición de contenido educativo
  const isEducationCreatorRoute = educationCreatorRoutes.some((route) =>
    pathname.startsWith(route)
  );
  if (isEducationCreatorRoute) {
    if (!session) {
      // Si no hay sesión, redirigir a login (aunque la regla anterior ya podría cubrir esto)
      const url = new URL("/login", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    // Si hay sesión, verificar el tipo de usuario
    if (!(session.userType === "TEACHER" || session.userType === "ADMIN")) {
      // Redirigir a la página principal de educación con un mensaje (opcional)
      // O al inicio si se prefiere.
      const deniedUrl = new URL("/educacion", request.url);
      // Podrías añadir un query param para mostrar un toast en la página /educacion,
      // pero el toast desde el middleware no es directo.
      // deniedUrl.searchParams.set("error", "access_denied_creator");
      return NextResponse.redirect(deniedUrl);
    }
  }

  // 3. Proteger rutas de creación/edición de contenido educativo
  const isAdminProtectedRoute = adminRoutesProtected.some((route) =>
    pathname.startsWith(route)
  );
  if (isAdminProtectedRoute) {
    if (!session) {
      // Si no hay sesión, redirigir a login-admin (aunque la regla anterior ya podría cubrir esto)
      const url = new URL("/admin/auth/login-admin", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  }

  if (isAuthRoute && session && session.role !== "ADMIN") {
    // Redirigir a inicio si intenta acceder a login/registro con sesión
    return NextResponse.redirect(new URL("/inicio", request.url));
  }

  // Proteger rutas de administración
  if (isAdminRoute && (!session || session.role !== "ADMIN")) {
    // Redirigir a login de administrador si intenta acceder a ruta de admin sin ser admin
    return NextResponse.redirect(
      new URL("/admin/auth/login-admin", request.url)
    );
  }

  // Si un usuario ya está autenticado e intenta acceder a la autenticación de admin
  if (isAdminAuthRoute && session && session.role !== "ADMIN") {
    // Redirigir al inicio normal
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Si un usuario ADMIN ya está autenticado e intenta acceder a la autenticación de admin
  if (isAdminAuthRouteReady && session && session.role === "ADMIN") {
    // Redirigir al inicio normal
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
