import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { beforeAll, afterAll, describe, expect, it } from "vitest";
const userA = "11111111-1111-4111-8111-111111111111";
const userB = "22222222-2222-4222-8222-222222222222";
const conversationA = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
let db: PGlite;
async function asUser<T>(id: string, sql: string, args: unknown[] = []) {
  await db.exec("set role authenticated");
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id]);
  try {
    return await db.query<T>(sql, args);
  } finally {
    await db.exec("reset role");
  }
}
beforeAll(async () => {
  db = new PGlite();
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create table auth.users(id uuid primary key, raw_user_meta_data jsonb);
    create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid$$;
    grant usage on schema auth, public to anon, authenticated, service_role;
    grant execute on function auth.uid() to authenticated;`);
  await db.exec(
    readFileSync("supabase/migrations/202611270001_nursemate.sql", "utf8"),
  );
  await db.query("insert into auth.users values ($1, $3), ($2, $3)", [
    userA,
    userB,
    JSON.stringify({ full_name: "Sinh viên" }),
  ]);
  await db.query(
    "insert into public.conversations(id,user_id,title,category) values ($1,$2,'Học tập','career')",
    [conversationA, userA],
  );
});
afterAll(async () => {
  await db?.close();
});
describe("Migration PostgreSQL và Row Level Security", () => {
  it("tạo hồ sơ tự động khi đăng ký", async () =>
    expect((await db.query("select * from public.profiles")).rows).toHaveLength(
      2,
    ));
  it("tài khoản khác không đọc được hội thoại", async () =>
    expect(
      (await asUser(userB, "select * from public.conversations")).rows,
    ).toHaveLength(0));
  it("chỉ đọc được hồ sơ của chính mình", async () =>
    expect(
      (await asUser(userA, "select * from public.profiles")).rows,
    ).toHaveLength(1));
  it("không giả mạo chủ sở hữu khi tạo hội thoại", async () => {
    await expect(
      asUser(
        userB,
        "insert into public.conversations(user_id,title,category) values ($1,'Giả mạo','career')",
        [userA],
      ),
    ).rejects.toThrow();
  });
  it("không đổi tên hoặc xóa hội thoại tài khoản khác", async () => {
    expect(
      (
        await asUser(
          userB,
          "update public.conversations set title='Thay đổi' where id=$1 returning id",
          [conversationA],
        )
      ).rows,
    ).toHaveLength(0);
    expect(
      (
        await asUser(
          userB,
          "delete from public.conversations where id=$1 returning id",
          [conversationA],
        )
      ).rows,
    ).toHaveLength(0);
  });
  it("không giả mạo tin nhắn trợ lý qua Data API", async () => {
    await expect(
      asUser(
        userA,
        "insert into public.messages(conversation_id,role,content) values ($1,'assistant','Giả mạo')",
        [conversationA],
      ),
    ).rejects.toThrow();
  });
  it("không gọi RPC lưu tin nhắn bằng quyền người dùng", async () => {
    await expect(
      asUser(userA, "select public.complete_chat_request($1,$2,'Giả mạo')", [
        userA,
        crypto.randomUUID(),
      ]),
    ).rejects.toThrow();
  });
  it("server vẫn kiểm tra quyền sở hữu trong RPC", async () => {
    const result = await db.query<{ result: { state: string } }>(
      "select public.reserve_chat_request($1,$2,$3,'Xin chào') as result",
      [userB, conversationA, crypto.randomUUID()],
    );
    expect(result.rows[0].result.state).toBe("missing");
  });
  it("lưu cặp tin nhắn nguyên tử và trả lại kết quả khi gửi trùng", async () => {
    const id = crypto.randomUUID();
    const args = [userA, conversationA, id, "Tôi muốn học điều dưỡng"];
    const reserved = await db.query<{ result: { state: string } }>(
      "select public.reserve_chat_request($1,$2,$3,$4) as result",
      args,
    );
    expect(reserved.rows[0].result.state).toBe("reserved");
    const busy = await db.query<{ result: { state: string } }>(
      "select public.reserve_chat_request($1,$2,$3,$4) as result",
      args,
    );
    expect(busy.rows[0].result.state).toBe("busy");
    const completed = await db.query<{ result: unknown[] }>(
      "select public.complete_chat_request($1,$2,'Bạn mong muốn nghề nghiệp nào?') as result",
      [userA, id],
    );
    expect(completed.rows[0].result).toHaveLength(2);
    const retry = await db.query<{ result: { state: string } }>(
      "select public.reserve_chat_request($1,$2,$3,$4) as result",
      args,
    );
    expect(retry.rows[0].result.state).toBe("completed");
    expect(
      (await asUser(userA, "select * from public.messages")).rows,
    ).toHaveLength(2);
    expect(
      (await asUser(userB, "select * from public.messages")).rows,
    ).toHaveLength(0);
  });
  it("chặn vượt quá 8 yêu cầu trong một phút", async () => {
    for (let i = 0; i < 7; i++) {
      const id = crypto.randomUUID();
      await db.query("select public.reserve_chat_request($1,$2,$3,'Câu hỏi')", [
        userA,
        conversationA,
        id,
      ]);
      await db.query("select public.fail_chat_request($1,$2)", [userA, id]);
    }
    const result = await db.query<{ result: { state: string } }>(
      "select public.reserve_chat_request($1,$2,$3,'Câu hỏi') as result",
      [userA, conversationA, crypto.randomUUID()],
    );
    expect(result.rows[0].result.state).toBe("limited");
  });
  it("xóa hội thoại xóa nội dung nhưng giữ bộ đếm hạn mức", async () => {
    await asUser(userA, "delete from public.conversations where id=$1", [
      conversationA,
    ]);
    expect((await db.query("select * from public.messages")).rows).toHaveLength(
      0,
    );
    const ledger = await db.query<{
      content: string | null;
      result: unknown;
      conversation_id: string | null;
    }>("select * from public.chat_requests");
    expect(ledger.rows.length).toBeGreaterThan(0);
    expect(
      ledger.rows.every(
        (r) =>
          r.content === null && r.result === null && r.conversation_id === null,
      ),
    ).toBe(true);
    const created = await asUser<{ id: string }>(
      userA,
      "insert into public.conversations(user_id,title,category) values($1,'Mới','career') returning id",
      [userA],
    );
    const result = await db.query<{ result: { state: string } }>(
      "select public.reserve_chat_request($1,$2,$3,'Không vượt hạn mức') as result",
      [userA, created.rows[0].id, crypto.randomUUID()],
    );
    expect(result.rows[0].result.state).toBe("limited");
  });
  it("chặn hơn 100 yêu cầu trong 24 giờ dù đã qua cửa sổ một phút", async () => {
    const created = await asUser<{ id: string }>(
      userB,
      "insert into public.conversations(user_id,title,category) values($1,'Ngày','career') returning id",
      [userB],
    );
    await db.query(
      "insert into public.chat_requests(id,user_id,conversation_id,content,status,created_at) select gen_random_uuid(),$1,$2,'Câu hỏi','failed',clock_timestamp()-interval '2 hours' from generate_series(1,100)",
      [userB, created.rows[0].id],
    );
    const result = await db.query<{ result: { state: string } }>(
      "select public.reserve_chat_request($1,$2,$3,'Câu hỏi') as result",
      [userB, created.rows[0].id, crypto.randomUUID()],
    );
    expect(result.rows[0].result.state).toBe("limited");
  });
});
