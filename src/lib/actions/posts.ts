"use server";

import { createClient } from "@/lib/supabase/server";
import { postToTelegram } from "@/lib/telegram";
import { generateAndUploadThumbnail } from "@/lib/actions/thumbnail";
import { compressImage, datedImagePath, uploadToImageCdn } from "@/lib/image-cdn";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import slugify from "slugify";
import type { EditorMode, PostStatus } from "@/lib/types";

function buildSlug(title: string, existingSlug?: string) {
  if (existingSlug) return existingSlug;
  return slugify(title, { lower: true, strict: true }).slice(0, 90);
}

/**
 * Every post gets a cover image: whatever the editor uploaded, or — if they
 * left it blank — a branded thumbnail generated automatically from the
 * title/category. Generation failures are logged but never block saving the
 * post (the post just falls back to no image, same as before this feature).
 */
async function resolveCoverImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  input: { cover_image?: string; title: string; category_id?: string | null },
  slug: string
): Promise<string | null> {
  if (input.cover_image) return input.cover_image;

  try {
    let categoryName: string | null = null;
    if (input.category_id) {
      const { data: cat } = await supabase
        .from("categories")
        .select("name")
        .eq("id", input.category_id)
        .single();
      categoryName = cat?.name ?? null;
    }
    return await generateAndUploadThumbnail({
      keySeed: slug,
      title: input.title,
      category: categoryName,
    });
  } catch (err) {
    console.error("Auto thumbnail generation failed:", err);
    return null;
  }
}

export interface PostFormInput {
  title: string;
  slug?: string;
  excerpt?: string;
  content_html: string;
  content_markdown?: string;
  editor_mode: EditorMode;
  cover_image?: string;
  category_id?: string | null;
  tags?: string[];
  status: PostStatus;
  published_at?: string | null;
  meta_title?: string;
  meta_description?: string;
}

export async function createPost(input: PostFormInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const slug = buildSlug(input.title, input.slug);
  const published_at =
    input.status === "published" && !input.published_at
      ? new Date().toISOString()
      : input.published_at ?? null;
  const cover_image = await resolveCoverImage(supabase, input, slug);

  const { data, error } = await supabase
    .from("posts")
    .insert({
      title: input.title,
      slug,
      excerpt: input.excerpt || null,
      content_html: input.content_html,
      content_markdown: input.content_markdown || null,
      editor_mode: input.editor_mode,
      cover_image,
      category_id: input.category_id || null,
      tags: input.tags || [],
      status: input.status,
      published_at,
      meta_title: input.meta_title || input.title,
      meta_description: input.meta_description || input.excerpt || null,
      author_id: user?.id ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  if (input.status === "published") {
    await postToTelegram(data as never);
  }

  revalidatePath("/admin/posts");
  revalidatePath("/current-affairs");
  redirect("/admin/posts");
}

const MAX_REVISIONS_PER_POST = 20;

/**
 * Snapshots a post's current row into post_revisions before it gets
 * overwritten, then trims old revisions beyond the retention cap so the
 * table doesn't grow without bound. Best-effort — a snapshot failure is
 * logged but never blocks the actual save.
 */
async function snapshotRevision(
  supabase: Awaited<ReturnType<typeof createClient>>,
  postId: string
) {
  try {
    const { data: current } = await supabase
      .from("posts")
      .select(
        "title, excerpt, content_html, content_markdown, editor_mode, cover_image, category_id, tags, meta_title, meta_description"
      )
      .eq("id", postId)
      .single();

    if (!current) return;

    await supabase.from("post_revisions").insert({ post_id: postId, ...current });

    const { data: old } = await supabase
      .from("post_revisions")
      .select("id")
      .eq("post_id", postId)
      .order("created_at", { ascending: false })
      .range(MAX_REVISIONS_PER_POST, MAX_REVISIONS_PER_POST + 200);

    if (old && old.length > 0) {
      await supabase
        .from("post_revisions")
        .delete()
        .in("id", old.map((r) => r.id));
    }
  } catch (err) {
    console.error("Revision snapshot failed:", err);
  }
}

export async function updatePost(id: string, input: PostFormInput) {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("posts")
    .select("status, published_at, slug")
    .eq("id", id)
    .single();

  await snapshotRevision(supabase, id);

  const slug = buildSlug(input.title, input.slug || existing?.slug);
  const isNewlyPublished =
    input.status === "published" && existing?.status !== "published";

  const published_at =
    input.status === "published"
      ? existing?.published_at ?? new Date().toISOString()
      : input.published_at ?? null;
  const cover_image = await resolveCoverImage(supabase, input, slug);

  const { data, error } = await supabase
    .from("posts")
    .update({
      title: input.title,
      slug,
      excerpt: input.excerpt || null,
      content_html: input.content_html,
      content_markdown: input.content_markdown || null,
      editor_mode: input.editor_mode,
      cover_image,
      category_id: input.category_id || null,
      tags: input.tags || [],
      status: input.status,
      published_at,
      meta_title: input.meta_title || input.title,
      meta_description: input.meta_description || input.excerpt || null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  if (isNewlyPublished) {
    await postToTelegram(data as never);
  }

  revalidatePath("/admin/posts");
  revalidatePath("/current-affairs");
  revalidatePath(`/current-affairs/${slug}`);
  redirect("/admin/posts");
}

export async function deletePost(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/posts");
  revalidatePath("/current-affairs");
}

// ---- Version history ----

export async function getPostRevisions(postId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("post_revisions")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

/**
 * Rolls a post back to an earlier snapshot. The post's current state is
 * snapshotted first (same as a normal edit would), so restoring is itself
 * just another reversible step, not a one-way trip.
 */
export async function restorePostRevision(revisionId: string) {
  const supabase = await createClient();

  const { data: revision, error: revError } = await supabase
    .from("post_revisions")
    .select("*")
    .eq("id", revisionId)
    .single();
  if (revError || !revision) throw new Error(revError?.message || "Revision not found");

  await snapshotRevision(supabase, revision.post_id);

  const { error } = await supabase
    .from("posts")
    .update({
      title: revision.title,
      excerpt: revision.excerpt,
      content_html: revision.content_html,
      content_markdown: revision.content_markdown,
      editor_mode: revision.editor_mode,
      cover_image: revision.cover_image,
      category_id: revision.category_id,
      tags: revision.tags,
      meta_title: revision.meta_title,
      meta_description: revision.meta_description,
    })
    .eq("id", revision.post_id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/posts");
  revalidatePath(`/admin/posts/${revision.post_id}/edit`);
  revalidatePath("/current-affairs");
  redirect(`/admin/posts/${revision.post_id}/edit`);
}

// ---- Bulk actions ----

export async function bulkUpdateStatus(ids: string[], status: PostStatus) {
  if (ids.length === 0) return;
  const supabase = await createClient();

  const update: { status: PostStatus; published_at?: string } =
    status === "published" ? { status, published_at: new Date().toISOString() } : { status };

  // Only fill in published_at for rows that don't already have one, so a
  // post's original publish date isn't overwritten by a later bulk action.
  if (status === "published") {
    const { error } = await supabase
      .from("posts")
      .update({ status })
      .in("id", ids)
      .not("published_at", "is", null);
    if (error) throw new Error(error.message);

    const { error: error2 } = await supabase
      .from("posts")
      .update(update)
      .in("id", ids)
      .is("published_at", null);
    if (error2) throw new Error(error2.message);
  } else {
    const { error } = await supabase.from("posts").update({ status }).in("id", ids);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin/posts");
  revalidatePath("/current-affairs");
}

export async function bulkDeletePosts(ids: string[]) {
  if (ids.length === 0) return;
  const supabase = await createClient();
  const { error } = await supabase.from("posts").delete().in("id", ids);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/posts");
  revalidatePath("/current-affairs");
}


export async function createCategory(name: string) {
  const supabase = await createClient();
  const slug = slugify(name, { lower: true, strict: true });
  const { error } = await supabase
    .from("categories")
    .insert({ name, slug });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/categories");
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/categories");
}

export async function uploadImage(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) throw new Error("No file provided");

  // Compress on the way in, then store in the free GitHub-backed image
  // repo served via jsDelivr (Supabase storage stays for legacy images).
  const input = Buffer.from(await file.arrayBuffer());
  const compressed = await compressImage(input);
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
  return uploadToImageCdn(compressed, datedImagePath(filename));
}
