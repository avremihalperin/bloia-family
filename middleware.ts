import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_PATHS = ["/login", "/join", "/setup", "/api/auth/family", "/robots.txt"];

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

  if (
    PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth")
  ) {
    return updateSession(request);
  }

  const hasSession = await hasValidFamilySession(request);
  if (!hasSession) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
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
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
