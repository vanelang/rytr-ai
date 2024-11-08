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
        <div className="container py-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-8 w-48 bg-white/5 rounded animate-pulse" />
              <div className="h-10 w-32 bg-white/5 rounded animate-pulse" />
            </div>
            <div className="space-y-4">
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
