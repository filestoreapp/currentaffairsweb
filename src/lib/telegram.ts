import type { Post, PscUpdate } from "@/lib/types";

/**
 * The public username of the channel these posts land in, appended to every
 * auto-post so readers can find and share the channel even after the
 * message is forwarded elsewhere.
 */
const CHANNEL_USERNAME = "@Daily_CurrentAffairs_Malayalam";
const CHANNEL_FOOTER = `\n\n📢 Join our channel: ${CHANNEL_USERNAME}`;

const SOURCE_LABELS: Record<PscUpdate["source"], string> = {
  notifications: "Notification",
  examination_notification: "Examination Notification",
  syllabus: "Syllabus",
  exam_programme: "Exam Programme",
  result_notifications: "Result Notification",
  shortlists: "Short List",
  rankedlist: "Ranked List",
  interviews: "Interview Schedule",
};

/**
 * TELEGRAM AUTO-POST — PLACEHOLDER
 * ---------------------------------------------------------------
 * This is a ready-to-wire hook for auto-posting published articles
 * to your Telegram channel. It currently does nothing unless you
 * set TELEGRAM_ENABLED=true and provide a bot token + channel id.
 *
 * SETUP (when you're ready):
 * 1. Create a bot with @BotFather on Telegram, get the bot token.
 * 2. Add the bot as admin to your channel.
 * 3. Get your channel id (e.g. "@your_channel" or numeric id).
 * 4. In Vercel/​.env.local set:
 *      TELEGRAM_BOT_TOKEN=xxxx
 *      TELEGRAM_CHANNEL_ID=@your_channel
 *      TELEGRAM_ENABLED=true
 * 5. This function is already called from the "Publish" server
 *    action in src/lib/actions/posts.ts — no other wiring needed.
 * ---------------------------------------------------------------
 */
export async function postToTelegram(post: Post) {
  const enabled = process.env.TELEGRAM_ENABLED === "true";
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const channelId = process.env.TELEGRAM_CHANNEL_ID;

  if (!enabled || !token || !channelId) {
    // Not configured yet — silently skip. This is expected for now.
    return { skipped: true };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const link = `${siteUrl}/current-affairs/${post.slug}`;
  const caption = `📢 *${post.title}*\n\n${post.excerpt ?? ""}\n\n🔗 ${link}${CHANNEL_FOOTER}`;

  // Every post now gets a cover image (either uploaded, or an
  // auto-generated branded thumbnail) — send it as a photo with the post
  // details as the caption so the channel post is visual, not just a wall
  // of text. Falls back to a plain text message on the rare post that still
  // has no image at all.
  const endpoint = post.cover_image ? "sendPhoto" : "sendMessage";
  const body = post.cover_image
    ? {
        chat_id: channelId,
        photo: post.cover_image,
        caption,
        parse_mode: "Markdown",
      }
    : {
        chat_id: channelId,
        text: caption,
        parse_mode: "Markdown",
      };

  const url = `https://api.telegram.org/bot${token}/${endpoint}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Telegram post failed:", errText);
    return { skipped: false, ok: false };
  }

  return { skipped: false, ok: true };
}

/**
 * Announce a newly published mock test on Telegram: question count,
 * duration and marking scheme, with a deep link to take the test.
 * Same env vars as postToTelegram; silently no-ops until those are set.
 */
export async function postMockToTelegram(mock: {
  title: string;
  slug: string;
  description: string | null;
  questionCount: number;
  durationMinutes: number | null;
  negativeMarking: number;
}) {
  const enabled = process.env.TELEGRAM_ENABLED === "true";
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const channelId = process.env.TELEGRAM_CHANNEL_ID;

  if (!enabled || !token || !channelId) {
    return { skipped: true };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const link = `${siteUrl}/mock-tests/${mock.slug}`;
  const marking =
    mock.negativeMarking > 0
      ? `+1 for correct, −${mock.negativeMarking} for wrong`
      : "+1 for correct, no negative marking";
  const text =
    `📝 *New Mock Test: ${mock.title}*\n\n` +
    `${mock.description ? `${mock.description}\n\n` : ""}` +
    `❓ ${mock.questionCount} questions` +
    `${mock.durationMinutes ? ` · ⏱ ${mock.durationMinutes} minutes` : ""}\n` +
    `📊 ${marking}\n\n` +
    `Take it free and see your rank 👇\n🔗 ${link}${CHANNEL_FOOTER}`;

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: channelId, text, parse_mode: "Markdown" }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Telegram mock test post failed:", errText);
    return { skipped: false, ok: false };
  }

  return { skipped: false, ok: true };
}
export async function postPscUpdateToTelegram(item: PscUpdate) {
  const enabled = process.env.TELEGRAM_ENABLED === "true";
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const channelId = process.env.TELEGRAM_CHANNEL_ID;

  if (!enabled || !token || !channelId) {
    return { skipped: true };
  }

  const label = SOURCE_LABELS[item.source] ?? item.source;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const link = `${siteUrl}/psc-updates/${item.id}`;
  const text = `📢 *New ${label}*\n\n${item.title}\n\n🔗 ${link}${CHANNEL_FOOTER}`;

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: channelId, text, parse_mode: "Markdown" }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Telegram PSC update post failed:", errText);
    return { skipped: false, ok: false };
  }

  return { skipped: false, ok: true };
}

/**
 * Announce a newly published PYQ paper on Telegram: which exam and year,
 * question count and marking scheme, with a deep link to attempt it.
 * Same env vars as postToTelegram; silently no-ops until those are set.
 */
export async function postPyqToTelegram(paper: {
  title: string;
  slug: string;
  description: string | null;
  examName: string | null;
  examYear: number | null;
  pdfUrl: string | null;
  questionCount: number;
  negativeMarking: number;
}) {
  const enabled = process.env.TELEGRAM_ENABLED === "true";
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const channelId = process.env.TELEGRAM_CHANNEL_ID;

  if (!enabled || !token || !channelId) {
    return { skipped: true };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const link = `${siteUrl}/pyqs/${paper.slug}`;
  const examLabel =
    [paper.examName, paper.examYear].filter(Boolean).join(" ") || "Kerala PSC";
  const marking =
    paper.negativeMarking > 0
      ? `+1 for correct, −${paper.negativeMarking} for wrong`
      : "+1 for correct, no negative marking";
  const text =
    `📜 *New PYQ Paper: ${paper.title}*\n\n` +
    `🏛 ${examLabel}\n` +
    `${paper.description ? `${paper.description}\n\n` : ""}` +
    `❓ ${paper.questionCount} questions · 📊 ${marking}\n\n` +
    `Practice the real paper free 👇\n🔗 ${link}` +
    `${paper.pdfUrl ? `\n\n📄 Original question paper (PDF):\n${paper.pdfUrl}` : ""}` +
    `${CHANNEL_FOOTER}`;

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: channelId, text, parse_mode: "Markdown" }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Telegram PYQ post failed:", errText);
    return { skipped: false, ok: false };
  }

  return { skipped: false, ok: true };
}
