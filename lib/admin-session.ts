import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const COOKIE_NAME = "admin_db_token";
const SESSION_DAYS = 7;

export function adminCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: SESSION_DAYS * 24 * 60 * 60,
    path: "/",
  };
}

export async function setAdminDbToken(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, adminCookieOptions());
}

export function attachAdminToken(response: NextResponse, token: string) {
  response.cookies.set(COOKIE_NAME, token, adminCookieOptions());
  return response;
}

export async function getAdminDbToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function verifyAdminSession(): Promise<boolean> {
  const token = await getAdminDbToken();
  if (!token) return false;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("is_valid_admin_session", {
    session_token: token,
  });

  return !error && data === true;
}

export async function requireAdminSession(): Promise<void> {
  const valid = await verifyAdminSession();
  if (!valid) throw new Error("ADMIN_SESSION_REQUIRED");
}

export async function isAdminPinConfigured(): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("admin_pin_is_configured");
  return data === true;
}
