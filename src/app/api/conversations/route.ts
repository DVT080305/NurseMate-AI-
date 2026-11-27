import { NextResponse } from "next/server";
import { apiUser, apiError, HttpError, readJson } from "@/lib/http";
import { conversationSchema } from "@/lib/validation";
export async function POST(request: Request) {
  try {
    const { user, supabase } = await apiUser(request);
    const input = conversationSchema.safeParse(await readJson(request));
    if (!input.success)
      throw new HttpError(400, "Tên hoặc nhóm hội thoại không hợp lệ.");
    const { data, error } = await supabase
      .from("conversations")
      .insert({ ...input.data, user_id: user.id })
      .select()
      .single();
    if (error)
      throw new HttpError(
        503,
        "Không tạo được hội thoại. Vui lòng kiểm tra kết nối và migration Supabase.",
      );
    return NextResponse.json({ conversation: data }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
