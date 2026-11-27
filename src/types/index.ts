export type Category = "procedures" | "terminology" | "scenarios" | "career";
export type Profile = {
  id: string;
  full_name: string;
  career_goal: string;
  education_level: string;
  created_at: string;
  updated_at: string;
};
export type Conversation = {
  id: string;
  user_id: string;
  title: string;
  category: Category;
  created_at: string;
  updated_at: string;
};
export type Message = {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};
