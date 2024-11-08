"use client";
import { DashboardHeader } from "@/components/dashboard/header";
import { ArticleList } from "@/components/dashboard/article-list";
import { User } from "next-auth";

interface Article {
  id: number;
  title: string;
  status: "draft" | "published";
  content: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

interface DashboardContentProps {
  user: User;
  initialArticles: Article[];
}

export function DashboardContent({ user, initialArticles }: DashboardContentProps) {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <DashboardHeader user={user} />
      <main className="flex-1">
        <div className="container py-8">
          <ArticleList initialArticles={initialArticles} />
        </div>
      </main>
    </div>
  );
}
