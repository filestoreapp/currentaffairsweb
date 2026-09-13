"use server";

import { createClient } from "@/lib/supabase/server";
import { generateThumbnailBuffer } from "@/lib/thumbnail";
import { revalidatePath } from "next/cache";

/**
 * Generates a branded thumbnail and uploads it to the `post-images` bucket,
 * returning its public URL. `keySeed` should be the post's slug when known
 * (stable path, easy to spot in storage) or any unique-ish string for posts
 * that haven't been saved yet.
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
  const supabase = await createClient();

  const path = `auto-thumbnails/${keySeed}-${Date.now()}.png`;
  const { error } = await supabase.storage
    .from("post-images")
    .upload(path, buffer, { contentType: "image/png", upsert: true });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("post-images").getPublicUrl(path);
  return data.publicUrl;
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
