"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mintShortLink, ShortLinkError } from "@/lib/short-links";

/**
 * Create a short link from the admin form. Session-checked: the admin
 * middleware already redirects signed-out visitors to /admin/login, and
 * this throws if somehow called without a session. Failures bounce back
 * to the page with ?error= instead of throwing an error page.
 */
export async function createShortLinkAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in to create short links.");

  const targetUrl = String(formData.get("target_url") ?? "");
  const label = String(formData.get("label") ?? "");
  const alias = String(formData.get("alias") ?? "").trim() || undefined;

  try {
    await mintShortLink(targetUrl, label, alias);
  } catch (err) {
    const message =
      err instanceof ShortLinkError
        ? err.message
        : "Could not create the short link.";
    redirect(`/admin/short-links?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/admin/short-links");
  redirect("/admin/short-links?created=1");
}
