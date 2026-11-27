import Link from "next/link";
export default function AuthError() {
  return (
    <main id="main" className="center-state">
      <h1>Liên kết xác nhận không còn hiệu lực.</h1>
      <p>
        Hãy dùng liên kết mới nhất trong email và mở bằng trình duyệt bạn đã
        dùng để đăng ký.
      </p>
      <Link href="/login" className="button">
        Quay lại đăng nhập
      </Link>
    </main>
  );
}
