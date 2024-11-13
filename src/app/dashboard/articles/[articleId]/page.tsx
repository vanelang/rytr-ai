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

  console.log(article.sources);
  const videoSources = article.sources?.filter((source) => source.source === "video") || [];
  const hasVideos = videoSources.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <DashboardHeader user={session.user} />
      <div className="flex-1 flex">
        <main className="flex-1 container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <ArticleEditor articleId={parseInt(articleId)} initialArticle={article} />
        </main>

        {/* Side Panel */}
        <aside className="hidden lg:block w-80 border-l border-white/10 p-6 space-y-6">
          <ImageGrid sources={article.sources || []} />
          {hasVideos && (
            <>
              <div className="w-full h-px bg-white/10" />
              <VideoList sources={article.sources || []} />
            </>
          )}
          <div className="w-full h-px bg-white/10" />
          <SourcesList sources={article.sources || []} />
        </aside>
      </div>
    </div>
  );
}
