import { z } from "zod";
import type { Category } from "@/types";
import { AiOutputError } from "@/lib/ai/errors";

const outputSchema = z
  .object({
    kind: z.enum(["answer", "clarification", "roadmap"]),
    content: z.string().max(16000),
    sections: z.array(z.string().min(1).max(6000)).max(3),
  })
  .strict();
export const roadmapHeadings = [
  "Những việc cần thiết phải làm ngay tức thì để đạt được định hướng đó.",
  "Lộ trình các việc cần làm.",
  "Các mốc thời gian cần chú ý.",
];
export function parseOutput(raw: string, category: Category): string {
  let payload: unknown;
  try {
    payload = JSON.parse(raw.replace(/^\uFEFF/, "").trim());
  } catch {
    throw new AiOutputError("invalid_json");
  }
  const parsed = outputSchema.safeParse(payload);
  if (!parsed.success) throw new AiOutputError("invalid_schema");
  const result = parsed.data;
  if (
    /\p{Extended_Pictographic}/u.test(result.content + result.sections.join(""))
  )
    throw new AiOutputError("invalid_content");
  if (category === "career") {
    if (
      result.kind === "roadmap" &&
      result.sections.length === 3 &&
      !result.content.trim()
    ) {
      if (result.sections.some((s) => /^\s*#{1,6}\s/m.test(s)))
        throw new AiOutputError("invalid_content");
      return result.sections
        .map((s, i) => `## ${i + 1}. ${roadmapHeadings[i]}\n\n${s}`)
        .join("\n\n");
    }
    if (result.kind !== "clarification")
      throw new AiOutputError("invalid_content");
  } else if (result.kind !== "answer")
    throw new AiOutputError("invalid_content");
  if (!result.content.trim() || result.sections.length)
    throw new AiOutputError("invalid_content");
  return result.content.trim();
}
