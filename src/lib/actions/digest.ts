"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { callWorker } from "@/lib/worker-client";
import type { Post } from "@/lib/types";

const POST_SELECT = "*, category:categories(*)";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return supabase;
}

/** All daily-digest posts (drafts + published), newest first. */
export async function getDigestPosts(): Promise<Post[]> {
  const supabase = await requireAdmin();
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .contains("tags", ["daily-digest"])
    .order("created_at", { ascending: false })
    .limit(60);
  if (error) throw error;
  return (data ?? []) as unknown as Post[];
}

/**
 * Publish a digest draft from the admin panel. Goes through the Koyeb
 * worker so the branded thumbnail is generated, the Telegram
 * announcement fires, and the site revalidates — the same path the
 * chat approval uses.
 */
export async function publishDigestPostAction(slug: string) {
  await requireAdmin();
  const result = await callWorker("publish-post", { slug });
  revalidatePath("/admin/digest");
  revalidatePath("/admin/posts");
  return result as { ok: boolean; published?: string[] };
}

/** Delete a digest draft (rejected digests). Drafts only — the worker refuses anything else. */
export async function deleteDigestPostAction(slug: string) {
  await requireAdmin();
  const result = await callWorker("delete-post", { slug });
  revalidatePath("/admin/digest");
  revalidatePath("/admin/posts");
  return result as { ok: boolean; deleted?: boolean };
}
