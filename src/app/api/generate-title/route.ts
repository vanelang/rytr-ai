import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { NextResponse } from "next/server";

const model = groq("mixtral-8x7b-32768");

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const prompt = `Generate a single SEO-optimized, engaging, and click-worthy article title for the topic: ${topic}. 
    The title should be compelling and around 60 characters long. 
    Return only the title text without quotes or any additional formatting.`;

    const { text } = await generateText({
      model,
      prompt,
      temperature: 0.7,
      maxTokens: 100,
    });

    const cleanTitle = text.trim().replace(/^["']|["']$/g, "");

    return NextResponse.json({ title: cleanTitle });
  } catch (error) {
    console.error("Error generating title:", error);
    return NextResponse.json({ error: "Failed to generate title" }, { status: 500 });
  }
}
