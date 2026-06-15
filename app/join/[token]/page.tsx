import { createClient } from "@/lib/supabase/server";
import { JoinClient } from "./JoinClient";
import type { Invitation } from "@/lib/types";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function JoinPage({ params }: PageProps) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: invitation } = await supabase.rpc("get_invitation_by_token", {
    p_token: token,
  });

  const { data: parents } = await supabase.rpc("get_parents_for_invitation", {
    p_token: token,
  });

  return (
    <main className="auth-bg min-h-screen p-4 py-12">
      <JoinClient
        token={token}
        invitation={invitation as Invitation | null}
        parents={parents ?? []}
      />
    </main>
  );
}
