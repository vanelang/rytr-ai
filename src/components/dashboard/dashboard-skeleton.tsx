import { DashboardHeader } from "./header";
import { User } from "next-auth";

interface DashboardSkeletonProps {
  user: User;
}

export function DashboardSkeleton({ user }: DashboardSkeletonProps) {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <DashboardHeader user={user} />
      <main className="flex-1">
        <div className="container py-8">
          <div className="flex justify-between items-center mb-8">
            <div className="h-8 w-32 bg-white/10 rounded animate-pulse" />
            <div className="h-10 w-40 bg-white/10 rounded animate-pulse" />
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="p-4 rounded-lg border border-white/10 bg-black/50 flex justify-between items-center"
              >
                <div className="space-y-2">
                  <div className="h-5 w-48 bg-white/10 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
                </div>
                <div className="h-8 w-24 bg-white/10 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
