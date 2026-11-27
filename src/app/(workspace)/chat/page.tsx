import { Chat } from "@/components/chat";
import { categorySchema } from "@/lib/validation";
import { requireUser } from "@/lib/auth";
export const metadata = { title: "Trò chuyện học tập" };
export default async function NewChat({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  await requireUser();
  const query = await searchParams;
  const category = categorySchema.safeParse(query.category);
  return (
    <Chat
      key={query.category || "new"}
      conversation={null}
      initialMessages={[]}
      initialCategory={category.success ? category.data : "procedures"}
    />
  );
}
