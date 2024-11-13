import { db } from "@/db";
import { articles, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { markdownToHtml } from "@/lib/markdown";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon, ClockIcon, ArrowLeftIcon, ShareIcon, BookmarkIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

// Enable dynamic rendering and set revalidation time
export const revalidate = 0;

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

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

    // Fetch the author information
    const author = await db.query.users.findFirst({
      where: eq(users.id, article.userId),
    });

    const readingTime = calculateReadingTime(article.content || "");
    const htmlContent = article.content ? await markdownToHtml(article.content) : null;

    return {
      ...article,
      content: htmlContent,
      readingTime,
      author: {
        name: author?.name || "Anonymous",
        image: author?.image || null,
        email: author?.email || "",
      },
    };
  } catch (error) {
    console.error("Error fetching article:", error);
    return null;
  }
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ articleId: string }>;
}) {
  const article = await getArticle(parseInt((await params).articleId));

  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/blog"
          className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to all posts
        </Link>
        <article>
          <header className="mb-8">
            <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-white">
              {article.title}
            </h1>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={article.author.image || undefined} alt={article.author.name} />
                  <AvatarFallback>
                    {article.author.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-white">{article.author.name}</p>
                  <p className="text-sm text-gray-400">{article.author.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-gray-400">
                <div className="flex items-center space-x-1">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{format(new Date(article.createdAt), "MMMM d, yyyy")}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ClockIcon className="h-4 w-4" />
                  <span>{article.readingTime} min read</span>
                </div>
              </div>
            </div>
          </header>
          <div className="prose prose-invert max-w-none">
            <div
              dangerouslySetInnerHTML={{ __html: article.content || "" }}
              className="prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white prose-blockquote:text-gray-300 prose-code:text-white prose-pre:bg-gray-900/50 prose-pre:text-gray-300 prose-img:rounded-lg prose-img:shadow-2xl prose-img:mx-auto prose-img:max-w-full md:prose-img:max-w-[80%]"
            />
          </div>
        </article>
        <footer className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <Badge
              variant="outline"
              className="bg-gray-900 text-white border-gray-700 hover:bg-gray-800 transition-colors duration-300"
            >
              {article.metadata?.category || "General"}
            </Badge>
            <div className="flex space-x-4">
              <Button
                variant="outline"
                size="icon"
                className="text-gray-400 hover:text-white border-gray-700 hover:bg-gray-800 transition-colors duration-300"
              >
                <ShareIcon className="h-4 w-4" />
                <span className="sr-only">Share</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="text-gray-400 hover:text-white border-gray-700 hover:bg-gray-800 transition-colors duration-300"
              >
                <BookmarkIcon className="h-4 w-4" />
                <span className="sr-only">Bookmark</span>
              </Button>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
