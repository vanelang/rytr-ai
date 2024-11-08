import { NextResponse } from "next/server";
import { db } from "@/db";
import { articles, contentGenerationQueue } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";
import { revalidatePath } from "next/cache";

const model = groq("mixtral-8x7b-32768");

export async function GET(req: Request) {
  try {
    // Get pending articles from queue
    const pendingItems = await db.query.contentGenerationQueue.findMany({
      where: eq(contentGenerationQueue.status, "pending"),
      limit: 5, // Process 5 at a time
    });

    for (const item of pendingItems) {
      try {
        // Update status to processing
        await db
          .update(contentGenerationQueue)
          .set({ status: "processing" })
          .where(eq(contentGenerationQueue.id, item.id));

        // Get article details
        const article = await db.query.articles.findFirst({
          where: eq(articles.id, item.articleId),
        });

        if (!article) continue;

        // Generate content using AI
        const { text } = await generateText({
          model,
          prompt: `Write a comprehensive article about: ${article.title}. 
          Include introduction, main points, and conclusion. 
          Make it SEO-friendly and engaging.`,
          temperature: 0.7,
          maxTokens: 2000,
        });

        // Update article with generated content
        await db
          .update(articles)
          .set({
            content: text,
            status: "published",
            updatedAt: new Date(),
          })
          .where(eq(articles.id, item.articleId));

        // Mark as completed
        await db
          .update(contentGenerationQueue)
          .set({
            status: "completed",
            processedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(contentGenerationQueue.id, item.id));
      } catch (error) {
        // Mark as failed
        await db
          .update(contentGenerationQueue)
          .set({
            status: "failed",
            error: (error as Error).message,
            updatedAt: new Date(),
          })
          .where(eq(contentGenerationQueue.id, item.id));
      }
    }

    revalidatePath("/dashboard");
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process queue" }, { status: 500 });
  }
}
