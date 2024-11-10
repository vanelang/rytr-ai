import { DashboardHeader } from "@/components/dashboard/header";
import { ArticleEditorSkeleton } from "@/components/dashboard/article-editor-skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <main className="flex-1">
        <ArticleEditorSkeleton />
      </main>
    </div>
  );
}
