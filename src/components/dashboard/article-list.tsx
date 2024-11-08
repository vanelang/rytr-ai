"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FileText, Plus, Loader2 } from "lucide-react";
import { TitleGeneratorModal } from "./title-generator-modal";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

type Article = {
  id: number;
  title: string;
  status: "draft" | "published";
  createdAt: Date;
};

interface ArticleListProps {
  initialArticles: Article[];
  onArticleCreated: () => void;
}

export function ArticleList({ initialArticles, onArticleCreated }: ArticleListProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTitleSelect = async (title: string) => {
    setIsModalOpen(false);
    await onArticleCreated();
  };

  const handleArticleClick = (articleId: number) => {
    router.push(`/dashboard/articles/${articleId}`);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Articles</h1>
          <p className="mt-1 text-sm text-white/70">Create and manage your AI-powered content</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90" onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Article
        </Button>
      </div>

      {initialArticles.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center gap-4">
          <div className="relative w-60 h-60">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 blur-3xl" />
            <div className="relative flex h-full items-center justify-center rounded-xl border border-white/10 bg-black/50 p-8 backdrop-blur">
              <FileText className="h-20 w-20 text-white/20" />
            </div>
          </div>
          <h2 className="text-xl font-semibold">No articles yet</h2>
          <p className="text-center text-white/70">
            Get started by creating a new article.
            <br />
            Your AI-powered writing journey begins here.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {initialArticles.map((article) => (
            <div
              key={article.id}
              onClick={() => handleArticleClick(article.id)}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur transition-colors hover:bg-white/10 cursor-pointer"
            >
              <div>
                <h3 className="font-medium text-white">{article.title}</h3>
                <p className="mt-1 text-sm text-white/70">
                  Created {format(new Date(article.createdAt), "PPP")}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  article.status === "published"
                    ? "bg-green-500/10 text-green-400"
                    : "bg-yellow-500/10 text-yellow-400"
                }`}
              >
                {article.status}
              </span>
            </div>
          ))}
        </div>
      )}

      <TitleGeneratorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTitleSelect={handleTitleSelect}
      />
    </>
  );
}
