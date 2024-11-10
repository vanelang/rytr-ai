export function ArticleEditorSkeleton() {
  return (
    <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="space-y-6">
        {/* Title Skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-8 w-1/3 bg-white/5 rounded animate-pulse" />
          <div className="flex items-center gap-4">
            <div className="h-10 w-24 bg-white/5 rounded animate-pulse" />
            <div className="h-10 w-24 bg-white/5 rounded animate-pulse" />
          </div>
        </div>

        {/* Editor Toolbar Skeleton */}
        <div className="h-12 w-full bg-white/5 rounded animate-pulse" />

        {/* Editor Content Skeleton */}
        <div className="rounded-lg border border-white/10 bg-black/50 p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-6 w-2/3 bg-white/5 rounded animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
                  <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-white/5 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
