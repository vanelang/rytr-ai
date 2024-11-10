import { NextResponse } from "next/server";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateText } from "ai";
import { getRandomModel } from "@/lib/ai-models";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { searchWeb } from "@/lib/tavily";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { articleId } = await req.json();

    if (!articleId) {
      return NextResponse.json({ error: "Article ID is required" }, { status: 400 });
    }

    const article = await db.query.articles.findFirst({
      where: eq(articles.id, articleId),
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    try {
      // Search for relevant information
      const searchResults = await searchWeb(article.title);

      // Format search results for the AI prompt
      const sourcesContext = searchResults
        .map(
          (result, index) => `
Source ${index + 1}:
Title: ${result.title}
Content: ${result.content}
URL: ${result.url}
`
        )
        .join("\n\n");

      const { text } = await generateText({
        model: getRandomModel(),
        messages: [
          {
            role: "system",
            content:
              "You are a professional content writer who creates engaging, well-structured articles with valuable insights. Use the provided sources to create accurate, well-researched content.",
          },
          {
            role: "user",
            content: `Write an engaging article about "${article.title}" using the following sources:

${sourcesContext}

Focus on:
- Clear, concise explanations
- Practical examples and insights
- Natural, conversational tone
- Well-structured content
- Valuable takeaways
- Accurate information from sources

Structure:
1. Engaging introduction
2. Main points with clear headings
3. Supporting details and examples
4. Actionable conclusion

Use markdown formatting:
- ## for main headings
- ### for subheadings
- - for bullet points
- > for important quotes
- *text* for emphasis
- --- for section breaks

Keep paragraphs short and focused. Write as if explaining to an interested friend.`,
          },
        ],
        temperature: 0.7,
        maxTokens: 2000,
      });

      if (!text || text.length < 100) {
        throw new Error("Generated content is too short or empty");
      }

      // Update article with generated content and sources
      await db
        .update(articles)
        .set({
          status: "published",
          content: text,
          sources: searchResults.map((result) => ({
            title: result.title,
            summary: result.content || "",
            source: "web",
            url: result.url,
          })),
          updatedAt: new Date(),
        })
        .where(eq(articles.id, articleId));

      return NextResponse.json({ success: true, content: text });
    } catch (generationError) {
      // Update article status to failed
      await db
        .update(articles)
        .set({
          status: "failed",
          updatedAt: new Date(),
          metadata: {
            keywords: article.metadata?.keywords || [],
            description: article.metadata?.description || "",
            readingTime: article.metadata?.readingTime || 0,
            error:
              generationError instanceof Error
                ? generationError.message
                : "Content generation failed",
          },
        })
        .where(eq(articles.id, articleId));

      throw generationError; // Re-throw to be caught by outer catch block
    }
  } catch (error) {
    console.error("Content generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate content",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
