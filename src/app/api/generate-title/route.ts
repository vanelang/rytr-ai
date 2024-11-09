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

    const prompt = `Generate ${titleCount} unique, engaging, and SEO-friendly article titles about "${topic}".
    
    Requirements:
    - Each title should be 50-70 characters long
    - Include keywords naturally
    - Make them compelling and click-worthy
    - Avoid clickbait
    - Use proper capitalization
    - No quotes or special characters
    
    Format the response as a simple array of titles.
    Example: ["Title 1", "Title 2", "Title 3"]`;

    const { text } = await generateText({
      model,
      prompt,
      temperature: 0.7,
      maxTokens: 500,
    });

    // Parse the response to get titles array
    try {
      // Clean up the response text and parse it
      const cleanText = text.replace(/```json|```/g, "").trim();
      const titles = JSON.parse(cleanText);

      if (!Array.isArray(titles)) {
        throw new Error("Invalid response format");
      }

      return NextResponse.json({ titles: titles.slice(0, titleCount) });
    } catch (parseError) {
      // Fallback parsing method if JSON parse fails
      const titles = text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map((line) => line.replace(/^["'\d.\-\[\]]+/, "").trim()) // Remove quotes, numbers, dashes, brackets
        .slice(0, titleCount);

      return NextResponse.json({ titles });
    }
  } catch (error) {
    console.error("Title generation error:", error);
    return NextResponse.json({ error: "Failed to generate titles" }, { status: 500 });
  }
}
