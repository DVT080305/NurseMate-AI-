import type { Category } from "@/types";

export const categories: {
  id: Category;
  number: string;
  title: string;
  short: string;
  description: string;
  prompt: string;
  color: string;
}[] = [
  {
    id: "procedures",
    number: "01",
    title: "Ôn tập quy trình",
    short: "Quy trình điều dưỡng",
    description:
      "Hiểu nguyên tắc, nắm từng bước và tự tin hơn trước mỗi buổi thực hành.",
    prompt:
      "Tôi muốn ôn tập các nguyên tắc kiểm soát nhiễm khuẩn trong thực hành điều dưỡng.",
    color: "teal",
  },
  {
    id: "terminology",
    number: "02",
    title: "Thuật ngữ chuyên ngành",
    short: "Thuật ngữ chuyên ngành",
    description:
      "Kết nối kiến thức tiếng Việt và tiếng Anh bằng những giải thích dễ hiểu.",
    prompt:
      "Giải thích thuật ngữ dấu hiệu sinh tồn và tên tiếng Anh đầy đủ, kèm ví dụ trong học tập.",
    color: "blue",
  },
  {
    id: "scenarios",
    number: "03",
    title: "Luyện tập tình huống",
    short: "Câu hỏi tình huống",
    description:
      "Rèn tư duy qua tình huống giả định, câu hỏi trắc nghiệm và phản hồi cụ thể.",
    prompt:
      "Tạo một tình huống điều dưỡng giả định về an toàn người bệnh và hỏi tôi một câu trắc nghiệm. Chưa tiết lộ đáp án.",
    color: "violet",
  },
  {
    id: "career",
    number: "04",
    title: "Định hướng nghề nghiệp",
    short: "Định hướng nghề nghiệp",
    description:
      "Từng bước xây dựng lộ trình phát triển phù hợp với mục tiêu của chính bạn.",
    prompt:
      "Tôi muốn được tư vấn định hướng nghề nghiệp. Bạn cần tôi cung cấp những thông tin gì?",
    color: "amber",
  },
];
export function getCategory(id: string) {
  return categories.find((c) => c.id === id) ?? categories[0];
}
