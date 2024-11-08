"use client";
import { DashboardHeader } from "@/components/dashboard/header";
import { ArticleList } from "@/components/dashboard/article-list";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Article {
  id: number;
  title: string;
  status: "draft" | "published";
  createdAt: Date;
}

export function DashboardContent() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (session?.user) {
      fetchArticles();
    }
  }, [session]);

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
        <div className="container py-8">
          <ArticleList initialArticles={articles} onArticleCreated={fetchArticles} />
        </div>
      </main>
    </div>
  );
}
