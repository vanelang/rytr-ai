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
      // Now we only need one search call
      const { webResults, imageResults } = await searchWeb(article.title);

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

      // Format image results with explicit markdown syntax
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
            content: `You are a professional content writer. Your task is to write engaging articles with images.
CRITICAL: You MUST embed the provided images within the article content using the exact markdown syntax given.
Each image should appear after a relevant paragraph that relates to the image's content.
Failure to include ALL images will result in rejection of the article.`,
          },
          {
            role: "user",
            content: `Write an engaging article about "${article.title}" using these sources and images.

CRITICAL IMAGE REQUIREMENTS:
1. You MUST include ALL ${imageResults.length} images in the article content
2. Copy and paste the exact markdown syntax for each image: ![title](url)
3. Each image must be placed after a relevant paragraph
4. Add a descriptive caption below each image using *italics*
5. DO NOT skip any images or modify the URLs
6. Verify that each image markdown is on its own line

Available Sources:
${sourcesContext}

Required Images (ALL must be used):
${imagesContext}

Article Requirements:
1. Start with an engaging introduction
2. Use clear section headings (## for main sections)
3. Include relevant facts and information from sources
4. Place each image after a related paragraph
5. End with a strong conclusion

Formatting Guide:
- ## for main headings
- ### for subheadings
- > for important quotes
- * for emphasis
- - for bullet points

FINAL VERIFICATION:
- Confirm all ${imageResults.length} images are included
- Each image has a caption
- Images are evenly distributed throughout the content`,
          },
        ],
        temperature: 0.7,
        maxTokens: 2500,
      });

      // Verify that all images are included in the generated content
      const imageVerification = imageResults.every(
        (image) => text.includes(image.url) && text.includes(`![`)
      );

      if (!imageVerification) {
        throw new Error("Generated content is missing one or more required images");
      }

      if (!text || text.length < 100) {
        throw new Error("Generated content is too short or empty");
      }

      // Update article with generated content, sources, and images
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
