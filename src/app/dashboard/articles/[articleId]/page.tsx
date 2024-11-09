import { DashboardHeader } from "@/components/dashboard/header";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { ArticleEditor } from "@/components/dashboard/article-editor";
import { db } from "@/db";
import { articles, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";

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
      <main className="flex-1">
        <ArticleEditor articleId={parseInt(articleId)} initialArticle={article} />
      </main>
    </div>
  );
}
