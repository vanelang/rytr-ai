import { NextResponse } from "next/server";
import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const model = groq("mixtral-8x7b-32768");

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { topic, count = 3 } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const titleCount = Math.min(Math.max(parseInt(count) || 3, 1), 5);

    const prompt = `Generate ${titleCount} blog titles about "${topic}". Format as a JSON array of strings.

Key requirements:
- Natural, conversational titles
- Clear value proposition
- SEO-friendly keywords
- 40-60 characters long
- No clickbait or hype
- No numbers at start
- No special characters

Style:
- Write like a professional journalist
- Be specific and direct
- Focus on reader benefits
- Use active voice
- Sound authoritative but approachable

Example response:
[
  "Essential Guide to Cloud Computing Architecture",
  "Modern JavaScript Best Practices for Developers",
  "Understanding GraphQL in Web Applications"
]

Return ONLY the JSON array.`;

    const { text } = await generateText({
      model,
      prompt,
      temperature: 0.6, // Reduced for more consistent output
      maxTokens: 300,
    });

    try {
      // Clean and parse the response
      const cleanText = text
        .replace(/```json\n?|```\n?/g, "")
        .replace(/[\u201C\u201D]/g, '"') // Replace smart quotes
        .trim();

      // Ensure valid JSON array format
      const jsonText =
        cleanText.startsWith("[") && cleanText.endsWith("]") ? cleanText : `[${cleanText}]`;

      let titles = JSON.parse(jsonText) as string[];

      // Validate and clean titles
      if (!Array.isArray(titles)) {
        titles = [titles].filter((title) => typeof title === "string");
      }

      titles = titles
        .filter((title) => typeof title === "string")
        .map(
          (title) =>
            title
              .trim()
              .replace(/^["'\d.\-\[\]]+/, "") // Remove leading special chars
              .replace(/["'\[\]]+$/, "") // Remove trailing special chars
        )
        .filter(
          (title) =>
            title.length >= 20 && // Minimum length
            title.length <= 60 && // Maximum length
            !/^[0-9]/.test(title) // No numbers at start
        )
        .slice(0, titleCount);

      if (titles.length === 0) {
        return NextResponse.json(
          {
            error: "Could not generate appropriate titles. Please try again.",
          },
          { status: 422 }
        );
      }

      return NextResponse.json({ titles });
    } catch (parseError) {
      console.error("Title parsing error:", parseError, "Raw text:", text);

      // Fallback parsing for non-JSON responses
      const titles = text
        .split("\n")
        .map((line) => line.trim())
        .filter(
          (line) =>
            line.length >= 20 &&
            line.length <= 60 &&
            !line.startsWith("[") &&
            !line.startsWith("]") &&
            !line.startsWith("```") &&
            !/^[0-9]/.test(line)
        )
        .map((line) => line.replace(/^["'\d.\-\[\]]+|["'\[\]]+$/g, "").trim())
        .slice(0, titleCount);

      if (titles.length === 0) {
        return NextResponse.json(
          {
            error: "Failed to generate titles. Please try a different topic.",
          },
          { status: 422 }
        );
      }

      return NextResponse.json({ titles });
    }
  } catch (error) {
    console.error("Title generation error:", error);
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
