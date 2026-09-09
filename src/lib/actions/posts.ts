"use server";

import { createClient } from "@/lib/supabase/server";
import { postToTelegram } from "@/lib/telegram";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import slugify from "slugify";
import type { EditorMode, PostStatus } from "@/lib/types";

function buildSlug(title: string, existingSlug?: string) {
  if (existingSlug) return existingSlug;
  return slugify(title, { lower: true, strict: true }).slice(0, 90);
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

  const { data, error } = await supabase
    .from("posts")
    .insert({
      title: input.title,
      slug,
      excerpt: input.excerpt || null,
      content_html: input.content_html,
      content_markdown: input.content_markdown || null,
      editor_mode: input.editor_mode,
      cover_image: input.cover_image || null,
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

export async function updatePost(id: string, input: PostFormInput) {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("posts")
    .select("status, published_at, slug")
    .eq("id", id)
    .single();

  const slug = buildSlug(input.title, input.slug || existing?.slug);
  const isNewlyPublished =
    input.status === "published" && existing?.status !== "published";

  const published_at =
    input.status === "published"
      ? existing?.published_at ?? new Date().toISOString()
      : input.published_at ?? null;

  const { data, error } = await supabase
    .from("posts")
    .update({
      title: input.title,
      slug,
      excerpt: input.excerpt || null,
      content_html: input.content_html,
      content_markdown: input.content_markdown || null,
      editor_mode: input.editor_mode,
      cover_image: input.cover_image || null,
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
  const supabase = await createClient();
  const file = formData.get("file") as File;
  if (!file) throw new Error("No file provided");

  const ext = file.name.split(".").pop();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from("post-images")
    .upload(path, file, { contentType: file.type });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("post-images").getPublicUrl(path);
  return data.publicUrl;
}
