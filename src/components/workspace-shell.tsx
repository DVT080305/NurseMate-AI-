"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Plus,
  LogOut,
  PanelLeftClose,
  Menu,
  MessageSquare,
  ArrowUpRight,
  X,
  Pencil,
  Trash2,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { CategoryIcon } from "@/components/category-icon";
import { categories } from "@/lib/categories";
import { createClient } from "@/lib/supabase/client";
import type { Conversation } from "@/types";

export function WorkspaceShell({
  children,
  conversations,
  name,
  email,
  loadError,
}: {
  children: React.ReactNode;
  conversations: Conversation[];
  name: string;
  email: string;
  loadError: boolean;
}) {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Conversation | null>(null);
  const [deleting, setDeleting] = useState<Conversation | null>(null);
  const [title, setTitle] = useState("");

  async function changeConversation(action: "rename" | "delete") {
    const conversation = action === "rename" ? editing : deleting;
    if (!conversation || busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/conversations/${conversation.id}`, {
        method: action === "rename" ? "PATCH" : "DELETE",
        headers: { "Content-Type": "application/json" },
        ...(action === "rename" ? { body: JSON.stringify({ title }) } : {}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEditing(null);
      setDeleting(null);
      if (action === "delete" && path === `/chat/${conversation.id}`)
        router.push("/chat");
      router.refresh();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Không thể thực hiện thao tác.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    setBusy(true);
    setError("");
    try {
      const { error: authError } = await createClient().auth.signOut();
      if (authError) throw authError;
      router.replace("/login");
      router.refresh();
    } catch {
      setError("Không thể đăng xuất. Vui lòng thử lại.");
      setBusy(false);
    }
  }

  return (
    <div className="workspace">
      <div className="mobile-workspace-bar">
        <Brand light />
        <button
          className="icon-button icon-button-dark"
          aria-label="Mở menu"
          onClick={() => setOpen(true)}
        >
          <Menu size={21} />
        </button>
      </div>
      {open && (
        <button
          className="sidebar-overlay"
          aria-label="Đóng menu"
          onClick={() => setOpen(false)}
        />
      )}
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <Brand light />
          <button
            className="icon-button icon-button-dark mobile-close"
            aria-label="Đóng menu"
            onClick={() => setOpen(false)}
          >
            <PanelLeftClose size={19} />
          </button>
        </div>
        <Link
          href="/chat"
          className="button new-chat"
          onClick={() => setOpen(false)}
        >
          <Plus size={18} /> Cuộc hội thoại mới
        </Link>
        <nav aria-label="Không gian học tập" className="workspace-nav">
          <Link
            href="/dashboard"
            className={path === "/dashboard" ? "active" : ""}
            onClick={() => setOpen(false)}
          >
            <LayoutDashboard size={18} /> Tổng quan
          </Link>
          <span className="sidebar-label">GÓC HỌC TẬP</span>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/chat?category=${c.id}`}
              onClick={() => setOpen(false)}
            >
              <CategoryIcon category={c.id} size={17} />
              {c.short}
            </Link>
          ))}
        </nav>
        <div className="sidebar-history">
          <span className="sidebar-label">
            HỘI THOẠI GẦN ĐÂY{" "}
            <small>
              {conversations.length === 50
                ? "50 gần nhất"
                : conversations.length}
            </small>
          </span>
          {loadError ? (
            <p className="sidebar-empty" role="alert">
              Chưa tải được lịch sử. Kiểm tra kết nối và migration.
            </p>
          ) : conversations.length ? (
            conversations.map((c) => (
              <div
                className={`history-row ${path === `/chat/${c.id}` ? "active" : ""}`}
                key={c.id}
              >
                <Link
                  href={`/chat/${c.id}`}
                  onClick={() => setOpen(false)}
                  title={c.title}
                >
                  <MessageSquare size={15} />
                  <span>{c.title}</span>
                </Link>
                <button
                  className="icon-button"
                  aria-label={`Đổi tên ${c.title}`}
                  onClick={() => {
                    setEditing(c);
                    setTitle(c.title);
                    setError("");
                  }}
                >
                  <Pencil size={13} />
                </button>
                <button
                  className="icon-button"
                  aria-label={`Xóa ${c.title}`}
                  onClick={() => {
                    setDeleting(c);
                    setError("");
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          ) : (
            <p className="sidebar-empty">
              Những cuộc trò chuyện của bạn sẽ xuất hiện ở đây.
            </p>
          )}
        </div>
        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <span>Học tập với sự tận tâm</span>
            <p>Không chia sẻ thông tin định danh người bệnh.</p>
            <Link href="/">
              Về NurseMate <ArrowUpRight size={14} />
            </Link>
          </div>
          {error && !editing && !deleting && (
            <p className="alert alert-error" role="alert">
              {error}
            </p>
          )}
          <div className="account-row">
            <span className="avatar">
              {(name || email || "B").charAt(0).toUpperCase()}
            </span>
            <div>
              <strong>{name || "Bạn học NurseMate"}</strong>
              <small>{email}</small>
            </div>
            <button
              className="icon-button"
              aria-label="Đăng xuất"
              disabled={busy}
              onClick={logout}
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>
      <div className="workspace-main">{children}</div>
      {(editing || deleting) && (
        <div className="modal-backdrop">
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <button
              className="icon-button modal-close"
              aria-label="Đóng"
              disabled={busy}
              onClick={() => {
                setEditing(null);
                setDeleting(null);
              }}
            >
              <X size={19} />
            </button>
            <h2 id="modal-title">
              {editing ? "Đổi tên hội thoại" : "Xóa cuộc hội thoại?"}
            </h2>
            <p>
              {editing
                ? "Đặt một cái tên để dễ tìm lại kiến thức."
                : "Toàn bộ tin nhắn trong hội thoại này sẽ được xóa. Thao tác này không thể hoàn tác."}
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void changeConversation(editing ? "rename" : "delete");
              }}
            >
              {editing && (
                <label>
                  Tên hội thoại
                  <input
                    autoFocus
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    minLength={1}
                    maxLength={100}
                    required
                    disabled={busy}
                  />
                </label>
              )}
              {error && (
                <p role="alert" className="alert alert-error">
                  {error}
                </p>
              )}
              <div className="modal-actions">
                <button
                  type="button"
                  className="button button-ghost"
                  disabled={busy}
                  onClick={() => {
                    setEditing(null);
                    setDeleting(null);
                  }}
                >
                  Hủy
                </button>
                <button
                  className={`button ${deleting ? "button-danger" : ""}`}
                  disabled={busy || (!!editing && !title.trim())}
                >
                  {busy ? "Đang xử lý…" : editing ? "Lưu tên" : "Xóa hội thoại"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
