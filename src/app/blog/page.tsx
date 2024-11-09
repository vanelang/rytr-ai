import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { markdownToHtml } from "@/lib/markdown";
import { format } from "date-fns";

// Enable dynamic rendering and set revalidation time
export const revalidate = 0;

async function getPublishedArticles() {
  try {
    const publishedArticles = await db
      .select()
      .from(articles)
      .where(eq(articles.status, "published"))
      .orderBy(articles.createdAt);

    // Convert markdown content to HTML for each article
    const articlesWithHtml = await Promise.all(
      publishedArticles.map(async (article) => ({
        ...article,
        content: article.content ? await markdownToHtml(article.content) : null,
      }))
    );

    return articlesWithHtml;
  } catch (error) {
    console.error("Error fetching published articles:", error);
    return [];
  }
}

export default async function BlogPage() {
  const publishedArticles = await getPublishedArticles();
  const featuredArticle = publishedArticles[0];
  const otherArticles = publishedArticles.slice(1);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <h1 className="mb-8 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Latest Articles
        </h1>

        {publishedArticles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No articles published yet.</p>
          </div>
        ) : (
          <>
            {/* Featured Article */}
            {featuredArticle && (
              <div className="mb-12">
                <Card className="overflow-hidden border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6 md:p-8">
                    <Badge className="mb-4 bg-blue-50 text-blue-700 hover:bg-blue-100 border-transparent">
                      Featured
                    </Badge>
                    <CardTitle className="mb-4 text-2xl font-bold text-gray-900 md:text-3xl">
                      {featuredArticle.title}
                    </CardTitle>
                    <div className="mb-6 prose max-w-none line-clamp-3 text-gray-600">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: featuredArticle.content?.slice(0, 300) + "..." || "",
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <time className="text-sm text-gray-500">
                        {format(new Date(featuredArticle.createdAt), "MMMM d, yyyy")}
                      </time>
                      <Link
                        href={`/blog/${featuredArticle.id}`}
                        className="inline-flex items-center text-blue-600 hover:text-blue-700"
                      >
                        Read full article
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Grid of other articles */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {otherArticles.map((article) => (
                <Card
                  key={article.id}
                  className="overflow-hidden border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <time className="text-sm text-gray-500">
                      {format(new Date(article.createdAt), "MMMM d, yyyy")}
                    </time>
                    <CardTitle className="line-clamp-2 text-xl text-gray-900 mt-2">
                      {article.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none line-clamp-3 text-gray-600">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: article.content?.slice(0, 200) + "..." || "",
                        }}
                      />
                    </div>
                  </CardContent>
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
          </>
        )}
      </div>
    </div>
  );
}
