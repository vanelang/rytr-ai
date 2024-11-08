"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useCallback, useEffect } from "react";
import { markdownToHtml } from "@/lib/markdown";

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function Editor({ value, onChange, placeholder }: EditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: markdownToHtml(value),
    editorProps: {
      attributes: {
        class: "min-h-[500px] w-full text-white focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(markdownToHtml(value));
    }
  }, [editor, value]);

  const addHeading = useCallback(
    (level: 1 | 2 | 3) => {
      editor?.chain().focus().toggleHeading({ level }).run();
    },
    [editor]
  );

  const addBold = useCallback(() => {
    editor?.chain().focus().toggleBold().run();
  }, [editor]);

  const addItalic = useCallback(() => {
    editor?.chain().focus().toggleItalic().run();
  }, [editor]);

  const addBulletList = useCallback(() => {
    editor?.chain().focus().toggleBulletList().run();
  }, [editor]);

  const addOrderedList = useCallback(() => {
    editor?.chain().focus().toggleOrderedList().run();
  }, [editor]);

  const addBlockquote = useCallback(() => {
    editor?.chain().focus().toggleBlockquote().run();
  }, [editor]);

  const addCodeBlock = useCallback(() => {
    editor?.chain().focus().toggleCodeBlock().run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="prose prose-invert w-full max-w-none">
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => addHeading(1)}
          className="rounded bg-white/10 px-2 py-1 text-sm text-white hover:bg-white/20"
        >
          H1
        </button>
        <button
          onClick={() => addHeading(2)}
          className="rounded bg-white/10 px-2 py-1 text-sm text-white hover:bg-white/20"
        >
          H2
        </button>
        <button
          onClick={() => addHeading(3)}
          className="rounded bg-white/10 px-2 py-1 text-sm text-white hover:bg-white/20"
        >
          H3
        </button>
        <button
          onClick={addBold}
          className="rounded bg-white/10 px-2 py-1 text-sm text-white hover:bg-white/20"
        >
          Bold
        </button>
        <button
          onClick={addItalic}
          className="rounded bg-white/10 px-2 py-1 text-sm text-white hover:bg-white/20"
        >
          Italic
        </button>
        <button
          onClick={addBulletList}
          className="rounded bg-white/10 px-2 py-1 text-sm text-white hover:bg-white/20"
        >
          Bullet List
        </button>
        <button
          onClick={addOrderedList}
          className="rounded bg-white/10 px-2 py-1 text-sm text-white hover:bg-white/20"
        >
          Numbered List
        </button>
        <button
          onClick={addBlockquote}
          className="rounded bg-white/10 px-2 py-1 text-sm text-white hover:bg-white/20"
        >
          Quote
        </button>
        <button
          onClick={addCodeBlock}
          className="rounded bg-white/10 px-2 py-1 text-sm text-white hover:bg-white/20"
        >
          Code Block
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
