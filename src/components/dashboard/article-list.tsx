"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, Plus, Loader2, Trash2 } from "lucide-react";
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
  const [deleteArticleId, setDeleteArticleId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleTitleSelect = async (title: string) => {
    setIsModalOpen(false);
    await onArticleCreated();
  };

  const handleArticleClick = (articleId: number) => {
    router.push(`/dashboard/articles/${articleId}`);
  };

  const handleDeleteClick = (e: React.MouseEvent, articleId: number) => {
    e.stopPropagation();
    setDeleteArticleId(articleId);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteArticleId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/articles/${deleteArticleId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete article");
      }

      onArticleCreated();
    } catch (error) {
      console.error("Error deleting article:", error);
    } finally {
      setIsDeleting(false);
      setDeleteArticleId(null);
    }
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
              className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur transition-colors hover:bg-white/10 cursor-pointer"
            >
              <div>
                <h3 className="font-medium text-white">{article.title}</h3>
                <p className="mt-1 text-sm text-white/70">
                  Created {format(new Date(article.createdAt), "PPP")}
                </p>
              </div>
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => handleDeleteClick(e, article.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-400" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <TitleGeneratorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTitleSelect={handleTitleSelect}
      />

      <Dialog open={deleteArticleId !== null} onOpenChange={() => setDeleteArticleId(null)}>
        <DialogContent className="bg-black/95 border border-red-500/20 text-white shadow-xl shadow-red-500/10 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-xl text-white flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-400" />
              Delete Article
            </DialogTitle>
            <DialogDescription className="text-white/70 pt-2 text-base">
              This will permanently delete your article and all of its content.
              <span className="block mt-2 text-red-400 font-medium">
                This action cannot be undone.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setDeleteArticleId(null)}
              disabled={isDeleting}
              className="text-white hover:bg-white/10 hover:text-white border border-white/10"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Article
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
