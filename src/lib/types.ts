export type PostStatus = "draft" | "published" | "scheduled";
export type EditorMode = "richtext" | "markdown";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content_html: string;
  content_markdown: string | null;
  editor_mode: EditorMode;
  cover_image: string | null;
  category_id: string | null;
  category?: Category | null;
  tags: string[];
  status: PostStatus;
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  views: number;
  telegram_posted: boolean;
  author_id: string | null;
  created_at: string;
  updated_at: string;
}
