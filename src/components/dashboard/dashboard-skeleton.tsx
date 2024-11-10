import { User } from "next-auth";
import { DashboardHeader } from "./header";

interface DashboardSkeletonProps {
  user: User | null;
}

export function DashboardSkeleton({ user }: DashboardSkeletonProps) {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      {user && <DashboardHeader user={user} />}
      <div className="flex-1 flex">
        {/* Main Content */}
        <main className="flex-1 container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
              <div>
                <div className="h-8 w-48 bg-white/5 rounded animate-pulse" />
                <div className="mt-1 h-4 w-64 bg-white/5 rounded animate-pulse" />
              </div>
              <div className="h-10 w-full sm:w-40 bg-white/5 rounded animate-pulse" />
            </div>

            {/* Articles Grid Skeleton */}
            <div className="mt-6 sm:mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col justify-between rounded-xl border border-white/10 bg-white/5 p-4 sm:p-6 animate-pulse"
                >
                  <div>
                    <div className="h-6 w-3/4 bg-white/5 rounded mb-2" />
                    <div className="h-4 w-1/2 bg-white/5 rounded" />
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="h-6 w-20 bg-white/5 rounded-full" />
                    <div className="h-8 w-8 bg-white/5 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Side Panel Skeleton */}
        <aside className="hidden lg:block w-80 border-l border-white/10 p-6 space-y-6">
          <div className="space-y-4">
            <div className="h-5 w-32 bg-white/5 rounded animate-pulse" />
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
                  <div className="h-4 w-16 bg-white/5 rounded animate-pulse" />
                </div>
                <div className="h-2 w-full bg-white/5 rounded animate-pulse" />
                <div className="h-4 w-36 bg-white/5 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
