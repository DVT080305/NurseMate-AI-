import { BookOpen, Stethoscope, MessagesSquare, Route } from "lucide-react";
import type { Category } from "@/types";
export function CategoryIcon({
  category,
  size = 24,
}: {
  category: Category;
  size?: number;
}) {
  const Icon = {
    procedures: Stethoscope,
    terminology: BookOpen,
    scenarios: MessagesSquare,
    career: Route,
  }[category];
  return <Icon size={size} strokeWidth={1.7} />;
}
