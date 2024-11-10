import { DashboardHeader } from "@/components/dashboard/header";
import { ArticleEditorSkeleton } from "@/components/dashboard/article-editor-skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <main className="flex-1 flex">
        <div className="flex-1 container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <ArticleEditorSkeleton />
        </div>

        {/* Side Panel Skeleton */}
        <aside className="hidden lg:block w-80 border-l border-white/10 p-6 space-y-6">
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
