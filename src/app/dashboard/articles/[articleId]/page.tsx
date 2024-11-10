import { DashboardHeader } from "@/components/dashboard/header";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth.config";
import { redirect } from "next/navigation";
import { ArticleEditor } from "@/components/dashboard/article-editor";
import { db } from "@/db";
import { articles, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { SourcesList } from "@/components/dashboard/sources-list";

interface PageProps {
  params: Promise<{ articleId: string }>;
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

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <DashboardHeader user={session.user} />
      <div className="flex-1 flex">
        <main className="flex-1 container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <ArticleEditor articleId={parseInt(articleId)} initialArticle={article} />
        </main>

        {/* Side Panel */}
        <aside className="hidden lg:block w-80 border-l border-white/10 p-6 space-y-6">
          <SourcesList sources={article.sources || []} />
        </aside>
      </div>
    </div>
  );
}
