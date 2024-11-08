import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { NextResponse } from "next/server";

const model = groq("mixtral-8x7b-32768");

export async function POST(req: Request) {
  try {
    const { topic, count = 1 } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    if (count < 1 || count > 3) {
      return NextResponse.json({ error: "Count must be between 1 and 3" }, { status: 400 });
    }

    const prompt = `Generate ${count} SEO-optimized, engaging, and click-worthy article ${
      count === 1 ? "title" : "titles"
    } for the topic: ${topic}. 
    Each title should be compelling and around 60 characters long.
    Return only the title${
      count === 1 ? "" : "s"
    } in a JSON array format without any additional text or formatting.
    Example format: ${count === 1 ? '["Title"]' : '["Title 1", "Title 2"]'}`;

    const { text } = await generateText({
      model,
      prompt,
      temperature: 0.7,
      maxTokens: 200,
    });

    try {
      const titles = JSON.parse(text);
      if (Array.isArray(titles) && titles.length === count) {
        return NextResponse.json({ titles });
      }
      throw new Error("Invalid response format");
    } catch (error) {
      // Fallback: Try to extract titles from the text
      const titleMatches = text.match(/"([^"]+)"/g);
      if (titleMatches) {
        const titles = titleMatches.map((match) => match.replace(/"/g, "")).slice(0, count);
        return NextResponse.json({ titles });
      }
      throw new Error("Could not parse titles");
    }
  } catch (error) {
    console.error("Error generating titles:", error);
    return NextResponse.json({ error: "Failed to generate titles" }, { status: 500 });
  }
}
