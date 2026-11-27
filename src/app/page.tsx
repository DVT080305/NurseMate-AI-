import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  ShieldCheck,
  Check,
  Heart,
  Sparkles,
  Stethoscope,
  GraduationCap,
  BookOpen,
  Plus,
  CheckCheck,
  Route,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { CategoryIcon } from "@/components/category-icon";
import { categories } from "@/lib/categories";

export default function Home() {
  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <Brand />
          <nav className="desktop-nav" aria-label="Điều hướng chính">
            <a href="#chuc-nang">Khám phá chức năng</a>
            <a href="#cach-hoc">Cách học cùng NurseMate</a>
            <a href="#gia-tri">Dành cho bạn</a>
          </nav>
          <div className="header-actions">
            <Link href="/login" className="login-link">
              Đăng nhập
            </Link>
            <Link href="/register" className="button button-small">
              Bắt đầu học <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </header>
      <main id="main">
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="eyebrow">
                <span className="status-dot" /> NGƯỜI BẠN HỌC TẬP CỦA SINH VIÊN
                ĐIỀU DƯỠNG
              </div>
              <h1>
                Vững kiến thức.
                <br />
                Tự tin thực hành.
                <br />
                <span>Sẵn sàng tương lai.</span>
              </h1>
              <p>
                Mỗi bước học hôm nay, một bước gần hơn với nghề.
                <br className="desktop-only" /> Cùng NurseMate AI ôn tập, rèn tư
                duy và tìm lộ trình
                <br className="desktop-only" /> phát triển dành riêng cho bạn.
              </p>
              <div className="hero-actions">
                <Link href="/register" className="button">
                  Bắt đầu hành trình học tập <ArrowUpRight size={19} />
                </Link>
                <a href="#chuc-nang" className="text-link">
                  Khám phá thêm <ArrowRight size={17} />
                </a>
              </div>
              <div className="hero-note">
                <ShieldCheck size={18} />
                <span>
                  Hỗ trợ học tập · Không thay thế hướng dẫn chuyên môn
                </span>
              </div>
            </div>
            <div
              className="hero-visual"
              aria-label="Minh họa hành trình học tập với bốn nhóm chức năng"
            >
              <div className="visual-grid" />
              <div className="visual-orbit orbit-one" />
              <div className="visual-orbit orbit-two" />
              <span className="visual-plus plus-one">+</span>
              <span className="visual-plus plus-two">+</span>
              <div className="visual-caption">
                <span className="status-dot" /> MỘT HÀNH TRÌNH, NHIỀU KHẢ NĂNG
              </div>
              <div className="study-card">
                <div className="study-card-head">
                  <span className="study-icon">
                    <Stethoscope size={23} />
                  </span>
                  <div>
                    <strong>
                      Không chỉ ghi nhớ.
                      <br />
                      Học để thấu hiểu.
                    </strong>
                  </div>
                  <span className="mini-tag">NurseMate AI</span>
                </div>
                <div className="study-divider" />
                <div className="study-label">LỘ TRÌNH HỌC TẬP CỦA BẠN</div>
                <div className="study-step">
                  <span className="step-circle">
                    <BookOpen size={16} />
                  </span>
                  <div>
                    <strong>Xây nền tảng kiến thức</strong>
                    <small>Quy trình & thuật ngữ điều dưỡng</small>
                  </div>
                  <CheckCheck size={19} className="teal-text" />
                </div>
                <div className="step-line" />
                <div className="study-step">
                  <span className="step-circle step-active">
                    <Sparkles size={16} />
                  </span>
                  <div>
                    <strong>Rèn luyện qua tình huống</strong>
                    <small>Học chủ động, hiểu sâu hơn</small>
                  </div>
                  <ArrowUpRight size={18} className="teal-text" />
                </div>
                <div className="step-line" />
                <div className="study-step">
                  <span className="step-circle step-blue">
                    <Route size={16} />
                  </span>
                  <div>
                    <strong>Định hình tương lai</strong>
                    <small>Mục tiêu rõ ràng, từng bước tiến lên</small>
                  </div>
                  <ArrowUpRight size={18} className="teal-text" />
                </div>
                <div className="study-footer">
                  <span className="status-dot" /> Luôn có một bước tiếp theo
                  dành cho bạn
                </div>
              </div>
              <div className="floating-note note-top">
                <span className="round-icon blue">
                  <GraduationCap size={20} />
                </span>
                <div>
                  <strong>Học theo cách của bạn</strong>
                  <small>Từng câu hỏi, từng bước tiến</small>
                </div>
              </div>
              <div className="floating-note note-bottom">
                <span className="round-icon teal">
                  <Heart size={20} />
                </span>
                <div>
                  <strong>Kiến thức đi cùng sự tận tâm</strong>
                  <small>Nuôi dưỡng người điều dưỡng tương lai</small>
                </div>
              </div>
              <span className="illustration-label">
                MINH HỌA HÀNH TRÌNH HỌC TẬP
              </span>
            </div>
          </div>
        </section>
        <div className="principles-strip">
          <div className="container principles-inner">
            <span>
              <GraduationCap size={20} /> Dành riêng cho sinh viên điều dưỡng
            </span>
            <span>
              <BookOpen size={19} /> Học bằng tiếng Việt, hiểu thật rõ
            </span>
            <span>
              <ShieldCheck size={20} /> Lấy an toàn làm nền tảng
            </span>
          </div>
        </div>
        <section className="section container" id="chuc-nang">
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                BỐN CÁCH HỌC, MỘT NGƯỜI BẠN ĐỒNG HÀNH
              </span>
              <h2>Bạn muốn khám phá điều gì hôm nay?</h2>
            </div>
            <p>
              Từ kiến thức đầu tiên đến định hướng nghề nghiệp,
              <br />
              NurseMate đồng hành trên từng chặng đường.
            </p>
          </div>
          <div className="feature-grid">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/chat?category=${c.id}`}
                className={`feature-card ${c.color}`}
              >
                <div className="feature-top">
                  <span className={`round-icon ${c.color}`}>
                    <CategoryIcon category={c.id} />
                  </span>
                  <span className="feature-number">/{c.number}</span>
                </div>
                <h3>{c.title}</h3>
                <p>{c.description}</p>
                <span className="feature-link">
                  Khám phá ngay <ArrowUpRight size={18} />
                </span>
              </Link>
            ))}
          </div>
        </section>
        <section className="how-section" id="cach-hoc">
          <div className="container how-grid">
            <div>
              <span className="eyebrow">ĐƠN GIẢN ĐỂ BẮT ĐẦU</span>
              <h2>
                Một câu hỏi nhỏ.
                <br />
                Một bước tiến mới.
              </h2>
              <p>
                Bạn không cần biết mọi câu trả lời.
                <br />
                Chỉ cần bắt đầu từ điều bạn đang tò mò.
              </p>
              <Link href="/register" className="text-link">
                Tạo tài khoản của bạn <ArrowRight size={18} />
              </Link>
            </div>
            <div className="how-steps">
              {[
                {
                  n: "01",
                  title: "Chọn điều bạn muốn học",
                  text: "Ôn quy trình, tra thuật ngữ, thử một tình huống hay tìm hướng đi cho tương lai.",
                },
                {
                  n: "02",
                  title: "Đặt câu hỏi, cùng tìm hiểu",
                  text: "Trò chuyện tự nhiên bằng tiếng Việt. Hỏi tiếp để làm rõ những điều bạn chưa hiểu.",
                },
                {
                  n: "03",
                  title: "Lưu lại để tiếp tục tiến bộ",
                  text: "Hội thoại được lưu trong tài khoản, để bạn trở lại và tiếp nối việc học bất cứ lúc nào.",
                },
              ].map((s) => (
                <div className="how-step" key={s.n}>
                  <span>{s.n}</span>
                  <div>
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="section container benefits" id="gia-tri">
          <div>
            <span className="eyebrow">HỌC VỮNG HƠN, ĐI XA HƠN</span>
            <h2>
              Dành cho những người
              <br />
              chọn nghề chăm sóc.
            </h2>
            <p>
              Chúng tôi tin sự tự tin bắt đầu từ việc hiểu rõ.
              <br />
              NurseMate giúp bạn xây dựng nền tảng ấy mỗi ngày.
            </p>
          </div>
          <div className="benefit-list">
            {[
              "Giải thích rõ ràng, phù hợp với mục đích học tập",
              "Chủ động ôn tập theo nhu cầu và nhịp học của bạn",
              "Rèn tư duy qua phản hồi và tình huống giả định",
              "Kết nối kiến thức hôm nay với mục tiêu ngày mai",
            ].map((t) => (
              <div key={t}>
                <span>
                  <Check size={17} />
                </span>
                {t}
              </div>
            ))}
          </div>
        </section>
        <section className="container cta-wrap">
          <div className="cta">
            <span className="cta-symbol">
              <Plus size={72} strokeWidth={1} />
            </span>
            <div>
              <span className="eyebrow">BẮT ĐẦU TỪ HÔM NAY</span>
              <h2>
                Người điều dưỡng tương lai,
                <br />
                hành trình của bạn bắt đầu ở đây.
              </h2>
            </div>
            <Link className="button button-white" href="/register">
              Học cùng NurseMate <ArrowUpRight size={19} />
            </Link>
          </div>
        </section>
      </main>
      <footer className="site-footer container">
        <div className="footer-top">
          <Brand />
          <p>
            Trợ lý học tập và thực hành điều dưỡng.
            <br />
            Đồng hành cùng kiến thức và sự tận tâm.
          </p>
          <Link href="/login">
            Vào không gian học tập <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} NurseMate AI.</span>
          <span>
            Nội dung chỉ phục vụ học tập. Luôn đối chiếu tài liệu và hướng dẫn
            chuyên môn.
          </span>
        </div>
      </footer>
    </>
  );
}
