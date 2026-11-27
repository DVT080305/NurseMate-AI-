# Kết quả kiểm thử NurseMate AI

## Cập nhật lỗi đăng nhập production — 27/11/2026

- Đã đối chiếu bundle đang chạy trên Vercel: Project URL Supabase khác bản local đã xác minh và hostname production trả lỗi DNS `ENOTFOUND`. Publishable key công khai khớp bản local. Không ghi các giá trị khóa vào báo cáo/log.
- Deployment được kiểm tra chạy commit `869d4fb`, chưa có bản sửa API đăng nhập cùng nguồn. Vì bản đó gọi Supabase từ trình duyệt, lỗi đăng nhập không đi qua Runtime Logs của Vercel.
- Đã sửa `NEXT_PUBLIC_SUPABASE_URL` trên Vercel cho Production/Preview và thêm `GEMINI_MODEL=gemini-3.6-flash`. Cần deployment mới để cấu hình public mới có hiệu lực. Thiếu Gemini model không ảnh hưởng xác thực.
- `npm run typecheck`, `npm run lint`, `npm test` và `npm run build` đạt; 101 bài kiểm thử logic/route/cookie/proxy đạt. Kiểm thử mới xác nhận đăng nhập không cần biến Gemini, vẫn chặn yêu cầu khác nguồn, giữ thuộc tính cookie và không ghi bí mật vào log.
- 15 ca trình duyệt cho luồng đăng nhập đã đạt trên desktop/tablet/mobile, gồm lỗi thông tin đăng nhập, mạng, timeout và phản hồi HTML 503/504. Các phản hồi được mô phỏng trong test cục bộ; không dùng tài khoản thật.
- Chỉ dùng fixture cục bộ cho kiểm thử đăng nhập, theo lựa chọn của người dùng. Không tạo/xóa tài khoản hoặc thay mật khẩu trên Supabase; chưa xác nhận đăng nhập bằng tài khoản thật sau triển khai.

## Báo cáo giai đoạn khởi tạo

Ngày thực hiện: 27/11/2026. Môi trường Windows, Node.js 24.16.0, npm 11.13.0, Google Chrome cài trên máy. Không có `.env.local`, tài khoản Supabase hoặc khóa Gemini trong thư mục dự án.

| Kiểm tra                               | Kết quả                                                                                    |
| -------------------------------------- | ------------------------------------------------------------------------------------------ |
| `npm run typecheck`                    | Đạt, không có lỗi TypeScript                                                               |
| `npm run lint`                         | Đạt, không có lỗi hoặc cảnh báo ESLint                                                     |
| `npm test`                             | 39 bài đạt, 4 tệp kiểm thử                                                                 |
| `npm run build`                        | Đạt, tạo production build Next.js                                                          |
| `npm run test:e2e`                     | 15 bài đạt trên desktop, tablet và mobile; dùng Chrome headless                            |
| npm audit trong quá trình cài đặt cuối | Không phát hiện lỗ hổng trong 540 packages được kiểm tra                                   |
| Rà bundle máy khách                    | Không tìm thấy tên biến khóa máy chủ hoặc đoạn system prompt được rà trong `.next/static`  |
| Kiểm tra ảnh giao diện                 | Đã xem trang chủ desktop/mobile và đăng nhập mobile; không có tràn ngang trong ca kiểm thử |

## Phạm vi đã kiểm chứng

- Đầu vào có giới hạn, UUID hợp lệ, không cho khách gửi role, lịch sử, model hoặc system prompt tùy chỉnh.
- JSON từ mô hình phải hợp lệ; lộ trình nghề nghiệp có đúng ba phần; từ chối biểu tượng và cấu trúc sai. Đây là kiểm thử cấu trúc, không phải đánh giá câu trả lời của Gemini thật.
- Route chat chặn chưa đăng nhập, hội thoại không sở hữu, yêu cầu vượt hạn mức; lấy nhóm chức năng từ cơ sở dữ liệu, gọi writer phía máy chủ và không trả câu trả lời giả khi mô hình lỗi.
- Thực thi toàn bộ migration trên PostgreSQL nhúng PGlite: trigger tạo profile, RLS cho hai người dùng, chặn giả mạo chủ sở hữu và tin nhắn trợ lý, chặn gọi RPC bằng quyền người dùng, lưu giao dịch và idempotency.
- Giới hạn 8 yêu cầu mỗi phút và 100 yêu cầu mỗi 24 giờ; xóa hội thoại không đặt lại bộ đếm, nhưng xóa nội dung trong lịch sử và sổ yêu cầu.
- Trình duyệt desktop/tablet/mobile: bốn chức năng trên trang chủ, điều hướng đăng ký, chặn dashboard/chat/hội thoại chưa đăng nhập, báo thiếu cấu hình, lỗi API và chặn origin khác.
- Ảnh chụp kiểm tra tại `artifacts/home-desktop.png`, `artifacts/home-mobile.png`, `artifacts/login-mobile.png` (không commit).

## Chưa thể kiểm chứng với dịch vụ thật

- Đăng ký qua email, nhận thư xác nhận và đăng nhập Supabase trực tuyến.
- Migration, RLS và CRUD qua PostgREST trên dự án Supabase của bạn.
- Hồ sơ, dashboard và giao diện chat trong phiên đăng nhập thật.
- Nhận câu trả lời Gemini thật ở cả bốn nhóm; chất lượng tư vấn, hỏi nghề nghiệp, không viết tắt và xưng hô thực tế.
- Hành vi lỗi nhà cung cấp thật khi hết hạn mức, sai khóa, mất mạng hoặc hết thời gian chờ. Các bộ ánh xạ lỗi và lỗi mô phỏng đã được kiểm thử cục bộ.
- Triển khai Vercel, domain và xác nhận email qua domain production.

Các phần trên cần cấu hình trong `.env.example`, chạy SQL trên Supabase và tài khoản triển khai. GitHub CLI hiện chưa đăng nhập; Supabase và Vercel chưa kết nối. Không có migration trực tuyến, repository từ xa hoặc deployment nào đã được tạo.

Sau khi cấu hình, chạy `npm run test:integration` với app đang chạy; đặt `RUN_GEMINI=1` nếu muốn kiểm tra Gemini thật và dùng hạn mức dự án. Hướng dẫn chi tiết trong [README.md](README.md).
