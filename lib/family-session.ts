import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const COOKIE_NAME = "family_db_token";
const SESSION_DAYS = 7;

export function familyCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: SESSION_DAYS * 24 * 60 * 60,
    path: "/",
  };
}

export async function setFamilyDbToken(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, familyCookieOptions());
}

export function attachFamilyToken(response: NextResponse, token: string) {
  response.cookies.set(COOKIE_NAME, token, familyCookieOptions());
  return response;
}

export async function getFamilyDbToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

export async function clearFamilySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function verifyFamilySession(): Promise<boolean> {
  const token = await getFamilyDbToken();
  if (!token) return false;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("is_valid_family_session", {
    session_token: token,
  });

  return !error && data === true;
}

export async function requireFamilySession(): Promise<string> {
  const token = await getFamilyDbToken();
  if (!token) throw new Error("FAMILY_SESSION_REQUIRED");

  const valid = await verifyFamilySession();
  if (!valid) throw new Error("FAMILY_SESSION_REQUIRED");

  return token;
}
