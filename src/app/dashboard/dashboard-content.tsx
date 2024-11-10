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
      <main className="flex-1 container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {!isUnlimited && (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Info className="h-5 w-5 text-primary mt-1 shrink-0" />
                <div className="space-y-2 w-full">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white">
                      Monthly Article Usage: {currentMonthArticles.length} / {articleLimit}
                    </p>
                    <span className="text-xs text-white">{Math.round(usagePercentage)}%</span>
                  </div>
                  <Progress value={usagePercentage} className="h-2 bg-white/10" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          <ArticleList
            initialArticles={articles}
            onArticleCreated={handleArticleCreated}
            isGenerating={isGenerating}
            setIsGenerating={setIsGenerating}
          />
        </div>

        <UpgradeDialog isOpen={showUpgradeDialog} onClose={() => setShowUpgradeDialog(false)} />
      </main>
    </div>
  );
}
