"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { Editor } from "@/components/editor";
import { Preview } from "@/components/preview";
import { htmlToMarkdown } from "@/lib/markdown";

interface Article {
  id: number;
  title: string;
  content: string | null;
  status: "draft" | "published";
}

interface ArticleEditorProps {
  article: Article;
}

export function ArticleEditor({ article }: ArticleEditorProps) {
  const router = useRouter();
  const [content, setContent] = useState(article.content || "");
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/articles/${article.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
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
  }, [content, article.id, router]);

  const handleEditorChange = (html: string) => {
    const markdown = htmlToMarkdown(html);
    setContent(markdown);
  };

  return (
    <div className="container py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">{article.title}</h1>
        <div className="flex items-center gap-4">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              article.status === "published"
                ? "bg-green-500/10 text-green-400"
                : "bg-yellow-500/10 text-yellow-400"
            }`}
          >
            {article.status}
          </span>
          <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span className="ml-2">Save</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="rounded-lg border border-white/10 bg-black/50 p-4">
          <Editor
            value={content}
            onChange={handleEditorChange}
            placeholder="Start writing your article..."
          />
        </div>
        <div className="rounded-lg border border-white/10 bg-black/50 p-4 overflow-auto max-h-[calc(100vh-200px)]">
          <Preview content={content} />
        </div>
      </div>
    </div>
  );
}
