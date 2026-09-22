"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { marked } from "marked";
import slugify from "slugify";
import { formatDistanceToNow } from "date-fns";
import RichTextEditor from "@/components/admin/RichTextEditor";
import MarkdownEditor from "@/components/admin/MarkdownEditor";
import ImageUploader from "@/components/admin/ImageUploader";
import { createPost, updatePost, type PostFormInput } from "@/lib/actions/posts";
import { previewThumbnail } from "@/lib/actions/thumbnail";
import { useDraftAutosave } from "@/lib/useDraftAutosave";
import type { Category, EditorMode, Post, PostStatus } from "@/lib/types";
import { Loader2, Sparkles } from "lucide-react";

interface DraftShape {
  title: string;
  slug: string;
  excerpt: string;
  editorMode: EditorMode;
  contentHtml: string;
  contentMarkdown: string;
  coverImage: string | null;
  categoryId: string;
  tags: string;
  status: PostStatus;
  scheduledAt: string;
  metaTitle: string;
  metaDescription: string;
}

export default function PostForm({
  post,
  categories,
}: {
  post?: Post;
  categories: Category[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [editorMode, setEditorMode] = useState<EditorMode>(
    post?.editor_mode ?? "richtext"
  );
  const [contentHtml, setContentHtml] = useState(post?.content_html ?? "");
  const [contentMarkdown, setContentMarkdown] = useState(
    post?.content_markdown ?? ""
  );
  const [coverImage, setCoverImage] = useState<string | null>(
    post?.cover_image ?? null
  );
  const [categoryId, setCategoryId] = useState(post?.category_id ?? "");
  const [tags, setTags] = useState((post?.tags ?? []).join(", "));
  const [status, setStatus] = useState<PostStatus>(post?.status ?? "draft");
  const [scheduledAt, setScheduledAt] = useState(
    post?.status === "scheduled" && post?.published_at
      ? post.published_at.slice(0, 16)
      : ""
  );
  const [metaTitle, setMetaTitle] = useState(post?.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(
    post?.meta_description ?? ""
  );
  const [error, setError] = useState<string | null>(null);
  const [generatingThumb, setGeneratingThumb] = useState(false);

  const draftKey = `postDraft:${post?.id ?? "new"}`;
  const { restorableDraft, restorableSavedAt, restore, discard, clearDraft } =
    useDraftAutosave<DraftShape>(draftKey, {
      title,
      slug,
      excerpt,
      editorMode,
      contentHtml,
      contentMarkdown,
      coverImage,
      categoryId,
      tags,
      status,
      scheduledAt,
      metaTitle,
      metaDescription,
    });

  function applyDraft(d: DraftShape) {
    setTitle(d.title);
    setSlug(d.slug);
    setExcerpt(d.excerpt);
    setEditorMode(d.editorMode);
    setContentHtml(d.contentHtml);
    setContentMarkdown(d.contentMarkdown);
    setCoverImage(d.coverImage);
    setCategoryId(d.categoryId);
    setTags(d.tags);
    setStatus(d.status);
    setScheduledAt(d.scheduledAt);
    setMetaTitle(d.metaTitle);
    setMetaDescription(d.metaDescription);
  }

  async function handleGenerateThumbnail() {
    if (!title.trim()) {
      setError("Add a title first so the thumbnail has something to show");
      return;
    }
    setError(null);
    setGeneratingThumb(true);
    try {
      const categoryName =
        categories.find((c) => c.id === categoryId)?.name ?? null;
      const url = await previewThumbnail(title, categoryName);
      setCoverImage(url);
    } catch (err) {
      setError("Couldn't generate a thumbnail: " + (err as Error).message);
    } finally {
      setGeneratingThumb(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (status === "scheduled" && !scheduledAt) {
      setError("Pick a date and time to schedule this post for");
      return;
    }

    const finalHtml =
      editorMode === "markdown" ? (marked.parse(contentMarkdown) as string) : contentHtml;

    const input: PostFormInput = {
      title,
      slug: slug ? slugify(slug, { lower: true, strict: true }) : undefined,
      excerpt,
      content_html: finalHtml,
      content_markdown: editorMode === "markdown" ? contentMarkdown : undefined,
      editor_mode: editorMode,
      cover_image: coverImage ?? undefined,
      category_id: categoryId || null,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      status,
      published_at:
        status === "scheduled" ? new Date(scheduledAt).toISOString() : undefined,
      meta_title: metaTitle,
      meta_description: metaDescription,
    };

    startTransition(async () => {
      try {
        clearDraft();
        if (post) {
          await updatePost(post.id, input);
        } else {
          await createPost(input);
        }
      } catch (err) {
        setError((err as Error).message);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {restorableDraft && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span>
            You have an unsaved draft from{" "}
            {restorableSavedAt
              ? formatDistanceToNow(new Date(restorableSavedAt), { addSuffix: true })
              : "earlier"}
            .
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                const d = restore();
                if (d) applyDraft(d);
              }}
              className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
            >
              Restore draft
            </button>
            <button
              type="button"
              onClick={discard}
              className="rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100"
            >
              Discard
            </button>
          </div>
        </div>
      )}
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Kerala PSC LDC 2026 Notification Released"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Slug (URL) — leave blank to auto-generate
            </label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="kerala-psc-ldc-2026-notification"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Excerpt
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              placeholder="Short summary shown in listings..."
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">
                Content
              </label>
              <div className="flex overflow-hidden rounded-lg border border-slate-300 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setEditorMode("richtext")}
                  className={`px-3 py-1.5 ${
                    editorMode === "richtext"
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-slate-600"
                  }`}
                >
                  Rich Text
                </button>
                <button
                  type="button"
                  onClick={() => setEditorMode("markdown")}
                  className={`px-3 py-1.5 ${
                    editorMode === "markdown"
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-slate-600"
                  }`}
                >
                  Markdown
                </button>
              </div>
            </div>

            {editorMode === "richtext" ? (
              <RichTextEditor content={contentHtml} onChange={setContentHtml} />
            ) : (
              <MarkdownEditor
                content={contentMarkdown}
                onChange={setContentMarkdown}
              />
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-bold text-slate-800">SEO</h3>
            <div className="mt-3 space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-500">
                  Meta title
                </label>
                <input
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder={title || "Defaults to post title"}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">
                  Meta description
                </label>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={2}
                  placeholder={excerpt || "Defaults to excerpt"}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-bold text-slate-800">Publish</h3>
            <div className="mt-3 space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-500">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as PostStatus)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>

              {status === "scheduled" && (
                <div>
                  <label className="text-xs font-medium text-slate-500">
                    Publish at
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                  <p className="mt-1 text-xs text-slate-400">
                    Goes live automatically at this time — no need to come
                    back and hit publish.
                  </p>
                </div>
              )}
              <button
                type="submit"
                disabled={isPending}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {isPending && <Loader2 size={16} className="animate-spin" />}
                {post ? "Update Post" : "Create Post"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/admin/posts")}
                className="w-full rounded-lg border border-slate-300 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <ImageUploader value={coverImage} onChange={setCoverImage} />
            <button
              type="button"
              onClick={handleGenerateThumbnail}
              disabled={generatingThumb}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 disabled:opacity-60"
            >
              {generatingThumb ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Sparkles size={16} />
              )}
              {coverImage ? "Regenerate branded thumbnail" : "Auto-generate thumbnail"}
            </button>
            <p className="mt-2 text-xs text-slate-400">
              Leave the cover image blank and one is generated automatically
              from the title and category when you save.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <label className="text-sm font-medium text-slate-700">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="">Uncategorized</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <label className="mt-4 block text-sm font-medium text-slate-700">
              Tags (comma separated)
            </label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="psc, kerala, notification"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
