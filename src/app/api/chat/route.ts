import { NextResponse } from "next/server";
import { apiUser, apiError, HttpError, readJson } from "@/lib/http";
import { chatSchema } from "@/lib/validation";
import { createWriter } from "@/lib/supabase/writer";
import { generateAnswer, geminiError } from "@/lib/ai/gemini";
import type { Conversation, Message, Profile } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: Request) {
  let reserved: { userId: string; requestId: string } | null = null;
  let writer: ReturnType<typeof createWriter> | null = null;
  try {
    const { user, supabase } = await apiUser(request);
    const input = chatSchema.safeParse(await readJson(request));
    if (!input.success)
      throw new HttpError(
        400,
        "Câu hỏi phải có từ 1 đến 4.000 ký tự và mã hội thoại hợp lệ.",
      );
    const { conversationId, content, requestId } = input.data;
    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .select()
      .eq("id", conversationId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (conversationError)
      throw new HttpError(
        503,
        "Không đọc được hội thoại. Vui lòng kiểm tra kết nối Supabase.",
      );
    if (!conversation) throw new HttpError(404, "Không tìm thấy hội thoại.");
    if (!process.env.GEMINI_API_KEY || !process.env.GEMINI_MODEL)
      throw new Error("AI_NOT_CONFIGURED");
    writer = createWriter();
    const { data: claim, error: claimError } = await writer.rpc(
      "reserve_chat_request",
      {
        p_user_id: user.id,
        p_conversation_id: conversationId,
        p_request_id: requestId,
        p_content: content,
      },
    );
    if (claimError)
      throw new HttpError(
        503,
        "Không thể khởi tạo yêu cầu. Vui lòng kiểm tra migration và cấu hình máy chủ.",
      );
    if (claim.state === "completed")
      return NextResponse.json({ messages: claim.messages });
    if (claim.state === "limited")
      throw new HttpError(
        429,
        "Bạn đã đạt giới hạn 8 câu hỏi mỗi phút hoặc 100 câu hỏi mỗi ngày. Vui lòng thử lại sau.",
      );
    if (claim.state === "busy")
      throw new HttpError(
        409,
        "Hội thoại đang xử lý một yêu cầu. Vui lòng chờ rồi tải lại hội thoại.",
      );
    if (claim.state === "conflict")
      return NextResponse.json(
        {
          error:
            "Yêu cầu trước đó đã kết thúc. Bạn có thể nhấn gửi lại để tạo yêu cầu mới.",
          code: "REQUEST_CONFLICT",
        },
        { status: 409 },
      );
    if (claim.state !== "reserved")
      throw new HttpError(404, "Không tìm thấy hội thoại.");
    reserved = { userId: user.id, requestId };
    const [historyResult, profileResult] = await Promise.all([
      supabase
        .from("messages")
        .select()
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: false })
        .limit(12),
      supabase.from("profiles").select().eq("id", user.id).maybeSingle(),
    ]);
    if (historyResult.error || profileResult.error)
      throw new HttpError(
        503,
        "Không thể đọc lịch sử hoặc hồ sơ. Vui lòng thử lại sau.",
      );
    // Keep whole turns while bounding total context to 32,000 characters.
    const recent = (historyResult.data ?? []) as Message[];
    let used = 0;
    const selected: Message[] = [];
    for (let i = 0; i + 1 < recent.length; i += 2) {
      const pair = recent.slice(i, i + 2);
      const size = pair.reduce((n, m) => n + m.content.length, 0);
      if (used + size > 32000) break;
      selected.push(...pair);
      used += size;
    }
    const answer = await generateAnswer(
      (conversation as Conversation).category,
      selected.reverse(),
      content,
      profileResult.data as Profile | null,
    );
    const { data: messages, error: saveError } = await writer.rpc(
      "complete_chat_request",
      { p_user_id: user.id, p_request_id: requestId, p_answer: answer },
    );
    if (saveError)
      throw new HttpError(
        503,
        "Không lưu được câu trả lời. Vui lòng tải lại hội thoại trước khi thử lại.",
      );
    reserved = null;
    return NextResponse.json({ messages });
  } catch (error) {
    if (reserved && writer) {
      try {
        await writer.rpc("fail_chat_request", {
          p_user_id: reserved.userId,
          p_request_id: reserved.requestId,
        });
      } catch {
        /* Expired reservations are reclaimed after 90 seconds if cleanup is unreachable. */
      }
    }
    if (error instanceof HttpError) return apiError(error);
    const failure = geminiError(error);
    return NextResponse.json(
      { error: failure.message },
      { status: failure.status },
    );
  }
}
