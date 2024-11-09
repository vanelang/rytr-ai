export function ArticleEditorSkeleton() {
  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="h-8 w-96 bg-white/10 rounded animate-pulse" />
        <div className="flex items-center gap-4">
          <div className="h-8 w-24 bg-white/10 rounded-full animate-pulse" />
          <div className="h-10 w-24 bg-white/10 rounded animate-pulse" />
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-black/50 p-6 overflow-auto max-h-[calc(100vh-200px)]">
        <div className="space-y-8">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="h-7 w-2/3 bg-white/10 rounded animate-pulse" />
              <div className="space-y-3">
                <div className="h-5 w-full bg-white/10 rounded animate-pulse" />
                <div className="h-5 w-full bg-white/10 rounded animate-pulse" />
                <div className="h-5 w-3/4 bg-white/10 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
