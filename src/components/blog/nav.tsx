"use client";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Session } from "next-auth";

interface BlogNavProps {
  session: Session | null;
}

export function BlogNav({ session }: BlogNavProps) {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
      <div className="flex h-16">
        {/* Left side - Logo */}
        <div className="flex-1 container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-semibold transition-colors hover:opacity-90"
          >
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            <span className="bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent bg-300% animate-gradient text-2xl">
              Rytr
            </span>
          </Link>

          {/* Right side - Navigation Links and Auth */}
          <div className="ml-auto flex items-center space-x-6">
            <Link
              href="/blog"
              className="text-white hover:text-white/80 px-3 py-2 rounded-md text-sm font-medium"
            >
              Blog
            </Link>
            {session ? (
              <Link href="/dashboard">
                <Button
                  variant="outline"
                  className="border-white/10 hover:border-white/20 transition-colors"
                >
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/">
                <Button
                  variant="outline"
                  className="border-white/10 hover:border-white/20 transition-colors"
                >
                  Login with Google
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
