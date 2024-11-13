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

interface VideoResult {
  url: string;
  title: string;
  thumbnail?: string;
  platform: string;
  duration?: string;
}

interface CombinedSearchResult {
  webResults: SearchResult[];
  imageResults: ImageResult[];
  videoResults: VideoResult[];
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

function extractVideoInfo(url: string): { platform: string; videoId?: string; type?: string } {
  try {
    const urlObj = new URL(url);

    // YouTube detection
    if (urlObj.hostname.includes("youtube.com") || urlObj.hostname.includes("youtu.be")) {
      // Handle YouTube playlists
      if (urlObj.pathname.includes("playlist")) {
        const playlistId = urlObj.searchParams.get("list");
        return {
          platform: "YouTube",
          videoId: playlistId || undefined,
          type: "playlist",
        };
      }
      // Handle regular YouTube videos
      const videoId =
        urlObj.searchParams.get("v") || urlObj.pathname.replace("/watch/", "").replace("/", "");
      return {
        platform: "YouTube",
        videoId,
        type: "video",
      };
    }

    // Vimeo detection
    if (urlObj.hostname.includes("vimeo.com")) {
      const videoId = urlObj.pathname.slice(1);
      return {
        platform: "Vimeo",
        videoId,
        type: "video",
      };
    }

    return { platform: "Other" };
  } catch {
    return { platform: "Unknown" };
  }
}

function extractVideoUrls(content: string, webResults: SearchResult[]): VideoResult[] {
  const videoResults: VideoResult[] = [];

  // Function to process a URL and add to results if it's a video
  const processUrl = (url: string, title: string = "") => {
    try {
      const { platform, videoId, type } = extractVideoInfo(url);
      if ((platform === "YouTube" || platform === "Vimeo") && videoId) {
        const isPlaylist = type === "playlist";
        videoResults.push({
          url,
          title: title || `${platform} ${isPlaylist ? "Playlist" : "Video"}`,
          platform,
          thumbnail:
            platform === "YouTube"
              ? isPlaylist
                ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
                : `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
              : undefined,
        });
      }
    } catch (error) {
      console.warn("Error processing video URL:", error);
    }
  };

  // Extract URLs from web results
  webResults.forEach((result) => {
    // Check if the result URL itself is a video
    processUrl(result.url, result.title);

    // Extract URLs from content
    const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;
    const urls = result.content.match(urlRegex) || [];
    urls.forEach((url) => processUrl(url));
  });

  // Extract URLs from the additional content
  const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;
  const urls = content.match(urlRegex) || [];
  urls.forEach((url) => processUrl(url));

  // Remove duplicates based on URL
  const uniqueVideos = Array.from(
    new Map(videoResults.map((video) => [video.url, video])).values()
  );

  return uniqueVideos;
}

export async function searchWeb(query: string): Promise<CombinedSearchResult> {
  const apiKey = getRandomApiKey();
  const client = tavily({ apiKey });

  try {
    const response = await client.search(query, {
      searchDepth: "advanced",
      includeAnswer: true,
      includeImages: true,
      includeImageDescriptions: true,
      maxResults: 10, // Increased to get more potential video sources
    });

    if (!response.results || !Array.isArray(response.results)) {
      throw new Error("Invalid response format from Tavily");
    }

    const webResults = response.results
      .filter((result) => {
        const { platform } = extractVideoInfo(result.url);
        return platform === "Other" || platform === "Unknown";
      })
      .map((result) => ({
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

    // Extract video URLs from answer and content
    const allContent = [
      response.answer || "",
      ...response.results.map((result) => result.content),
    ].join(" ");

    const videoResults = extractVideoUrls(allContent, response.results);

    return {
      webResults,
      imageResults,
      videoResults: videoResults.slice(0, 3), // Limit to 3 videos
    };
  } catch (error: any) {
    if (error.message?.includes("rate limit") && API_KEYS.length > 1) {
      console.warn(`Rate limit hit for API key, retrying with different key...`);
      return searchWeb(query);
    }
    throw new Error(`Failed to search web: ${error.message || "Unknown error"}`);
  }
}
