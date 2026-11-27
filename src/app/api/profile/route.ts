import { NextResponse } from "next/server";
import { apiUser, apiError, HttpError, readJson } from "@/lib/http";
import { profileSchema } from "@/lib/validation";
export async function PATCH(request: Request) {
  try {
    const { user, supabase } = await apiUser(request);
    const input = profileSchema.safeParse(await readJson(request));
    if (!input.success)
      throw new HttpError(
        400,
        "Hồ sơ không hợp lệ. Kiểm tra họ tên và độ dài nội dung.",
      );
    const { data, error } = await supabase
      .from("profiles")
      .update(input.data)
      .eq("id", user.id)
      .select()
      .single();
    if (error) throw new HttpError(503, "Không cập nhật được hồ sơ.");
    return NextResponse.json({ profile: data });
  } catch (error) {
    return apiError(error);
  }
}
