import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Stethoscope,
  ShieldCheck,
  Sparkles,
  BookOpen,
  Route,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { AuthForm } from "@/components/auth-form";
import { isSupabaseConfigured } from "@/lib/env";

export function AuthPage({ mode }: { mode: "login" | "register" }) {
  const configured = isSupabaseConfigured();
  return (
    <main id="main" className="auth-layout">
      <aside className="auth-aside">
        <div className="auth-aside-bg" aria-hidden="true">
          <Image
            src="/images/nursing-study.jpg"
            alt=""
            fill
            sizes="(max-width: 760px) 0vw, 46vw"
          />
        </div>
        <Brand light />
        <div className="auth-aside-copy">
          <span className="auth-big-icon" aria-hidden="true">
            <Stethoscope size={30} strokeWidth={1.9} />
          </span>
          <span className="eyebrow eyebrow-dark">
            ĐỒNG HÀNH TRÊN TỪNG BƯỚC TIẾN
          </span>
          <h2>
            Học bằng sự tò mò.
            <br />
            Lớn lên bằng
            <br />
            <span className="gradient-text-light">sự tận tâm.</span>
          </h2>
          <p>
            Không gian học tập điều dưỡng tích hợp AI để đặt câu hỏi, ôn tập quy
            trình, rèn luyện tình huống và chuẩn bị vững vàng cho tương lai.
          </p>
          <div className="auth-feature-pills">
            <div className="auth-feature-pill">
              <Sparkles size={16} /> Trợ lý AI giải thích rõ ràng bằng tiếng Việt
            </div>
            <div className="auth-feature-pill">
              <BookOpen size={16} /> Ôn quy trình &amp; thuật ngữ Anh – Việt
            </div>
            <div className="auth-feature-pill">
              <Route size={16} /> Lưu trữ hội thoại &amp; cá nhân hóa mục tiêu
            </div>
          </div>
        </div>
        <div className="hero-note">
          <ShieldCheck size={17} /> Kiến thức vững vàng · Tương lai rộng mở
        </div>
      </aside>

      <section className="auth-main">
        <div className="auth-main-top">
          <span className="auth-mobile-brand">
            <Brand />
          </span>
          <Link href="/" className="back-link">
            <ArrowLeft size={16} /> Về trang chủ
          </Link>
        </div>

        <div className="auth-box">
          <span className="eyebrow">KHÔNG GIAN HỌC TẬP CỦA BẠN</span>
          <h1>
            {mode === "register"
              ? "Bắt đầu hành trình mới."
              : "Chào mừng bạn trở lại."}
          </h1>
          <p>
            {mode === "register"
              ? "Tạo tài khoản để cùng NurseMate học thêm mỗi ngày."
              : "Tiếp tục từ nơi bạn đã dừng lại, cùng NurseMate."}
          </p>
          {!configured && (
            <div className="alert alert-info" role="status">
              <strong>Ứng dụng đang chờ kết nối Supabase.</strong>
              <br />
              Thêm NEXT_PUBLIC_SUPABASE_URL và
              NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY vào .env.local, chạy
              migration rồi khởi động lại ứng dụng. Xem README.md để cài đặt.
            </div>
          )}
          <AuthForm mode={mode} configured={configured} />
          <p className="auth-disclaimer">
            NurseMate chỉ hỗ trợ học tập, không thay thế người hướng dẫn hoặc
            nhân viên y tế. Không nhập thông tin định danh người bệnh.
          </p>
        </div>

        <small className="auth-copyright">
          NurseMate AI · Nền tảng học tập và thực hành điều dưỡng
        </small>
      </section>
    </main>
  );
}
