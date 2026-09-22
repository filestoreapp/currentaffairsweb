"use server";

import { createClient } from "@/lib/supabase/server";
import { generateThumbnailBuffer } from "@/lib/thumbnail";
import { compressImage, uploadToImageCdn } from "@/lib/image-cdn";
import { revalidatePath } from "next/cache";

/**
 * Generates a branded thumbnail and uploads it to the `post-images` bucket,
 * returning its public URL. `keySeed` should be the post's slug when known
 * (stable path, easy to spot in storage) or any unique-ish string for posts
 * that haven't been saved yet.
 *
 * The storage path is stable per keySeed (no timestamp suffix) and the
 * upload uses `upsert: true`, so re-generating a thumbnail for the same
 * post/title overwrites the old file instead of leaving it behind. Every
 * earlier version of this stamped a new `-${Date.now()}` file on each call,
 * so every click of "Generate thumbnail" while drafting left a permanent
 * orphaned file in storage — that's almost certainly what was filling up
 * the storage quota. Use cleanupOrphanedThumbnails() below to remove any
 * old timestamped files left over from before this fix.
 */
export async function generateAndUploadThumbnail({
  keySeed,
  title,
  category,
}: {
  keySeed: string;
  title: string;
  category?: string | null;
}): Promise<string> {
  const buffer = await generateThumbnailBuffer({ title, category });
  const compressed = await compressImage(Buffer.from(buffer));

  // Stable path per keySeed + upsert: re-generating overwrites the old
  // file instead of leaving orphans. The returned CDN URL is pinned to
  // the new commit SHA, so there's never a stale-cache problem.
  const path = `auto-thumbnails/${keySeed}.webp`;
  return uploadToImageCdn(compressed, path, { upsert: true });
}

/**
 * Called from the admin editor's "Generate thumbnail" button — for posts
 * that don't have a slug yet (new, unsaved posts) this just needs a title.
 */
export async function previewThumbnail(title: string, categoryName?: string | null) {
  if (!title.trim()) throw new Error("Add a title first");
  const seed = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40) || "post";
  return generateAndUploadThumbnail({ keySeed: seed, title, category: categoryName });
}

/**
 * Finds every published/scheduled/draft post with no cover_image and
 * generates one for each. Used by the "Generate missing thumbnails" button
 * in /admin/posts, so existing posts created before this feature (or ones
 * an editor never uploaded a cover for) get one automatically too.
 */
export async function backfillMissingThumbnails(): Promise<{
  updated: number;
  failed: number;
}> {
  const supabase = await createClient();

  const { data: posts, error } = await supabase
    .from("posts")
    .select("id, slug, title, category:categories(name)")
    .is("cover_image", null);

  if (error) throw new Error(error.message);

  let updated = 0;
  let failed = 0;

  for (const post of posts ?? []) {
    try {
      const categoryName = Array.isArray(post.category)
        ? (post.category[0] as { name?: string } | undefined)?.name
        : (post.category as { name?: string } | null)?.name;

      const url = await generateAndUploadThumbnail({
        keySeed: post.slug,
        title: post.title,
        category: categoryName ?? null,
      });

      const { error: updateError } = await supabase
        .from("posts")
        .update({ cover_image: url })
        .eq("id", post.id);

      if (updateError) throw new Error(updateError.message);
      updated += 1;
    } catch (err) {
      console.error(`Thumbnail backfill failed for post ${post.id}:`, err);
      failed += 1;
    }
  }

  revalidatePath("/admin/posts");
  revalidatePath("/current-affairs");

  return { updated, failed };
}

/**
 * Deletes any file under `auto-thumbnails/` in the `post-images` bucket
 * that isn't currently used as a post's cover_image. Safe to run any time
 * — this is the cleanup for the storage leak described above
 * (every old "Generate thumbnail" click before the stable-path fix left a
 * file behind forever). Run this once after upgrading, then occasionally
 * afterwards to sweep up previews from posts that were never saved.
 */
export async function cleanupOrphanedThumbnails(): Promise<{
  deleted: number;
  kept: number;
}> {
  const supabase = await createClient();

  const { data: files, error: listError } = await supabase.storage
    .from("post-images")
    .list("auto-thumbnails", { limit: 1000 });
  if (listError) throw new Error(listError.message);

  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .select("cover_image")
    .not("cover_image", "is", null);
  if (postsError) throw new Error(postsError.message);

  const marker = "/post-images/";
  const referencedPaths = new Set(
    (posts ?? [])
      .map((p) => p.cover_image as string | null)
      .filter((url): url is string => !!url)
      .map((url) => {
        const idx = url.indexOf(marker);
        if (idx === -1) return null;
        return url.slice(idx + marker.length).split("?")[0];
      })
      .filter((p): p is string => !!p)
  );

  const orphaned = (files ?? [])
    .filter((f) => f.name && !referencedPaths.has(`auto-thumbnails/${f.name}`))
    .map((f) => `auto-thumbnails/${f.name}`);

  let deleted = 0;
  if (orphaned.length > 0) {
    const { error: deleteError } = await supabase.storage
      .from("post-images")
      .remove(orphaned);
    if (deleteError) throw new Error(deleteError.message);
    deleted = orphaned.length;
  }

  revalidatePath("/admin/posts");

  return { deleted, kept: (files?.length ?? 0) - deleted };
}
