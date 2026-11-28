import Link from "next/link";
import { Activity } from "lucide-react";

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className={`brand ${light ? "brand-light" : ""}`}
      aria-label="NurseMate AI — Trang chủ"
    >
      <span className="brand-mark" aria-hidden="true">
        <Activity size={21} strokeWidth={2.4} />
      </span>
      <span className="brand-text">
        <span className="brand-name">
          NurseMate<span className="brand-ai">AI</span>
        </span>
        <small>ĐỒNG HÀNH CÙNG ĐIỀU DƯỠNG</small>
      </span>
    </Link>
  );
}
