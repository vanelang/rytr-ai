import { ArrowRight, CalendarIcon, ClockIcon } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { format } from "date-fns";
import { markdownToHtml } from "@/lib/markdown";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth.config";
import { BlogNav } from "@/components/blog/nav";
import Link from "next/link";

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

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export default async function BlogPage() {
  const session = await getServerSession(authOptions);
  const publishedArticles = await getPublishedArticles();

  // Convert markdown to HTML for each article
  const articlesWithHtml = await Promise.all(
    publishedArticles.map(async (article) => {
      const contentWithoutHeading = removeFirstHeading(article.content || "");
      const htmlContent = await markdownToHtml(contentWithoutHeading);
      const readingTime = calculateReadingTime(contentWithoutHeading);
      return { ...article, htmlContent, readingTime };
    })
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <BlogNav session={session} />

      {/* Main Content */}
      <header className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-center mb-6">
            Recent Articles
          </h1>
          <p className="text-2xl text-gray-400 text-center max-w-3xl mx-auto">
            Discover the latest articles created by our users with AI assistance
          </p>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {articlesWithHtml.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-400">No articles published yet.</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {articlesWithHtml.map((article) => (
              <Card
                key={article.id}
                className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-all duration-300"
              >
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold text-white leading-tight">
                    {article.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="text-gray-400 text-lg line-clamp-3"
                    dangerouslySetInnerHTML={{
                      __html: article.htmlContent.slice(0, 200) + "...",
                    }}
                  />
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <div className="flex items-center space-x-4 text-gray-500 text-base">
                    <div className="flex items-center space-x-1">
                      <CalendarIcon className="h-5 w-5" />
                      <span>{format(new Date(article.createdAt), "MMMM d, yyyy")}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="h-5 w-5" />
                      <span>{article.readingTime} min read</span>
                    </div>
                  </div>
                </CardFooter>
                <CardFooter>
                  <Link
                    href={`/blog/${article.id}`}
                    className="inline-flex items-center text-lg text-white hover:text-gray-300 transition-colors"
                  >
                    Read more
                    <ArrowRight className="ml-2 h-5 w-5" />
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
