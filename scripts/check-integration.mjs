import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SECRET_KEY",
];
if (process.env.RUN_GEMINI === "1")
  required.push("GEMINI_API_KEY", "GEMINI_MODEL");
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Thiếu biến môi trường: ${missing.join(", ")}`);
  process.exit(1);
}
const base = process.env.TEST_BASE_URL || "http://localhost:3000";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const admin = createClient(url, process.env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const created = [];
async function newUser() {
  const password = `Nm!${randomUUID()}`;
  const email = `nursemate-test-${randomUUID()}@example.com`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: "Kiểm thử NurseMate" },
  });
  if (error)
    throw new Error(
      "Không tạo được tài khoản kiểm thử. Kiểm tra khóa máy chủ và quyền quản trị.",
    );
  created.push(data.user.id);
  const jar = new Map();
  const client = createServerClient(url, key, {
    cookies: {
      getAll: () => [...jar].map(([name, value]) => ({ name, value })),
      setAll: (values) =>
        values.forEach(({ name, value }) => jar.set(name, value)),
    },
  });
  const login = await client.auth.signInWithPassword({ email, password });
  assert.equal(login.error, null, "Đăng nhập bằng mật khẩu");
  async function api(path, method = "GET", body) {
    const response = await fetch(`${base}${path}`, {
      method,
      signal: AbortSignal.timeout(75000),
      redirect: "manual",
      headers: {
        cookie: [...jar].map(([n, v]) => `${n}=${v}`).join("; "),
        origin: base,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    return response;
  }
  return { id: data.user.id, client, api };
}
try {
  const a = await newUser();
  const b = await newUser();
  const dashboard = await a.api("/dashboard");
  assert.equal(dashboard.status, 200, "Dashboard sau đăng nhập");
  assert.match(
    await dashboard.text(),
    /Xin chào/,
    "Dashboard hiển thị nội dung đã xác thực",
  );
  const anonymousDashboard = await fetch(`${base}/dashboard`, {
    redirect: "manual",
  });
  const anonymousHtml = await anonymousDashboard.text();
  // Next.js can emit a meta redirect after the streaming response has started.
  const redirectedByHeader =
    [307, 308].includes(anonymousDashboard.status) &&
    anonymousDashboard.headers.get("location")?.startsWith("/login");
  const redirectedByStream =
    anonymousDashboard.status === 200 &&
    /<meta[^>]+http-equiv="refresh"[^>]+content="\d+;url=\/login(?:\?[^\"]*)?"/.test(
      anonymousHtml,
    );
  assert.ok(
    redirectedByHeader || redirectedByStream,
    "Chặn dashboard chưa đăng nhập",
  );
  assert.doesNotMatch(
    anonymousHtml,
    /Xin chào/,
    "Không tiết lộ nội dung dashboard khi chưa đăng nhập",
  );
  const createResponse = await a.api("/api/conversations", "POST", {
    category: "career",
    title: "Kiểm thử kết nối thật",
  });
  assert.equal(createResponse.status, 201, "Tạo hội thoại");
  const { conversation } = await createResponse.json();
  const otherRead = await b.client
    .from("conversations")
    .select()
    .eq("id", conversation.id);
  assert.equal(otherRead.data?.length, 0, "RLS đọc chéo");
  assert.equal(
    (
      await b.api(`/api/conversations/${conversation.id}`, "PATCH", {
        title: "Không được phép",
      })
    ).status,
    404,
    "API đổi tên chéo",
  );
  assert.equal(
    (await b.api(`/api/conversations/${conversation.id}`, "DELETE")).status,
    404,
    "API xóa chéo",
  );
  const forged = await a.client.from("messages").insert({
    conversation_id: conversation.id,
    role: "assistant",
    content: "Giả mạo",
  });
  assert.ok(forged.error, "Phải chặn giả mạo trợ lý");
  assert.equal(
    (
      await a.api(`/api/conversations/${conversation.id}`, "PATCH", {
        title: "Đã đổi tên",
      })
    ).status,
    200,
    "Đổi tên hội thoại",
  );
  console.log(
    "ĐẠT: đăng nhập, dashboard, tạo/đổi tên hội thoại, quyền truy cập riêng và chặn giả mạo trợ lý.",
  );
  if (process.env.RUN_GEMINI === "1") {
    const firstId = randomUUID();
    const firstBody = {
      conversationId: conversation.id,
      requestId: firstId,
      content:
        "Tôi muốn được tư vấn phát triển bản thân. Tôi chưa xác định nghề nghiệp mong muốn.",
    };
    const first = await a.api("/api/chat", "POST", firstBody);
    assert.equal(first.status, 200, "Gọi Gemini thật: hỏi làm rõ");
    const firstData = await first.json();
    console.log("ĐẠT: API chat nhận câu trả lời thật từ Gemini.");
    assert.match(firstData.messages[1].content, /nghề nghiệp|công việc/i);
    assert.doesNotMatch(firstData.messages[1].content, /^## /m);
    const duplicate = await a.api("/api/chat", "POST", firstBody);
    assert.equal(duplicate.status, 200, "Gửi trùng trả lại kết quả đã lưu");
    const duplicateData = await duplicate.json();
    assert.deepEqual(duplicateData.messages, firstData.messages);
    const second = await a.api("/api/chat", "POST", {
      conversationId: conversation.id,
      requestId: randomUUID(),
      content:
        "Tôi muốn làm điều dưỡng chăm sóc người cao tuổi tại Việt Nam. Tôi là sinh viên điều dưỡng năm hai, chưa có kinh nghiệm làm việc, đã học kiến thức cơ bản và thực hành trong phòng mô phỏng. Mục tiêu của tôi là củng cố kỹ năng và chuẩn bị thực tập trong sáu tháng tới. Hãy đề xuất lộ trình phù hợp; tôi sẽ tự xác minh yêu cầu hành nghề với cơ sở đào tạo.",
    });
    assert.equal(second.status, 200, "Gọi Gemini thật: lộ trình nghề nghiệp");
    const secondData = await second.json();
    const answer = secondData.messages[1].content;
    console.log("ĐẠT: API chat nhận lộ trình nghề nghiệp thật.");
    assert.equal((answer.match(/^## /gm) || []).length, 3, "Đúng ba phần");
    assert.match(answer, /đề xuất/i);
    assert.match(answer, /bạn/i);
    assert.match(answer, /tôi/i);
    const history = await a.client
      .from("messages")
      .select()
      .eq("conversation_id", conversation.id);
    assert.equal(history.data?.length, 4, "Lịch sử được lưu bền vững");
    const reload = await a.api(`/chat/${conversation.id}`);
    assert.equal(reload.status, 200, "Tải lại trang hội thoại");
    console.log(
      "ĐẠT: Gemini thật, hỏi nghề nghiệp, ba phần, xưng hô, chống gửi trùng và lịch sử.",
    );
  } else
    console.log(
      "CHƯA CHẠY: Gemini thật. Đặt RUN_GEMINI=1 để thực hiện (sử dụng hạn mức của bạn).",
    );
  assert.equal(
    (await a.api(`/api/conversations/${conversation.id}`, "DELETE")).status,
    200,
    "Xóa hội thoại",
  );
  assert.equal(
    (
      await a.client
        .from("messages")
        .select()
        .eq("conversation_id", conversation.id)
    ).data?.length,
    0,
    "Xóa lịch sử liên quan",
  );
  console.log(
    "ĐẠT: tài khoản kiểm thử, đăng nhập, dashboard, RLS hai người dùng, chặn giả mạo trợ lý, tạo/đổi tên/xóa hội thoại.",
  );
} catch (error) {
  console.error(
    error instanceof assert.AssertionError
      ? error.message
      : "Kiểm thử tích hợp chưa hoàn tất. Kiểm tra cấu hình và ứng dụng đang chạy.",
  );
  process.exitCode = 1;
} finally {
  let cleanupFailed = false;
  for (const id of created) {
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) cleanupFailed = true;
  }
  if (cleanupFailed) {
    console.error(
      "Cần xóa thủ công tài khoản nursemate-test-...@example.com trong Supabase Authentication.",
    );
    process.exitCode = 1;
  }
}
