"use client";

import { useRef, useState } from "react";
import { uploadImage } from "@/lib/actions/posts";
import { ImagePlus, Loader2, X } from "lucide-react";
import Image from "next/image";

export default function ImageUploader({
  value,
  onChange,
  label = "Cover image",
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const url = await uploadImage(formData);
      onChange(url);
    } catch (err) {
      alert("Upload failed: " + (err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="mt-1">
        {value ? (
          <div className="relative h-40 w-full overflow-hidden rounded-lg border border-slate-200">
            <Image src={value} alt="cover" fill className="object-cover" />
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 text-slate-400 hover:border-indigo-400 hover:text-indigo-500"
          >
            {uploading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <ImagePlus size={22} />
                <span className="text-xs font-medium">
                  Click to upload image
                </span>
              </>
            )}
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>
    </div>
  );
}
