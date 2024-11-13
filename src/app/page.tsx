"use client";
import { useEffect } from "react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Pen, Loader2 } from "lucide-react";
import { BlogNav } from "@/components/blog/nav";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  const handleGoogleSignIn = async () => {
    try {
      await signIn("google", {
        callbackUrl: "/dashboard",
      });
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  // Show loading state while checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-900" />
      </div>
    );
  }

  // Only show login page if not authenticated
  if (!session) {
    return (
      <div className="min-h-screen w-full dark flex flex-col bg-gradient-to-br from-background to-secondary">
        <BlogNav session={session} />
        <div className="flex-1 flex items-center justify-center">
          <div className="relative w-full max-w-md px-4 py-8">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 blur-3xl" />
            <Card className="relative border-muted/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <CardContent className="pt-8">
                <div className="flex flex-col items-center space-y-6">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Pen className="h-8 w-8 text-primary" />
                  </div>
                  <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-bold tracking-tighter">Welcome to Rytr</h1>
                    <p className="text-sm text-muted-foreground">
                      AI-Powered SEO Blog Writing Platform
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full relative flex items-center justify-center space-x-2 h-12"
                    onClick={handleGoogleSignIn}
                  >
                    <svg className="absolute left-4 h-5 w-5" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col text-center text-sm text-muted-foreground">
                <p>
                  By continuing, you agree to Rytr&apos;s{" "}
                  <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
                    Privacy Policy
                  </Link>
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
