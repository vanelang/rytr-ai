"use client";
import { DashboardHeader } from "@/components/dashboard/header";
import { ArticleList } from "@/components/dashboard/article-list";
import { User } from "next-auth";

interface Article {
  id: number;
  title: string;
  status: "draft" | "published";
  createdAt: Date;
}

interface DashboardContentProps {
  user: User;
  articles: Article[];
  onArticleCreated: () => void;
}

export function DashboardContent({ user, articles, onArticleCreated }: DashboardContentProps) {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <DashboardHeader user={user} />
      <main className="flex-1">
        <div className="container py-8">
          <ArticleList initialArticles={articles} onArticleCreated={onArticleCreated} />
        </div>
      </main>
    </div>
  );
}
