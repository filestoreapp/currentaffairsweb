import { getAllPostsForAdmin } from "@/lib/posts";
import { getQuizByIdForAdmin } from "@/lib/quizzes";
import QuizForm from "@/components/admin/QuizForm";
import { notFound } from "next/navigation";

export default async function EditQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [quiz, posts] = await Promise.all([
    getQuizByIdForAdmin(id),
    getAllPostsForAdmin(),
  ]);

  if (!quiz) notFound();

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Edit Quiz</h1>
      <div className="mt-6">
        <QuizForm quiz={quiz} posts={posts} />
      </div>
    </div>
  );
}
