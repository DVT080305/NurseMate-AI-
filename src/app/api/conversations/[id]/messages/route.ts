import { NextResponse } from "next/server";
import { apiUser, apiError, HttpError } from "@/lib/http";
import { uuidSchema } from "@/lib/validation";
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { user, supabase } = await apiUser(request);
    const { id } = await context.params;
    const before = new URL(request.url).searchParams.get("before");
    if (
      !uuidSchema.safeParse(id).success ||
      !before ||
      before.length > 40 ||
      !Number.isFinite(Date.parse(before))
    )
      throw new HttpError(400, "Tham số không hợp lệ.");
    const { data: conversation, error } = await supabase
      .from("conversations")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) throw new HttpError(503, "Không đọc được hội thoại.");
    if (!conversation) throw new HttpError(404, "Không tìm thấy hội thoại.");
    const result = await supabase
      .from("messages")
      .select()
      .eq("conversation_id", id)
      .lt("created_at", before)
      .order("created_at", { ascending: false })
      .limit(40);
    if (result.error) throw new HttpError(503, "Không đọc được tin nhắn.");
    return NextResponse.json({
      messages: result.data.reverse(),
      hasMore: result.data.length === 40,
    });
  } catch (error) {
    return apiError(error);
  }
}
