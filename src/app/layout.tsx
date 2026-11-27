import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "NurseMate AI | Đồng hành cùng điều dưỡng",
    template: "%s | NurseMate AI",
  },
  icons: { icon: "/icon.svg" },
  description:
    "Trợ lý học tập và thực hành điều dưỡng. Ôn tập quy trình, thuật ngữ, tình huống và phát triển nghề nghiệp cùng trí tuệ nhân tạo.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>
        <a className="skip-link" href="#main">
          Đến nội dung chính
        </a>
        {children}
      </body>
    </html>
  );
}
