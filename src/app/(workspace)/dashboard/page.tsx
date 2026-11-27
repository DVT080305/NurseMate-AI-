import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  MessageSquare,
  Sun,
  ShieldCheck,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { categories, getCategory } from "@/lib/categories";
import { CategoryIcon } from "@/components/category-icon";
import { ProfileForm } from "@/components/profile-form";
import type { Conversation, Profile } from "@/types";
export const metadata = { title: "Không gian học tập" };
export default async function Dashboard() {
  const { user, supabase } = await requireUser();
  const [profileResult, historyResult] = await Promise.all([
    supabase.from("profiles").select().eq("id", user.id).maybeSingle(),
    supabase
      .from("conversations")
      .select()
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(5),
  ]);
  const profile = profileResult.data as Profile | null;
  const conversations = (historyResult.data ?? []) as Conversation[];
  return (
    <main id="main" className="dashboard">
      <header className="workspace-heading">
        <span>KHÔNG GIAN HỌC TẬP</span>
        <span className="workspace-badge">
          <span className="status-dot" /> NurseMate AI
        </span>
      </header>
      <div className="dashboard-intro">
        <div className="eyebrow">
          <Sun size={16} /> MỖI NGÀY, MỘT BƯỚC TIẾN
        </div>
        <h1>Xin chào, {profile?.full_name || "bạn"}.</h1>
        <p>Hôm nay, bạn muốn học thêm điều gì?</p>
      </div>
      <section className="dashboard-banner">
        <div>
          <span className="eyebrow">KIẾN THỨC ĐI CÙNG SỰ TẬN TÂM</span>
          <h2>
            Từng câu hỏi nhỏ,
            <br />
            xây nền tảng vững vàng.
          </h2>
          <Link href="/chat" className="button button-small">
            Bắt đầu trò chuyện <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="banner-art" aria-hidden="true">
          <CategoryIcon category="procedures" size={100} />
          <span className="banner-plus">+</span>
        </div>
      </section>
      <div className="subheading">
        <h2>Góc học tập của bạn</h2>
        <span>Chọn một chủ đề để bắt đầu</span>
      </div>
      <section className="dashboard-features">
        {categories.map((c) => (
          <Link
            href={`/chat?category=${c.id}`}
            className={`feature-card ${c.color}`}
            key={c.id}
          >
            <span className={`round-icon ${c.color}`}>
              <CategoryIcon category={c.id} />
            </span>
            <h3>{c.title}</h3>
            <p>{c.description}</p>
            <ArrowUpRight size={19} className="card-arrow" />
          </Link>
        ))}
      </section>
      <div className="dashboard-bottom">
        <section className="panel">
          <div className="panel-heading">
            <h2>Tiếp tục cuộc trò chuyện</h2>
            <Link href="/chat" className="text-link">
              Tạo mới <ArrowRight size={16} />
            </Link>
          </div>
          {historyResult.error || profileResult.error ? (
            <p className="alert alert-error" role="alert">
              Không tải được dữ liệu. Hãy kiểm tra kết nối và migration
              Supabase.
            </p>
          ) : conversations.length ? (
            <div className="recent-list">
              {conversations.map((c) => (
                <Link key={c.id} href={`/chat/${c.id}`}>
                  <span
                    className={`round-icon ${getCategory(c.category).color}`}
                  >
                    <CategoryIcon category={c.category} size={19} />
                  </span>
                  <div>
                    <strong>{c.title}</strong>
                    <small>
                      {getCategory(c.category).short} ·{" "}
                      {new Intl.DateTimeFormat("vi-VN", {
                        day: "numeric",
                        month: "numeric",
                        timeZone: "Asia/Ho_Chi_Minh",
                      }).format(new Date(c.updated_at))}
                    </small>
                  </div>
                  <ArrowUpRight size={17} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <MessageSquare size={30} strokeWidth={1.3} />
              <h3>Cuộc trò chuyện đầu tiên đang chờ bạn</h3>
              <p>Đặt câu hỏi và lưu lại những điều bạn học được.</p>
              <Link href="/chat" className="text-link">
                Bắt đầu ngay <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </section>
        <ProfileForm profile={profile} email={user.email ?? ""} />
      </div>
      <p className="workspace-disclaimer">
        <ShieldCheck size={16} /> Chỉ dùng cho học tập. Luôn đối chiếu tài liệu
        và hướng dẫn chuyên môn.
      </p>
    </main>
  );
}
