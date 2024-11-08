"use client";
import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { Editor } from "@/components/editor";
import { htmlToMarkdown } from "@/lib/markdown";

interface Article {
  id: number;
  title: string;
  content: string | null;
  status: "draft" | "published";
}

interface ArticleEditorProps {
  articleId: number;
}

export function ArticleEditor({ articleId }: ArticleEditorProps) {
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchArticle() {
      try {
        const response = await fetch(`/api/articles/${articleId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch article");
        }
        const data = await response.json();
        setArticle(data);
        setContent(data.content || "");
      } catch (error) {
        console.error("Error fetching article:", error);
        router.push("/dashboard");
      }
    }

    fetchArticle();
  }, [articleId, router]);

  const handleSave = useCallback(async () => {
    if (!article) return;

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
  }, [content, article, router]);

  const handleEditorChange = (html: string) => {
    if (saving) return;
    const markdown = htmlToMarkdown(html);
    setContent(markdown);
  };

  if (!article) {
    return null;
  }

  return (
    <div className="container py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">{article.title}</h1>
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
            <span className="ml-2">Save</span>
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-black/50 p-4">
        <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
          <Editor
            value={content}
            onChange={handleEditorChange}
            placeholder="Start writing your article..."
          />
        </div>
      </div>
    </div>
  );
}
