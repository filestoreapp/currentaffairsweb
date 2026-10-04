import type { Post, PscUpdate } from "@/lib/types";
import { postPublicPath } from "@/lib/series-paths";


/**
 * The public username of the channel these posts land in, appended to every
 * auto-post so readers can find and share the channel even after the
 * message is forwarded elsewhere.
 */
const CHANNEL_LINK = "https://t.me/Daily_CurrentAffairs_Malayalam";
const CHANNEL_FOOTER = `\n\n📢 Join our channel: ${CHANNEL_LINK}`;

/**
 * Escape text for Telegram's HTML parse mode. We use HTML (not Markdown)
 * because Markdown treats underscores as italic markers — which mangled
 * the t.me/Daily_CurrentAffairs_Malayalam link into
 * t.me/DailyCurrentAffairsMalayalam in the rendered message.
 */
function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Site base URL with no trailing slash (NEXT_PUBLIC_SITE_URL may end with one, producing "//" in links). */
function siteBase(): string {
  const raw = "https://www.psccurrentaffairs.online";
  return raw.replace(/\/+$/, "");
}

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

  const link = `${siteBase()}${postPublicPath(post.slug)}`;
  const caption = `📢 <b>${esc(post.title)}</b>\n\n${esc(post.excerpt ?? "")}\n\n🔗 ${link}${CHANNEL_FOOTER}`;

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
        parse_mode: "HTML",
      }
    : {
        chat_id: channelId,
        text: caption,
        parse_mode: "HTML",
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

  const link = `${siteBase()}/mock-tests/${mock.slug}`;
  const marking =
    mock.negativeMarking > 0
      ? `+1 for correct, −${mock.negativeMarking} for wrong`
      : "+1 for correct, no negative marking";
  const text =
    `📝 <b>New Mock Test: ${esc(mock.title)}</b>\n\n` +
    `${mock.description ? `${esc(mock.description)}\n\n` : ""}` +
    `❓ ${mock.questionCount} questions` +
    `${mock.durationMinutes ? ` · ⏱ ${mock.durationMinutes} minutes` : ""}\n` +
    `📊 ${marking}\n\n` +
    `Take it free and see your rank 👇\n🔗 ${link}${CHANNEL_FOOTER}`;

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: channelId, text, parse_mode: "HTML" }),
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
  const link = `${siteBase()}/psc-updates/${item.id}`;
  const text = `📢 <b>New ${esc(label)}</b>\n\n${esc(item.title)}\n\n🔗 ${link}${CHANNEL_FOOTER}`;

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: channelId, text, parse_mode: "HTML" }),
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
  hasPdf: boolean;
  questionCount: number;
  negativeMarking: number;
}) {
  const enabled = process.env.TELEGRAM_ENABLED === "true";
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const channelId = process.env.TELEGRAM_CHANNEL_ID;

  if (!enabled || !token || !channelId) {
    return { skipped: true };
  }

  const siteUrl = siteBase();
  const link = `${siteUrl}/pyqs/${paper.slug}`;
  const examLabel =
    [paper.examName, paper.examYear].filter(Boolean).join(" ") || "Kerala PSC";
  const marking =
    paper.negativeMarking > 0
      ? `+1 for correct, −${paper.negativeMarking} for wrong`
      : "+1 for correct, no negative marking";
  const text =
    `📜 <b>New PYQ Paper: ${esc(paper.title)}</b>\n\n` +
    `🏛 ${esc(examLabel)}\n` +
    `${paper.description ? `${esc(paper.description)}\n\n` : ""}` +
    `❓ ${paper.questionCount} questions · 📊 ${marking}\n\n` +
    `Practice the real paper free 👇\n🔗 ${link}` +
    `${paper.hasPdf ? `\n\n📄 Original question paper (PDF):\n${siteUrl}/api/pyq/download/${paper.slug}` : ""}` +
    `${CHANNEL_FOOTER}`;

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: channelId, text, parse_mode: "HTML" }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Telegram PYQ post failed:", errText);
    return { skipped: false, ok: false };
  }

  return { skipped: false, ok: true };
}
