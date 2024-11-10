"use client";
import { DashboardHeader } from "@/components/dashboard/header";
import { ArticleList } from "@/components/dashboard/article-list";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Progress } from "@/components/ui/progress";
import { Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { UpgradeDialog } from "@/components/dashboard/upgrade-dialog";

interface Article {
  id: number;
  title: string;
  status: "draft" | "published";
  createdAt: Date;
  content?: string;
  sources?: any[];
}

interface UserPlan {
  features: {
    articleLimit: number;
  };
}

export function DashboardContent() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [articles, setArticles] = useState<Article[]>([]);
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingArticles, setProcessingArticles] = useState<number[]>([]);
  const [recentArticles, setRecentArticles] = useState<number[]>([]);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  // Get current month's articles
  const getCurrentMonthArticles = () => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    return articles.filter((article) => new Date(article.createdAt) >= startOfMonth);
  };

  // Fetch user's plan
  const fetchUserPlan = async () => {
    try {
      const response = await fetch("/api/user/plan");
      if (!response.ok) throw new Error("Failed to fetch user plan");
      const data = await response.json();
      setUserPlan(data.plan);
    } catch (error) {
      console.error("Error fetching user plan:", error);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchUserPlan();
    }
  }, [session]);

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
    // Check if user has reached the limit
    const currentMonthArticles = getCurrentMonthArticles();
    const articleLimit = userPlan?.features.articleLimit || 0;

    if (!isUnlimited && currentMonthArticles.length >= articleLimit) {
      setShowUpgradeDialog(true);
      return;
    }

    await fetchArticles();
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

  const currentMonthArticles = getCurrentMonthArticles();
  const articleLimit = userPlan?.features.articleLimit || 0;
  const isUnlimited = articleLimit === -1;
  const articlesUsed = currentMonthArticles.length;
  const articlesRemaining = isUnlimited ? -1 : Math.max(0, articleLimit - articlesUsed);
  const usagePercentage = isUnlimited ? 0 : (articlesUsed / articleLimit) * 100;

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <DashboardHeader user={session.user} />
      <main className="flex-1">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Article Usage Stats */}
          <Card className="mb-8 bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-medium text-white">Article Usage</h2>
                <span className="text-xs text-white/70">
                  {isUnlimited
                    ? "Unlimited Articles"
                    : `${articlesUsed} of ${articleLimit} articles used this month`}
                </span>
              </div>
              {!isUnlimited && (
                <>
                  <Progress value={usagePercentage} className="h-2 mb-2" />
                  <div className="flex items-center gap-2 text-xs text-white/70">
                    <Info className="h-4 w-4" />
                    {articlesRemaining === 0 ? (
                      <span className="text-yellow-400">
                        You've reached your monthly article limit. Consider upgrading your plan for
                        more articles.
                      </span>
                    ) : (
                      <span>
                        {articlesRemaining} article{articlesRemaining !== 1 ? "s" : ""} remaining
                        this month
                      </span>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <ArticleList
            initialArticles={articles}
            onArticleCreated={handleArticleCreated}
            processingArticles={processingArticles}
          />

          {/* Add Upgrade Dialog */}
          <UpgradeDialog isOpen={showUpgradeDialog} onClose={() => setShowUpgradeDialog(false)} />
        </div>
      </main>
    </div>
  );
}
