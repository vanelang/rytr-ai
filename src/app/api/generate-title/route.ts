import { NextResponse } from "next/server";
import { generateText } from "ai";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { getRandomModel } from "@/lib/ai-models";

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

    const prompt = `Generate ${titleCount} engaging blog titles about "${topic}". Return ONLY a JSON array of strings.

Example response format:
["Title One", "Title Two", "Title Three"]

Requirements for each title:
- Natural and conversational tone
- 50-60 characters long
- Include relevant keywords
- Clear value proposition
- No clickbait or sensationalism
- No special characters or excessive punctuation
- No numbers at the start
- Use proper title case

Remember: Return ONLY the JSON array, no additional text or explanation.`;

    const { text } = await generateText({
      model: getRandomModel(),
      temperature: 0.7,
      maxTokens: 500,
      messages: [
        {
          role: "system",
          content:
            "You are a professional content writer who creates clear, engaging titles. Return only valid JSON arrays.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Clean and parse the response
    try {
      // Remove any markdown code blocks and extra whitespace
      const cleanText = text.replace(/```json\n?|```\n?/g, "").trim();

      // Ensure the text starts and ends with brackets
      const jsonText = cleanText.startsWith("[") ? cleanText : `[${cleanText}]`;

      let titles = JSON.parse(jsonText) as string[];

      // Validate the response
      if (!Array.isArray(titles)) {
        titles = [titles].filter((title) => typeof title === "string");
      }

      // Clean up titles and ensure they're strings
      titles = titles
        .filter((title) => typeof title === "string")
        .map((title) => title.trim())
        .filter((title) => title.length > 0)
        .slice(0, titleCount);

      if (titles.length === 0) {
        throw new Error("No valid titles generated");
      }

      return NextResponse.json({ titles });
    } catch (parseError) {
      console.error("Parsing error:", parseError, "Raw text:", text);

      // Fallback parsing method
      const titles = text
        .split("\n")
        .map((line) => line.trim())
        .filter(
          (line) =>
            line.length > 0 &&
            !line.startsWith("[") &&
            !line.startsWith("]") &&
            !line.startsWith("```")
        )
        .map((line) => line.replace(/^["'\d.\-\[\]]+|["'\[\]]$/g, "").trim())
        .filter((line) => line.length > 0)
        .slice(0, titleCount);

      if (titles.length === 0) {
        return NextResponse.json({ error: "Failed to generate valid titles" }, { status: 500 });
      }

      return NextResponse.json({ titles });
    }
  } catch (error) {
    console.error("Title generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate titles",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
