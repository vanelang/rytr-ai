import { Loader2 } from "lucide-react";

export function ArticleEditorSkeleton() {
  return (
    <div className="container py-6 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}
