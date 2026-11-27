import { requireUser } from "@/lib/auth";
import { WorkspaceShell } from "@/components/workspace-shell";
import type { Conversation } from "@/types";
export const dynamic = "force-dynamic";
export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { supabase, user } = await requireUser();
  const [profile, history] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("conversations")
      .select()
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(50),
  ]);
  return (
    <WorkspaceShell
      name={profile.data?.full_name ?? ""}
      email={user.email ?? ""}
      conversations={(history.data ?? []) as Conversation[]}
      loadError={!!history.error}
    >
      {children}
    </WorkspaceShell>
  );
}
