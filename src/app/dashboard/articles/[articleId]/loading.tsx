import { Metadata } from "next";
import { DashboardHeader } from "@/components/dashboard/header";
import { ArticleEditorSkeleton } from "@/components/dashboard/article-editor-skeleton";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Loading Article | AI Content Platform",
  description: "Loading your article content...",
  robots: "noindex, nofollow", // Prevent indexing of loading states
};

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <main className="flex-1 flex">
        <div className="flex-1 container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <ArticleEditorSkeleton />
        </div>

        {/* Side Panel Skeleton */}
        <aside className="hidden lg:block w-80 border-l border-white/10 p-6 space-y-6">
          {/* Image Grid Skeleton */}
          <div className="space-y-4">
            <div className="h-5 w-20 bg-white/5 rounded animate-pulse" />
            <div className="grid grid-cols-2 gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square rounded-lg bg-white/5 animate-pulse" />
              ))}
            </div>
          </div>

          <div className="w-full h-px bg-white/5" />

          {/* Sources List Skeleton */}
          <div className="space-y-4">
            <div className="h-5 w-20 bg-white/5 rounded animate-pulse" />
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="h-4 w-3/4 bg-white/10 rounded animate-pulse" />
                      <div className="h-12 w-full bg-white/10 rounded animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
