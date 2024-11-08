import { User } from "next-auth";
import { DashboardHeader } from "./header";

interface DashboardSkeletonProps {
  user: User | null;
}

export function DashboardSkeleton({ user }: DashboardSkeletonProps) {
  return (
    <>
      {user && <DashboardHeader user={user} />}
      <main className="flex-1">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
              <div className="h-8 w-48 bg-white/5 rounded animate-pulse" />
              <div className="h-10 w-32 bg-white/5 rounded animate-pulse" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="p-4 rounded-lg border border-white/10 bg-white/5 animate-pulse"
                >
                  <div className="h-6 w-48 bg-white/5 rounded mb-2" />
                  <div className="h-4 w-24 bg-white/5 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
