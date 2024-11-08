import { Loader2 } from "lucide-react";

export function ArticleEditorSkeleton() {
  return (
    <div className="container py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="h-7 w-96 bg-white/10 rounded animate-pulse" />
        <div className="flex items-center gap-4">
          <div className="h-6 w-24 bg-white/10 rounded-full animate-pulse" />
          <div className="h-9 w-24 bg-white/10 rounded animate-pulse" />
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-black/50 p-4 overflow-auto max-h-[calc(100vh-200px)]">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="h-6 w-2/3 bg-white/10 rounded animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
                <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-white/10 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
