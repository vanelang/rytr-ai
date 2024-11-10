"use client";
import { DashboardHeader } from "@/components/dashboard/header";
import { ArticleList } from "@/components/dashboard/article-list";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { UpgradeDialog } from "@/components/dashboard/upgrade-dialog";
import type { User } from "next-auth";

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
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

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
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (session?.user) {
      fetchArticles();
    }
  }, [session]);

  const handleArticleCreated = async () => {
    // Check if user has reached the limit
    const currentMonthArticles = getCurrentMonthArticles();
    const articleLimit = userPlan?.features.articleLimit || 0;
    const isUnlimited = articleLimit === -1;

    if (!isUnlimited && currentMonthArticles.length >= articleLimit) {
      setShowUpgradeDialog(true);
      return;
    }

    await fetchArticles();
  };

  if (loading || !session) {
    return (
      <div className="min-h-screen flex flex-col bg-black">
        <DashboardSkeleton user={session?.user || null} />
      </div>
    );
  }

  const currentMonthArticles = getCurrentMonthArticles();
  const articleLimit = userPlan?.features.articleLimit || 0;
  const isUnlimited = articleLimit === -1;
  const usagePercentage = isUnlimited ? 0 : (currentMonthArticles.length / articleLimit) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <DashboardHeader user={session.user} />
      <div className="flex-1 flex">
        {/* Main Content */}
        <main className="flex-1 container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <ArticleList
            initialArticles={articles}
            onArticleCreated={handleArticleCreated}
            isGenerating={isGenerating}
            setIsGenerating={setIsGenerating}
            onLimitReached={() => setShowUpgradeDialog(true)}
            currentMonthCount={currentMonthArticles.length}
            articleLimit={articleLimit}
            isUnlimited={isUnlimited}
          />
        </main>

        {/* Side Panel */}
        <aside className="hidden lg:block w-80 border-l border-white/10 p-6 space-y-6">
          {!isUnlimited && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-white">Usage Overview</h3>
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Info className="h-4 w-4 text-primary" />
                        <span className="text-sm text-white">Monthly Articles</span>
                      </div>
                      <span className="text-sm font-medium text-white">
                        {currentMonthArticles.length} / {articleLimit}
                      </span>
                    </div>
                    <Progress value={usagePercentage} className="h-2 bg-white/10" />
                    <p className="text-xs text-white/80">
                      {articleLimit - currentMonthArticles.length} articles remaining this month
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          {/* Add more sidebar content here */}
        </aside>
      </div>

      <UpgradeDialog isOpen={showUpgradeDialog} onClose={() => setShowUpgradeDialog(false)} />
    </div>
  );
}
