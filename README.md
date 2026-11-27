# NurseMate AI

Trợ lý học tập và thực hành điều dưỡng bằng tiếng Việt. Dự án Next.js App Router, TypeScript, Tailwind CSS, Supabase Authentication/PostgreSQL và Gemini qua SDK chính thức `@google/genai`, sẵn sàng build cho Vercel.

## Chạy trên máy cá nhân

Cần Node.js 22 trở lên và npm. Phiên bản thư viện được khóa trong `package.json` và `package-lock.json`.

```powershell
npm ci
Copy-Item .env.example .env.local
# Mở .env.local và điền thông tin của bạn; không ghi đè file đã có.
npm run dev
```

Mở http://localhost:3000. Trang giới thiệu chạy ngay khi chưa có khóa. Trang đăng nhập sẽ báo thiếu cấu hình; ứng dụng không tạo tài khoản hoặc câu trả lời giả. Sau khi sửa biến môi trường, khởi động lại máy chủ. Khi chạy production, phải build lại để cập nhật các biến `NEXT_PUBLIC_*`.

## Cấu hình Supabase

1. Chọn dự án Supabase của bạn (hoặc tự tạo dự án theo gói bạn muốn).
2. Trong **Connect / API Keys**, lấy Project URL và Publishable key.
3. Điền `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` vào `.env.local`.
4. Trong API Keys, lấy **Secret key** và đặt vào `SUPABASE_SECRET_KEY`, chỉ ở máy chủ. Khóa `service_role` cũ cũng tương thích, nhưng nên dùng Secret key mới khi có.
5. Mở **SQL Editor**, dán toàn bộ [migration](supabase/migrations/202611270001_nursemate.sql), chọn **Run**. Đây là migration khởi tạo, chạy một lần trên dự án chưa có các bảng này. Nếu đã dùng Supabase CLI: `supabase link --project-ref YOUR_PROJECT_REF`, rồi `supabase db push`.
6. Trong **Authentication → Sign In / Providers → Email**, bật đăng nhập bằng Email và **tắt Confirm Email**, sau đó lưu. Dự án dùng đăng ký bằng email/mật khẩu và vào học ngay, không yêu cầu mở thư xác nhận. Đây là cấu hình phía Supabase; sửa mã nguồn hoặc `.env.local` không tự tắt được tùy chọn này.
7. Trong **Authentication → URL Configuration**, đặt Site URL là `http://localhost:3000` khi phát triển và thêm Redirect URL `http://localhost:3000/auth/callback`.
8. Đăng ký tài khoản. Khi **Confirm Email** đã tắt, Supabase cấp phiên đăng nhập và ứng dụng chuyển thẳng tới dashboard. Route callback được giữ để tương thích nếu sau này bạn thêm luồng xác thực bằng liên kết.

Migration chưa được thực thi trên một dự án Supabase trực tuyến trong phiên xây dựng này. Hãy chạy bước 5 trước khi thử đăng ký.

### Vì sao cần thêm khóa máy chủ?

Publishable key cùng access token có cùng quyền khi dùng từ trình duyệt và máy chủ. Vì vậy không thể dùng chính quyền đó để vừa cho máy chủ ghi tin nhắn trợ lý, vừa chặn trình duyệt giả mạo tin nhắn. Dự án cố ý thu hồi mọi quyền ghi trực tiếp bảng `messages` của người dùng và dùng `SUPABASE_SECRET_KEY` cho đúng ba RPC đặt chỗ, hoàn tất, báo lỗi yêu cầu trò chuyện. Đây là trường hợp cần quyền máy chủ để đáp ứng yêu cầu chống giả mạo. Khóa không được đưa vào mã máy khách.

Mọi thao tác đọc lịch sử, tạo/đổi tên/xóa hội thoại và sửa hồ sơ đều dùng client gắn phiên người dùng và RLS. API xác minh người dùng bằng `auth.getUser()`; không tin user ID, lịch sử, category, model, role hay system prompt do trình duyệt tự gửi. RPC máy chủ còn kiểm tra quyền sở hữu lần nữa trước khi ghi dữ liệu.

## Cấu hình Gemini

1. Tạo khóa trong [Google AI Studio](https://aistudio.google.com/api-keys).
2. Điền `GEMINI_API_KEY` vào `.env.local` và `GEMINI_MODEL=gemini-3.8-flash`.
3. Kiểm tra [danh sách mô hình chính thức](https://aistudio.google.com/docs/models) và quyền truy cập của dự án. Tài liệu được kiểm tra ngày 27/11/2026, đánh dấu `gemini-3.8-flash` là Stable. Có thể thay model bằng một model ổn định hỗ trợ `generateContent` và structured JSON, nếu tài khoản của bạn yêu cầu.
4. Khởi động lại ứng dụng, đăng nhập và tạo câu hỏi. Nếu hạn mức, khóa, model hoặc mạng có lỗi, ứng dụng hiển thị lỗi thật, không sinh câu trả lời thay thế.

Giới hạn: 4.000 ký tự mỗi câu hỏi, tối đa 12 tin nhắn lịch sử / 32.000 ký tự, 4.096 output tokens, thời gian chờ SDK 45 giây. Cơ sở dữ liệu áp dụng 8 yêu cầu/phút và 100 yêu cầu/24 giờ mỗi tài khoản, tính cả yêu cầu đã thất bại. Nhiều instance Vercel cùng dùng một bộ đếm. Mỗi hội thoại chỉ xử lý một yêu cầu tại một thời điểm; đặt chỗ hết hạn sau 90 giây nếu máy chủ bị ngắt.

Mã yêu cầu UUID cung cấp tính lặp an toàn: cùng mã, người dùng, hội thoại và nội dung sẽ lấy lại kết quả đã hoàn tất; ID thất bại không được tái sử dụng. Cả câu hỏi và câu trả lời được ghi trong một giao dịch. Tin nhắn cũ được phân trang 40 dòng. System prompt nằm tại `src/lib/ai/system-prompt.ts` với dấu `server-only`.

Khi xóa hội thoại, tin nhắn và nội dung/kết quả trong sổ yêu cầu đều bị xóa. Mã yêu cầu, chủ tài khoản, trạng thái và thời điểm vẫn được giữ để không thể lách hạn mức bằng cách xóa hội thoại. Sổ yêu cầu không có quyền đọc từ trình duyệt. Khi vận hành lâu dài, có thể lên lịch xóa bản ghi cũ sau kỳ lưu trữ bạn chọn, tối thiểu phải giữ 24 giờ để tính hạn mức.

Tư vấn nghề nghiệp dùng JSON có cấu trúc; máy chủ dựng đúng ba tiêu đề khi mô hình chọn lộ trình, hoặc trả câu hỏi làm rõ khi thiếu dữ liệu. Cấu trúc và biểu tượng được kiểm tra bằng mã; tính đúng đắn về nghề nghiệp, xưng hô và không viết tắt còn phụ thuộc đầu ra mô hình, cần kiểm tra thực tế. Không thể xem kiểm thử prompt cục bộ là xác minh chất lượng tư vấn lâm sàng.

## Chức năng

- Trang chủ tiếng Việt, bốn nhóm học tập, hướng dẫn sử dụng và lợi ích; responsive.
- Đăng ký và vào dashboard ngay, đăng nhập và đăng xuất bằng Supabase SSR; không yêu cầu xác minh email khi **Confirm Email** đã tắt.
- Dashboard có lời chào, hội thoại gần đây, hồ sơ/trình độ/mục tiêu có thể cập nhật.
- Chat theo bốn chủ đề; tạo, đổi tên, xóa hội thoại; lịch sử riêng từng tài khoản, tải thêm tin nhắn cũ.
- Markdown an toàn: không render HTML thô, URL được lọc bằng cơ chế mặc định của React Markdown; liên kết ngoài có `noopener noreferrer`.
- Trạng thái chờ, rỗng, lỗi; khóa nút gửi khi xử lý; tự cuộn đến tin nhắn mới.
- Không dùng dữ liệu bệnh nhân làm nội dung minh họa; nội dung trang chủ là minh họa hành trình, không phải thống kê hay hội thoại thật.

## Cấu trúc

```text
src/app/                    Trang, route handler, layout và giao diện
src/app/(workspace)/        Dashboard và chat cần đăng nhập
src/app/api/chat/route.ts   API Gemini, kiểm tra quyền và lưu giao dịch
src/components/            Thành phần giao diện tái sử dụng
src/lib/ai/                 Gemini, prompt và kiểm tra cấu trúc đầu ra
src/lib/supabase/           Client trình duyệt, SSR và writer máy chủ
src/lib/validation/         Zod schemas
src/types/                  Kiểu dữ liệu ứng dụng
src/proxy.ts                Làm mới phiên bằng cookie
supabase/migrations/        SQL khởi tạo bảng, trigger, RLS, index và RPC
public/                    Logo biểu tượng SVG
tests/                     Kiểm thử validation, Gemini, PostgreSQL và trình duyệt
scripts/                   Kiểm thử tích hợp với dịch vụ thật
```

## Kiểm thử

```powershell
npm run typecheck
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Nếu muốn dùng Chrome đã cài trên Windows:

```powershell
$env:PLAYWRIGHT_CHROME_PATH='C:\Program Files\Google\Chrome\Application\chrome.exe'
npm run test:e2e
```

Unit tests thực thi migration trên PostgreSQL nhúng PGlite, với schema `auth` mô phỏng hợp đồng `auth.uid()`. Chúng kiểm tra isolation, quyền cột, chặn ghi trợ lý, RPC, giao dịch, quota và cascade. Đây là PostgreSQL thật chạy cục bộ, không thay thế kiểm thử Supabase Authentication/PostgREST trên dịch vụ thật. Playwright kiểm tra desktop/mobile, điều hướng, chặn trang riêng tư, lỗi cấu hình và origin.

### Kiểm thử tích hợp thật sau khi cấu hình

Chạy app ở terminal thứ nhất (`npm run dev` hoặc `npm run build` rồi `npm start`). Terminal thứ hai:

```powershell
npm run test:integration
# Tùy chọn gọi Gemini thật, sử dụng hạn mức của dự án:
$env:RUN_GEMINI='1'
npm run test:integration
```

Script tạo hai tài khoản kiểm thử tạm thời `nursemate-test-...@example.com` trong chính dự án Supabase được cấu hình, đăng nhập, kiểm tra quyền chéo, giả mạo, CRUD hội thoại, rồi xóa các tài khoản đó trong `finally`. Nếu bật Gemini, script còn kiểm tra hỏi nghề nghiệp, trả ba phần, xưng hô, idempotency và lịch sử sau khi tải lại. Dùng dự án phát triển để chạy script. Có thể đổi địa chỉ app bằng `TEST_BASE_URL`. Script báo lỗi nếu thất bại và không in khóa/chi tiết phản hồi có thể chứa bí mật.

Kết quả thực tế của phiên xây dựng được ghi riêng trong [TESTING.md](TESTING.md). Chưa chạy kiểm thử tích hợp khi chưa có `.env.local`.

## GitHub và Vercel

1. Kiểm tra `.env.local` nằm trong `.gitignore`. Không commit bất kỳ khóa nào.
2. Tạo repository GitHub theo quyền truy cập bạn muốn. Từ thư mục dự án:

```powershell
git init
git add .
git commit -m "Build NurseMate AI"
git branch -M main
git remote add origin https://github.com/YOUR_ACCOUNT/nursemate-ai.git
git push -u origin main
```

3. Vào Vercel → **Add New Project** → import repository. Framework preset **Next.js**, Root Directory là thư mục gốc dự án. Node.js 22 hoặc 24, Install `npm ci`, Build `npm run build`, output theo mặc định Next.js.
4. Thêm đủ năm biến trong `.env.example` cho môi trường Production/Preview cần sử dụng. Để Secret key và Gemini key dưới dạng sensitive. Không thêm tiền tố `NEXT_PUBLIC_` vào hai khóa máy chủ.
5. Deploy. Trong Supabase Authentication, đặt **Site URL** thành `https://YOUR_DOMAIN` và thêm **Redirect URLs** `https://YOUR_DOMAIN/auth/callback`. Chỉ thêm preview domain mà bạn chủ động dùng; giữ localhost cho phát triển nếu cần.
6. Nếu đổi biến môi trường, redeploy. Kiểm tra **Confirm Email** đã tắt. Đăng ký bằng email thử, kiểm tra vào dashboard ngay, đăng nhập lại, gửi câu hỏi ở cả bốn nhóm, tải lại lịch sử, đổi tên/xóa và kiểm tra một tài khoản khác không đọc được hội thoại.
7. Kiểm tra Vercel logs và Supabase logs khi có lỗi; tuyệt đối không ghi khóa hoặc nội dung bệnh nhân vào log. Route chat đặt `maxDuration=60`; chọn giới hạn runtime tương ứng với gói Vercel của bạn, không tự bật dịch vụ trả phí.

Không có repository từ xa hay deployment nào được tạo trong phiên này; GitHub CLI chưa đăng nhập, Supabase/Vercel chưa kết nối.

## Tài liệu đã đối chiếu

- [Next.js — Installation](https://nextjs.org/docs/app/getting-started/installation)
- [Supabase — Server-side clients với Next.js](https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs)
- [Gemini — Models](https://aistudio.google.com/docs/models)
- [Google Gen AI JavaScript SDK](https://github.com/googleapis/js-genai)
