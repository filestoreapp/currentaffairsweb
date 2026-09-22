import { getAllPostsForAdmin, getAllCategories } from "@/lib/posts";
import { getQuizByIdForAdmin } from "@/lib/quizzes";
import QuizForm from "@/components/admin/QuizForm";
import { notFound } from "next/navigation";

export default async function EditQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [quiz, posts, categories] = await Promise.all([
    getQuizByIdForAdmin(id),
    getAllPostsForAdmin(),
    getAllCategories(),
  ]);

  if (!quiz) notFound();

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">Edit Quiz</h1>
      <div className="mt-6">
        <QuizForm quiz={quiz} posts={posts} categories={categories} />
      </div>
    </div>
  );
}
