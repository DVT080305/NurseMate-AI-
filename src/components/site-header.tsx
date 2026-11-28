"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Brand } from "@/components/brand";

const NAV_LINKS = [
  { href: "#chuc-nang", label: "Chức năng" },
  { href: "#trai-nghiem", label: "Trợ lý AI" },
  { href: "#cach-hoc", label: "Lộ trình" },
  { href: "#gia-tri", label: "Giá trị" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 16);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`site-header ${scrolled ? "site-header-scrolled" : ""}`}>
      <div className="container header-inner">
        <Brand light />
        <nav className="desktop-nav" aria-label="Điều hướng chính">
          {NAV_LINKS.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <Link href="/login" className="login-link">
            Đăng nhập
          </Link>
          <Link href="/register" className="button button-small">
            Bắt đầu học <ArrowUpRight size={15} />
          </Link>
          <button
            type="button"
            className="icon-button icon-button-dark mobile-nav-toggle"
            aria-label={menuOpen ? "Đóng menu" : "Mở menu điều hướng"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="mobile-nav-drawer">
          <nav aria-label="Điều hướng di động">
            {NAV_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="mobile-nav-actions">
            <Link
              href="/login"
              className="button button-dark-outline full-width"
              onClick={() => setMenuOpen(false)}
            >
              Đăng nhập
            </Link>
            <Link
              href="/register"
              className="button full-width"
              onClick={() => setMenuOpen(false)}
            >
              Bắt đầu học <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
