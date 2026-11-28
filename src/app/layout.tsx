import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-be-vietnam",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "NurseMate AI | Đồng hành cùng điều dưỡng",
    template: "%s | NurseMate AI",
  },
  icons: { icon: "/icon.svg" },
  description:
    "Trợ lý học tập và thực hành điều dưỡng ứng dụng AI. Ôn tập quy trình, thuật ngữ chuyên ngành, luyện tình huống lâm sàng và định hướng nghề nghiệp.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={beVietnamPro.variable}>
      <body>
        <a className="skip-link" href="#main">
          Đến nội dung chính
        </a>
        {children}
      </body>
    </html>
  );
}
