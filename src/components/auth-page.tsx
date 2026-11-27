import Link from "next/link";
import { ArrowLeft, Stethoscope, ShieldCheck } from "lucide-react";
import { Brand } from "@/components/brand";
import { AuthForm } from "@/components/auth-form";
import { isSupabaseConfigured } from "@/lib/env";
export function AuthPage({ mode }: { mode: "login" | "register" }) {
  const configured = isSupabaseConfigured();
  return (
    <main id="main" className="auth-layout">
      <aside className="auth-aside">
        <Brand />
        <div className="auth-aside-copy">
          <span className="auth-big-icon">
            <Stethoscope size={66} strokeWidth={1.1} />
          </span>
          <span className="eyebrow">ĐỒNG HÀNH TRÊN TỪNG BƯỚC TIẾN</span>
          <h2>
            Học bằng sự tò mò.
            <br />
            Lớn lên bằng
            <br />
            <span>sự tận tâm.</span>
          </h2>
          <p>
            Một không gian để đặt câu hỏi, củng cố kiến thức và chuẩn bị cho
            hành trình điều dưỡng của bạn.
          </p>
        </div>
        <div className="hero-note">
          <ShieldCheck size={19} /> Kiến thức vững vàng. Tương lai rộng mở.
        </div>
      </aside>
      <section className="auth-main">
        <Link href="/" className="back-link">
          <ArrowLeft size={17} /> Về trang chủ
        </Link>
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
          NurseMate AI · Trợ lý học tập và thực hành điều dưỡng
        </small>
      </section>
    </main>
  );
}
