import { getAllPostsForAdmin } from "@/lib/posts";
import { getAllCategories } from "@/lib/posts";
import QuizForm from "@/components/admin/QuizForm";

export default async function NewQuizPage() {
  const [posts, categories] = await Promise.all([
    getAllPostsForAdmin(),
    getAllCategories(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-extrabold">New Quiz</h1>
      <div className="mt-6">
        <QuizForm posts={posts} categories={categories} />
      </div>
    </div>
  );
}
