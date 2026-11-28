"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowUp,
  ArrowUpRight,
  ChevronDown,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { categories, getCategory } from "@/lib/categories";
import { CategoryIcon } from "@/components/category-icon";
import type { Category, Conversation, Message } from "@/types";

export function Chat({
  conversation,
  initialMessages,
  initialCategory,
  initialHasMore = false,
}: {
  conversation: Conversation | null;
  initialMessages: Message[];
  initialCategory: Category;
  initialHasMore?: boolean;
}) {
  const router = useRouter();
  const [category, setCategory] = useState(initialCategory);
  const [conversationId, setConversationId] = useState(
    conversation?.id ?? null,
  );
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState("");
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const inFlight = useRef(false);
  const retryRef = useRef<{
    id: string;
    content: string;
    conversationId: string;
  } | null>(null);
  const topic = getCategory(category);
  const lastId = messages.at(-1)?.id;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [lastId, pending]);

  async function send(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = input.trim();
    if (inFlight.current || !content || content.length > 4000) return;
    inFlight.current = true;
    setBusy(true);
    setError("");
    setPending(content);
    try {
      let id = conversationId;
      if (!id) {
        const res = await fetch("/api/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category, title: content.slice(0, 80) }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        id = data.conversation.id;
        setConversationId(id);
      }
      if (!id) throw new Error("Không thể tạo hội thoại.");
      const retry = retryRef.current;
      const requestId =
        retry?.content === content && retry.conversationId === id
          ? retry.id
          : crypto.randomUUID();
      retryRef.current = { id: requestId, content, conversationId: id };
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: id, requestId, content }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (
          [400, 401, 403, 404, 429].includes(res.status) ||
          data.code === "REQUEST_CONFLICT"
        )
          retryRef.current = null;
        throw new Error(data.error);
      }
      setMessages((previous) => {
        const ids = new Set(previous.map((m) => m.id));
        return [
          ...previous,
          ...(data.messages as Message[]).filter((m) => !ids.has(m.id)),
        ];
      });
      setInput("");
      retryRef.current = null;
      if (!conversation) router.replace(`/chat/${id}`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Mất kết nối. Vui lòng tải lại hội thoại trước khi gửi lại câu hỏi.",
      );
    } finally {
      setBusy(false);
      setPending("");
      inFlight.current = false;
    }
  }

  async function loadOlder() {
    if (!conversationId || !messages.length || loadingOlder) return;
    setLoadingOlder(true);
    setError("");
    try {
      const res = await fetch(
        `/api/conversations/${conversationId}/messages?before=${encodeURIComponent(messages[0].created_at)}`,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessages((previous) => [...data.messages, ...previous]);
      setHasMore(data.hasMore);
    } catch {
      setError("Không tải được tin nhắn cũ. Vui lòng thử lại.");
    } finally {
      setLoadingOlder(false);
    }
  }

  return (
    <main id="main" className="chat-page">
      <header className="chat-header">
        <div>
          <Link
            href="/dashboard"
            className="icon-button"
            aria-label="Về tổng quan"
          >
            <ArrowLeft size={18} />
          </Link>
          <span className={`round-icon round-icon-sm ${topic.color}`}>
            <CategoryIcon category={category} size={18} />
          </span>
          <div>
            <h1>{conversation?.title || topic.short}</h1>
            <small>Không gian học tập cùng NurseMate AI</small>
          </div>
        </div>
        <span className="chat-header-tag">
          <ShieldCheck size={15} /> Chỉ dành cho học tập
        </span>
      </header>

      <div className="chat-scroll">
        <div className="chat-content">
          {!messages.length && !pending ? (
            <div className="chat-welcome">
              <span className="welcome-mark" aria-hidden="true">
                <Sparkles size={30} strokeWidth={1.7} />
              </span>
              <span className="eyebrow">CÙNG HỌC · CÙNG TIẾN BỘ</span>
              <h2>
                Một câu hỏi mới.
                <br />
                <span className="gradient-text">Một điều bạn hiểu thêm.</span>
              </h2>
              <p>
                Tôi là NurseMate, trợ lý học tập điều dưỡng ứng dụng AI.
                <br />
                Chọn chủ đề bên dưới hoặc đặt câu hỏi để bắt đầu ngay.
              </p>
              {!conversationId && (
                <div className="topic-tabs" aria-label="Chọn nhóm chức năng">
                  {categories.map((c) => (
                    <button
                      type="button"
                      key={c.id}
                      className={category === c.id ? "selected" : ""}
                      onClick={() => setCategory(c.id)}
                    >
                      <CategoryIcon category={c.id} size={15} />
                      {c.title}
                    </button>
                  ))}
                </div>
              )}
              <button
                type="button"
                className={`suggestion-card ${topic.color}`}
                onClick={() => setInput(topic.prompt)}
              >
                <span className={`round-icon round-icon-md ${topic.color}`}>
                  <CategoryIcon category={category} size={20} />
                </span>
                <span className="suggestion-copy">
                  <strong>Gợi ý câu hỏi cho mục {topic.short}</strong>
                  <small>{topic.prompt}</small>
                </span>
                <ArrowUpRight size={19} className="suggestion-arrow" />
              </button>
            </div>
          ) : (
            <>
              {hasMore && (
                <button
                  type="button"
                  className="load-older text-link"
                  disabled={loadingOlder}
                  onClick={loadOlder}
                >
                  {loadingOlder ? "Đang tải…" : "Xem tin nhắn trước đó"}
                  <ChevronDown size={16} />
                </button>
              )}
              {messages.map((m) => (
                <article key={m.id} className={`message message-${m.role}`}>
                  <span
                    className={`message-avatar ${m.role === "assistant" ? "assistant-avatar" : ""}`}
                  >
                    {m.role === "assistant" ? <Sparkles size={17} /> : "B"}
                  </span>
                  <div className="message-body">
                    <span className="message-author">
                      {m.role === "assistant" ? "NurseMate AI" : "Bạn"}
                    </span>
                    <div className="markdown">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        skipHtml
                        components={{
                          a: ({ href, children }) => (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {children}
                            </a>
                          ),
                        }}
                      >
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </article>
              ))}
              {pending && (
                <>
                  <article className="message message-user">
                    <span className="message-avatar">B</span>
                    <div className="message-body">
                      <span className="message-author">
                        Bạn <small>· Đang gửi</small>
                      </span>
                      <p>{pending}</p>
                    </div>
                  </article>
                  <div role="status" className="thinking">
                    <span className="typing-dots" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </span>
                    NurseMate đang chuẩn bị câu trả lời…
                  </div>
                </>
              )}
            </>
          )}
          <div ref={endRef} />
        </div>
      </div>

      <div className="chat-compose">
        <div className="compose-inner">
          {error && (
            <div className="alert alert-error" role="alert">
              {error}
              <button
                type="button"
                className="text-link"
                onClick={() => {
                  window.location.href = conversationId
                    ? `/chat/${conversationId}`
                    : "/chat";
                }}
              >
                Tải lại hội thoại
              </button>
            </div>
          )}
          <form ref={formRef} onSubmit={send} className="compose-form">
            <label className="sr-only" htmlFor="question">
              Câu hỏi của bạn
            </label>
            <textarea
              id="question"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={busy}
              placeholder="Bạn muốn tìm hiểu điều gì về ngành điều dưỡng?"
              rows={2}
              maxLength={4000}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  !e.nativeEvent.isComposing
                ) {
                  e.preventDefault();
                  formRef.current?.requestSubmit();
                }
              }}
            />
            <div className="compose-toolbar">
              <span>
                <CategoryIcon category={category} size={14} /> {topic.short}
              </span>
              <div>
                <small>{input.length}/4.000</small>
                <button
                  className="send-button"
                  aria-label="Gửi câu hỏi"
                  disabled={busy || !input.trim()}
                >
                  {busy ? (
                    <LoaderCircle className="spin" size={18} />
                  ) : (
                    <ArrowUp size={19} />
                  )}
                </button>
              </div>
            </div>
          </form>
          <p className="compose-note">
            Nội dung có thể chưa chính xác. Luôn đối chiếu tài liệu chuyên môn.
            Không nhập thông tin định danh người bệnh.
          </p>
        </div>
      </div>
    </main>
  );
}
