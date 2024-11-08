import { NextResponse } from "next/server";
import { db } from "@/db";
import { articles, contentGenerationQueue, users } from "@/db/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { eq, and, inArray } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get array of article IDs from request body
    const { articleIds } = await req.json();

    if (!articleIds || !Array.isArray(articleIds)) {
      return NextResponse.json({ error: "Invalid article IDs" }, { status: 400 });
    }

    // Get status for all requested articles
    const statuses = await db.query.contentGenerationQueue.findMany({
      where: and(
        inArray(contentGenerationQueue.articleId, articleIds),
        eq(contentGenerationQueue.status, "processing")
      ),
    });

    // Get the actual articles that are completed
    const completedArticles = await db.query.articles.findMany({
      where: and(inArray(articles.id, articleIds), eq(articles.status, "published")),
    });

    return NextResponse.json({
      processing: statuses.map((status) => ({
        articleId: status.articleId,
        status: status.status,
        error: status.error,
      })),
      completed: completedArticles.map((article) => ({
        id: article.id,
        title: article.title,
        status: article.status,
        content: article.content,
        sources: article.sources,
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch article statuses" }, { status: 500 });
  }
}
