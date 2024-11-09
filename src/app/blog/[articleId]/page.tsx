import { db } from "@/db";
import { articles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { markdownToHtml } from "@/lib/markdown";
import { notFound } from "next/navigation";
import { format } from "date-fns";

// Enable dynamic rendering and set revalidation time
export const revalidate = 0;

async function getArticle(id: number) {
  try {
    const article = await db
      .select()
      .from(articles)
      .where(eq(articles.id, id))
      .then((res) => res[0]);

    if (!article || article.status !== "published") {
      return null;
    }

    return {
      ...article,
      content: article.content ? await markdownToHtml(article.content) : null,
    };
  } catch (error) {
    console.error("Error fetching article:", error);
    return null;
  }
}

export default async function BlogArticlePage({ params }: { params: { articleId: string } }) {
  const article = await getArticle(parseInt(params.articleId));

  if (!article) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <article className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{article.title}</h1>
          <time className="text-sm text-gray-500">
            {format(new Date(article.createdAt), "MMMM d, yyyy")}
          </time>
        </header>

        <div className="prose prose-lg max-w-none">
          <div dangerouslySetInnerHTML={{ __html: article.content || "" }} />
        </div>
      </article>
    </main>
  );
}
