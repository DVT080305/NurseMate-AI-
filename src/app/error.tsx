"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="center-state">
      <div className="center-state-card">
        <span className="eyebrow">ĐÃ XẢY RA SỰ CỐ</span>
        <h1>Không thể tải nội dung.</h1>
        <p>
          Vui lòng kiểm tra kết nối. Nếu vừa cài đặt, hãy kiểm tra cấu hình và
          chạy migration trong Supabase.
        </p>
        <button onClick={reset} className="button">
          Thử lại
        </button>
      </div>
    </main>
  );
}
