import { DashboardHeader } from "@/components/dashboard/header";
import { ArticleEditorSkeleton } from "@/components/dashboard/article-editor-skeleton";

// Create a placeholder user for loading state
const placeholderUser = {
  id: "",
  name: "",
  email: "",
  image: null,
};

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <DashboardHeader user={placeholderUser} />
      <main className="flex-1">
        <ArticleEditorSkeleton />
      </main>
    </div>
  );
}
