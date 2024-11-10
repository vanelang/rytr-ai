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

    const prompt = `You are a title generator API. Your response must be a valid JSON array of strings.

Topic: "${topic}"
Number of titles: ${titleCount}

Response format must be exactly like this:
["First Title Here", "Second Title Here", "Third Title Here"]

Title requirements:
- Natural and conversational tone
- 50-60 characters long
- Include relevant keywords
- Clear value proposition
- No clickbait or sensationalism
- No special characters or excessive punctuation
- No numbers at the start
- Use proper title case

Important: 
1. Return ONLY the JSON array
2. No markdown formatting
3. No explanation text
4. No code blocks
5. Must be valid JSON with double quotes
6. Must start with [ and end with ]`;

    const { text } = await generateText({
      model: getRandomModel(),
      temperature: 0.7,
      maxTokens: 500,
      messages: [
        {
          role: "system",
          content:
            "You are a JSON API that only returns valid JSON arrays of strings. Never include explanations or formatting.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Clean and validate the response
    try {
      // Remove any non-JSON characters
      const cleanText = text
        .replace(/```json\n?|```\n?/g, "") // Remove code blocks
        .replace(/[\u0000-\u001F]+/g, "") // Remove control characters
        .replace(/^[^[]*(\[.*\])[^]*$/, "$1") // Extract only the JSON array
        .trim();

      // Validate JSON structure
      if (!cleanText.startsWith("[") || !cleanText.endsWith("]")) {
        throw new Error("Invalid JSON array format");
      }

      let titles = JSON.parse(cleanText) as string[];

      // Validate array contents
      if (!Array.isArray(titles)) {
        throw new Error("Response is not an array");
      }

      // Clean and validate each title
      titles = titles
        .filter((title): title is string => typeof title === "string")
        .map((title) => title.trim())
        .filter((title) => {
          // Title validation rules
          return (
            title.length > 0 &&
            title.length <= 100 && // Maximum length
            !title.match(/^\d/) && // No numbers at start
            !title.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?]+/) // No special characters
          );
        })
        .slice(0, titleCount);

      if (titles.length === 0) {
        throw new Error("No valid titles after filtering");
      }

      return NextResponse.json({ titles });
    } catch (parseError) {
      console.error("Parsing error:", parseError, "Raw text:", text);

      // Last resort: Try to extract anything that looks like a title
      const fallbackTitles = text
        .split(/[\n,]/)
        .map(
          (line) =>
            line
              .trim()
              .replace(/^["'\s\d.\-\[\]]+|["'\[\]\s]+$/g, "")
              .replace(/^[^a-zA-Z]+/, "") // Remove non-letter characters from start
        )
        .filter(
          (line) => line.length >= 20 && line.length <= 100 && /^[A-Z]/.test(line) // Must start with capital letter
        )
        .slice(0, titleCount);

      if (fallbackTitles.length === 0) {
        return NextResponse.json({ error: "Failed to generate valid titles" }, { status: 500 });
      }

      return NextResponse.json({ titles: fallbackTitles });
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
