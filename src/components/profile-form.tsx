"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Profile } from "@/types";
export function ProfileForm({
  profile,
  email,
}: {
  profile: Profile | null;
  email: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không cập nhật được hồ sơ.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="panel profile-panel">
      <div className="panel-heading">
        <h2>Hồ sơ học tập</h2>
        <button
          className="text-link"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
        >
          {open ? "Thu gọn" : "Cập nhật"}
        </button>
      </div>
      <p className="muted small">{email}</p>
      {open ? (
        <form className="profile-form" onSubmit={submit}>
          <label>
            Họ và tên
            <input
              name="full_name"
              defaultValue={profile?.full_name}
              required
              minLength={2}
              maxLength={100}
              disabled={busy}
            />
          </label>
          <label>
            Trình độ hiện tại
            <input
              name="education_level"
              defaultValue={profile?.education_level}
              maxLength={200}
              placeholder="Ví dụ: Sinh viên điều dưỡng năm hai"
              disabled={busy}
            />
          </label>
          <label>
            Mục tiêu nghề nghiệp
            <textarea
              name="career_goal"
              defaultValue={profile?.career_goal}
              maxLength={500}
              placeholder="Nghề nghiệp và mục tiêu bạn mong muốn"
              rows={3}
              disabled={busy}
            />
          </label>
          {error && (
            <p className="alert alert-error" role="alert">
              {error}
            </p>
          )}
          {saved && (
            <p className="alert alert-success" role="status">
              Đã lưu hồ sơ học tập.
            </p>
          )}
          <button className="button button-small" disabled={busy}>
            {busy ? "Đang lưu…" : "Lưu thay đổi"}
          </button>
        </form>
      ) : (
        <dl className="profile-details">
          <dt>Trình độ hiện tại</dt>
          <dd>{profile?.education_level || "Chưa cập nhật"}</dd>
          <dt>Mục tiêu nghề nghiệp</dt>
          <dd>
            {profile?.career_goal ||
              "Thêm mục tiêu để việc tư vấn phù hợp hơn với bạn."}
          </dd>
        </dl>
      )}
    </section>
  );
}
