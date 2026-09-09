"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownEditor({
  content,
  onChange,
}: {
  content: string;
  onChange: (markdown: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write markdown here... (# Heading, **bold**, - list, ![alt](url))"
        className="min-h-[320px] rounded-lg border border-slate-300 p-4 font-mono text-sm focus:border-indigo-500 focus:outline-none"
      />
      <div className="prose prose-slate min-h-[320px] max-w-none overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-4">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content || "*Preview will appear here...*"}
        </ReactMarkdown>
      </div>
    </div>
  );
}
