import { NextResponse } from "next/server";
import { apiUser, apiError, HttpError, readJson } from "@/lib/http";
import { renameSchema, uuidSchema } from "@/lib/validation";
type Context = { params: Promise<{ id: string }> };
export async function PATCH(request: Request, context: Context) {
  try {
    const { user, supabase } = await apiUser(request);
    const { id } = await context.params;
    const input = renameSchema.safeParse(await readJson(request));
    if (!input.success || !uuidSchema.safeParse(id).success)
      throw new HttpError(400, "Dữ liệu không hợp lệ.");
    const { data, error } = await supabase
      .from("conversations")
      .update(input.data)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .maybeSingle();
    if (error) throw new HttpError(503, "Không thể đổi tên hội thoại.");
    if (!data) throw new HttpError(404, "Không tìm thấy hội thoại.");
    return NextResponse.json({ conversation: data });
  } catch (error) {
    return apiError(error);
  }
}
export async function DELETE(request: Request, context: Context) {
  try {
    const { user, supabase } = await apiUser(request);
    const { id } = await context.params;
    if (!uuidSchema.safeParse(id).success)
      throw new HttpError(400, "Mã hội thoại không hợp lệ.");
    const { data, error } = await supabase
      .from("conversations")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle();
    if (error) throw new HttpError(503, "Không thể xóa hội thoại.");
    if (!data) throw new HttpError(404, "Không tìm thấy hội thoại.");
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
