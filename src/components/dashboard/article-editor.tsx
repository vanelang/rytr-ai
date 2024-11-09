"use client";
import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Save,
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
} from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { markdownToHtml, htmlToMarkdown } from "@/lib/markdown";

interface Article {
  id: number;
  title: string;
  content: string | null;
  status: "draft" | "published";
}

interface ArticleEditorProps {
  articleId: number;
  initialArticle: Article;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

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
        <Bold className="h-4 w-4" />
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
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={`text-white/70 hover:text-white hover:bg-white/10 ${
          editor.isActive("strike") ? "bg-white/10 text-white" : ""
        }`}
      >
        <Strikethrough className="h-4 w-4" />
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
        <Code className="h-4 w-4" />
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
    </div>
  );
};

export function ArticleEditor({ articleId, initialArticle }: ArticleEditorProps) {
  const router = useRouter();
  const [article, setArticle] = useState(initialArticle);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start writing your article...",
      }),
    ],
    content: content,
    editorProps: {
      attributes: {
        class:
          "prose prose-invert prose-headings:text-white prose-p:text-gray-300 prose-blockquote:text-gray-300 prose-strong:text-white prose-code:text-white prose-pre:bg-gray-800/50 prose-pre:text-gray-300 max-w-none focus:outline-none min-h-[500px] px-4 py-2",
      },
    },
    onUpdate: ({ editor }) => {
      if (saving) return;
      setContent(editor.getHTML());
    },
  });

  useEffect(() => {
    const initializeContent = async () => {
      if (initialArticle.content) {
        const htmlContent = await markdownToHtml(initialArticle.content);
        setContent(htmlContent);
        editor?.commands.setContent(htmlContent);
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

  if (!article) {
    return null;
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
        <h1 className="text-lg sm:text-xl font-semibold text-white">{article.title}</h1>
        <div className="flex items-center gap-4">
          {article.status === "draft" ? (
            <div className="flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium bg-yellow-500/10 text-yellow-400">
              <Loader2 className="h-3 w-3 animate-spin" />
              Processing
            </div>
          ) : (
            <span className="rounded-full px-3 py-1 text-xs font-medium bg-green-500/10 text-green-400">
              Published
            </span>
          )}
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
        <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
