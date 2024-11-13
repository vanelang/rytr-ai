import { NextResponse } from "next/server";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateText } from "ai";
import { getRandomModel } from "@/lib/ai-models";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth.config";
import { searchWeb } from "@/lib/tavily";

interface ImageResult {
  url: string;
  title: string;
  domain: string;
}

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
      const { webResults, imageResults, videoResults } = await searchWeb(article.title);
      console.log(videoResults);

      if (!imageResults.length) {
        console.warn("No images found for article:", article.title);
      }

      // Format search results for the AI prompt
      const sourcesContext = webResults
        .map(
          (result, index) => `
Source ${index + 1}:
Title: ${result.title}
Content: ${result.content}
URL: ${result.url}
`
        )
        .join("\n\n");

      const imagesContext = imageResults
        .map(
          (image, index) => `
[Image ${index + 1}]
Markdown: ![${image.title}](${image.url})
Description: ${image.title}
Source: ${image.domain}
`
        )
        .join("\n\n");

      const { text } = await generateText({
        model: getRandomModel(),
        messages: [
          {
            role: "system",
            content: `You are a professional content writer. Your task is to write engaging articles with images and videos.
Try to embed the provided images and videos within the article content using the exact markdown syntax given.
Each media element should appear after a relevant paragraph that relates to its content.`,
          },
          {
            role: "user",
            content: `Write an engaging article about "${
              article.title
            }" using these sources, images, and videos.

Available Sources:
${sourcesContext}

Available Images:
${imagesContext}

Available Videos:
${videoResults
  .map(
    (video, index) => `
[Video ${index + 1}]
Title: ${video.title}
URL: ${video.url}
Platform: ${video.platform}
${video.duration ? `Duration: ${video.duration}` : ""}
`
  )
  .join("\n\n")}

Article Requirements:
1. Start with an engaging introduction
2. Use clear section headings (## for main sections)
3. Include relevant facts and information from sources
4. Place images and videos after related paragraphs
5. End with a strong conclusion

Formatting Guide:
- ## for main headings
- ### for subheadings
- > for important quotes
- * for emphasis
- - for bullet points
- For videos, use: [Watch: Title](video_url)`,
          },
        ],
        temperature: 0.7,
        maxTokens: 2500,
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
          sources: [
            ...webResults.map((result) => ({
              title: result.title,
              summary: result.content || "",
              source: "web",
              url: result.url,
            })),
            ...imageResults.map((image) => ({
              title: image.title,
              summary: `Image from ${image.domain}`,
              source: "image",
              url: image.url,
            })),
            ...videoResults.map((video) => ({
              title: video.title,
              summary: `Video from ${video.platform}`,
              source: "video",
              url: video.url,
            })),
          ],
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

      throw generationError;
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
