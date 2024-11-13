export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="h-10 w-48 bg-gray-800 rounded-lg animate-pulse mx-auto" />
          <div className="h-6 w-96 bg-gray-800 rounded-lg animate-pulse mx-auto" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex flex-col rounded-lg border border-gray-800 bg-gray-800/50 p-6"
            >
              {/* Title skeleton */}
              <div className="h-6 w-3/4 bg-gray-700 rounded animate-pulse mb-4" />

              {/* Content skeleton */}
              <div className="space-y-3 mb-4">
                <div className="h-4 w-full bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-4/6 bg-gray-700 rounded animate-pulse" />
              </div>

              {/* Footer skeleton */}
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-700">
                <div className="flex items-center space-x-4">
                  <div className="h-4 w-24 bg-gray-700 rounded animate-pulse" />
                  <div className="h-4 w-20 bg-gray-700 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
