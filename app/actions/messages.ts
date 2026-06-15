"use server";

import { revalidatePath } from "next/cache";
import { getFamilyDbToken, verifyFamilySession } from "@/lib/family-session";
import { getAdminDbToken, verifyAdminSession } from "@/lib/admin-session";
import { createClient } from "@/lib/supabase/server";
import type { AdminMessage } from "@/lib/types";

export async function sendMessageToAdmin(senderName: string, message: string) {
  const familyToken = await getFamilyDbToken();
  if (!familyToken || !(await verifyFamilySession())) {
    throw new Error("נדרשת התחברות למשפחה");
  }

  const body = message.trim();
  if (!body) throw new Error("נא לכתוב הודעה");

  const supabase = await createClient();
  const { error } = await supabase.rpc("send_admin_message_via_session", {
    session_token: familyToken,
    p_message: body,
    p_sender_name: senderName.trim() || null,
  });

  if (error) throw error;
  revalidatePath("/admin/seed");
}

export async function getAdminMessages(): Promise<AdminMessage[]> {
  const adminToken = await getAdminDbToken();
  if (!adminToken || !(await verifyAdminSession())) {
    throw new Error("נדרשת הרשאת מנהל");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_admin_messages_via_admin_session", {
    admin_session_token: adminToken,
  });

  if (error) throw error;
  return data ?? [];
}
