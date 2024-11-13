import { Metadata } from "next";
import { DashboardHeader } from "@/components/dashboard/header";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth.config";
import { redirect } from "next/navigation";
import { ArticleEditor } from "@/components/dashboard/article-editor";
import { db } from "@/db";
import { articles, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SourcesList } from "@/components/dashboard/sources-list";
import { ImageGrid } from "@/components/dashboard/image-grid";
import { VideoList } from "@/components/dashboard/video-list";
import { Button } from "@/components/ui/button";
import { SidebarOpen } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface PageProps {
  params: Promise<{ articleId: string }>;
}

// Dynamic metadata generation
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { articleId } = await params;

  const article = await db.query.articles.findFirst({
    where: eq(articles.id, parseInt(articleId)),
  });

  if (!article) {
    return {
      title: "Article Not Found",
      description: "The requested article could not be found",
    };
  }

  return {
    title: `${article.title}`,
    description: article.metadata?.description || "Edit and manage your AI-generated article",
    keywords: article.metadata?.keywords || [],
    openGraph: {
      title: article.title,
      description: article.metadata?.description || "Edit and manage your AI-generated article",
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      authors: ["AI Content Platform"],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.metadata?.description || "Edit and manage your AI-generated article",
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const sessionPromise = getServerSession(authOptions);
  const { articleId } = await params;

  // Parallel data fetching
  const [session, article] = await Promise.all([
    sessionPromise,
    db.query.articles.findFirst({
      where: eq(articles.id, parseInt(articleId)),
    }),
  ]);

  if (!session?.user?.email) {
    redirect("/");
  }

  const dbUser = await db.query.users.findFirst({
    where: eq(users.email, session.user.email),
  });

  if (!dbUser) {
    redirect("/");
  }

  if (!article || article.userId !== dbUser.id) {
    redirect("/dashboard");
  }

  const videoSources = article.sources?.filter((source) => source.source === "video") || [];
  const hasVideos = videoSources.length > 0;

  const SidePanel = () => (
    <div className="space-y-6">
      <ImageGrid sources={article.sources || []} />
      {hasVideos && (
        <>
          <div className="w-full h-px bg-white/10" />
          <VideoList sources={article.sources || []} />
        </>
      )}
      <div className="w-full h-px bg-white/10" />
      <SourcesList sources={article.sources || []} />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <DashboardHeader user={session.user} />
      <div className="flex-1 flex">
        <main className="flex-1 container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Mobile Drawer Trigger */}
          <div className="lg:hidden mb-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="border-white/10">
                  <SidebarOpen className="h-4 w-4 mr-2" />
                  View Sources
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[90%] sm:w-[440px] bg-gray-950 border-white/10 p-6"
              >
                <SidePanel />
              </SheetContent>
            </Sheet>
          </div>

          <ArticleEditor articleId={parseInt(articleId)} initialArticle={article} />
        </main>

        {/* Desktop Side Panel */}
        <aside className="hidden lg:block w-80 border-l border-white/10 p-6">
          <SidePanel />
        </aside>
      </div>
    </div>
  );
}
