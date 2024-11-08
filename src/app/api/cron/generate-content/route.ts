import { NextResponse } from "next/server";
import { db } from "@/db";
import { articles, contentGenerationQueue } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";

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

        const prompt = `Write a comprehensive article about: ${article.title}
        
        Follow this markdown structure:
        1. Start with a compelling introduction (2-3 paragraphs)
        2. Create 3-5 main sections with h2 headings
        3. Under each main section:
           - Add 2-3 subsections with h3 headings
           - Include relevant bullet points or numbered lists
           - Add emphasis using **bold** and *italic* text
           - Use blockquotes for important points
           - Include example code blocks if relevant
        4. End with a strong conclusion
        
        Make it SEO-friendly, engaging, and well-structured.
        Use proper markdown syntax for:
        - Headings (# ## ###)
        - Lists (- or 1. 2. 3.)
        - Emphasis (**bold** and *italic*)
        - Blockquotes (>)
        - Code blocks (\`\`\`)
        - Horizontal rules (---)
        
        Ensure the content is informative and valuable to readers.`;

        const { text } = await generateText({
          model,
          prompt,
          temperature: 0.7,
          maxTokens: 2000,
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
