import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { articles, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { ArticleEditor } from "@/components/dashboard/article-editor";
import { DashboardHeader } from "@/components/dashboard/header";

interface PageProps {
  params: Promise<{ articleId: string }>;
}

export default async function ArticlePage({ params }: PageProps) {
  const { articleId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/");
  }

  const dbUser = await db.query.users.findFirst({
    where: eq(users.email, session.user.email),
  });

  if (!dbUser) {
    redirect("/");
  }

  const article = await db.query.articles.findFirst({
    where: and(eq(articles.id, parseInt(articleId)), eq(articles.userId, dbUser.id)),
  });

  if (!article) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <DashboardHeader user={session.user} />
      <div className="flex-1">
        <ArticleEditor article={article} />
      </div>
    </div>
  );
}
