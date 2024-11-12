import { tavily } from "@tavily/core";

interface SearchResult {
  title: string;
  url: string;
  content: string;
  source?: string;
  score?: number;
}

interface ImageResult {
  url: string;
  title: string;
  domain: string;
}

interface CombinedSearchResult {
  webResults: SearchResult[];
  imageResults: ImageResult[];
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

export async function searchWeb(query: string): Promise<CombinedSearchResult> {
  const apiKey = getRandomApiKey();
  const client = tavily({ apiKey });

  try {
    const response = await client.search(query, {
      searchDepth: "advanced",
      includeAnswer: false,
      includeImages: true,
      includeImageDescriptions: true,
      maxResults: 5,
    });

    if (!response.results || !Array.isArray(response.results)) {
      throw new Error("Invalid response format from Tavily");
    }

    const webResults = response.results.map((result) => ({
      title: result.title || "",
      url: result.url || "",
      content: result.content || "",
      source: result.url,
      score: result.score,
    }));

    const imageResults = (response.images || [])
      .filter((image) => {
        try {
          new URL(image.url);
          return image.url.match(/\.(jpg|jpeg|png|gif|webp)/i);
        } catch {
          return false;
        }
      })
      .map((image) => ({
        url: image.url,
        title: image.description || "Image",
        domain: new URL(image.url).hostname,
      }));

    return {
      webResults,
      imageResults,
    };
  } catch (error: any) {
    if (error.message?.includes("rate limit") && API_KEYS.length > 1) {
      console.warn(`Rate limit hit for API key, retrying with different key...`);
      return searchWeb(query);
    }
    throw new Error(`Failed to search web: ${error.message || "Unknown error"}`);
  }
}
