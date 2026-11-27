import Link from "next/link";
import { Activity } from "lucide-react";
export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className={`brand ${light ? "brand-light" : ""}`}
      aria-label="NurseMate AI — Trang chủ"
    >
      <span className="brand-mark">
        <Activity size={25} strokeWidth={2.2} />
      </span>
      <span>
        NurseMate<span className="brand-ai">AI</span>
        <small>ĐỒNG HÀNH CÙNG ĐIỀU DƯỠNG</small>
      </span>
    </Link>
  );
}
