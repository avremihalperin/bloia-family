import { NextResponse } from "next/server";
import { setAdminDbToken } from "@/lib/admin-session";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { pin } = await request.json();

    if (!pin || typeof pin !== "string") {
      return NextResponse.json({ error: "נדרש PIN מנהל" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: token, error } = await supabase.rpc("create_admin_session", {
      input_pin: pin,
    });

    if (error) {
      if (error.message.includes("invalid_admin_pin")) {
        return NextResponse.json({ error: "PIN מנהל שגוי" }, { status: 401 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await setAdminDbToken(token);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "שגיאה בשרת" }, { status: 500 });
  }
}
