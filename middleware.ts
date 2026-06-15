import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_PATHS = [
  "/login",
  "/join",
  "/setup",
  "/api/auth/family",
  "/robots.txt",
  "/logo.png",
  "/icon.png",
  "/apple-icon.png",
  "/favicon.ico",
  "/manifest.webmanifest",
];

function isPublicAsset(pathname: string) {
  return (
    pathname === "/icon" ||
    pathname.startsWith("/icon?") ||
    pathname === "/apple-icon" ||
    pathname.startsWith("/apple-icon?") ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico)$/i.test(pathname)
  );
}

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  if (pathname.startsWith("/join/")) return true;
  if (isPublicAsset(pathname)) return true;
  if (pathname.startsWith("/_next") || pathname.startsWith("/api/auth")) return true;
  return false;
}

async function hasValidFamilySession(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get("family_db_token")?.value;
  if (!token) return false;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase.rpc("is_valid_family_session", {
    session_token: token,
  });

  return !error && data === true;
}

async function hasValidAdminSession(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get("admin_db_token")?.value;
  if (!token) return false;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase.rpc("is_valid_admin_session", {
    session_token: token,
  });

  return !error && data === true;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return updateSession(request);
  }

  const hasSession = await hasValidFamilySession(request);
  if (!hasSession) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("family_db_token");
    return response;
  }

  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const hasAdmin = await hasValidAdminSession(request);
    if (!hasAdmin) {
      const adminLoginUrl = request.nextUrl.clone();
      adminLoginUrl.pathname = "/admin/login";
      adminLoginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(adminLoginUrl);
    }
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|logo.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
