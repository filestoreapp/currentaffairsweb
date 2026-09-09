import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import type { Post } from "@/lib/types";

export default function PostCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/current-affairs/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
        {post.cover_image ? (
          <Image
            src={post.cover_image}
            alt={post.title}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-300">
            No image
          </div>
        )}
        {post.category && (
          <span className="absolute left-3 top-3 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
            {post.category.name}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-lg font-bold text-slate-900 group-hover:text-indigo-600">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-2 line-clamp-2 flex-1 text-sm text-slate-600">
            {post.excerpt}
          </p>
        )}
        <p className="mt-3 text-xs font-medium text-slate-400">
          {post.published_at
            ? format(new Date(post.published_at), "dd MMM yyyy")
            : format(new Date(post.created_at), "dd MMM yyyy")}
        </p>
      </div>
    </Link>
  );
}
