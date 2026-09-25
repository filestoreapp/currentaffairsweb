"use client";

import { useState } from "react";
import { Mail } from "lucide-react";

export default function ContactForm({ to }: { to: string }) {
  const [name, setName] = useState("");
  const [from, setFrom] = useState("");
  const [message, setMessage] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Website enquiry from ${name || "a reader"}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${from}\n\n${message}`
    );
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  };

  const inputCls =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100";

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"
    >
      <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
        <Mail size={18} className="text-indigo-600" /> Send us an email
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        This opens your email app — nothing is stored on our servers.
      </p>
      <div className="mt-5 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            Your name
          </label>
          <input
            className={inputCls}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            Your email
          </label>
          <input
            type="email"
            className={inputCls}
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            Message
          </label>
          <textarea
            className={`${inputCls} min-h-32 resize-y`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="How can we help?"
            required
          />
        </div>
        <button
          type="submit"
          className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Send message
        </button>
      </div>
    </form>
  );
}
