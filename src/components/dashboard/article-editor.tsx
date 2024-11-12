"use client";
import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Save,
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Code as CodeIcon,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Image as ImageIcon,
} from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { markdownToHtml, htmlToMarkdown } from "@/lib/markdown";
import { IBM_Plex_Mono } from "next/font/google";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import History from "@tiptap/extension-history";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import CodeExtension from "@tiptap/extension-code";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import Blockquote from "@tiptap/extension-blockquote";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { ResearchSource } from "@/db/schema";
import { Node as ProseMirrorNode } from "prosemirror-model";
import { NodeViewRenderer, NodeViewRendererProps } from "@tiptap/core";

interface Article {
  id: number;
  title: string;
  content: string | null;
  status: "draft" | "published" | "failed";
  metadata?: {
    keywords: string[];
    description: string;
    readingTime: number;
    error?: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  sources?: ResearchSource[] | null;
}

interface ArticleEditorProps {
  articleId: number;
  initialArticle: Article;
}

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
});

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  const addImage = useCallback(() => {
    const url = window.prompt("Enter the URL of the image:");
    if (url) {
      editor
        .chain()
        .focus()
        .setImage({
          src: url,
          alt: "Image",
          title: "Image",
        })
        .createParagraph()
        .run();
    }
  }, [editor]);

  return (
    <div className="border-b border-white/10 p-2 flex gap-1 flex-wrap">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`text-white/70 hover:text-white hover:bg-white/10 ${
          editor.isActive("bold") ? "bg-white/10 text-white" : ""
        }`}
      >
        <BoldIcon className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`text-white/70 hover:text-white hover:bg-white/10 ${
          editor.isActive("italic") ? "bg-white/10 text-white" : ""
        }`}
      >
        <ItalicIcon className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        className={`text-white/70 hover:text-white hover:bg-white/10 ${
          editor.isActive("code") ? "bg-white/10 text-white" : ""
        }`}
      >
        <CodeIcon className="h-4 w-4" />
      </Button>
      <div className="w-px h-6 bg-white/10 mx-1" />
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`text-white/70 hover:text-white hover:bg-white/10 ${
          editor.isActive("heading", { level: 1 }) ? "bg-white/10 text-white" : ""
        }`}
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`text-white/70 hover:text-white hover:bg-white/10 ${
          editor.isActive("heading", { level: 2 }) ? "bg-white/10 text-white" : ""
        }`}
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <div className="w-px h-6 bg-white/10 mx-1" />
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`text-white/70 hover:text-white hover:bg-white/10 ${
          editor.isActive("bulletList") ? "bg-white/10 text-white" : ""
        }`}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`text-white/70 hover:text-white hover:bg-white/10 ${
          editor.isActive("orderedList") ? "bg-white/10 text-white" : ""
        }`}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`text-white/70 hover:text-white hover:bg-white/10 ${
          editor.isActive("blockquote") ? "bg-white/10 text-white" : ""
        }`}
      >
        <Quote className="h-4 w-4" />
      </Button>
      <div className="w-px h-6 bg-white/10 mx-1" />
      <Button
        size="sm"
        variant="ghost"
        onClick={addImage}
        className="text-white/70 hover:text-white hover:bg-white/10"
      >
        <ImageIcon className="h-4 w-4" />
      </Button>
    </div>
  );
};

// Add a custom image node extension
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
        update: (node: ProseMirrorNode, decorations: any) => {
          if (node.type.name !== "image") return false;

          // Update image attributes
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

export function ArticleEditor({ articleId, initialArticle }: ArticleEditorProps) {
  const router = useRouter();
  const [article, setArticle] = useState(initialArticle);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const editor = useEditor(
    {
      extensions: [
        Document,
        Paragraph,
        Text,
        History,
        Bold,
        Italic,
        CodeExtension,
        Heading,
        BulletList,
        OrderedList,
        ListItem,
        Blockquote,
        Link.configure({
          openOnClick: false,
        }),
        CustomImage.configure({
          HTMLAttributes: {
            class: "rounded-lg max-w-full h-auto my-4",
            loading: "lazy",
          },
          allowBase64: true,
          inline: false,
        }),
        StarterKit.configure({
          document: false,
          paragraph: false,
          text: false,
          history: false,
          bold: false,
          italic: false,
          strike: false,
          code: false,
          heading: false,
          bulletList: false,
          orderedList: false,
          listItem: false,
          blockquote: false,
          codeBlock: {
            HTMLAttributes: {
              spellcheck: false,
            },
          },
        }),
        Placeholder.configure({
          placeholder: "Start writing your article...",
        }),
      ],
      content: content,
      editorProps: {
        attributes: {
          class: `prose prose-invert prose-headings:text-white prose-p:text-gray-300 prose-blockquote:text-gray-300 prose-strong:text-white prose-code:text-white prose-pre:bg-gray-800/50 prose-pre:text-gray-300 prose-code:font-[var(--font-ibm-plex-mono),_monospace] prose-pre:font-[var(--font-ibm-plex-mono),_monospace] prose-img:rounded-lg prose-img:mx-auto prose-img:max-w-2xl prose-img:shadow-lg max-w-none focus:outline-none min-h-[500px] px-4 py-2`,
        },
      },
      parseOptions: {
        preserveWhitespace: true,
      },
    },
    [initialArticle.id]
  );

  useEffect(() => {
    const initializeContent = async () => {
      if (initialArticle.content) {
        try {
          console.log("Original markdown:", initialArticle.content);
          const htmlContent = await markdownToHtml(initialArticle.content);
          console.log("Converted HTML:", htmlContent);

          if (editor && !editor.isDestroyed) {
            // Clear and set content with a small delay to ensure proper rendering
            editor.commands.clearContent();
            setTimeout(() => {
              editor.commands.setContent(htmlContent);
              editor.commands.focus("end");

              // Force image refresh
              const images = document.querySelectorAll(".ProseMirror img");
              // @ts-ignore
              images.forEach((img: HTMLImageElement) => {
                const src = img.src;
                img.src = "";
                requestAnimationFrame(() => {
                  img.src = src;
                });
              });
            }, 50);
          }
          setContent(htmlContent);
        } catch (error) {
          console.error("Error converting markdown to HTML:", error);
        }
      }
    };

    initializeContent();
  }, [initialArticle.content, editor]);

  const handleSave = useCallback(async () => {
    if (!article) return;

    setSaving(true);
    try {
      const markdownContent = await htmlToMarkdown(content);

      const response = await fetch(`/api/articles/${article.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: markdownContent }),
      });

      if (!response.ok) {
        throw new Error("Failed to save article");
      }

      router.refresh();
    } catch (error) {
      console.error("Error saving article:", error);
    } finally {
      setSaving(false);
    }
  }, [content, article, router]);

  const getStatusDisplay = (status: Article["status"]) => {
    switch (status) {
      case "published":
        return <span className="text-green-400">Published</span>;
      case "failed":
        return <span className="text-red-400">Failed</span>;
      default:
        return <span className="text-yellow-400">Draft</span>;
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error("Image failed to load:", e.currentTarget.src);
    e.currentTarget.style.border = "2px dashed red";
    e.currentTarget.style.padding = "1rem";
    e.currentTarget.style.display = "block";
    e.currentTarget.style.width = "100%";
    e.currentTarget.style.textAlign = "center";
    e.currentTarget.style.background = "rgba(255,0,0,0.1)";
  };

  if (!article) {
    return null;
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
        <h1 className="text-lg sm:text-xl font-semibold text-white">{article.title}</h1>
        <div className="flex items-center gap-4">
          {getStatusDisplay(article.status)}
          <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span className="ml-2 hidden sm:inline">Save</span>
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-black/50">
        <div className="overflow-x-auto">
          <MenuBar editor={editor} />
        </div>
        <div className="overflow-y-auto max-h-[calc(100vh-250px)]">
          <EditorContent
            editor={editor}
            className="prose-img:max-w-2xl prose-img:mx-auto"
            onError={(e) => {
              if (e.target instanceof HTMLImageElement) {
                handleImageError(e as React.SyntheticEvent<HTMLImageElement, Event>);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
