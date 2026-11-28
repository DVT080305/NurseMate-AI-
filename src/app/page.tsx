import Link from "next/link";
import Image from "next/image";
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
  MessageSquareText,
  BrainCircuit,
  BookmarkCheck,
  Clock,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { CategoryIcon } from "@/components/category-icon";
import { Reveal } from "@/components/reveal";
import { SiteHeader } from "@/components/site-header";
import { categories } from "@/lib/categories";

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main id="main">
        {/* HERO SECTION — MODERN HEALTHTECH + AI PLATFORM */}
        <section className="hero">
          <div className="hero-bg-grid" aria-hidden="true" />
          <div className="hero-orb hero-orb-one" aria-hidden="true" />
          <div className="hero-orb hero-orb-two" aria-hidden="true" />

          <div className="container hero-grid">
            <Reveal variant="up" className="hero-copy">
              <div className="eyebrow eyebrow-dark">
                <span className="status-dot" /> NỀN TẢNG AI HỌC TẬP NGÀNH ĐIỀU
                DƯỠNG
              </div>
              <h1>
                Vững kiến thức.
                <br />
                Tự tin thực hành.
                <br />
                <span className="gradient-text-light">Sẵn sàng tương lai.</span>
              </h1>
              <p className="hero-lead">
                Nền tảng HealthTech tích hợp AI dành riêng cho sinh viên và nhân
                lực điều dưỡng. Ôn tập quy trình lâm sàng, hệ thống hóa thuật
                ngữ chuyên ngành, luyện phản xạ tình huống và định hình lộ trình
                nghề nghiệp.
              </p>
              <div className="hero-actions">
                <Link href="/register" className="button">
                  Bắt đầu hành trình học tập <ArrowUpRight size={18} />
                </Link>
                <a href="#chuc-nang" className="button button-dark-outline">
                  Khám phá chức năng <ArrowRight size={17} />
                </a>
              </div>

              <div className="hero-metrics" aria-label="Điểm nổi bật">
                <div className="hero-metric">
                  <strong>4 Trụ cột</strong>
                  <span>Chuyên sâu điều dưỡng</span>
                </div>
                <div className="hero-metric">
                  <strong>24/7 AI</strong>
                  <span>Hỏi đáp tiếng Việt chuẩn xác</span>
                </div>
                <div className="hero-metric">
                  <strong>An toàn</strong>
                  <span>Chuẩn mực học thuật y khoa</span>
                </div>
              </div>

              <div className="hero-note">
                <ShieldCheck size={16} />
                <span>
                  Hỗ trợ học tập chuyên ngành · Không thay thế hướng dẫn lâm sàng
                </span>
              </div>
            </Reveal>

            <Reveal variant="scale" delay={100} className="hero-visual">
              <div className="hero-photo-frame">
                <div className="hero-photo-inner">
                  <Image
                    src="/images/hero-nursing.jpg"
                    alt="Sinh viên điều dưỡng thực hành và học tập cùng công nghệ tại phòng mô phỏng lâm sàng hiện đại"
                    width={960}
                    height={720}
                    priority
                    className="hero-photo-img"
                  />
                  <div className="hero-photo-overlay">
                    <span className="hero-photo-tag">
                      <span className="status-dot" /> Mô phỏng &amp; Ôn tập lâm
                      sàng
                    </span>
                    <span className="hero-photo-pill">AI Companion</span>
                  </div>
                </div>
              </div>

              <div className="hero-floating-row">
                <div className="hero-glass-card">
                  <span className="round-icon round-icon-md blue">
                    <Stethoscope size={20} />
                  </span>
                  <div>
                    <strong>Học để thấu hiểu</strong>
                    <small>Quy trình · Thuật ngữ · Tình huống</small>
                  </div>
                </div>

                <div className="hero-glass-card">
                  <span className="round-icon round-icon-md teal">
                    <Heart size={20} />
                  </span>
                  <div>
                    <strong>Kiến thức &amp; Tận tâm</strong>
                    <small>Nuôi dưỡng điều dưỡng tương lai</small>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* OVERLAPPING QUICK HIGHLIGHTS BAR */}
        <div className="container highlights-wrap">
          <Reveal variant="up" delay={120} className="highlights-bar">
            <div className="highlight-item">
              <span className="round-icon round-icon-md blue">
                <GraduationCap size={20} />
              </span>
              <div>
                <strong>Chuyên biệt Điều dưỡng</strong>
                <span>Bám sát tư duy thực hành &amp; học thuật y khoa</span>
              </div>
            </div>
            <div className="highlight-item">
              <span className="round-icon round-icon-md teal">
                <BookOpen size={19} />
              </span>
              <div>
                <strong>Tiếng Việt trực quan</strong>
                <span>Kết nối thuật ngữ Anh – Việt dễ nhớ, dễ ứng dụng</span>
              </div>
            </div>
            <div className="highlight-item">
              <span className="round-icon round-icon-md violet">
                <ShieldCheck size={20} />
              </span>
              <div>
                <strong>Đề cao an toàn người bệnh</strong>
                <span>Luôn nhắc đối chiếu phác đồ và hướng dẫn chuyên môn</span>
              </div>
            </div>
          </Reveal>
        </div>

        {/* 4 CORE LEARNING PILLARS */}
        <section className="section container" id="chuc-nang">
          <Reveal variant="up" className="section-heading">
            <div>
              <span className="eyebrow">
                <Sparkles size={13} /> BỐN TRỤ CỘT HỌC TẬP TOÀN DIỆN
              </span>
              <h2>Bạn muốn khám phá điều gì hôm nay?</h2>
            </div>
            <p>
              Từ kiến thức nền tảng, thuật ngữ y khoa đến rèn luyện tình huống
              và định hướng nghề nghiệp — tất cả hội tụ trong một không gian AI
              chuyên biệt.
            </p>
          </Reveal>

          <div className="feature-grid">
            {categories.map((c, index) => (
              <Reveal key={c.id} variant="up" delay={index * 80}>
                <Link
                  href={`/chat?category=${c.id}`}
                  className={`feature-card ${c.color}`}
                >
                  <div className="feature-top">
                    <span className={`round-icon round-icon-lg ${c.color}`}>
                      <CategoryIcon category={c.id} size={22} />
                    </span>
                    <span className="feature-number">/{c.number}</span>
                  </div>
                  <h3>{c.title}</h3>
                  <p>{c.description}</p>
                  <span className="feature-link">
                    Khám phá ngay <ArrowUpRight size={17} />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        {/* AI ASSISTANT SHOWCASE SECTION */}
        <section className="showcase-section" id="trai-nghiem">
          <div className="container showcase-grid">
            <Reveal variant="right" className="showcase-media">
              <div className="showcase-image-card">
                <Image
                  src="/images/nursing-study.jpg"
                  alt="Sinh viên điều dưỡng học tập kiến thức chuyên ngành trên máy tính tại không gian y khoa hiện đại"
                  width={960}
                  height={540}
                />
              </div>
              <div className="showcase-preview-card">
                <div className="preview-header">
                  <div className="preview-header-left">
                    <span className="round-icon round-icon-sm teal">
                      <Sparkles size={16} />
                    </span>
                    <div>
                      <strong>NurseMate AI · Quy trình điều dưỡng</strong>
                      <small>Trả lời có cấu trúc · Chuẩn học thuật</small>
                    </div>
                  </div>
                  <span className="status-dot" aria-hidden="true" />
                </div>
                <div className="preview-bubble preview-bubble-user">
                  Mình cần ôn lại 5 thời điểm vệ sinh tay của WHO trước buổi
                  thực tập lâm sàng ngày mai.
                </div>
                <div className="preview-bubble preview-bubble-ai">
                  <strong>5 thời điểm vệ sinh tay (WHO):</strong> (1) Trước khi
                  tiếp xúc người bệnh, (2) Trước thủ thuật vô khuẩn, (3) Sau nguy
                  cơ phơi nhiễm dịch tiết, (4) Sau khi tiếp xúc người bệnh, (5)
                  Sau khi chạm vật dụng xung quanh...
                </div>
              </div>
            </Reveal>

            <Reveal variant="left" delay={100} className="showcase-copy">
              <span className="eyebrow">
                <BrainCircuit size={14} /> TRỢ LÝ AI Y KHOA CHUYÊN SÂU
              </span>
              <h2>
                Học chủ động hơn mỗi ngày cùng{" "}
                <span className="gradient-text">trợ lý AI điều dưỡng</span>.
              </h2>
              <p>
                Thay vì tìm kiếm rời rạc qua hàng chục tài liệu, NurseMate AI
                giúp bạn hệ thống hóa kiến thức nhanh chóng, phản biện tình
                huống thực tế và ghi nhớ lâu hơn.
              </p>

              <div className="showcase-points">
                <div className="showcase-point">
                  <span className="round-icon round-icon-md blue">
                    <MessageSquareText size={19} />
                  </span>
                  <div>
                    <strong>Hỏi đáp tự nhiên theo đúng ngữ cảnh</strong>
                    <p>
                      Đặt câu hỏi tiếp nối để đào sâu từng bước trong quy trình
                      hoặc phân biệt các khái niệm dễ nhầm lẫn.
                    </p>
                  </div>
                </div>
                <div className="showcase-point">
                  <span className="round-icon round-icon-md teal">
                    <BookmarkCheck size={19} />
                  </span>
                  <div>
                    <strong>Lưu trữ lịch sử học tập cá nhân</strong>
                    <p>
                      Mọi cuộc hội thoại được phân loại theo chủ đề và lưu an
                      toàn trong tài khoản để ôn tập bất cứ lúc nào.
                    </p>
                  </div>
                </div>
                <div className="showcase-point">
                  <span className="round-icon round-icon-md violet">
                    <Clock size={19} />
                  </span>
                  <div>
                    <strong>Linh hoạt theo nhịp học của riêng bạn</strong>
                    <p>
                      Ôn bài trước giờ thi, chuẩn bị đi lâm sàng hay lập kế
                      hoạch phát triển nghề nghiệp mọi lúc, mọi nơi.
                    </p>
                  </div>
                </div>
              </div>

              <Link href="/chat" className="button">
                Trải nghiệm AI Chat ngay <ArrowUpRight size={18} />
              </Link>
            </Reveal>
          </div>
        </section>

        {/* HOW IT WORKS — DEEP NAVY PIPELINE */}
        <section className="how-section" id="cach-hoc">
          <div className="container how-grid">
            <Reveal variant="right">
              <span className="eyebrow eyebrow-dark">ĐƠN GIẢN ĐỂ BẮT ĐẦU</span>
              <h2>
                Một câu hỏi nhỏ.
                <br />
                Một bước tiến mới.
              </h2>
              <p>
                Bạn không cần biết mọi câu trả lời ngay từ đầu. Chỉ cần bắt đầu
                từ điều bạn đang quan tâm — NurseMate AI sẽ dẫn dắt bạn từng
                bước một cách mạch lạc và khoa học.
              </p>
              <Link href="/register" className="button button-white">
                Tạo tài khoản miễn phí <ArrowRight size={18} />
              </Link>
            </Reveal>

            <div className="how-steps">
              {[
                {
                  n: "01",
                  title: "Chọn trụ cột bạn muốn ôn tập",
                  text: "Quy trình điều dưỡng, thuật ngữ chuyên ngành Anh – Việt, luyện tập tình huống hay tư vấn định hướng nghề nghiệp.",
                },
                {
                  n: "02",
                  title: "Đặt câu hỏi và tương tác chuyên sâu",
                  text: "Trò chuyện tự nhiên bằng tiếng Việt. Hỏi tiếp, yêu cầu ví dụ minh họa hoặc thử sức với câu hỏi trắc nghiệm.",
                },
                {
                  n: "03",
                  title: "Lưu lại kiến thức và theo dõi tiến bộ",
                  text: "Hội thoại được tự động lưu và đặt tên khoa học trong không gian cá nhân để bạn dễ dàng quay lại ôn tập.",
                },
              ].map((s, index) => (
                <Reveal key={s.n} variant="up" delay={index * 100}>
                  <div className="how-step">
                    <span className="how-step-num">{s.n}</span>
                    <div>
                      <h3>{s.title}</h3>
                      <p>{s.text}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* BENEFITS / VALUE */}
        <section className="section container benefits" id="gia-tri">
          <Reveal variant="right">
            <span className="eyebrow">HỌC VỮNG HƠN · ĐI XA HƠN</span>
            <h2>
              Dành cho những người trẻ{" "}
              <span className="gradient-text">chọn nghề chăm sóc</span>.
            </h2>
            <p>
              Chúng tôi tin rằng sự tự tin trên lâm sàng bắt đầu từ nền tảng
              kiến thức vững chắc. NurseMate AI đồng hành giúp bạn xây dựng nền
              tảng ấy mỗi ngày với sự chỉn chu và chuẩn mực.
            </p>
            <div className="benefit-pill-row">
              <span className="benefit-pill">
                <Stethoscope size={15} /> Chuẩn hóa tư duy lâm sàng
              </span>
              <span className="benefit-pill">
                <GraduationCap size={15} /> Thân thiện sinh viên
              </span>
              <span className="benefit-pill">
                <Heart size={15} /> Nuôi dưỡng y đức
              </span>
            </div>
          </Reveal>

          <div className="benefit-list">
            {[
              {
                title: "Giải thích mạch lạc, đúng trọng tâm học tập",
                desc: "Trình bày khoa học theo từng ý chính, dễ đọc trên cả máy tính và điện thoại.",
              },
              {
                title: "Chủ động ôn tập theo đúng nhịp độ cá nhân",
                desc: "Học lại những phần còn yếu mà không ngại hỏi đi hỏi lại nhiều lần.",
              },
              {
                title: "Rèn tư duy phản xạ qua tình huống giả định",
                desc: "Thực hành phân tích ca học tập và nhận phản hồi chi tiết ngay lập tức.",
              },
              {
                title: "Gắn kết kiến thức hôm nay với mục tiêu nghề nghiệp",
                desc: "Cá nhân hóa gợi ý theo trình độ hiện tại và định hướng phát triển của bạn.",
              },
            ].map((item, index) => (
              <Reveal key={item.title} variant="up" delay={index * 80}>
                <div className="benefit-card">
                  <span className="benefit-check">
                    <Check size={17} strokeWidth={2.6} />
                  </span>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="container cta-wrap">
          <Reveal variant="scale">
            <div className="cta">
              <span className="cta-symbol" aria-hidden="true">
                <Plus size={120} strokeWidth={1} />
              </span>
              <div>
                <span className="eyebrow eyebrow-dark">BẮT ĐẦU TỪ HÔM NAY</span>
                <h2>
                  Người điều dưỡng tương lai,
                  <br />
                  hành trình của bạn bắt đầu ở đây.
                </h2>
                <p>
                  Tạo tài khoản trong vài giây và mở khóa không gian học tập AI
                  chuyên biệt cùng NurseMate.
                </p>
              </div>
              <Link className="button button-white" href="/register">
                Học cùng NurseMate <ArrowUpRight size={19} />
              </Link>
            </div>
          </Reveal>
        </section>
      </main>

      {/* DEEP NAVY MULTI-COLUMN FOOTER */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand-col">
              <Brand light />
              <p>
                Nền tảng học tập và thực hành điều dưỡng ứng dụng trí tuệ nhân
                tạo. Đồng hành cùng sinh viên xây dựng nền tảng kiến thức vững
                vàng và sự tận tâm với nghề chăm sóc sức khỏe.
              </p>
            </div>

            <div className="footer-col">
              <h3>Khám phá</h3>
              <div className="footer-links">
                <a href="#chuc-nang">Bốn trụ cột học tập</a>
                <a href="#trai-nghiem">Trợ lý AI điều dưỡng</a>
                <a href="#cach-hoc">Lộ trình bắt đầu</a>
                <a href="#gia-tri">Giá trị mang lại</a>
              </div>
            </div>

            <div className="footer-col">
              <h3>Không gian học tập</h3>
              <div className="footer-links">
                <Link href="/login">
                  Đăng nhập <ArrowUpRight size={14} />
                </Link>
                <Link href="/register">
                  Đăng ký tài khoản <ArrowUpRight size={14} />
                </Link>
                <Link href="/dashboard">
                  Vào không gian học tập <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <span>
              © {new Date().getFullYear()} NurseMate AI. Bảo lưu mọi quyền.
            </span>
            <span>
              Nội dung chỉ phục vụ học tập. Luôn đối chiếu tài liệu và hướng dẫn
              chuyên môn.
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
