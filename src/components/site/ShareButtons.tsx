"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.198.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-1.746-.873-2.888-1.557-4.036-3.53-.305-.524.305-.487.873-1.62.099-.198.05-.371-.05-.52-.099-.148-.669-1.61-.916-2.206-.242-.579-.489-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.075-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.05 3.13 4.977 4.26 2.926 1.13 2.926.754 3.474.706.545-.05 1.758-.719 2.006-1.412.247-.694.247-1.288.173-1.412-.074-.124-.272-.198-.57-.347z" />
      <path d="M12.05 22h-.005a9.947 9.947 0 0 1-5.005-1.347L2 22l1.365-4.984A9.995 9.995 0 0 1 12.05 2C17.575 2 22 6.477 22 12.05c0 5.573-4.425 9.95-9.95 9.95zm0-18a8 8 0 0 0-6.928 12.02l.22.37-.85 3.107 3.187-.837.357.212A7.95 7.95 0 0 0 12.05 20 8 8 0 0 0 12.05 4z" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" aria-hidden="true">
      <path d="M21.9 4.3 18.6 20c-.2 1-.9 1.2-1.7.8l-4.7-3.5-2.3 2.2c-.3.3-.5.4-.9.4l.3-4.6 8.4-7.6c.4-.3-.1-.5-.5-.2L7 12.4l-4.5-1.4c-1-.3-1-.9.2-1.4L20.6 3.4c.8-.3 1.5.2 1.3.9z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" aria-hidden="true">
      <path d="M18.9 2H22l-6.8 7.8L23 22h-6.9l-5.4-7-6.2 7H1.3l7.3-8.3L1 2h7.1l4.9 6.4L18.9 2zm-2.4 18h1.9L7.6 4H5.6l10.9 16z" />
    </svg>
  );
}

export default function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard API unavailable — silently ignore, the link is visible anyway
    }
  }

  const links = [
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      icon: <WhatsAppIcon />,
      style: "bg-[#25D366] hover:bg-[#1fbd59]",
    },
    {
      label: "Telegram",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      icon: <TelegramIcon />,
      style: "bg-[#229ED9] hover:bg-[#1c8bc0]",
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      icon: <XIcon />,
      style: "bg-slate-900 hover:bg-slate-700",
    },
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        Share
      </span>
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${link.label}`}
          className={`flex h-8 w-8 items-center justify-center rounded-full text-white ${link.style}`}
        >
          {link.icon}
        </a>
      ))}
      <button
        onClick={copyLink}
        aria-label="Copy link"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-indigo-400 hover:text-indigo-600"
      >
        {copied ? <Check size={15} /> : <Link2 size={15} />}
      </button>
    </div>
  );
}
