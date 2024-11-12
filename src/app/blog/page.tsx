import Link from "next/link";
import { ArrowRight, CalendarIcon, ClockIcon } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { format } from "date-fns";
import { markdownToHtml } from "@/lib/markdown";

// Enable dynamic rendering and set revalidation time
export const revalidate = 0;

async function getPublishedArticles() {
  try {
    const publishedArticles = await db
      .select({
        id: articles.id,
        title: articles.title,
        createdAt: articles.createdAt,
        content: articles.content,
        metadata: articles.metadata,
      })
      .from(articles)
      .where(eq(articles.status, "published"))
      .orderBy(desc(articles.createdAt));

    return publishedArticles;
  } catch (error) {
    console.error("Error fetching published articles:", error);
    return [];
  }
}

function removeFirstHeading(markdown: string): string {
  const lines = markdown.split("\n");
  if (lines[0].startsWith("#")) {
    return lines.slice(1).join("\n");
  }
  return markdown;
}

export default async function BlogPage() {
  const publishedArticles = await getPublishedArticles();

  // Convert markdown to HTML for each article
  const articlesWithHtml = await Promise.all(
    publishedArticles.map(async (article) => {
      const contentWithoutHeading = removeFirstHeading(article.content || "");
      const htmlContent = await markdownToHtml(contentWithoutHeading);
      return { ...article, htmlContent };
    })
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <header className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight text-center mb-4">Recent Articles</h1>
          <p className="text-xl text-gray-400 text-center">
            Discover the latest articles created by our users with AI assistance
          </p>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {articlesWithHtml.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No articles published yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articlesWithHtml.map((article) => (
              <Card
                key={article.id}
                className="bg-gray-800 border-gray-700 hover:border-primary transition-colors duration-300"
              >
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">{article.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="text-gray-400"
                    dangerouslySetInnerHTML={{ __html: article.htmlContent.slice(0, 200) + "..." }}
                  />
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{format(new Date(article.createdAt), "MMMM d, yyyy")}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <ClockIcon className="h-4 w-4" />
                    <span>{article.metadata?.readingTime || 5} min read</span>
                  </div>
                </CardFooter>
                <CardFooter>
                  <Link
                    href={`/blog/${article.id}`}
                    className="inline-flex items-center text-blue-600 hover:text-blue-700"
                  >
                    Read more
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
