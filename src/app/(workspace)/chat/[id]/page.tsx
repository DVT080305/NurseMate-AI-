import { notFound } from "next/navigation";
import { Chat } from "@/components/chat";
import { requireUser } from "@/lib/auth";
import { uuidSchema } from "@/lib/validation";
import type { Conversation, Message } from "@/types";
export const metadata = { title: "Hội thoại học tập" };
export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user, supabase } = await requireUser();
  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) notFound();
  const { data, error } = await supabase
    .from("conversations")
    .select()
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) throw new Error("Không tải được hội thoại.");
  if (!data) notFound();
  const { data: messages, error: messageError } = await supabase
    .from("messages")
    .select()
    .eq("conversation_id", id)
    .order("created_at", { ascending: false })
    .limit(40);
  if (messageError) throw new Error("Không tải được tin nhắn.");
  return (
    <Chat
      key={id}
      conversation={data as Conversation}
      initialCategory={data.category}
      initialMessages={((messages ?? []) as Message[]).reverse()}
      initialHasMore={messages?.length === 40}
    />
  );
}
