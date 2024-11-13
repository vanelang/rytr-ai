export default function BlogArticleLoading() {
  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back button skeleton */}
        <div className="h-6 w-32 bg-gray-800 rounded animate-pulse mb-8" />

        <article>
          <header className="mb-8">
            {/* Title skeleton */}
            <div className="h-12 w-3/4 bg-gray-800 rounded-lg animate-pulse mb-6" />

            {/* Author and metadata skeleton */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                {/* Avatar skeleton */}
                <div className="h-10 w-10 rounded-full bg-gray-800 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-gray-800 rounded animate-pulse" />
                  <div className="h-3 w-48 bg-gray-800 rounded animate-pulse" />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {/* Date and reading time skeleton */}
                <div className="h-4 w-32 bg-gray-800 rounded animate-pulse" />
                <div className="h-4 w-24 bg-gray-800 rounded animate-pulse" />
              </div>
            </div>
          </header>

          {/* Content skeleton */}
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-4 w-full bg-gray-800 rounded animate-pulse"
                style={{ width: `${Math.random() * 40 + 60}%` }}
              />
            ))}
          </div>

          {/* Footer skeleton */}
          <footer className="mt-12 pt-8 border-t border-gray-800">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="h-8 w-24 bg-gray-800 rounded animate-pulse" />
              <div className="flex space-x-4">
                <div className="h-8 w-8 bg-gray-800 rounded animate-pulse" />
                <div className="h-8 w-8 bg-gray-800 rounded animate-pulse" />
              </div>
            </div>
          </footer>
        </article>
      </main>
    </div>
  );
}
