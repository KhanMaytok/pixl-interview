import { type NextRequest, NextResponse } from "next/server";
import { client } from "~/api/client";

// Rutas que no requieren autenticación
const publicRoutes = ['/login', '/register'];

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Obtener el token del header de autorización
  const token = request.cookies.get('token')?.value;

  if (!token && publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  if (!token || token === undefined && !publicRoutes.includes(pathname)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Verificar el token con el backend
    const response = await client.api.auth["verify-token"].get({ headers: { authorization: token } })
    if (response.error || !response.data?.user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (publicRoutes.includes(pathname) && response.data) {
      return NextResponse.redirect(new URL('/chats', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.log(error);
  }
}

// Configurar en qué rutas se ejecutará el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

