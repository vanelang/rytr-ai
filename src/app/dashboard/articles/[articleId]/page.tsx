import { DashboardHeader } from "@/components/dashboard/header";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { ArticleEditor } from "@/components/dashboard/article-editor";
import { Suspense } from "react";
import { ArticleEditorSkeleton } from "@/components/dashboard/article-editor-skeleton";

interface PageProps {
  params: Promise<{ articleId: string }>;
}

export default async function ArticlePage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  const { articleId } = await params;

  if (!session?.user?.email) {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <DashboardHeader user={session.user} />
      <div className="flex-1">
        <Suspense fallback={<ArticleEditorSkeleton />}>
          <ArticleEditor articleId={parseInt(articleId)} />
        </Suspense>
      </div>
    </div>
  );
}
