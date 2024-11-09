import { NextResponse } from "next/server";
import { db } from "@/db";
import { articles, contentGenerationQueue } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";

const model = groq("mixtral-8x7b-32768");

export async function GET(req: Request) {
  try {
    const pendingItems = await db.query.contentGenerationQueue.findMany({
      where: eq(contentGenerationQueue.status, "pending"),
      limit: 5,
    });

    for (const item of pendingItems) {
      try {
        await db
          .update(contentGenerationQueue)
          .set({ status: "processing" })
          .where(eq(contentGenerationQueue.id, item.id));

        const article = await db.query.articles.findFirst({
          where: eq(articles.id, item.articleId),
        });

        if (!article) continue;

        const prompt = `You are a professional content writer known for creating engaging, easy-to-read articles. Write an article that flows naturally and keeps readers interested throughout.

Key guidelines:
- Write in a conversational, friendly tone
- Keep paragraphs short (2-3 sentences max)
- Use simple, clear language
- Include real-world examples and practical insights
- Break up text with subheadings for better readability

Structure:
- Hook readers with an engaging opening
- Present your main points clearly
- Support ideas with specific examples
- End with key takeaways or a call to action

Formatting:
- Use ## for main sections
- Use ### for subsections
- Add *italic* for emphasis on key points
- Use > for important quotes or takeaways
- Include bullet points for lists
- Add --- for section breaks

Remember: Write as if you're explaining to a friend, be concise, and focus on providing value to the reader.`;

        const { text } = await generateText({
          model,
          prompt,
          temperature: 0.7,
          maxTokens: 2000,
          messages: [
            {
              role: "system",
              content: `You are writing an article about: ${article.title}. Focus on delivering valuable insights in a natural, engaging way.`,
            },
          ],
        });

        // Update article with generated content
        await db
          .update(articles)
          .set({
            status: "published",
            content: text,
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

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process queue" }, { status: 500 });
  }
}
