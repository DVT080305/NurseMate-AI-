import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AuthError() {
  return (
    <main id="main" className="center-state">
      <div className="center-state-card">
        <span className="eyebrow">XÁC THỰC TÀI KHOẢN</span>
        <h1>Liên kết xác nhận không còn hiệu lực.</h1>
        <p>
          Hãy dùng liên kết mới nhất trong email và mở bằng trình duyệt bạn đã
          dùng để đăng ký.
        </p>
        <Link href="/login" className="button">
          <ArrowLeft size={17} /> Quay lại đăng nhập
        </Link>
      </div>
    </main>
  );
}
