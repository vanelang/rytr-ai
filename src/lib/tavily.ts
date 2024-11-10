import { tavily } from "@tavily/core";

interface SearchResult {
  title: string;
  url: string;
  content: string;
  source?: string;
  score?: number;
}

// Get API keys from environment variables
const API_KEYS = (process.env.TAVILY_API_KEYS || "").split(",").filter(Boolean);

if (API_KEYS.length === 0) {
  throw new Error("No Tavily API keys configured");
}

function getRandomApiKey(): string {
  const randomIndex = Math.floor(Math.random() * API_KEYS.length);
  return API_KEYS[randomIndex];
}

export async function searchWeb(query: string): Promise<SearchResult[]> {
  const apiKey = getRandomApiKey();
  const client = tavily({ apiKey });

  try {
    const response = await client.search(query, {
      searchDepth: "advanced",
      includeAnswer: false,
      includeDomains: [],
      excludeDomains: [],
      maxResults: 5,
    });

    // Validate and transform the response
    if (!response.results || !Array.isArray(response.results)) {
      throw new Error("Invalid response format from Tavily");
    }

    return response.results.map((result) => ({
      title: result.title || "",
      url: result.url || "",
      content: result.content || "",
      source: result.url,
      score: result.score,
    }));
  } catch (error: any) {
    // If rate limit is hit, try another key
    if (error.message?.includes("rate limit") && API_KEYS.length > 1) {
      console.warn(`Rate limit hit for API key, retrying with different key...`);
      return searchWeb(query); // Recursive retry with different key
    }
    throw new Error(`Failed to search web: ${error.message || "Unknown error"}`);
  }
}
