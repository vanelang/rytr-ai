"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useCallback, useEffect } from "react";
import { markdownToHtml } from "@/lib/markdown";
import Image from "@tiptap/extension-image";
import { Node as ProseMirrorNode } from "prosemirror-model";
import { NodeViewRenderer, NodeViewRendererProps } from "@tiptap/core";
import { Decoration, DecorationSource } from "prosemirror-view";

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const CustomImage = Image.extend({
  renderHTML({ HTMLAttributes }) {
    const { class: className, ...attrs } = HTMLAttributes;
    return [
      "div",
      { class: "image-wrapper" },
      ["img", { ...attrs, class: `${className || ""} block max-w-full mx-auto` }],
    ];
  },
  addNodeView() {
    return ({ node, HTMLAttributes }: NodeViewRendererProps) => {
      const container = document.createElement("div");
      container.className = "image-wrapper relative";

      const img = document.createElement("img");
      Object.entries(HTMLAttributes).forEach(([key, value]) => {
        img.setAttribute(key, value as string);
      });

      img.className = "block max-w-full mx-auto rounded-lg";
      container.appendChild(img);

      if (node.attrs.alt) {
        const caption = document.createElement("em");
        caption.className = "block text-center mt-2 text-sm text-gray-400";
        caption.textContent = node.attrs.alt;
        container.appendChild(caption);
      }

      return {
        dom: container,
        update: (
          node: ProseMirrorNode,
          decorations: readonly Decoration[],
          innerDecorations: DecorationSource
        ) => {
          if (node.type.name !== "image") return false;

          Object.entries(node.attrs).forEach(([key, value]) => {
            img.setAttribute(key, value as string);
          });

          // Update caption if it exists
          if (node.attrs.alt) {
            const caption = container.querySelector("em");
            if (caption) {
              caption.textContent = node.attrs.alt;
            } else {
              const newCaption = document.createElement("em");
              newCaption.className = "block text-center mt-2 text-sm text-gray-400";
              newCaption.textContent = node.attrs.alt;
              container.appendChild(newCaption);
            }
          }

          return true;
        },
      };
    };
  },
});

export function Editor({ value, onChange, placeholder }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({}),
      CustomImage.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto my-4",
          loading: "lazy",
        },
        allowBase64: true,
        inline: false,
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "prose prose-invert min-h-[500px] w-full text-white focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      const setContent = async () => {
        const htmlContent = await markdownToHtml(value);
        editor.commands.setContent(htmlContent);

        // Force image refresh
        setTimeout(() => {
          const images = document.querySelectorAll(".ProseMirror img");
          Array.from(images).forEach((element) => {
            const img = element as HTMLImageElement;
            const src = img.src;
            img.src = "";
            requestAnimationFrame(() => {
              img.src = src;
            });
          });
        }, 50);
      };

      setContent();
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
