import { NextResponse } from "next/server";
import { attachFamilyToken } from "@/lib/family-session";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "נדרשת סיסמה" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: token, error } = await supabase.rpc("create_family_session", {
      input_password: password,
    });

    if (error) {
      if (error.message.includes("invalid_password")) {
        return NextResponse.json({ error: "סיסמה שגויה" }, { status: 401 });
      }
      console.error("create_family_session error:", error.message);
      return NextResponse.json(
        { error: `שגיאה בהתחברות: ${error.message}` },
        { status: 500 }
      );
    }

    const response = NextResponse.json({ success: true });
    return attachFamilyToken(response, token);
  } catch {
    return NextResponse.json({ error: "שגיאה בשרת" }, { status: 500 });
  }
}
