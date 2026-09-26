export interface PostRevision {
  id: string;
  post_id: string;
  title: string;
  excerpt: string | null;
  content_html: string;
  content_markdown: string | null;
  editor_mode: EditorMode;
  cover_image: string | null;
  category_id: string | null;
  tags: string[];
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
}

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

export type QuizStatus = "draft" | "published";
export type QuizDifficulty = "easy" | "medium" | "hard";

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string | null;
  position: number;
}

export interface Quiz {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  post_id: string | null;
  post?: Post | null;
  category_id: string | null;
  category?: Category | null;
  difficulty: QuizDifficulty;
  time_limit_seconds: number | null;
  is_mock: boolean;
  negative_marking: number;
  instructions: string | null;
  is_pyq: boolean;
  exam_name: string | null;
  exam_year: number | null;
  pdf_url: string | null;
  status: QuizStatus;
  created_at: string;
  updated_at: string;
  questions?: QuizQuestion[];
  attempt_count?: number;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  name: string;
  score: number;
  total: number;
  correct_count: number;
  wrong_count: number;
  skipped_count: number;
  time_taken_seconds: number | null;
  answers: (number | null)[] | null;
  created_at: string;
}

// ---- PSC auto-updates (scraped from keralapsc.gov.in) ----

export type PscSourceKey =
  | "notifications"
  | "examination_notification"
  | "syllabus"
  | "exam_programme"
  | "result_notifications"
  | "shortlists"
  | "rankedlist"
  | "interviews";

export interface PscUpdate {
  id: string;
  source: PscSourceKey;
  title: string;
  source_url: string;
  pdf_url: string | null;
  category_number: string | null;
  published_on: string | null;
  scraped_at: string;
  telegram_posted: boolean;
  created_at: string;
}
