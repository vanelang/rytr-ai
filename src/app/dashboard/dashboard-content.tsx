"use client";
import { DashboardHeader } from "@/components/dashboard/header";
import { ArticleList } from "@/components/dashboard/article-list";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

interface Article {
  id: number;
  title: string;
  status: "draft" | "published";
  createdAt: Date;
  content?: string;
  sources?: any[];
}

export function DashboardContent() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingArticles, setProcessingArticles] = useState<number[]>([]);
  const [recentArticles, setRecentArticles] = useState<number[]>([]); // Track recently created articles

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  const fetchArticles = async () => {
    try {
      const response = await fetch("/api/articles");
      if (!response.ok) throw new Error("Failed to fetch articles");
      const data = await response.json();
      setArticles(data.articles);

      // Update processing articles list
      const processing = data.articles
        .filter((article: Article) => article.status === "draft")
        .map((article: Article) => article.id);
      setProcessingArticles(processing);
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkArticleStatus = useCallback(async () => {
    if (processingArticles.length === 0) return;

    try {
      const response = await fetch("/api/articles/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ articleIds: processingArticles }),
      });

      if (!response.ok) throw new Error("Failed to check article status");

      const data = await response.json();

      // Update completed articles
      if (data.completed.length > 0) {
        setArticles((prevArticles) => {
          const updatedArticles = [...prevArticles];
          data.completed.forEach((completedArticle: Article) => {
            const index = updatedArticles.findIndex((a) => a.id === completedArticle.id);
            if (index !== -1) {
              updatedArticles[index] = {
                ...updatedArticles[index],
                ...completedArticle,
              };
            }
          });
          return updatedArticles;
        });

        // Remove completed articles from processing list
        setProcessingArticles((prev) =>
          prev.filter((id) => !data.completed.some((a: Article) => a.id === id))
        );

        // Remove from recent articles list
        setRecentArticles((prev) =>
          prev.filter((id) => !data.completed.some((a: Article) => a.id === id))
        );
      }

      // Handle failed articles
      data.processing.forEach((status: any) => {
        if (status.status === "failed") {
          setProcessingArticles((prev) => prev.filter((id) => id !== status.articleId));
          setRecentArticles((prev) => prev.filter((id) => id !== status.articleId));
        }
      });
    } catch (error) {
      console.error("Error checking article status:", error);
    }
  }, [processingArticles]);

  // Initial fetch
  useEffect(() => {
    if (session?.user) {
      fetchArticles();
    }
  }, [session]);

  // Frequent status check for recent articles (every 5 seconds)
  useEffect(() => {
    if (recentArticles.length === 0) return;

    const intervalId = setInterval(checkArticleStatus, 5000); // Check every 5 seconds

    // After 1 minute, remove from recent articles
    const timeoutId = setTimeout(() => {
      setRecentArticles([]);
    }, 60000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [recentArticles, checkArticleStatus]);

  // Regular status polling for older processing articles
  useEffect(() => {
    if (processingArticles.length === 0) return;

    const intervalId = setInterval(checkArticleStatus, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, [processingArticles, checkArticleStatus]);

  // Add article to recent list when created
  const handleArticleCreated = async () => {
    await fetchArticles();
    // Add newly created articles to recent list
    const newArticles = articles
      .filter((article) => article.status === "draft")
      .map((article) => article.id);
    setRecentArticles((prev) => [...new Set([...prev, ...newArticles])]);
  };

  // Show skeleton immediately while checking auth and loading data
  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen flex-col bg-black text-white">
        <DashboardSkeleton user={null} />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <DashboardHeader user={session.user} />
      <main className="flex-1">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <ArticleList
            initialArticles={articles}
            onArticleCreated={handleArticleCreated}
            processingArticles={processingArticles}
          />
        </div>
      </main>
    </div>
  );
}
