"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { DashboardContent } from "./dashboard-content";
import { useEffect, useState } from "react";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/");
    }
  }, [status]);

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

  if (status === "loading") {
    return null;
  }

  if (!session?.user) return null;

  if (loading) {
    return <DashboardSkeleton user={session.user} />;
  }

  return (
    <DashboardContent user={session.user} articles={articles} onArticleCreated={fetchArticles} />
  );
}
