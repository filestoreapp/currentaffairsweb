"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { uploadImage } from "@/lib/actions/posts";
import {
  Bold,
  Italic,
  UnderlineIcon,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  ImageIcon,
  Heading2,
  Heading3,
  Undo,
  Redo,
} from "lucide-react";

export default function RichTextEditor({
  content,
  onChange,
}: {
  content: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Image,
      Placeholder.configure({
        placeholder: "Write your current affairs article here...",
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-slate max-w-none min-h-[320px] focus:outline-none px-4 py-3",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) return null;

  async function handleImageUpload() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file || !editor) return;
      const formData = new FormData();
      formData.append("file", file);
      try {
        const url = await uploadImage(formData);
        editor.chain().focus().setImage({ src: url }).run();
      } catch (err) {
        alert("Image upload failed: " + (err as Error).message);
      }
    };
    input.click();
  }

  function setLink() {
    const url = window.prompt("Enter URL");
    if (url) editor?.chain().focus().setLink({ href: url }).run();
  }

  const ToolbarBtn = ({
    onClick,
    active,
    children,
    title,
  }: {
    onClick: () => void;
    active?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`rounded-md p-2 text-slate-600 hover:bg-slate-100 ${
        active ? "bg-indigo-100 text-indigo-700" : ""
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="overflow-hidden rounded-lg border border-slate-300">
      <div className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 p-1">
        <ToolbarBtn
          title="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={16} />
        </ToolbarBtn>
        <ToolbarBtn
          title="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={16} />
        </ToolbarBtn>
        <ToolbarBtn
          title="Underline"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon size={16} />
        </ToolbarBtn>
        <ToolbarBtn
          title="Heading 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 size={16} />
        </ToolbarBtn>
        <ToolbarBtn
          title="Heading 3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          <Heading3 size={16} />
        </ToolbarBtn>
        <ToolbarBtn
          title="Bullet list"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List size={16} />
        </ToolbarBtn>
        <ToolbarBtn
          title="Numbered list"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={16} />
        </ToolbarBtn>
        <ToolbarBtn
          title="Quote"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote size={16} />
        </ToolbarBtn>
        <ToolbarBtn title="Link" onClick={setLink}>
          <LinkIcon size={16} />
        </ToolbarBtn>
        <ToolbarBtn title="Insert image" onClick={handleImageUpload}>
          <ImageIcon size={16} />
        </ToolbarBtn>
        <ToolbarBtn
          title="Undo"
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo size={16} />
        </ToolbarBtn>
        <ToolbarBtn
          title="Redo"
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo size={16} />
        </ToolbarBtn>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
