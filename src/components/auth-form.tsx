"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, signupSchema } from "@/lib/validation";
import { authFailure } from "@/lib/auth-errors";
export function AuthForm({
  mode,
  configured,
}: {
  mode: "login" | "register";
  configured: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError("");
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    const parsed = (mode === "register" ? signupSchema : loginSchema).safeParse(
      fields,
    );
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    try {
      if (mode === "register") {
        const client = createClient();
        const values = signupSchema.parse(fields);
        const { data, error: authError } = await client.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            data: { full_name: values.full_name },
          },
        });
        if (authError) throw authError;
        if (!data.session) {
          setError(
            "Supabase chưa cấp phiên đăng nhập. Vui lòng tắt Confirm Email trong Authentication → Sign In / Providers → Email của dự án. Nếu đã có tài khoản, bạn hãy đăng nhập.",
          );
          return;
        }
      } else {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify(parsed.data),
          signal: AbortSignal.timeout(30000),
        });
        const result = await response.json().catch(() => null);
        if (!response.ok || !result?.ok)
          throw Object.assign(new Error("AUTH_FAILED"), {
            code: result?.code,
            status: response.status,
          });
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(authFailure(err).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <form onSubmit={submit} className="auth-form">
        {mode === "register" && (
          <label>
            Họ và tên
            <input
              name="full_name"
              autoComplete="name"
              required
              minLength={2}
              maxLength={100}
              placeholder="Nguyễn Minh Anh"
              disabled={!configured || busy}
            />
          </label>
        )}
        <label>
          Email
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            maxLength={254}
            placeholder="ban@example.com"
            disabled={!configured || busy}
          />
        </label>
        <label>
          Mật khẩu
          <div className="password-field">
            <input
              type={visible ? "text" : "password"}
              name="password"
              autoComplete={
                mode === "register" ? "new-password" : "current-password"
              }
              required
              minLength={mode === "register" ? 8 : 1}
              maxLength={128}
              placeholder={
                mode === "register"
                  ? "Ít nhất 8 ký tự"
                  : "Nhập mật khẩu của bạn"
              }
              disabled={!configured || busy}
            />
            <button
              type="button"
              aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              onClick={() => setVisible(!visible)}
            >
              {visible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </label>
        {error && (
          <p className="alert alert-error" role="alert">
            {error}
          </p>
        )}
        <button className="button full-width" disabled={!configured || busy}>
          {busy ? (
            <LoaderCircle size={18} className="spin" />
          ) : (
            <>
              {mode === "register" ? "Tạo tài khoản" : "Vào không gian học tập"}
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>
      <p className="auth-switch">
        {mode === "register" ? "Đã có tài khoản?" : "Bạn chưa có tài khoản?"}{" "}
        <Link href={mode === "register" ? "/login" : "/register"}>
          {mode === "register" ? "Đăng nhập" : "Đăng ký ngay"}
        </Link>
      </p>
    </>
  );
}
