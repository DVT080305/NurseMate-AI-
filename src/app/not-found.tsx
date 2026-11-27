import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="center-state">
      <span className="eyebrow">404 · KHÔNG TÌM THẤY</span>
      <h1>Trang này chưa có ở đây.</h1>
      <p>Liên kết có thể đã thay đổi hoặc bạn không có quyền truy cập.</p>
      <Link href="/" className="button">
        Về trang chủ
      </Link>
    </main>
  );
}
